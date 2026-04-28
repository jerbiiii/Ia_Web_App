import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* ── Overlay loader ── */}
            {loading && (
                <div className="auth-overlay">
                    <div className="auth-loader">
                        <div className="auth-loader__ring" />
                        <div className="auth-loader__ring auth-loader__ring--2" />
                        <div className="auth-loader__dot" />
                    </div>
                    <p className="auth-loader__text">Connexion en cours...</p>
                </div>
            )}
            {/* Background effects */}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-grid" />

            <motion.div
                className={`auth-card glass-card anim-1${loading ? ' auth-card--blur' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <span className="auth-logo-hex">⬡</span>
                        <span className="auth-logo-name">IA<span style={{ color: 'var(--primary)' }}>-Tech</span></span>
                    </Link>
                    <h1 className="auth-title">Connexion</h1>
                    <p className="auth-sub">Accédez à votre espace de recherche</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error anim-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Adresse email</label>
                        <div className="input-wrap">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input
                                type="email"
                                className="form-input input-with-icon"
                                placeholder="vous@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mot de passe</label>
                        <div className="input-wrap">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <input
                                type={showPwd ? 'text' : 'password'}
                                className="form-input input-with-icon input-with-toggle"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                                {showPwd
                                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-sm" />Connexion en cours...</>
                        ) : (
                            <><span>Se connecter</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span style={{ color: 'var(--text-muted)' }}>Pas encore de compte ?</span>
                    <Link to="/register" className="auth-link">S'inscrire gratuitement →</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;