import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import HighlightManagement from './HighlightManagement';
import HomeContentManagement from './HomeContentManagement';
import './ModeratorPanel.css';

/* ─── Dashboard principal (index) ─── */
const ModeratorDashboard = () => {
    const navigate = useNavigate();
    const [recentActualites, setRecentActualites] = useState([]);
    const [nbActualites, setNbActualites] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        api.get('/actualites')
            .then(r => {
                const data = r.data || [];
                setNbActualites(data.length);
                setRecentActualites(data.slice(0, 3));
            })
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, []);

    return (
        <div className="mod-dashboard">

            {/* ── 3 cartes de navigation ── */}
            <div className="mod-dashboard__cards">

                <div className="mod-dash-card" onClick={() => navigate('actualites')}>
                    <div className="mod-dash-card__icon">📋</div>
                    <div className="mod-dash-card__body">
                        <h3>Actualités & Annonces</h3>
                        <p>Publiez et gérez les actualités affichées sur le site.</p>
                        {!loadingStats && (
                            <span className="mod-dash-card__count">
                                {nbActualites} actualité{nbActualites !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <span className="mod-dash-card__arrow">→</span>
                </div>

                <div className="mod-dash-card" onClick={() => navigate('highlights')}>
                    <div className="mod-dash-card__icon">⭐</div>
                    <div className="mod-dash-card__body">
                        <h3>Projets à la une</h3>
                        <p>Mettez en avant les projets récents sur la page d'accueil.</p>
                    </div>
                    <span className="mod-dash-card__arrow">→</span>
                </div>

                <div className="mod-dash-card" onClick={() => navigate('home-content')}>
                    <div className="mod-dash-card__icon">🏗️</div>
                    <div className="mod-dash-card__body">
                        <h3>Contenu page d'accueil</h3>
                        <p>Modifiez les textes et sections de la page d'accueil.</p>
                    </div>
                    <span className="mod-dash-card__arrow">→</span>
                </div>

            </div>

            {/* ── Aperçu des dernières actualités ── */}
            <div className="mod-section" style={{ marginTop: '2rem' }}>
                <div className="mod-section__head">
                    <h2>Dernières actualités</h2>
                    <button className="btn-add" onClick={() => navigate('actualites/new')}>
                        + Nouvelle actualité
                    </button>
                </div>

                {loadingStats ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="mod-list">
                        {recentActualites.length === 0 ? (
                            <p className="mod-empty">Aucune actualité pour le moment.</p>
                        ) : (
                            recentActualites.map(a => (
                                <div key={a.id} className="mod-item">
                                    <div className="mod-item__info">
                                        <span className="mod-item__date">
                                            {new Date(a.datePublication).toLocaleDateString('fr-FR')}
                                        </span>
                                        <h3 className="mod-item__title">{a.titre}</h3>
                                        <p className="mod-item__body">{a.contenu}</p>
                                    </div>
                                    <div className="mod-item__actions">
                                        <button
                                            className="btn-edit"
                                            onClick={e => { e.stopPropagation(); navigate(`actualites/edit/${a.id}`); }}
                                        >
                                            ✏️ Modifier
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        <button
                            className="btn-cancel"
                            style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                            onClick={() => navigate('actualites')}
                        >
                            Voir toutes les actualités →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Liste complète des actualités ─── */
const ActualiteList = () => {
    const [items, setItems]  = useState([]);
    const [loading, setLoad] = useState(true);
    const navigate           = useNavigate();

    const load = () => {
        setLoad(true);
        api.get('/actualites')
            .then(r => setItems(r.data))
            .catch(() => setItems([]))
            .finally(() => setLoad(false));
    };
    useEffect(load, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette actualité ?')) return;
        try {
            await api.delete(`/actualites/${id}`);
            load();
        } catch (err) {
            alert('Erreur : ' + (err.response?.data?.message || 'Suppression non autorisée'));
        }
    };

    return (
        <div className="mod-section">
            <div className="mod-section__head">
                <h2>Actualités & Annonces</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-back" onClick={() => navigate('/moderateur')}>← Tableau de bord</button>
                    <button className="btn-add" onClick={() => navigate('new')}>+ Nouvelle actualité</button>
                </div>
            </div>

            {loading ? <p>Chargement...</p> : (
                <div className="mod-list">
                    {items.length === 0 && (
                        <p className="mod-empty">Aucune actualité pour le moment.</p>
                    )}
                    {items.map(a => (
                        <div key={a.id} className="mod-item">
                            <div className="mod-item__info">
                                <span className="mod-item__date">
                                    {new Date(a.datePublication).toLocaleDateString('fr-FR')}
                                </span>
                                <h3 className="mod-item__title">{a.titre}</h3>
                                <p className="mod-item__body">{a.contenu}</p>
                            </div>
                            <div className="mod-item__actions">
                                <button className="btn-edit" onClick={() => navigate(`edit/${a.id}`)}>
                                    ✏️ Modifier
                                </button>
                                <button className="btn-del" onClick={() => handleDelete(a.id)}>
                                    🗑 Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Formulaire actualité (création & édition) ─── */
const ActualiteForm = ({ editItem }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        titre:           editItem?.titre   || '',
        contenu:         editItem?.contenu || '',
        datePublication: editItem?.datePublication
            ? new Date(editItem.datePublication).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        actif: editItem?.actif ?? true,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editItem) {
            setForm({
                titre:           editItem.titre   || '',
                contenu:         editItem.contenu || '',
                datePublication: editItem.datePublication
                    ? new Date(editItem.datePublication).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16),
                actif: editItem.actif ?? true,
            });
        }
    }, [editItem]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                titre:           form.titre,
                contenu:         form.contenu,
                datePublication: new Date(form.datePublication).toISOString(),
                actif:           form.actif,
            };
            if (editItem) {
                await api.put(`/actualites/${editItem.id}`, payload);
            } else {
                await api.post('/actualites', payload);
            }
            navigate('/moderateur/actualites');
        } catch (err) {
            alert('Erreur lors de la sauvegarde : ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mod-section">
            <div className="mod-section__head">
                <h2>{editItem ? "Modifier l'actualité" : 'Nouvelle actualité'}</h2>
                <button className="btn-back" onClick={() => navigate('/moderateur/actualites')}>← Retour</button>
            </div>
            <form className="mod-form" onSubmit={handleSubmit}>
                <label>
                    Titre <span className="required">*</span>
                    <input
                        name="titre"
                        required
                        value={form.titre}
                        onChange={handleChange}
                        placeholder="Titre de l'actualité"
                    />
                </label>
                <label>
                    Contenu <span className="required">*</span>
                    <textarea
                        name="contenu"
                        required
                        rows={6}
                        value={form.contenu}
                        onChange={handleChange}
                        placeholder="Contenu de l'actualité..."
                    />
                </label>
                <label>
                    Date de publication
                    <input
                        type="datetime-local"
                        name="datePublication"
                        value={form.datePublication}
                        onChange={handleChange}
                    />
                </label>
                <label className="mod-form__checkbox">
                    <input
                        type="checkbox"
                        name="actif"
                        checked={form.actif}
                        onChange={handleChange}
                    />
                    Actif (affiché sur la page d'accueil)
                </label>
                <div className="mod-form__actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/moderateur/actualites')}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? 'Sauvegarde...' : '💾 Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ─── Wrapper édition actualité ─── */
const ActualiteFormEditWrapper = () => {
    const { id }              = useParams();
    const navigate            = useNavigate();
    const [editItem, setItem] = useState(null);
    const [loading, setLoad]  = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        if (!id) { navigate('/moderateur/actualites', { replace: true }); return; }
        api.get(`/actualites/${id}`)
            .then(r => setItem(r.data))
            .catch(() => setError('Actualité introuvable'))
            .finally(() => setLoad(false));
    }, [id, navigate]);

    if (loading) return <div className="mod-section"><p>Chargement...</p></div>;
    if (error)   return (
        <div className="mod-section">
            <p style={{ color: 'red' }}>{error}</p>
            <button className="btn-back" onClick={() => navigate('/moderateur/actualites')}>← Retour</button>
        </div>
    );

    return <ActualiteForm editItem={editItem} />;
};

/* ══ Panel Modérateur principal ══ */
const ModerateurPanel = () => (
    <div className="mod-panel container" style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}>
        <div className="mod-panel__header">
            <h1>Espace Modérateur</h1>
            <nav className="mod-panel__nav">
                <Link to="/moderateur">🏠 Tableau de bord</Link>
                <Link to="/moderateur/actualites">📋 Actualités</Link>
                <Link to="/moderateur/highlights">⭐ Projets à la une</Link>
                <Link to="/moderateur/home-content">🏗️ Page d'accueil</Link>
                <Link to="/">🌐 Voir le site</Link>
            </nav>
        </div>
        <Routes>
            <Route index                        element={<ModeratorDashboard />} />
            <Route path="actualites"            element={<ActualiteList />} />
            <Route path="actualites/new"        element={<ActualiteForm />} />
            <Route path="actualites/edit/:id"   element={<ActualiteFormEditWrapper />} />
            <Route path="highlights"            element={<HighlightManagement />} />
            <Route path="home-content"          element={<HomeContentManagement />} />
        </Routes>
    </div>
);

export default ModerateurPanel;