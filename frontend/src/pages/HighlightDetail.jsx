import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import highlightService from '../services/highlight.service';
import './HighlightDetail.css';

const IconArrow = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
);

const IconStar = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const HighlightDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError('');
        highlightService
            .getByIdPublic(id)
            .then((data) => setItem(data))
            .catch((e) => {
                console.error(e);
                setError(e.response?.status === 404
                    ? 'Projet à la une introuvable.'
                    : 'Impossible de charger ce projet.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="highlight-detail-page container" style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}>
                <div className="highlight-detail-state">Chargement…</div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="highlight-detail-page container" style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}>
                <p className="highlight-detail-state highlight-detail-state--error">{error || 'Projet introuvable.'}</p>
                <Link to="/highlights" className="highlight-detail-back">← Retour aux projets à la une</Link>
            </div>
        );
    }

    const dateFormatted = item.dateCreation
        ? new Date(item.dateCreation).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        : null;

    return (
        <motion.div
            className="highlight-detail-page container"
            style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <nav className="highlight-detail-breadcrumb" aria-label="Fil d'Ariane">
                <Link to="/">Accueil</Link>
                <span className="highlight-detail-breadcrumb__sep">/</span>
                <Link to="/highlights">Projets à la une</Link>
                <span className="highlight-detail-breadcrumb__sep">/</span>
                <span aria-current="page">{item.titre?.length > 50 ? item.titre.slice(0, 50) + '…' : item.titre}</span>
            </nav>

            <article className="highlight-detail-card">
                {item.imageUrl && (
                    <div className="highlight-detail-card__image">
                        <img src={item.imageUrl} alt={item.titre} />
                    </div>
                )}
                <div className="highlight-detail-card__body">
                    <span className="highlight-detail-card__badge">
                        <IconStar /> Projet à la une
                    </span>
                    <h1 className="highlight-detail-card__title">{item.titre}</h1>
                    {dateFormatted && (
                        <p className="highlight-detail-card__date">{dateFormatted}</p>
                    )}
                    {item.description && (
                        <div className="highlight-detail-card__description">
                            {item.description.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    )}
                    <Link to="/highlights" className="highlight-detail-back">
                        <IconArrow /> Retour aux projets à la une
                    </Link>
                </div>
            </article>
        </motion.div>
    );
};

export default HighlightDetail;