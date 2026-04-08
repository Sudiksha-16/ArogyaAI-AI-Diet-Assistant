import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Build Overpass QL query - unified for restaurants and grocery stores
function buildOverpassQuery(lat, lon, radius, amenityTypes, shopTypes = []) {
    const nodeWayUnions = [
        ...amenityTypes.map(type => `
          node["amenity"="${type}"](around:${radius},${lat},${lon});
          way["amenity"="${type}"](around:${radius},${lat},${lon});
        `),
        ...shopTypes.map(type => `
          node["shop"="${type}"](around:${radius},${lat},${lon});
          way["shop"="${type}"](around:${radius},${lat},${lon});
        `)
    ].join('');

    return `[out:json][timeout:30];(${nodeWayUnions});out center 40;`;
}

// Unified nearby places endpoint — matches frontend call signature
router.get('/nearby', authMiddleware, async (req, res) => {
    try {
        const { lat, lng, radius = 2000, type = 'restaurant' } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat and lng query params are required' });
        }

        let amenityTypes = [];
        let shopTypes = [];

        if (type === 'restaurant') {
            amenityTypes = ['restaurant', 'cafe', 'fast_food', 'food_court'];
        } else if (type === 'supermarket') {
            amenityTypes = ['marketplace'];
            shopTypes = ['supermarket', 'grocery', 'convenience', 'health_food', 'organic'];
        } else {
            amenityTypes = [type];
        }

        const query = buildOverpassQuery(lat, lng, radius, amenityTypes, shopTypes);

        const response = await axios.post(OVERPASS_API, query, {
            headers: { 'Content-Type': 'text/plain' },
            timeout: 30000
        });

        const elements = response.data.elements || [];

        const places = elements
            .filter(el => el.tags && el.tags.name)
            .map(el => {
                const elLat = el.lat || el.center?.lat;
                const elLon = el.lon || el.center?.lon;
                const tags = el.tags;

                const isVegan = tags.vegan === 'yes' || tags['diet:vegan'] === 'yes';
                const isVegetarian = tags.vegetarian === 'yes' || tags['diet:vegetarian'] === 'yes';
                const isOrganic = tags.organic === 'yes' || tags['diet:organic'] === 'yes';

                return {
                    id: el.id,
                    name: tags.name,
                    type: tags.amenity || tags.shop || type,
                    cuisine: tags.cuisine || null,
                    address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
                        .filter(Boolean).join(' ') || 'Address not available',
                    phone: tags.phone || tags['contact:phone'] || null,
                    website: tags.website || tags['contact:website'] || null,
                    openingHours: tags.opening_hours || null,
                    isVegan,
                    isVegetarian,
                    isOrganic,
                    lat: elLat,
                    lon: elLon,
                };
            })
            .slice(0, 40);

        res.json({ places, total: places.length, source: 'OpenStreetMap' });
    } catch (error) {
        console.error('Places search error:', error.message);
        res.status(500).json({ error: 'Error finding nearby places. The OpenStreetMap service may be temporarily unavailable.' });
    }
});

// Legacy: Find nearby healthy restaurants
router.get('/restaurants', authMiddleware, async (req, res) => {
    try {
        const { latitude, longitude, radius = 3000 } = req.query;
        if (!latitude || !longitude) return res.status(400).json({ error: 'Latitude and longitude required' });

        const query = buildOverpassQuery(latitude, longitude, radius, ['restaurant', 'cafe', 'fast_food'], []);
        const response = await axios.post(OVERPASS_API, query, { headers: { 'Content-Type': 'text/plain' }, timeout: 30000 });
        const elements = response.data.elements || [];
        const restaurants = elements
            .filter(el => el.tags && el.tags.name)
            .map(el => ({
                id: el.id,
                name: el.tags.name,
                type: el.tags.amenity,
                address: [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:city']].filter(Boolean).join(' ') || 'Address not available',
                phone: el.tags.phone || null,
                website: el.tags.website || null,
                openingHours: el.tags.opening_hours || null,
                isVegan: el.tags.vegan === 'yes',
                isVegetarian: el.tags.vegetarian === 'yes',
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
            }))
            .slice(0, 30);
        res.json({ restaurants, total: restaurants.length });
    } catch (error) {
        res.status(500).json({ error: 'Error finding nearby restaurants' });
    }
});

// Legacy: Find nearby grocery stores
router.get('/grocery-stores', authMiddleware, async (req, res) => {
    try {
        const { latitude, longitude, radius = 4000 } = req.query;
        if (!latitude || !longitude) return res.status(400).json({ error: 'Latitude and longitude required' });

        const query = buildOverpassQuery(latitude, longitude, radius, ['marketplace'], ['supermarket', 'grocery', 'convenience', 'health_food']);
        const response = await axios.post(OVERPASS_API, query, { headers: { 'Content-Type': 'text/plain' }, timeout: 30000 });
        const elements = response.data.elements || [];
        const stores = elements
            .filter(el => el.tags && el.tags.name)
            .map(el => ({
                id: el.id,
                name: el.tags.name,
                address: [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:city']].filter(Boolean).join(' ') || 'Address not available',
                phone: el.tags.phone || null,
                isOrganic: el.tags.organic === 'yes',
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
            }))
            .slice(0, 30);
        res.json({ stores, total: stores.length });
    } catch (error) {
        res.status(500).json({ error: 'Error finding nearby grocery stores' });
    }
});

export default router;
