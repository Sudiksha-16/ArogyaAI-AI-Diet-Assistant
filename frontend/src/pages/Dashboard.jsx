import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .dash-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:1.25rem;padding:1.5rem;transition:all 0.25s;}
  .dash-card:hover{border-color:rgba(255,255,255,0.14);transform:translateY(-2px);}
  .quick-btn{display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1rem;border-radius:1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.2s;text-decoration:none;color:rgba(255,255,255,0.65);font-weight:600;font-size:0.8rem;}
  .quick-btn:hover{transform:translateY(-3px);background:rgba(99,102,241,0.12);border-color:rgba(99,102,241,0.35);color:white;}
  .hydro-btn{width:2.75rem;height:2.75rem;border-radius:50%;border:none;cursor:pointer;font-size:1.1rem;transition:all 0.2s;font-family:inherit;}
`;

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [hydration, setHydration] = useState(0);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const rawName = user.email?.split('@')[0] || 'User';
    const capitalizedName =rawName.charAt(0).toUpperCase() + rawName.slice(1);

    useEffect(() => {
        api.get('/analytics/dashboard')
            .then(r => { setData(r.data); setHydration(r.data.hydrationToday || 0); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite' }}>🥗</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>Loading dashboard...</p>
            </div>
        </div>
    );

    const cals = data?.todayTotals?.calories || 0;
    const target = data?.targets?.calories || 2200;
    const protein = data?.todayTotals?.protein || 0;
    const carbs = data?.todayTotals?.carbs || 0;
    const fat = data?.todayTotals?.fat || 0;
    const tProtein = data?.targets?.protein || 150;
    const tCarbs = data?.targets?.carbs || 250;
    const tFat = data?.targets?.fat || 65;
    const streak = data?.streak || 0;
    const hydrationGoal = data?.hydrationGoal || 8;

    const calPct = Math.min((cals / target) * 100, 100);
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (calPct / 100) * circumference;

    const logHydration = async (glasses) => {
        const newVal = Math.max(0, Math.min(hydrationGoal, glasses));
        setHydration(newVal);
        try { await api.post('/food-log/hydration', { glasses: newVal }); } catch { }
    };

    const macros = [
        { name: 'Protein', val: protein, target: tProtein, unit: 'g', color: '#6366f1' },
        { name: 'Carbs', val: carbs, target: tCarbs, unit: 'g', color: '#f59e0b' },
        { name: 'Fat', val: fat, target: tFat, unit: 'g', color: '#10b981' },
    ];

    const quickActions = [
        { icon: '🍽️', label: 'Meal Plan', to: '/meal-planner', color: '#6366f1' },
        { icon: '📝', label: 'Log Food', to: '/food-logger', color: '#10b981' },
        { icon: '📊', label: 'Analytics', to: '/analytics', color: '#f59e0b' },
        { icon: '🧠', label: 'AI Coach', to: '/chatbot', color: '#8b5cf6' },
        { icon: '📍', label: 'Places', to: '/places', color: '#ef4444' },
    ];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                    {/* Greeting */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>{greeting} 👋</p>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                            {capitalizedName}'s Dashboard
                        </h1>
                        {streak > 0 && <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.875rem', borderRadius: '9999px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fdba74', fontSize: '0.8rem', fontWeight: 700 }}>🔥 {streak}-day streak!</div>}
                    </div>

                    {/* Main grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {/* Calories ring */}
                        <div className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', gridColumn: 'span 1' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <svg width="130" height="130" viewBox="0 0 130 130">
                                    <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
                                    <circle cx="65" cy="65" r="54" fill="none" stroke="url(#calGrad)" strokeWidth="12"
                                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
                                    <defs>
                                        <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{cals.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/ {target.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>kcal</span>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '1rem', color: 'white' }}>Today's Calories</p>
                                <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{Math.round(target - cals)} kcal remaining</p>
                                {macros.map(m => (
                                    <div key={m.name} style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{m.name}</span>
                                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{Math.round(m.val)}g / {m.target}g</span>
                                        </div>
                                        <div style={{ height: '5px', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min((m.val / m.target) * 100, 100)}%`, background: m.color, borderRadius: '9999px', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hydration */}
                        <div className="dash-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.2rem', fontWeight: 700, color: 'white' }}>💧 Hydration</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{hydration} of {hydrationGoal} glasses</p>
                                </div>
                                <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
                                    {Math.round((hydration / hydrationGoal) * 100)}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {Array.from({ length: hydrationGoal }, (_, i) => (
                                    <button key={i} onClick={() => logHydration(i + 1)}
                                        style={{
                                            width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s',
                                            background: i < hydration ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)',
                                            boxShadow: i < hydration ? '0 0 8px rgba(59,130,246,0.3)' : 'none',
                                        }}>
                                        💧
                                    </button>
                                ))}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                    <button onClick={() => logHydration(hydration - 1)} style={{ flex: 1, marginRight: '0.5rem', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>−</button>
                                    <button onClick={() => logHydration(hydration + 1)} style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>+ Glass</button>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>📈 Daily Stats</p>
                            {[
                                { label: 'Streak', value: `${streak} days 🔥`, color: '#f59e0b' },
                                { label: 'Calories left', value: `${Math.max(0, target - cals).toLocaleString()} kcal`, color: '#6366f1' },
                                { label: 'Hydration', value: `${hydration}/${hydrationGoal} glasses`, color: '#3b82f6' },
                                { label: 'Protein status', value: protein >= tProtein ? '✅ Goal met!' : `${Math.round(tProtein - protein)}g more`, color: protein >= tProtein ? '#10b981' : '#f59e0b' },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{s.label}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="dash-card" style={{ marginTop: '0.5rem' }}>
                        <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'white' }}>⚡ Quick Actions</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                            {quickActions.map(a => (
                                <a key={a.to} href={a.to} className="quick-btn">
                                    <span style={{ fontSize: '2rem' }}>{a.icon}</span>
                                    {a.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    {data?.recentAchievements?.length > 0 && (
                        <div className="dash-card" style={{ marginTop: '1rem' }}>
                            <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'white' }}>🏆 Recent Achievements</p>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {data.recentAchievements.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.875rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{a.icon || '🏅'}</span>
                                        <div>
                                            <p style={{ margin: '0 0 0.125rem', fontWeight: 700, fontSize: '0.85rem', color: '#fcd34d' }}>{a.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{a.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
