import { useState, useEffect } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .stat-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:1.25rem;padding:1.25rem;transition:all 0.25s;}
  .stat-card:hover{border-color:rgba(255,255,255,0.14);transform:translateY(-2px);}
`;

const Analytics = () => {
    const [weekly, setWeekly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(7);

    useEffect(() => {
        api.get(`/analytics/weekly?days=${range}`)
            .then(r => setWeekly(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [range]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
    );

    const days = weekly?.daily || [];
    const adherence = weekly?.adherencePercent || 0;
    const avgCal = days.length ? Math.round(days.reduce((s, d) => s + (d.calories || 0), 0) / days.length) : 0;
    const avgProtein = days.length ? Math.round(days.reduce((s, d) => s + (d.protein || 0), 0) / days.length) : 0;
    const maxCal = Math.max(...days.map(d => d.calories || 0), 1);

    const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.25rem', padding: '1.5rem' };
    const label = { display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' };

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>📊 Analytics</h1>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Track your nutrition over time</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[7, 14, 30].map(d => (
                                <button key={d} onClick={() => { setRange(d); setLoading(true); }}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: range === d ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)', background: range === d ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: range === d ? '#a5b4fc' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Avg Calories/day', value: `${avgCal}`, unit: 'kcal', color: '#6366f1', icon: '🔥' },
                            { label: 'Avg Protein/day', value: `${avgProtein}`, unit: 'g', color: '#ef4444', icon: '💪' },
                            { label: 'Goal Adherence', value: `${adherence}`, unit: '%', color: adherence >= 80 ? '#10b981' : '#f59e0b', icon: '🎯' },
                            { label: 'Days Logged', value: `${days.filter(d => d.calories > 0).length}`, unit: `/ ${days.length}`, color: '#3b82f6', icon: '📅' },
                        ].map(s => (
                            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                                <p style={label}>{s.label}</p>
                                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}<span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginLeft: '0.25rem' }}>{s.unit}</span></p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Calories Bar Chart */}
                        <div style={card}>
                            <p style={{ margin: '0 0 1.25rem', fontWeight: 700, color: 'white' }}>🔥 Calorie Intake</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', height: '180px' }}>
                                {days.map((d, i) => {
                                    const pct = maxCal > 0 ? (d.calories || 0) / maxCal : 0;
                                    const dt = new Date(d.date || d._id);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', height: '100%', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#a5b4fc', fontWeight: 700, writingMode: 'initial' }}>{d.calories > 0 ? d.calories : ''}</span>
                                            <div style={{ width: '100%', height: `${Math.max(pct * 140, d.calories > 0 ? 6 : 2)}px`, borderRadius: '0.375rem 0.375rem 0 0', background: d.calories > 0 ? 'linear-gradient(180deg,#8b5cf6,#6366f1)' : 'rgba(255,255,255,0.07)', transition: 'height 0.6s ease', boxShadow: d.calories > 0 ? '0 0 8px rgba(99,102,241,0.3)' : 'none', minHeight: '3px' }} />
                                            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)' }}>{isNaN(dt) ? `D${i + 1}` : dt.toLocaleDateString('en', { weekday: 'short' })}</span>
                                        </div>
                                    );
                                })}
                                {days.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', margin: 'auto', fontSize: '0.875rem' }}>No data yet</p>}
                            </div>
                        </div>

                        {/* Macro breakdown */}
                        <div style={card}>
                            <p style={{ margin: '0 0 1.25rem', fontWeight: 700, color: 'white' }}>🥦 Macro Breakdown</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { name: 'Protein', key: 'protein', color: '#ef4444', icon: '🥩' },
                                    { name: 'Carbohydrates', key: 'carbs', color: '#f59e0b', icon: '🍞' },
                                    { name: 'Fat', key: 'fat', color: '#10b981', icon: '🥑' },
                                ].map(m => {
                                    const total = days.reduce((s, d) => s + (d[m.key] || 0), 0);
                                    const avg = days.length ? Math.round(total / days.length) : 0;
                                    const maxVal = Math.max(...days.map(d => d[m.key] || 0), 1);
                                    return (
                                        <div key={m.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{m.icon} {m.name}</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: m.color }}>{avg}g avg/day</span>
                                            </div>
                                            <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${Math.min((avg / (m.name === 'Protein' ? 150 : m.name === 'Carbohydrates' ? 250 : 65)) * 100, 100)}%`, background: m.color, borderRadius: '9999px', transition: 'width 0.8s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Mini stacked bars */}
                            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.25rem', height: '40px', alignItems: 'flex-end' }}>
                                {days.slice(-7).map((d, i) => {
                                    const total = (d.protein || 0) * 4 + (d.carbs || 0) * 4 + (d.fat || 0) * 9;
                                    if (!total) return <div key={i} style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }} />;
                                    const pPct = ((d.protein || 0) * 4 / total) * 100;
                                    const cPct = ((d.carbs || 0) * 4 / total) * 100;
                                    const fPct = ((d.fat || 0) * 9 / total) * 100;
                                    const maxT = Math.max(...days.map(d => (d.protein || 0) * 4 + (d.carbs || 0) * 4 + (d.fat || 0) * 9), 1);
                                    const h = Math.max((total / maxT) * 36, 4);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                                            <div style={{ height: `${h}px`, borderRadius: '3px 3px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ background: '#ef4444', flex: pPct }} />
                                                <div style={{ background: '#f59e0b', flex: cPct }} />
                                                <div style={{ background: '#10b981', flex: fPct }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                {[{ color: '#ef4444', label: 'Protein' }, { color: '#f59e0b', label: 'Carbs' }, { color: '#10b981', label: 'Fat' }].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} /> {l.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Goal adherence ring */}
                        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none"
                                        stroke={adherence >= 80 ? '#10b981' : adherence >= 50 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - adherence / 100)}`}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{adherence}%</span>
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>adherence</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'white', fontSize: '1rem' }}>🎯 Goal Adherence</p>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Days within 10% of calorie target</p>
                                <div style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', background: adherence >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${adherence >= 80 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                    <p style={{ margin: 0, fontSize: '0.825rem', fontWeight: 700, color: adherence >= 80 ? '#6ee7b7' : '#fcd34d' }}>
                                        {adherence >= 80 ? '🌟 Excellent! Keep it up!' : adherence >= 50 ? '📈 Getting there!' : '💡 Try to log daily!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weekly totals */}
                        <div style={card}>
                            <p style={{ margin: '0 0 1.25rem', fontWeight: 700, color: 'white' }}>📈 {range}-Day Summary</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {[
                                    { label: 'Total Calories', value: days.reduce((s, d) => s + (d.calories || 0), 0).toLocaleString(), unit: 'kcal', color: '#6366f1' },
                                    { label: 'Total Protein', value: `${Math.round(days.reduce((s, d) => s + (d.protein || 0), 0))}`, unit: 'g', color: '#ef4444' },
                                    { label: 'Total Carbs', value: `${Math.round(days.reduce((s, d) => s + (d.carbs || 0), 0))}`, unit: 'g', color: '#f59e0b' },
                                    { label: 'Total Fat', value: `${Math.round(days.reduce((s, d) => s + (d.fat || 0), 0))}`, unit: 'g', color: '#10b981' },
                                    { label: 'Avg Hydration', value: weekly?.avgHydration?.toFixed(1) || '0', unit: 'glasses/day', color: '#3b82f6' },
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{s.label}</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: s.color }}>{s.value} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: '0.75rem' }}>{s.unit}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Analytics;
