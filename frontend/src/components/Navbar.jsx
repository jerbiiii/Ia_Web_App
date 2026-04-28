import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
// ── Icons (SVG inline) ─────────────────────────────────────────────────────

const IconSearch   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconUser     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconChevron  = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>;
const IconMenu     = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconClose    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLogout   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconDash     = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconShield   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default function Navbar() {
    const { isAuthenticated, user, isAdmin, isModerator, logout } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    const [scrolled,     setScrolled]     = useState(false);
    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery,  setSearchQuery]  = useState('');

    const userMenuRef = useRef(null);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { to: '/',             label: 'Accueil' },
        { to: '/publications', label: 'Publications' },
        { to: '/researchers',  label: 'Chercheurs' },
        { to: '/highlights',   label: 'À la une' },
    ];

    return (
        <>
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Navigation principale">
                <div className="container navbar__inner">

                    {/* Logo */}
                    <Link to="/" className="navbar__logo" aria-label="Accueil">
                        <div className="navbar__logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
                                <defs>
                                    <linearGradient id="nb" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'#0066b4',stopOpacity:1}} />
                                        <stop offset="100%" style={{stopColor:'#003d6e',stopOpacity:1}} />
                                    </linearGradient>
                                    <linearGradient id="na" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'#eb3700',stopOpacity:1}} />
                                        <stop offset="100%" style={{stopColor:'#c42d00',stopOpacity:1}} />
                                    </linearGradient>
                                </defs>
                                <circle cx="32" cy="32" r="32" fill="url(#nb)" />
                                <circle cx="14" cy="20" r="4" fill="white" opacity="0.9"/>
                                <circle cx="14" cy="32" r="4" fill="white" opacity="0.9"/>
                                <circle cx="14" cy="44" r="4" fill="white" opacity="0.9"/>
                                <circle cx="32" cy="14" r="4" fill="url(#na)"/>
                                <circle cx="32" cy="26" r="4" fill="url(#na)"/>
                                <circle cx="32" cy="38" r="4" fill="url(#na)"/>
                                <circle cx="32" cy="50" r="4" fill="url(#na)"/>
                                <circle cx="50" cy="24" r="4" fill="white" opacity="0.9"/>
                                <circle cx="50" cy="40" r="4" fill="white" opacity="0.9"/>
                                <line x1="18" y1="20" x2="28" y2="14" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="18" y1="20" x2="28" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="18" y1="32" x2="28" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="18" y1="32" x2="28" y2="38" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="18" y1="44" x2="28" y2="38" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="18" y1="44" x2="28" y2="50" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="14" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="26" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="26" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="38" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="38" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                <line x1="36" y1="50" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                            </svg>
                        </div>
                        <div>
                            <span className="navbar__logo-text">IATech</span>
                            <span className="navbar__logo-sub">Research</span>
                        </div>
                    </Link>

                    {/* Search */}
                    <form className="navbar__search" onSubmit={handleSearch} role="search">
                        <span className="navbar__search-icon" aria-hidden="true"><IconSearch /></span>
                        <input
                            className="navbar__search-input"
                            type="search"
                            placeholder="Rechercher publications, chercheurs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Rechercher"
                        />
                    </form>

                    {/* Desktop Nav */}
                    <nav className="navbar__nav" aria-label="Liens principaux">
                        {navLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `navbar__link${isActive ? ' active' : ''}`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}

                        <div className="navbar__divider" aria-hidden="true" />

                        {isAuthenticated ? (
                            <div className="navbar__user-menu" ref={userMenuRef}>
                                <button
                                    className="navbar__user-btn"
                                    onClick={() => setUserMenuOpen(prev => !prev)}
                                    aria-expanded={userMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="navbar__avatar" aria-hidden="true">
                                        {user?.prenom?.[0]?.toUpperCase() || user?.nom?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span className="navbar__user-name">
                                        {user?.prenom || user?.nom || 'Mon compte'}
                                    </span>
                                    <span className={`navbar__chevron${userMenuOpen ? ' open' : ''}`} aria-hidden="true">
                                        <IconChevron />
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <div className="navbar__dropdown" role="menu">
                                        <div className="navbar__dropdown-header">
                                            <p className="navbar__dropdown-name">
                                                {user?.prenom} {user?.nom}
                                            </p>
                                            <p className="navbar__dropdown-email">{user?.email}</p>
                                        </div>
                                        <div className="navbar__dropdown-sep" aria-hidden="true" />
                                        <Link to="/dashboard" className="navbar__dropdown-item" role="menuitem">
                                            <IconDash /> Dashboard
                                        </Link>
                                        {(isAdmin || isModerator) && (
                                            <Link to="/moderateur" className="navbar__dropdown-item" role="menuitem">
                                                <IconShield /> Panel modérateur
                                            </Link>
                                        )}
                                        {isAdmin && (
                                            <Link to="/admin" className="navbar__dropdown-item" role="menuitem">
                                                <IconShield /> Administration
                                            </Link>
                                        )}
                                        <div className="navbar__dropdown-sep" aria-hidden="true" />
                                        <button
                                            className="navbar__dropdown-item navbar__dropdown-item--danger"
                                            onClick={handleLogout}
                                            role="menuitem"
                                        >
                                            <IconLogout /> Se déconnecter
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    <IconUser /> Connexion
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="navbar__mobile-toggle"
                        onClick={() => setMobileOpen(prev => !prev)}
                        aria-expanded={mobileOpen}
                        aria-label="Menu mobile"
                    >
                        {mobileOpen ? <IconClose /> : <IconMenu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="navbar__mobile-menu">
                    <form className="navbar__mobile-search" onSubmit={handleSearch}>
                        <span className="navbar__search-icon"><IconSearch /></span>
                        <input
                            className="navbar__search-input"
                            type="search"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    {navLinks.map(({ to, label }) => (
                        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`}>
                            {label}
                        </NavLink>
                    ))}
                    <div className="navbar__mobile-sep" />
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="navbar__mobile-link">Dashboard</Link>
                            {(isAdmin || isModerator) && <Link to="/moderateur" className="navbar__mobile-link">Modérateur</Link>}
                            {isAdmin && <Link to="/admin" className="navbar__mobile-link">Administration</Link>}
                            <button className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleLogout}>
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"    className="navbar__mobile-link">Connexion</Link>
                            <Link to="/register" className="navbar__mobile-link navbar__mobile-link--accent">S'inscrire</Link>
                        </>
                    )}
                </div>
            )}
        </>
    );
}