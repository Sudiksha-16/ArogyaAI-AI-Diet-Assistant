import { useState, useEffect } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .log-input{width:100%;padding:0.75rem 1rem;border-radius:0.75rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:white;font-size:0.875rem;outline:none;transition:all 0.2s;font-family:inherit;}
  .log-input::placeholder{color:rgba(255,255,255,0.25);}
  .log-input:focus{border-color:rgba(99,102,241,0.6);background:rgba(99,102,241,0.08);box-shadow:0 0 0 3px rgba(99,102,241,0.12);}
  .log-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:0.875rem;padding:0.875rem 1rem;display:flex;align-items:center;gap:1rem;transition:all 0.2s;}
  .log-item:hover{border-color:rgba(255,255,255,0.12);}
  .result-item{padding:0.875rem 1rem;border-radius:0.875rem;cursor:pointer;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);transition:all 0.2s;}
  .result-item:hover{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);}
`;

const tabs = [
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'custom', icon: '✏️', label: 'Custom' },
    { id: 'image', icon: '📷', label: 'Image AI' },
    { id: 'log', icon: '📋', label: "Today's Log" },
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const FoodLogger = () => {
    const [tab, setTab] = useState('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [mealType, setMealType] = useState('Breakfast');
    const [quantity, setQuantity] = useState(100);
    const [todayLog, setTodayLog] = useState([]);
    const [loadingLog, setLoadingLog] = useState(false);
    const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imageResult, setImageResult] = useState(null);
    const [analyzingImage, setAnalyzingImage] = useState(false);

    useEffect(() => { fetchTodayLog(); }, []);

    const fetchTodayLog = async () => {
        setLoadingLog(true);
        try { const r = await api.get('/food-log/today'); setTodayLog(r.data.logs || []); }
        catch { }
        finally { setLoadingLog(false); }
    };

    const searchFood = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try { const r = await api.get(`/food-log/search?q=${encodeURIComponent(searchQuery)}`); setSearchResults(r.data.foods || []); }
        catch { alert('Search failed. Check your Edamam API key.'); }
        finally { setSearching(false); }
    };

    const logFood = async (food) => {
        try {
            await api.post('/food-log/log', {
                ...food,
                calories: Math.round((food.calories || 0) * quantity / 100),
                protein: Math.round((food.protein || 0) * quantity / 100 * 10) / 10,
                carbs: Math.round((food.carbs || 0) * quantity / 100 * 10) / 10,
                fat: Math.round((food.fat || 0) * quantity / 100 * 10) / 10,
                mealType, quantity,
            });
            await fetchTodayLog();
            alert(`✅ ${food.name || 'Food'} logged!`);
        } catch { alert('Error logging food'); }
    };

    const logCustom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/food-log/log', { ...custom, calories: parseInt(custom.calories), protein: parseFloat(custom.protein), carbs: parseFloat(custom.carbs), fat: parseFloat(custom.fat), mealType });
            await fetchTodayLog();
            setCustom({ name: '', calories: '', protein: '', carbs: '', fat: '' });
            alert('✅ Custom food logged!');
        } catch { alert('Error logging custom food'); }
    };

    const analyzeImage = async () => {
        if (!imageFile) return;
        setAnalyzingImage(true);
        const fd = new FormData(); fd.append('image', imageFile);
        try {
            const r = await api.post('/food-log/recognize-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setImageResult(r.data);
        } catch { alert('Image analysis failed. Check your Clarifai API key.'); }
        finally { setAnalyzingImage(false); }
    };

    const deleteEntry = async (id) => {
        if (!confirm('Delete this entry?')) return;
        try { await api.delete(`/food-log/${id}`); await fetchTodayLog(); } catch { alert('Error deleting entry'); }
    };

    const totals = todayLog.reduce((acc, e) => ({ calories: acc.calories + (e.calories || 0), protein: acc.protein + (e.protein || 0), carbs: acc.carbs + (e.carbs || 0), fat: acc.fat + (e.fat || 0) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.25rem', padding: '1.5rem' };
    const btnPrimary = { padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.875rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' };
    const label = { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' };

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>📝 Food Logger</h1>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Track every meal, every bite, every day</p>
                    </div>

                    {/* Today's total */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Calories', val: Math.round(totals.calories), unit: 'kcal', color: '#6366f1' },
                            { label: 'Protein', val: Math.round(totals.protein * 10) / 10, unit: 'g', color: '#ef4444' },
                            { label: 'Carbs', val: Math.round(totals.carbs * 10) / 10, unit: 'g', color: '#f59e0b' },
                            { label: 'Fat', val: Math.round(totals.fat * 10) / 10, unit: 'g', color: '#10b981' },
                        ].map(m => (
                            <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>{m.label}</p>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</p>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{m.unit}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
                        {/* Left: Add food */}
                        <div style={card}>
                            {/* Meal type selector */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <p style={{ ...label, marginBottom: '0.75rem' }}>Meal Type</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {MEAL_TYPES.map(m => (
                                        <button key={m} onClick={() => setMealType(m)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.75rem', border: mealType === m ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: mealType === m ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: mealType === m ? '#a5b4fc' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'inherit' }}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mode tabs */}
                            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.875rem', padding: '0.3rem' }}>
                                {tabs.map(t => (
                                    <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'inherit', transition: 'all 0.2s', background: tab === t.id ? 'rgba(99,102,241,0.25)' : 'transparent', color: tab === t.id ? '#a5b4fc' : 'rgba(255,255,255,0.4)' }}>
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search tab */}
                            {tab === 'search' && (
                                <div>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <input className="log-input" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchFood()} placeholder="Search for food (e.g. apple, chicken breast)..." style={{ flex: 1 }} />
                                        <button onClick={searchFood} disabled={searching} style={btnPrimary}>{searching ? <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : '🔍'}</button>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <label style={label}>Quantity (grams)</label>
                                        <input className="log-input" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} style={{ width: '8rem' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                                        {searchResults.map((food, i) => (
                                            <div key={i} className="result-item" onClick={() => logFood(food)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>{food.name}</p>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{food.brand || food.category || 'Food'}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ margin: '0 0 0.2rem', fontWeight: 800, color: '#a5b4fc', fontSize: '0.9rem' }}>{Math.round((food.calories || 0) * quantity / 100)} kcal</p>
                                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>P: {Math.round((food.protein || 0) * quantity / 100 * 10) / 10}g · Tap to log</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && searchQuery && !searching && (
                                            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2rem' }}>No results. Try a different search term.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Custom tab */}
                            {tab === 'custom' && (
                                <form onSubmit={logCustom}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={label}>Food Name</label>
                                        <input className="log-input" type="text" value={custom.name} onChange={e => setCustom({ ...custom, name: e.target.value })} placeholder="My custom meal" required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        {[['calories', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']].map(([key, lbl]) => (
                                            <div key={key}>
                                                <label style={label}>{lbl}</label>
                                                <input className="log-input" type="number" step="0.1" min="0" value={custom[key]} onChange={e => setCustom({ ...custom, [key]: e.target.value })} placeholder="0" required />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>✏️ Log Custom Food</button>
                                </form>
                            )}

                            {/* Image tab */}
                            {tab === 'image' && (
                                <div>
                                    <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', marginBottom: '1rem', background: 'rgba(99,102,241,0.04)' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                                        <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Upload a food photo to identify nutrients via AI</p>
                                        <label style={{ ...btnPrimary, cursor: 'pointer', display: 'inline-flex' }}>
                                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                                            📸 Choose Photo
                                        </label>
                                        {imageFile && <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#6ee7b7' }}>✅ {imageFile.name}</p>}
                                    </div>
                                    {imageFile && (
                                        <button onClick={analyzeImage} disabled={analyzingImage} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
                                            {analyzingImage ? <><div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Analyzing...</> : '🧠 Analyze with AI'}
                                        </button>
                                    )}
                                    {imageResult && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.875rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#6ee7b7' }}>🍽 {imageResult.foodName || 'Food Detected'}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{imageResult.description || `Estimated: ${imageResult.calories || '?'} kcal`}</p>
                                            {imageResult.calories && (
                                                <button onClick={() => logFood(imageResult)} style={{ ...btnPrimary, marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>+ Log This Food</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Today's log tab */}
                            {tab === 'log' && (
                                <div>
                                    {loadingLog ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                                        </div>
                                    ) : todayLog.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2rem' }}>Nothing logged today. Start adding meals!</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {todayLog.map((entry, i) => (
                                                <div key={i} className="log-item">
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>{entry.name}</p>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{entry.mealType} · {entry.quantity && `${entry.quantity}g`}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ margin: '0 0 0.2rem', fontWeight: 800, color: '#a5b4fc', fontSize: '0.875rem' }}>{entry.calories} kcal</p>
                                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>P:{entry.protein?.toFixed(1)}g C:{entry.carbs?.toFixed(1)}g F:{entry.fat?.toFixed(1)}g</p>
                                                    </div>
                                                    <button onClick={() => deleteEntry(entry._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '1.1rem', padding: '0 0 0 0.5rem', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Today's summary */}
                        <div>
                            <div style={card}>
                                <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'white' }}>Today's Nutrition</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { label: 'Calories', val: Math.round(totals.calories), unit: 'kcal', color: '#6366f1', max: 2000 },
                                        { label: 'Protein', val: Math.round(totals.protein * 10) / 10, unit: 'g', color: '#ef4444', max: 150 },
                                        { label: 'Carbs', val: Math.round(totals.carbs * 10) / 10, unit: 'g', color: '#f59e0b', max: 250 },
                                        { label: 'Fat', val: Math.round(totals.fat * 10) / 10, unit: 'g', color: '#10b981', max: 65 },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{m.label}</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: m.color }}>{m.val} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{m.unit}</span></span>
                                            </div>
                                            <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color, borderRadius: '9999px', transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '1.25rem', display: 'flex', justify: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>Entries today</p>
                                    <span style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>{todayLog.length}</span>
                                </div>
                                <button onClick={fetchTodayLog} style={{ marginTop: '0.75rem', width: '100%', padding: '0.65rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8rem' }}>
                                    🔄 Refresh Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FoodLogger;
