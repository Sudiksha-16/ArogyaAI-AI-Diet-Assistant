import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const STEPS = [
    { id: 1, icon: '👤', title: 'Basic Info', subtitle: 'Tell us about yourself' },
    { id: 2, icon: '🎯', title: 'Goals', subtitle: 'What do you want to achieve?' },
    { id: 3, icon: '🥗', title: 'Diet', subtitle: 'Your dietary preferences' },
    { id: 4, icon: '✅', title: 'Review', subtitle: 'Confirm your details' },
];

const GOALS = [
    { value: 'lose_weight', label: 'Lose Weight', icon: '⬇️', desc: '−500 cal deficit/day', color: '#ef4444' },
    { value: 'maintain_weight', label: 'Maintain', icon: '⚖️', desc: 'Stay at current weight', color: '#6366f1' },
    { value: 'gain_weight', label: 'Gain Weight', icon: '⬆️', desc: '+300 cal surplus/day', color: '#f59e0b' },
    { value: 'build_muscle', label: 'Build Muscle', icon: '💪', desc: '+300 cal + high protein', color: '#10b981' },
];

const ACTIVITY = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', icon: '💺' },
    { value: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week', icon: '🚶' },
    { value: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week', icon: '🏃' },
    { value: 'very_active', label: 'Very Active', desc: '6–7 days/week', icon: '💪' },
    { value: 'extremely_active', label: 'Athlete', desc: 'Physical job or 2x/day', icon: '🏋️' },
];

const DIET_OPTIONS = [
    { value: 'vegetarian', icon: '🥦', label: 'Vegetarian' },
    { value: 'vegan', icon: '🌱', label: 'Vegan' },
    { value: 'keto', icon: '🥑', label: 'Keto' },
    { value: 'paleo', icon: '🥩', label: 'Paleo' },
    { value: 'gluten-free', icon: '🌾', label: 'Gluten-Free' },
    { value: 'dairy-free', icon: '🥛', label: 'Dairy-Free' },
    { value: 'halal', icon: '☪️', label: 'Halal' },
    { value: 'kosher', icon: '✡️', label: 'Kosher' },
];

const css = `
  @keyframes spin { to{transform:rotate(360deg)} }
  .onb-input { width:100%; padding:0.75rem 1rem; border-radius:0.75rem; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:white; font-size:0.875rem; outline:none; transition:all 0.2s; font-family:inherit; }
  .onb-input::placeholder{color:rgba(255,255,255,0.25);}
  .onb-input:focus{border-color:rgba(99,102,241,0.6);background:rgba(99,102,241,0.08);box-shadow:0 0 0 3px rgba(99,102,241,0.12);}
  .onb-progress { background:rgba(255,255,255,0.07); height:3px; border-radius:9999px; overflow:hidden; }
`;

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    //console.log("Current Step:", step);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        age: '', gender: 'male', height: '', weight: '', targetWeight: '',
        activityLevel: 'moderately_active', goal: 'maintain_weight',
        dietaryRestrictions: [], allergies: '', healthConditions: '',
    });

    const change = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const list = form.dietaryRestrictions;
            setForm({ ...form, dietaryRestrictions: checked ? [...list, value] : list.filter(r => r !== value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        //e.preventDefault();
        if (step !== 4) return;
        setLoading(true);
        try {
            await api.post('/profile/onboarding', {
                ...form,
                age: parseInt(form.age), height: parseFloat(form.height),
                weight: parseFloat(form.weight), targetWeight: parseFloat(form.targetWeight),
                allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean),
                healthConditions: form.healthConditions.split(',').map(h => h.trim()).filter(Boolean),
            });
            navigate('/dashboard');
        } catch { alert('Error saving profile. Please try again.'); }
        finally { setLoading(false); }
    };

    const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '1.5rem', padding: '2rem', backdropFilter: 'blur(20px)' };
    const label = { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' };
    const optBtn = (active, activeColor = 'rgba(99,102,241,0.15)', activeBorder = 'rgba(99,102,241,0.4)') => ({
        background: active ? activeColor : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? activeBorder : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
        color: active ? 'white' : 'rgba(255,255,255,0.55)',
    });
    const btnPrimary = { padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.9rem', fontFamily: 'inherit' };
    const btnSecondary = { padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', fontFamily: 'inherit' };

    return (
        <>
            <style>{css}</style>
            <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', background: 'linear-gradient(135deg,#080c14,#0d1117)' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Setup Wizard</p>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'white' }}>Build Your Profile</h1>
                    </div>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '1.25rem', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }}>
                            <div style={{ height: '100%', width: `${((step - 1) / 3) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.5s ease', borderRadius: '9999px' }} />
                        </div>
                        {STEPS.map(s => (
                            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, transition: 'all 0.3s',
                                    background: step > s.id ? 'linear-gradient(135deg,#10b981,#059669)' : step === s.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.08)',
                                    boxShadow: step >= s.id ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                                    border: step < s.id ? '2px solid rgba(255,255,255,0.12)' : 'none',
                                    color: step >= s.id ? 'white' : 'rgba(255,255,255,0.3)',
                                }}>
                                    {step > s.id ? '✓' : s.icon}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, color: step >= s.id ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.title}</p>
                            </div>
                        ))}
                    </div>

                    {/* Card */}
                    <div style={card}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>{STEPS[step - 1].title}</h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{STEPS[step - 1].subtitle}</p>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                            {/* Step 1 */}
                            {step === 1 && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        {['male', 'female', 'other'].map(g => (
                                            <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                                                style={{ ...optBtn(form.gender === g), padding: '0.75rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                                {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚧ Other'}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[
                                            { name: 'age', label: 'Age (years)', placeholder: '25', min: 14, max: 100 },
                                            { name: 'height', label: 'Height (cm)', placeholder: '170', min: 100, max: 250 },
                                            { name: 'weight', label: 'Current Weight (kg)', placeholder: '70', step: '0.1' },
                                            { name: 'targetWeight', label: 'Target Weight (kg)', placeholder: '65', step: '0.1' },
                                        ].map(f => (
                                            <div key={f.name}>
                                                <label style={label}>{f.label}</label>
                                                <input className="onb-input" type="number" name={f.name} value={form[f.name]}
                                                    onChange={change} placeholder={f.placeholder} step={f.step} min={f.min} max={f.max} required />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <div>
                                    <label style={{ ...label, marginBottom: '0.75rem' }}>Primary Goal</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        {GOALS.map(g => (
                                            <button key={g.value} type="button" onClick={() => setForm({ ...form, goal: g.value })}
                                                style={{ ...optBtn(form.goal === g.value, `${g.color}18`, `${g.color}50`), padding: '1rem', textAlign: 'left' }}>
                                                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{g.icon}</div>
                                                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.875rem' }}>{g.label}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{g.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <label style={{ ...label, marginBottom: '0.75rem' }}>Activity Level</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {ACTIVITY.map(a => (
                                            <button key={a.value} type="button" onClick={() => setForm({ ...form, activityLevel: a.value })}
                                                style={{ ...optBtn(form.activityLevel === a.value), padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', width: '100%' }}>
                                                <span style={{ fontSize: '1.75rem' }}>{a.icon}</span>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.875rem' }}>{a.label}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{a.desc}</p>
                                                </div>
                                                {form.activityLevel === a.value && <span style={{ marginLeft: 'auto', color: '#818cf8', fontWeight: 700 }}>✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <div>
                                    <label style={{ ...label, marginBottom: '0.75rem' }}>Dietary Restrictions</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                        {DIET_OPTIONS.map(d => {
                                            const isSelected = form.dietaryRestrictions.includes(d.value);
                                            return (
                                                <label key={d.value} style={{ ...optBtn(isSelected, 'rgba(16,185,129,0.1)', 'rgba(16,185,129,0.4)'), display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}>
                                                    <input type="checkbox" value={d.value} checked={isSelected} onChange={change} style={{ display: 'none' }} />
                                                    <span style={{ fontSize: '1.25rem' }}>{d.icon}</span>
                                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.label}</span>
                                                    {isSelected && <span style={{ marginLeft: 'auto', color: '#6ee7b7' }}>✓</span>}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {[{ name: 'allergies', label: 'Known Allergies', placeholder: 'peanuts, shellfish, milk (comma-separated)' },
                                    { name: 'healthConditions', label: 'Health Conditions', placeholder: 'diabetes, hypertension (comma-separated)' }].map(f => (
                                        <div key={f.name} style={{ marginBottom: '1rem' }}>
                                            <label style={label}>{f.label}</label>
                                            <input className="onb-input" type="text" name={f.name} value={form[f.name]} onChange={change} placeholder={f.placeholder} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 4 — Review */}
                            {step === 4 && (
                                <div>
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '4rem' }}>🎉</div>
                                        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Everything looks great! Let's set up your dashboard.</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        {[
                                            { label: 'Age', value: `${form.age} years` },
                                            { label: 'Gender', value: form.gender },
                                            { label: 'Height', value: `${form.height} cm` },
                                            { label: 'Weight', value: `${form.weight} → ${form.targetWeight} kg` },
                                            { label: 'Activity', value: form.activityLevel.replace(/_/g, ' ') },
                                            { label: 'Goal', value: form.goal.replace(/_/g, ' ') },
                                        ].map(item => (
                                            <div key={item.label} style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>{item.label}</p>
                                                <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.875rem', textTransform: 'capitalize' }}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {form.dietaryRestrictions.length > 0 && (
                                        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>Diet Restrictions</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {form.dietaryRestrictions.map(r => (
                                                    <span key={r} style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)', textTransform: 'capitalize' }}>{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nav buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                                {step > 1 && <button type="button" onClick={() => setStep(step - 1)} style={{ ...btnSecondary, flex: 1 }}>← Back</button>}
                                {step < 4 ? (
                                    <button type="button" onClick={() => setStep(step + 1)} style={{ ...btnPrimary, flex: 1 }}>Continue →</button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{
                                            ...btnPrimary,
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            opacity: loading ? 0.6 : 1
                                        }}
                                    >
                                        {loading ? <><div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</> : '🚀 Launch Dashboard'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Onboarding;
