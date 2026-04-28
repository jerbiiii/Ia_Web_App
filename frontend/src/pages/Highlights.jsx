import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import highlightService from '../services/highlight.service';
import './Highlights.css';

const IconArrow = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const IconStar = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const Highlights = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await highlightService.getActive();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setError("Impossible de charger les projets à la une.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="highlights-page container" style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}>
            <header className="highlights-header">
                <nav className="highlights-breadcrumb" aria-label="Fil d'Ariane">
                    <Link to="/">Accueil</Link>
                    <span className="highlights-breadcrumb__sep">/</span>
                    <span aria-current="page">Projets à la une</span>
                </nav>
                <h1 className="highlights-title">
                    <span className="highlights-title-icon"><IconStar /></span>
                    Projets à la une
                </h1>
                <p className="highlights-subtitle">
                    Sélection de projets IA mis en avant par IA‑Technology : travaux récents, cas d&apos;usage stratégiques et démonstrateurs.
                </p>
            </header>

            {loading && (
                <div className="highlights-state">Chargement des projets…</div>
            )}

            {error && !loading && (
                <div className="highlights-state highlights-state--error">{error}</div>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="highlights-state">
                    Aucun projet à la une pour le moment.
                </div>
            )}

            {!loading && !error && items.length > 0 && (
                <section aria-label="Liste des projets à la une">
                    <div className="highlights-grid">
                        {items.map((item) => (
                            <Link key={item.id} to={`/highlights/${item.id}`} className="highlight-card highlight-card--link">
                                {item.imageUrl && (
                                    <div className="highlight-card__image">
                                        <img src={item.imageUrl} alt={item.titre} loading="lazy" />
                                    </div>
                                )}
                                <div className="highlight-card__body">
                                    <h2 className="highlight-card__title">{item.titre}</h2>
                                    {item.description && (
                                        <p className="highlight-card__desc">
                                            {item.description.length > 260
                                                ? item.description.slice(0, 260) + '…'
                                                : item.description}
                                        </p>
                                    )}
                                    <div className="highlight-card__meta">
                                        <span className="highlight-card__badge">
                                            Projet à la une
                                        </span>
                                        <span className="highlight-card__link">
                                            Voir le projet <IconArrow />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Highlights;
