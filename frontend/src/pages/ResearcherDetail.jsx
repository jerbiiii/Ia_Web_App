import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import './ResearcherDetail.css';

const ResearcherDetail = () => {
    const { id } = useParams();
    const [researcher, setResearcher] = useState(null);
    const [domaines, setDomaines]     = useState({});   // map id → nom
    const [publications, setPublications] = useState([]); // ✅ BUG #1 FIX
    const [loading, setLoad]          = useState(true);
    const [error, setError]           = useState(null);

    useEffect(() => {
        setLoad(true);
        setError(null);

        // 1. Charger le chercheur
        api.get(`/public/researchers/${id}`)
            .then(async r => {
                const data = r.data;
                setResearcher(data);


                try {
                    const pubRes = await api.get('/public/publications/search', {
                        params: { chercheur: data.nom }
                    });
                    const pubData = pubRes.data;
                    setPublications(Array.isArray(pubData) ? pubData : (pubData.content ?? []));
                } catch {
                    setPublications([]);
                }

                if (data.autresDomainesIds && data.autresDomainesIds.length > 0) {
                    try {
                        const domainesRes = await api.get('/public/domains');
                        const map = {};
                        domainesRes.data.forEach(d => { map[d.id] = d.nom; });
                        setDomaines(map);
                    } catch {
                        // Si l'appel échoue, on affichera les IDs en fallback
                    }
                }
            })
            .catch(err => {
                console.error(err);
                setError("Chercheur introuvable.");
            })
            .finally(() => setLoad(false));
    }, [id]);

    if (loading) return <div className="researcher-detail-page researcher-detail-loading">Chargement...</div>;
    if (error)   return <div className="researcher-detail-page researcher-detail-error">{error}</div>;
    if (!researcher) return null;

    const autresDomainesIds = researcher.autresDomainesIds || [];

    return (
        <motion.div 
            className="researcher-detail-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="researcher-detail__breadcrumb">
                <Link to="/researchers">← Retour aux chercheurs</Link>
            </div>

            <article className="researcher-card">
                {/* ── En-tête ── */}
                <header className="researcher-card__header">
                    <div className="researcher-card__avatar">
                        {researcher.prenom?.[0]}{researcher.nom?.[0]}
                    </div>
                    <div>
                        <h1>{researcher.prenom} {researcher.nom}</h1>
                        {researcher.grade && (
                            <p className="researcher-card__grade">{researcher.grade}</p>
                        )}
                        {researcher.institution && (
                            <p className="researcher-card__institution">
                                🏛️ {researcher.institution}
                            </p>
                        )}
                        {researcher.email && (
                            <p className="researcher-card__email">
                                ✉️ <a href={`mailto:${researcher.email}`}>{researcher.email}</a>
                            </p>
                        )}
                        {researcher.affiliation && (
                            <p className="researcher-card__affiliation">🏢 {researcher.affiliation}</p>
                        )}
                    </div>
                </header>

                {/* ── Domaines ── */}
                <section className="researcher-card__domains">
                    <h2>Domaines de recherche</h2>

                    {/* ✅ domainePrincipalNom directement disponible dans le DTO */}
                    {researcher.domainePrincipalNom && (
                        <div className="domain-item domain-item--primary">
                            <span className="domain-badge domain-badge--primary">Principal</span>
                            {researcher.domainePrincipalNom}
                        </div>
                    )}

                    {/* résolution des noms via le map chargé */}
                    {autresDomainesIds.length > 0 && (
                        <div className="domain-list">
                            {autresDomainesIds.map(domId => (
                                <div key={domId} className="domain-item">
                                    <span className="domain-badge">Secondaire</span>
                                    {/* Nom résolu depuis le map, sinon fallback "Domaine #id" */}
                                    {domaines[domId] || `Domaine #${domId}`}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Publications ── */}
                {publications.length > 0 && (
                    <section className="researcher-card__publications">
                        <h2>Publications ({publications.length})</h2>
                        <ul className="pub-list">
                            {publications.map(pub => (
                                <li key={pub.id} className="pub-list__item">
                                    <Link to={`/publications/${pub.id}`}>
                                        {pub.titre}
                                    </Link>
                                    {pub.datePublication && (
                                        <span className="pub-list__year">
                                            {new Date(pub.datePublication).getFullYear()}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </article>
        </motion.div>
    );
};

export default ResearcherDetail;