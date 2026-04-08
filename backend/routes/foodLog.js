import express from 'express';
import axios from 'axios';
import multer from 'multer';
import MealLog from '../models/MealLog.js';
import User from '../models/User.js';
import HydrationLog from '../models/HydrationLog.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for image uploads
/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });*/
const upload = multer({ storage: multer.memoryStorage() });

// Search nutrition database — tries Edamam first, falls back to Open Food Facts (free, no key needed)
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const searchTerm = (req.query.q || req.query.query || '').trim();
        if (!searchTerm) return res.status(400).json({ error: 'Search query required' });

        const appId = (process.env.EDAMAM_APP_ID || '').trim();
        const appKey = (process.env.EDAMAM_APP_KEY || '').trim();

        // Try Edamam if credentials look valid
        if (appId && appKey && appKey.length > 8) {
            try {
                const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
                    params: { app_id: appId, app_key: appKey, ingr: searchTerm, 'nutrition-type': 'logging' },
                    timeout: 8000
                });
                const foods = (response.data.hints || []).slice(0, 12).map(hint => ({
                    name: hint.food.label,
                    brand: hint.food.brand || hint.food.category || '',
                    calories: Math.round(hint.food.nutrients?.ENERC_KCAL || 0),
                    protein: Math.round((hint.food.nutrients?.PROCNT || 0) * 10) / 10,
                    carbs: Math.round((hint.food.nutrients?.CHOCDF || 0) * 10) / 10,
                    fat: Math.round((hint.food.nutrients?.FAT || 0) * 10) / 10,
                }));
                return res.json({ foods, source: 'edamam' });
            } catch (edamamErr) {
                console.warn('Edamam failed, falling back to Open Food Facts:', edamamErr.message);
            }
        }

        // Fallback: Open Food Facts (completely free, no API key required)
        const offResp = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
            params: {
                search_terms: searchTerm, search_simple: 1, action: 'process', json: 1, page_size: 15,
                fields: 'product_name,brands,nutriments'
            },
            timeout: 10000
        });
        const foods = (offResp.data.products || [])
            .filter(p => p.product_name && p.nutriments)
            .slice(0, 12)
            .map(p => ({
                name: p.product_name,
                brand: p.brands || '',
                calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
                protein: Math.round((p.nutriments.proteins_100g || 0) * 10) / 10,
                carbs: Math.round((p.nutriments.carbohydrates_100g || 0) * 10) / 10,
                fat: Math.round((p.nutriments.fat_100g || 0) * 10) / 10,
            }));
        res.json({ foods, source: 'open_food_facts' });
    } catch (error) {
        console.error('Food search error:', error.message);
        res.status(500).json({ error: 'Error searching for food. Please try again.' });
    }
});

// Add food log entry — accepts both old {foodName,nutrition:{}} and new flat {name,calories,protein,carbs,fat} formats
router.post('/log', authMiddleware, async (req, res) => {
    try {
        const body = req.body;
        // Support flat format from frontend: {name, calories, protein, carbs, fat, mealType, quantity}
        const foodName = body.foodName || body.name || 'Unknown food';
        const mealType = body.mealType || 'Snack';
        const quantity = body.quantity || 100;
        const nutrition = body.nutrition || {
            calories: Number(body.calories) || 0,
            protein: Number(body.protein) || 0,
            carbs: Number(body.carbs) || 0,
            fat: Number(body.fat) || 0,
            fats: Number(body.fat) || 0,
        };

        const mealLog = new MealLog({
            userId: req.userId,
            mealType,
            foodName,
            name: foodName,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat || nutrition.fats || 0,
            nutrition,
            quantity,
            source: body.source || 'search',
            date: new Date()
        });

        await mealLog.save();
        await updateStreak(req.userId).catch(() => { });

        res.status(201).json({ message: 'Food logged successfully', mealLog });
    } catch (error) {
        console.error('Food log error:', error);
        res.status(500).json({ error: 'Error logging food' });
    }
});

// Get today's food logs
router.get('/today', authMiddleware, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const rawLogs = await MealLog.find({
            userId: req.userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ date: -1 });

        // Normalize logs — support both old {nutrition:{calories}} and new flat {calories} formats
        const logs = rawLogs.map(log => {
            const l = log.toObject();
            const cal = l.calories || l.nutrition?.calories || 0;
            const prot = l.protein || l.nutrition?.protein || 0;
            const carb = l.carbs || l.nutrition?.carbs || 0;
            const fat = l.fat || l.nutrition?.fat || l.nutrition?.fats || 0;
            return {
                _id: l._id,
                name: l.name || l.foodName || 'Food',
                foodName: l.foodName || l.name || 'Food',
                mealType: l.mealType,
                quantity: l.quantity || 100,
                calories: cal,
                protein: prot,
                carbs: carb,
                fat: fat,
                date: l.date,
            };
        });

        const totals = logs.reduce((acc, l) => ({
            calories: acc.calories + (l.calories || 0),
            protein: acc.protein + (l.protein || 0),
            carbs: acc.carbs + (l.carbs || 0),
            fat: acc.fat + (l.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        res.json({ logs, totals });
    } catch (error) {
        console.error('Today logs error:', error);
        res.status(500).json({ error: 'Error fetching today\'s logs' });
    }
});

// Delete food log — /:id (frontend) 
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Food log deleted successfully' });
    } catch (error) {
        console.error('Delete log error:', error);
        res.status(500).json({ error: 'Error deleting food log' });
    }
});
// Legacy alias
router.delete('/log/:id', authMiddleware, async (req, res) => {
    try {
        await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Food log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting food log' });
    }
});

// Image recognition using Clarifai
router.post('/recognize-image', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const imageBase64 = req.file.buffer ? req.file.buffer.toString('base64') : null;

        if (!imageBase64 && !req.body.imageUrl) {
            return res.status(400).json({ error: 'No image provided' });
        }
        const response = await axios.post(
            `https://api.clarifai.com/v2/models/food-item-recognition/outputs`,
            {
                user_app_id: {
                    user_id: "clarifai",
                    app_id: "main"
                },
                inputs: [
                    {
                        data: {
                            image: { base64: imageBase64 }
                        }
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        /*const response = await axios.post(
            'https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/food-item-v1-recognition/outputs',
            {
                inputs: [{
                    data: {
                        image: imageBase64 ? { base64: imageBase64 } : { url: req.body.imageUrl }
                    }
                }]
            },
            {
                headers: {
                    'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );*/
        
        

        const concepts = response.data.outputs[0].data.concepts.slice(0, 5).map(c => ({
            name: c.name,
            confidence: c.value
        }));

        res.json({ recognizedFoods: concepts });
    } catch (error) {
        console.error('Image recognition error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error recognizing food from image' });
    }
});

// Log hydration
router.post('/hydration', authMiddleware, async (req, res) => {
    try {
        const { glasses } = req.body;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let hydrationLog = await HydrationLog.findOne({
            userId: req.userId,
            date: { $gte: startOfDay }
        });

        if (hydrationLog) {
            hydrationLog.glasses = glasses;
        } else {
            hydrationLog = new HydrationLog({
                userId: req.userId,
                glasses
            });
        }

        await hydrationLog.save();
        res.json({ message: 'Hydration logged', hydrationLog });
    } catch (error) {
        console.error('Hydration log error:', error);
        res.status(500).json({ error: 'Error logging hydration' });
    }
});

// Get today's hydration
router.get('/hydration/today', authMiddleware, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const hydrationLog = await HydrationLog.findOne({
            userId: req.userId,
            date: { $gte: startOfDay }
        });

        res.json({ glasses: hydrationLog?.glasses || 0 });
    } catch (error) {
        console.error('Hydration fetch error:', error);
        res.status(500).json({ error: 'Error fetching hydration' });
    }
});

// Helper function to update streak
async function updateStreak(userId) {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLog = user.streaks.lastLogDate ? new Date(user.streaks.lastLogDate) : null;

    if (lastLog) {
        lastLog.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastLog) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            user.streaks.currentStreak += 1;
            if (user.streaks.currentStreak > user.streaks.longestStreak) {
                user.streaks.longestStreak = user.streaks.currentStreak;
            }
        } else if (diffDays > 1) {
            // Streak broken
            user.streaks.currentStreak = 1;
        }
    } else {
        user.streaks.currentStreak = 1;
    }

    user.streaks.lastLogDate = new Date();
    await user.save();
}

export default router;
