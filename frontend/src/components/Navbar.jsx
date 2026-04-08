import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/meal-planner', icon: '🍽️', label: 'Meal Plan' },
    { to: '/food-logger', icon: '📝', label: 'Log Food' },
    { to: '/analytics', icon: '📊', label: 'Analytics' },
    { to: '/places', icon: '📍', label: 'Places' },
    { to: '/chatbot', icon: '🧠', label: 'AI Coach' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <style>{`
        .nav-link { display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.85rem;border-radius:0.75rem;font-size:0.82rem;font-weight:600;text-decoration:none;transition:all 0.2s;border:1px solid transparent;color:rgba(255,255,255,0.5); }
        .nav-link:hover { color:white;background:rgba(255,255,255,0.06); }
        .nav-link.active { color:#a5b4fc;background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.3); }
        .nav-logout { padding:0.4rem 1rem;border-radius:0.75rem;font-size:0.8rem;font-weight:600;cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);transition:all 0.2s;font-family:inherit; }
        .nav-logout:hover { background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);color:#fca5a5; }
        .nav-mob-link { display:flex;flex-direction:column;align-items:center;gap:0.35rem;padding:0.75rem 0.5rem;border-radius:0.875rem;text-decoration:none;font-size:0.7rem;font-weight:600;transition:all 0.2s;border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.5); }
        .nav-mob-link:hover { color:white;background:rgba(255,255,255,0.06); }
        .nav-mob-link.active { color:#a5b4fc;background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.3); }
        .ham-line { display:block;width:20px;height:2px;border-radius:2px;background:rgba(255,255,255,0.7);transition:all 0.3s; }
      `}</style>

            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(8,12,20,0.88)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

                    {/* Logo */}
                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
                        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 15px rgba(99,102,241,0.4)' }}>🥗</div>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.02em' }}>Arogya<span style={{ color: '#818cf8' }}>AI</span></span>
                    </Link>

                    {/* Desktop nav links */}
                    <div style={{ display: 'none', flex: 1, justifyContent: 'center', gap: '0.25rem' }} className="desktop-nav">
                        {NAV_LINKS.map(l => (
                            <Link key={l.to} to={l.to} className={`nav-link${isActive(l.to) ? ' active' : ''}`}>
                                <span>{l.icon}</span> {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop user + logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>
                                {(user.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email?.split('@')[0] || 'User'}
                            </span>
                        </div>
                        <button onClick={logout} className="nav-logout">Sign Out</button>

                        {/* Hamburger */}
                        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '0.5rem' }}>
                            <span className="ham-line" style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
                            <span className="ham-line" style={{ opacity: menuOpen ? 0 : 1 }} />
                            <span className="ham-line" style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1rem', background: 'rgba(8,12,20,0.98)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {NAV_LINKS.map(l => (
                                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className={`nav-mob-link${isActive(l.to) ? ' active' : ''}`}>
                                    <span style={{ fontSize: '1.5rem' }}>{l.icon}</span>
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{user.email}</span>
                            <button onClick={logout} className="nav-logout">Sign Out</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Make desktop-nav visible on md+ */}
            <style>{`.desktop-nav { display:none; } @media(min-width:768px){ .desktop-nav{display:flex!important;} }`}</style>
        </>
    );
};

export default Navbar;
