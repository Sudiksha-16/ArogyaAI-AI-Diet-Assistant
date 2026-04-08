import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const getStrength = () => {
        const p = form.password;
        if (!p) return { w: 0, label: '', color: '' };
        if (p.length < 6) return { w: 25, label: 'Weak', color: '#ef4444' };
        if (p.length < 10) return { w: 50, label: 'Fair', color: '#f59e0b' };
        if (p.match(/[A-Z]/) && p.match(/[0-9]/)) return { w: 100, label: 'Strong', color: '#10b981' };
        return { w: 75, label: 'Good', color: '#6366f1' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword)
            return setError('Passwords do not match');
        if (form.password.length < 6)
            return setError('Password must be at least 6 characters');

        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                email: form.email,
                password: form.password,
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/onboarding');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const str = getStrength();
    const confirmMatch =
        form.confirmPassword && form.confirmPassword === form.password;
    const confirmWrong =
        form.confirmPassword && form.confirmPassword !== form.password;

    const page = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #080c14 0%, #0d1117 100%)',
        position: 'relative',
        overflow: 'hidden',
    };

    const orb = (top, right, left, bottom, color) => ({
        position: 'fixed',
        top,
        right,
        left,
        bottom,
        width: '28rem',
        height: '28rem',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite',
    });

    const card = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        padding: '2rem',
        backdropFilter: 'blur(20px)',
    };

    return (
        <>
            <style>{`
                @keyframes float {
                    0%,100%{transform:translateY(0)}
                    50%{transform:translateY(-15px)}
                }
                @keyframes spin {
                    to{transform:rotate(360deg)}
                }

                .reg-input {
                    width:100%;
                    padding:0.75rem 1rem 0.75rem 2.75rem;
                    border-radius:0.75rem;
                    background:rgba(255,255,255,0.06);
                    border:1px solid rgba(255,255,255,0.1);
                    color:white;
                    font-size:0.875rem;
                    outline:none;
                    transition:all 0.2s;
                    font-family:inherit;
                }

                .reg-input::placeholder{
                    color:rgba(255,255,255,0.25);
                }

                .reg-input:focus{
                    border-color:rgba(99,102,241,0.6);
                    background:rgba(99,102,241,0.08);
                    box-shadow:0 0 0 3px rgba(99,102,241,0.12);
                }

                .reg-btn:hover{
                    transform:translateY(-2px);
                    box-shadow:0 8px 25px rgba(16,185,129,0.5)!important;
                }

                /* Improved Feature Card Hover */
                .reg-feature-card:hover {
                    transform: translateY(-5px);
                    background: rgba(16,185,129,0.08);
                    border-color: rgba(16,185,129,0.4);
                    box-shadow: 0 8px 25px rgba(16,185,129,0.2);
                }
            `}</style>

            <div style={page}>
                <div style={orb('-10rem', '-10rem', 'auto', 'auto', 'rgba(16,185,129,0.2)')} />
                <div style={orb('auto', 'auto', '-10rem', '-10rem', 'rgba(139,92,246,0.18)')} />

                <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '1.25rem',
                            fontSize: '2.5rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 0 40px rgba(16,185,129,0.5)',
                            marginBottom: '1rem',
                        }}>🌱</div>

                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: 'white',
                            margin: '0 0 0.25rem'
                        }}>
                            Start Your Journey
                        </h1>

                        <p style={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '0.9rem',
                            margin: 0
                        }}>
                            Start your personalized AI nutrition journey
                        </p>
                    </div>

                    {/* Card */}
                    <div style={card}>
                        {error && (
                            <div style={{
                                marginBottom: '1.25rem',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.75rem',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#fca5a5',
                                fontSize: '0.875rem',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Email Address
                                </label>

                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.3)',
                                        pointerEvents: 'none'
                                    }}>✉️</span>

                                    <input
                                        className="reg-input"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Password
                                </label>

                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.3)',
                                        pointerEvents: 'none'
                                    }}>🔒</span>

                                    <input
                                        className="reg-input"
                                        type={showPw ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        required
                                        style={{ paddingRight: '3rem' }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'rgba(255,255,255,0.35)',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {showPw ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                {form.password && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{
                                            height: '4px',
                                            borderRadius: '9999px',
                                            background: 'rgba(255,255,255,0.07)',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${str.w}%`,
                                                background: str.color,
                                                borderRadius: '9999px',
                                                transition: 'width 0.4s, background 0.4s'
                                            }} />
                                        </div>

                                        <p style={{
                                            margin: '0.25rem 0 0',
                                            fontSize: '0.75rem',
                                            color: str.color,
                                            fontWeight: 600
                                        }}>
                                            {str.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'rgba(255,255,255,0.4)',
                                    marginBottom: '0.5rem'
                                }}>
                                    Confirm Password
                                </label>

                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: confirmMatch ? '#10b981' : 'rgba(255,255,255,0.3)',
                                        pointerEvents: 'none'
                                    }}>
                                        {confirmMatch ? '✅' : '🔒'}
                                    </span>

                                    <input
                                        className="reg-input"
                                        type={showPw ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            borderColor: confirmMatch
                                                ? 'rgba(16,185,129,0.5)'
                                                : confirmWrong
                                                ? 'rgba(239,68,68,0.5)'
                                                : undefined
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="reg-btn"
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '0.875rem',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                                    opacity: loading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.95rem',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '1rem',
                                            height: '1rem',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.7s linear infinite'
                                        }} />
                                        Creating Account...
                                    </>
                                ) : '🌱 Create Account'}
                            </button>
                        </form>

                        <p style={{
                            textAlign: 'center',
                            marginTop: '1.25rem',
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '0.875rem'
                        }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: '#818cf8',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                Sign In
                            </Link>
                        </p>
                    </div>

                    {/* Improved Bottom Feature Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.75rem',
                        marginTop: '1.25rem'
                    }}>
                        {[
                            {
                                icon: '🔒',
                                title: 'Secure & Private',
                                desc: 'Encrypted authentication & protected data'
                            },
                            {
                                icon: '🚀',
                                title: 'Free to Start',
                                desc: 'No hidden charges or commitments'
                            },
                            {
                                icon: '💪',
                                title: 'Personalized',
                                desc: 'AI adapts to your health goals'
                            }
                        ].map(f => (
                            <div
                                key={f.title}
                                className="reg-feature-card"
                                style={{
                                    textAlign: 'center',
                                    padding: '1rem 0.75rem',
                                    borderRadius: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '1.3rem',
                                    marginBottom: '0.4rem'
                                }}>
                                    {f.icon}
                                </div>

                                <p style={{
                                    margin: '0 0 0.25rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'white'
                                }}>
                                    {f.title}
                                </p>

                                <p style={{
                                    margin: 0,
                                    fontSize: '0.65rem',
                                    color: 'rgba(255,255,255,0.4)'
                                }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;