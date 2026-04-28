import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Auth.css';

const Register = () => {
    const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
        if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
        setLoading(true);
        try {
            await register(form.nom, form.prenom, form.email, form.password);
            setSuccess('Compte créé ! Redirection vers la connexion...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

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
                    <p className="auth-loader__text">Création du compte...</p>
                </div>
            )}
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-grid" />

            <motion.div
                className={`auth-card glass-card anim-1${loading ? ' auth-card--blur' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <span className="auth-logo-hex">⬡</span>
                        <span className="auth-logo-name">IA<span style={{ color: 'var(--primary)' }}>-Tech</span></span>
                    </Link>
                    <h1 className="auth-title">Créer un compte</h1>
                    <p className="auth-sub">Rejoignez la communauté scientifique</p>
                </div>

                {error && (
                    <div className="alert alert-error anim-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success anim-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-row">
                        <div className="form-group">
                            <label className="form-label">Prénom</label>
                            <input className="form-input" type="text" name="prenom" placeholder="Jean" value={form.prenom} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nom</label>
                            <input className="form-input" type="text" name="nom" placeholder="Dupont" value={form.nom} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Adresse email</label>
                        <div className="input-wrap">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input className="form-input input-with-icon" type="email" name="email" placeholder="vous@email.com" value={form.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mot de passe</label>
                        <div className="input-wrap">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <input className="form-input input-with-icon input-with-toggle" type={showPwd ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                                {showPwd
                                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                        {/* Password strength */}
                        {form.password && (
                            <div className="pwd-strength">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="pwd-strength-bar" style={{
                                        background: i <= strength
                                            ? strength <= 1 ? 'var(--danger)'
                                                : strength === 2 ? '#f59e0b'
                                                    : strength === 3 ? '#00d4ff'
                                                        : 'var(--accent)'
                                            : 'var(--border-glass)'
                                    }} />
                                ))}
                                <span className="pwd-strength-label" style={{
                                    color: strength <= 1 ? 'var(--danger)' : strength === 2 ? '#f59e0b' : strength === 3 ? 'var(--primary)' : 'var(--accent)'
                                }}>
                                    {['', 'Faible', 'Moyen', 'Fort', 'Excellent'][strength]}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmer le mot de passe</label>
                        <div className="input-wrap">
                            {form.confirm && form.confirm === form.password ? (
                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            ) : form.confirm ? (
                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            ) : (
                                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            )}
                            <input
                                className={`form-input input-with-icon${form.confirm ? (form.confirm === form.password ? ' input-valid' : ' input-invalid') : ''}`}
                                type="password" name="confirm" placeholder="••••••••"
                                value={form.confirm} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-submit" disabled={loading || !!success}>
                        {loading ? (
                            <><span className="spinner-sm" />Création en cours...</>
                        ) : (
                            <><span>Créer mon compte</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span style={{ color: 'var(--text-muted)' }}>Déjà un compte ?</span>
                    <Link to="/login" className="auth-link">Se connecter →</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;