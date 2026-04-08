import { useState } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  .place-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:1.25rem;padding:1.25rem;transition:all 0.25s;}
  .place-card:hover{border-color:rgba(99,102,241,0.3);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.25);}
  .dirs-btn{padding:0.5rem 0.875rem;border-radius:0.75rem;border:none;cursor:pointer;font-weight:700;font-size:0.75rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-family:inherit;transition:all 0.2s;}
  .dirs-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(99,102,241,0.35);}
`;

const RADII = [500, 1000, 2000, 5000];

const Places = () => {
    const [location, setLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [radius, setRadius] = useState(2000);
    const [placeType, setPlaceType] = useState('restaurant');
    const [searched, setSearched] = useState(false);

    const getLocation = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });

    const search = async () => {
        setLoading(true);
        setError('');
        try {
            let lat, lng;
            if (!location) {
                const pos = await getLocation();
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                setLocation({ lat, lng });
            } else {
                lat = location.lat;
                lng = location.lng;
            }
            const r = await api.get(`/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${placeType}`);
            setPlaces(r.data.places || []);
            setSearched(true);
        } catch (e) {
            if (e.code === 1) setError('Location permission denied. Please allow location access.');
            else setError(e.response?.data?.error || e.message || 'Failed to find places');
        } finally { setLoading(false); }
    };

    const openDirections = (place) => {
        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${location?.lat},${location?.lng};${place.lat},${place.lon || place.lng}`;
        window.open(url, '_blank');
    };

    const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.25rem', padding: '1.5rem' };
    const btnPrimary = { padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.9rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' };

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>📍 Healthy Places</h1>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Find restaurants and stores near you powered by OpenStreetMap</p>
                    </div>

                    {/* Search controls */}
                    <div style={{ ...card, marginBottom: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            {/* Type */}
                            <div>
                                <p style={{ margin: '0 0 0.625rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Type</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[{ value: 'restaurant', icon: '🍽️', label: 'Restaurants' }, { value: 'supermarket', icon: '🛒', label: 'Groceries' }].map(t => (
                                        <button key={t.value} onClick={() => setPlaceType(t.value)}
                                            style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: placeType === t.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: placeType === t.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: placeType === t.value ? '#a5b4fc' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                                            {t.icon} {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Radius */}
                            <div>
                                <p style={{ margin: '0 0 0.625rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Distance</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {RADII.map(r => (
                                        <button key={r} onClick={() => setRadius(r)}
                                            style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: radius === r ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: radius === r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: radius === r ? '#a5b4fc' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'inherit' }}>
                                            {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={search} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-end' }}>
                                {loading ? <><div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Finding...</> : '📍 Find Places'}
                            </button>
                        </div>

                        {location && (
                            <p style={{ margin: '0.875rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                Location found: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ marginBottom: '1.25rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Results */}
                    {searched && places.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', ...card }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 4s ease-in-out infinite' }}>🗺️</div>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'white' }}>No places found</h3>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Try increasing the radius or searching in a different area</p>
                        </div>
                    )}

                    {!searched && !loading && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', ...card }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 5s ease-in-out infinite' }}>🗺️</div>
                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>Discover Healthy Places</h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Click "Find Places" to discover restaurants and stores near you</p>
                        </div>
                    )}

                    {places.length > 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>{places.filter(p => p.name).length} places found</p>
                                <span style={{ padding: '0.25rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                                    Within {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
                                {places.filter(p => p.name).map((place, i) => (
                                    <div key={i} className="place-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    {place.isVegan && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>🌱 Vegan</span>}
                                                    {place.isVegetarian && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>🥦 Veg</span>}
                                                    {place.isOrganic && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>🌿 Organic</span>}
                                                </div>
                                                <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'white', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</h3>
                                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{place.address || 'Address not available'}</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    {place.phone && <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>📞 {place.phone}</p>}
                                                    {place.openingHours && <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🕐 {place.openingHours}</p>}
                                                    {place.website && <a href={place.website} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none' }}>🌐 Website</a>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '3rem', height: '3rem', borderRadius: '0.875rem', flexShrink: 0, background: placeType === 'restaurant' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${placeType === 'restaurant' ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`, fontSize: '1.5rem' }}>
                                                {placeType === 'restaurant' ? '🍽️' : '🛒'}
                                            </div>
                                        </div>
                                        {location && (place.lat || place.center) && (
                                            <button onClick={() => openDirections(place)} className="dirs-btn" style={{ width: '100%', marginTop: '0.875rem' }}>
                                                🗺️ Get Directions
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Places;
