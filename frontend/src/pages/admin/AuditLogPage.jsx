import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import auditService from '../../services/Audit.service.js';
import './AuditLogPage.css';

const ACTION_COLORS = {
    CREATE:   { bg: '#d4edda', color: '#155724', label: 'Création' },
    UPDATE:   { bg: '#fff3cd', color: '#856404', label: 'Modification' },
    DELETE:   { bg: '#f8d7da', color: '#721c24', label: 'Suppression' },
    DOWNLOAD: { bg: '#d1ecf1', color: '#0c5460', label: 'Téléchargement' },
    LOGIN:    { bg: '#e2e3e5', color: '#383d41', label: 'Connexion' },
    LOGOUT:   { bg: '#e2e3e5', color: '#383d41', label: 'Déconnexion' },
};

const ENTITES = ['', 'RESEARCHER', 'PUBLICATION', 'DOMAIN', 'USER', 'ACTUALITE', 'HIGHLIGHT', 'HOME_CONTENT'];
const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'DOWNLOAD', 'LOGIN', 'LOGOUT'];

const AuditLogPage = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ action: '', entite: '', email: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await auditService.getAll();
            setLogs(data);
        } catch (err) {
            console.error('Erreur chargement logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.action) params.action = filters.action;
            if (filters.entite) params.entite = filters.entite;
            if (filters.email) params.email = filters.email;
            const data = await auditService.filter(params);
            setLogs(data);
        } catch (err) {
            console.error('Erreur filtrage:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({ action: '', entite: '', email: '' });
        fetchLogs();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const getActionBadge = (action) => {
        const style = ACTION_COLORS[action] || { bg: '#e9ecef', color: '#495057', label: action };
        return (
            <span
                className="action-badge"
                style={{ backgroundColor: style.bg, color: style.color }}
            >
                {style.label}
            </span>
        );
    };

    return (
        <motion.div
            className="audit-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="audit-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>
                    ← Retour au tableau de bord
                </button>
                <h2>📋 Journal des actions</h2>
                <p className="audit-subtitle">Historique complet de toutes les actions effectuées sur la plateforme</p>
            </div>

            {/* Filtres */}
            <div className="audit-filters">
                <div className="filter-group">
                    <label>Action</label>
                    <select
                        value={filters.action}
                        onChange={e => setFilters({ ...filters, action: e.target.value })}
                    >
                        {ACTIONS.map(a => (
                            <option key={a} value={a}>{a || 'Toutes les actions'}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Entité</label>
                    <select
                        value={filters.entite}
                        onChange={e => setFilters({ ...filters, entite: e.target.value })}
                    >
                        {ENTITES.map(e => (
                            <option key={e} value={e}>{e || 'Toutes les entités'}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Email utilisateur</label>
                    <input
                        type="text"
                        placeholder="ex: admin@example.com"
                        value={filters.email}
                        onChange={e => setFilters({ ...filters, email: e.target.value })}
                    />
                </div>

                <div className="filter-actions">
                    <button className="btn-filter" onClick={handleFilter}>Filtrer</button>
                    <button className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                </div>
            </div>

            {/* Stats rapides */}
            <div className="audit-stats">
                <div className="stat-box">
                    <span className="stat-number">{logs.length}</span>
                    <span className="stat-label">Total actions</span>
                </div>
                <div className="stat-box">
                    <span className="stat-number">
                        {logs.filter(l => l.action === 'CREATE').length}
                    </span>
                    <span className="stat-label">Créations</span>
                </div>
                <div className="stat-box">
                    <span className="stat-number">
                        {logs.filter(l => l.action === 'DELETE').length}
                    </span>
                    <span className="stat-label">Suppressions</span>
                </div>
                <div className="stat-box">
                    <span className="stat-number">
                        {new Set(logs.map(l => l.utilisateurEmail)).size}
                    </span>
                    <span className="stat-label">Utilisateurs actifs</span>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="audit-loading">Chargement des logs...</div>
            ) : logs.length === 0 ? (
                <div className="audit-empty">
                    <span>📋</span>
                    <p>Aucun log trouvé pour ces critères.</p>
                </div>
            ) : (
                <div className="audit-table-wrap">
                    <table className="audit-table">
                        <thead>
                        <tr>
                            <th>Date & heure</th>
                            <th>Action</th>
                            <th>Entité</th>
                            <th>ID</th>
                            <th>Utilisateur</th>
                            <th>Rôle</th>
                            <th>Description</th>
                            <th>IP</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="td-date">{formatDate(log.dateAction)}</td>
                                <td>{getActionBadge(log.action)}</td>
                                <td><span className="entite-tag">{log.entite}</span></td>
                                <td className="td-id">{log.entiteId || '—'}</td>
                                <td className="td-email">{log.utilisateurEmail}</td>
                                <td>
                                        <span className={`role-tag role-${log.utilisateurRole?.toLowerCase()}`}>
                                            {log.utilisateurRole}
                                        </span>
                                </td>
                                <td className="td-desc">{log.description}</td>
                                <td className="td-ip">{log.adresseIp || '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default AuditLogPage;