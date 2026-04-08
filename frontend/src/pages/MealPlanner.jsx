import { useState, useEffect } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .meal-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:1.25rem;overflow:hidden;transition:all 0.3s;}
  .meal-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.3);border-color:rgba(99,102,241,0.3);}
  .icon-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.4rem 0.75rem;cursor:pointer;color:rgba(255,255,255,0.65);font-size:0.78rem;font-weight:600;transition:all 0.2s;font-family:inherit;}
  .icon-btn:hover{background:rgba(255,255,255,0.12);color:white;}
`;

const MEAL_TYPES = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];

const MealPlanner = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [savedPlan, setSavedPlan] = useState(null);
    const [days, setDays] = useState(7);
    const [activeDay, setActiveDay] = useState(0);
    const [preferences, setPreferences] = useState('');

    useEffect(() => {
        api.get('/meal-plan/current').then(r => setSavedPlan(r.data.mealPlan)).catch(() => { });
    }, []);

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await api.post('/meal-plan/generate', { days, preferences });
            setPlan(res.data.mealPlan);
        } catch (e) {
            alert(e.response?.data?.error || 'Error generating meal plan. Check your OpenAI API key.');
        } finally { setLoading(false); }
    };

    const savePlan = async () => {
        try {
            await api.post('/meal-plan/save', { mealPlan: plan });
            setSavedPlan(plan);
            alert('✅ Meal plan saved!');
        } catch { alert('Error saving plan'); }
    };

    const downloadGroceryList = async () => {
        try {
            const res = await api.get('/meal-plan/grocery-list', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'grocery-list.pdf'; a.click();
        } catch { alert('Error downloading grocery list'); }
    };

    const displayPlan = plan || savedPlan;

    const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.25rem', padding: '1.5rem' };
    const btnPrimary = { padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.875rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' };
    const btnSuccess = { padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontSize: '0.875rem', fontFamily: 'inherit' };
    const btnSec = { padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontFamily: 'inherit' };

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>🍽️ AI Meal Planner</h1>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Generate a personalized meal plan with AI</p>
                        </div>
                        {displayPlan && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {plan && <button onClick={savePlan} style={btnSuccess}>💾 Save Plan</button>}
                                <button onClick={downloadGroceryList} style={btnSec}>🛒 Grocery List</button>
                            </div>
                        )}
                    </div>

                    {/* Generate section */}
                    <div style={{ ...card, marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'white' }}>⚡ Generate New Plan</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Days</label>
                                <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}>
                                    {[1, 3, 5, 7, 14].map(d => <option key={d} value={d} style={{ background: '#0d1117' }}>{d} day{d > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Special Preferences</label>
                                <input type="text" value={preferences} onChange={e => setPreferences(e.target.value)}
                                    placeholder="e.g. no nuts, Mediterranean style, high protein..."
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <button onClick={generatePlan} disabled={loading} style={{ ...btnPrimary, whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? <><div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Generating AI Plan...</> : '🧠 Generate Plan'}
                            </button>
                        </div>
                    </div>

                    {/* Display plan */}
                    {displayPlan && Array.isArray(displayPlan) ? (
                        <>
                            {/* Day tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                {displayPlan.map((day, i) => (
                                    <button key={i} onClick={() => setActiveDay(i)}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: activeDay === i ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: activeDay === i ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: activeDay === i ? '#a5b4fc' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                        Day {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Meals grid */}
                            {displayPlan[activeDay] && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                                    {Object.entries(displayPlan[activeDay]).map(([mealType, meal]) => (
                                        meal && (
                                            <div key={mealType} className="meal-card">
                                                {meal.image && (
                                                    <img src={meal.image} alt={meal.name || mealType} style={{ width: '100%', height: '160px', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                {!meal.image && (
                                                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'rgba(99,102,241,0.08)' }}>
                                                        {mealType.includes('Breakfast') ? '🍳' : mealType.includes('Lunch') ? '🥗' : mealType.includes('Dinner') ? '🍽️' : '🍎'}
                                                    </div>
                                                )}
                                                <div style={{ padding: '1rem' }}>
                                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>{mealType}</p>
                                                    <h3 style={{ margin: '0 0 0.625rem', fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{meal.name || 'Meal'}</h3>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                                        {meal.calories && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>{meal.calories} kcal</span>}
                                                        {meal.protein && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>{meal.protein}g protein</span>}
                                                    </div>
                                                    {meal.description && <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{meal.description}</p>}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </>
                    ) : displayPlan && typeof displayPlan === 'object' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                            {Object.entries(displayPlan).map(([mealType, meal]) => (
                                meal && (
                                    <div key={mealType} className="meal-card">
                                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'rgba(99,102,241,0.08)' }}>
                                            {mealType.includes('reakfast') ? '🍳' : mealType.includes('unch') ? '🥗' : mealType.includes('inner') ? '🍽️' : '🍎'}
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>{mealType}</p>
                                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{typeof meal === 'string' ? meal : meal.name || mealType}</h3>
                                            {typeof meal === 'object' && meal.calories && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>{meal.calories} kcal</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', ...card }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 5s ease-in-out infinite' }}>🍽️</div>
                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>No Meal Plan Yet</h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>Click "Generate Plan" to create your personalized AI-powered meal plan</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MealPlanner;
