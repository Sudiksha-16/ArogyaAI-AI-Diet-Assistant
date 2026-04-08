import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const S = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #080c14 0%, #0d1117 100%)',
        position: 'relative',
        overflow: 'hidden',
    },
    orb1: {
        position: 'fixed',
        top: '-10rem',
        left: '-10rem',
        width: '28rem',
        height: '28rem',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite',
    },
    orb2: {
        position: 'fixed',
        bottom: '-10rem',
        right: '-10rem',
        width: '28rem',
        height: '28rem',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'float 8s ease-in-out infinite reverse',
    },
    container: {
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1,
    },
    logoBox: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    logoIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '5rem',
        height: '5rem',
        borderRadius: '1.25rem',
        fontSize: '2.5rem',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        boxShadow: '0 0 40px rgba(99,102,241,0.5)',
        marginBottom: '1rem',
    },
    h1: {
        fontSize: '2rem',
        fontWeight: 800,
        color: 'white',
        margin: '0 0 0.25rem',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.9rem',
        margin: 0,
    },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        padding: '2rem',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
    },
    error: {
        marginBottom: '1.25rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.75rem',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#fca5a5',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    label: {
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '0.5rem',
    },
    fieldWrap: {
        position: 'relative',
        marginBottom: '1.25rem',
    },
    icon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '1rem',
        pointerEvents: 'none',
    },
    eyeBtn: {
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.35)',
        fontSize: '1rem',
        padding: 0,
    },
    submitBtn: {
        width: '100%',
        padding: '0.85rem',
        borderRadius: '0.875rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.95rem',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
    },
    divider: {
        textAlign: 'center',
        margin: '1.25rem 0',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '0.8rem',
    },
    linkText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.875rem',
    },
    link: {
        color: '#818cf8',
        fontWeight: 600,
        textDecoration: 'none',
    },
    featureRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.75rem',
        marginTop: '1.25rem',
    },
    featureItem: {
        textAlign: 'center',
        padding: '0.875rem 0.75rem',
        borderRadius: '0.875rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.25s ease',
    },
    featureIcon: {
        fontSize: '1.25rem',
        marginBottom: '0.375rem',
    },
};

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate(
                res.data.user.onboardingCompleted
                    ? '/dashboard'
                    : '/onboarding'
            );
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
            @keyframes float {
                0%,100%{transform:translateY(0)}
                50%{transform:translateY(-15px)}
            }
            @keyframes spin {
                to{transform:translateY(-50%) rotate(360deg)}
            }

            .login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(139,92,246,0.6) !important;
            }

            .auth-card:hover {
                border-color: rgba(99,102,241,0.4);
                box-shadow: 0 0 30px rgba(99,102,241,0.15);
            }

            .feature-card:hover {
                transform: translateY(-5px);
                background: rgba(99,102,241,0.08);
                border-color: rgba(99,102,241,0.4);
                box-shadow: 0 8px 25px rgba(99,102,241,0.2);
            }

            .auth-input {
                width:100%;
                padding:0.75rem 1rem 0.75rem 2.75rem;
                border-radius:0.75rem;
                background:rgba(255,255,255,0.06);
                border:1px solid rgba(255,255,255,0.1);
                color:white;
                font-size:0.875rem;
                outline:none;
                transition:all 0.2s;
            }

            .auth-input::placeholder {
                color:rgba(255,255,255,0.25);
            }

            .auth-input:focus {
                border-color:rgba(99,102,241,0.6);
                background:rgba(99,102,241,0.08);
                box-shadow:0 0 0 3px rgba(99,102,241,0.12);
            }
            `}</style>

            <div style={S.page}>
                <div style={S.orb1} />
                <div style={S.orb2} />

                <div style={S.container}>
                    <div style={S.logoBox}>
                        <div style={S.logoIcon}>🥗</div>
                        <h1 style={S.h1}>Welcome Back</h1>
                        <p style={S.subtitle}>
                            Sign in to access your personalized nutrition dashboard
                        </p>
                    </div>

                    <div style={S.card} className="auth-card">
                        {error && (
                            <div style={S.error}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <label style={S.label}>Email Address</label>
                            <div style={S.fieldWrap}>
                                <span style={S.icon}>✉️</span>
                                <input
                                    className="auth-input"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <label style={S.label}>Password</label>
                            <div style={S.fieldWrap}>
                                <span style={S.icon}>🔒</span>
                                <input
                                    className="auth-input"
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    style={S.eyeBtn}
                                    onClick={() => setShowPw(!showPw)}
                                >
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="login-btn"
                                style={{
                                    ...S.submitBtn,
                                    ...(loading
                                        ? { opacity: 0.6, cursor: 'not-allowed' }
                                        : {}),
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div
                                            style={{
                                                width: '1rem',
                                                height: '1rem',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: 'white',
                                                borderRadius: '50%',
                                                animation:
                                                    'spin 0.7s linear infinite',
                                            }}
                                        />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In →'
                                )}
                            </button>
                        </form>

                        <div style={S.divider}>— New here? —</div>
                        <p style={S.linkText}>
                            Don't have an account?{' '}
                            <Link to="/register" style={S.link}>
                                Create Account
                            </Link>
                        </p>
                    </div>

                    <div style={S.featureRow}>
                        {[
                            {
                                icon: '🧠',
                                title: 'AI Meal Plans',
                                desc: 'Personalized diet based on your goals',
                            },
                            {
                                icon: '📊',
                                title: 'Analytics',
                                desc: 'Track calories & nutrition insights',
                            },
                            {
                                icon: '🏆',
                                title: 'Achievements',
                                desc: 'Earn rewards for healthy habits',
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                style={S.featureItem}
                                className="feature-card"
                            >
                                <div style={S.featureIcon}>{f.icon}</div>
                                <p
                                    style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'white',
                                        margin: '0 0 0.25rem',
                                    }}
                                >
                                    {f.title}
                                </p>
                                <p
                                    style={{
                                        fontSize: '0.65rem',
                                        color: 'rgba(255,255,255,0.4)',
                                        margin: 0,
                                    }}
                                >
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

export default Login;