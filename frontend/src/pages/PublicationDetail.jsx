import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import './PublicationDetail.css';

const PublicationDetail = () => {
    const { id } = useParams();
    const [pub, setPub] = useState(null);
    const [loading, setLoad] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDl] = useState(false);

    useEffect(() => {
        setLoad(true);
        setError(null);
        api.get(`/public/publications/${id}`)
            .then(r => setPub(r.data))
            .catch(err => {
                console.error(err);
                setError('Publication introuvable ou accès refusé.');
            })
            .finally(() => setLoad(false));
    }, [id]);

    if (loading) return (
        <div className="pd-state">
            <div className="pd-spinner" />
            <span>Chargement...</span>
        </div>
    );
    if (error) return (
        <div className="pd-state pd-state--error">
            <p>{error}</p>
            <Link to="/publications" className="pd-btn pd-btn--outline">← Retour aux publications</Link>
        </div>
    );
    if (!pub) return null;

    const dateFormatee = pub.datePublication
        ? new Date(pub.datePublication).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        : null;

    const chercheurs = Array.isArray(pub.chercheursNoms) ? pub.chercheursNoms : [];
    const domaines = Array.isArray(pub.domainesNoms) ? pub.domainesNoms : [];
    const doiUrl = pub.doi
        ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`)
        : null;

    const handleDownload = async () => {
        setDl(true);
        try {
            const res = await api.get(`/public/publications/${pub.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `publication_${pub.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Erreur lors du téléchargement.');
        } finally {
            setDl(false);
        }
    };

    return (
        <div className="pd-page">
            <div className="pd-container">

                {/* ── Fil d'Ariane ── */}
                <nav className="pd-breadcrumb">
                    <Link to="/">Accueil</Link>
                    <span>›</span>
                    <Link to="/publications">Publications</Link>
                    <span>›</span>
                    <span className="pd-breadcrumb__current">
                        {pub.titre.length > 55 ? pub.titre.slice(0, 55) + '…' : pub.titre}
                    </span>
                </nav>

                {/* ── Layout 2 colonnes ── */}
                <motion.div
                    className="pd-layout"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >

                    {/* ══ Main ══ */}
                    <main className="pd-main">

                        <span className="pd-type-badge">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            Article de recherche
                        </span>

                        <h1 className="pd-title">{pub.titre}</h1>

                        {chercheurs.length > 0 && (
                            <p className="pd-authors">
                                <strong>Auteur(s) :</strong> {chercheurs.join(', ')}
                            </p>
                        )}

                        {domaines.length > 0 && (
                            <div className="pd-domains">
                                {domaines.map(d => (
                                    <span key={d} className="pd-domain-tag">{d}</span>
                                ))}
                            </div>
                        )}

                        <hr className="pd-divider" />

                        {pub.resume ? (
                            <section className="pd-abstract">
                                <h2 className="pd-section-title">Résumé</h2>
                                <p>{pub.resume}</p>
                            </section>
                        ) : (
                            <p className="pd-empty-text">Aucun résumé disponible pour cette publication.</p>
                        )}
                    </main>

                    {/* ══ Sidebar ══ */}
                    <aside className="pd-sidebar">

                        {/* Infos */}
                        <div className="pd-card">
                            <h3 className="pd-card__title">Informations</h3>
                            <dl className="pd-meta">

                                {dateFormatee && (
                                    <div className="pd-meta__row">
                                        <dt>📅 Date</dt>
                                        <dd>{dateFormatee}</dd>
                                    </div>
                                )}

                                {chercheurs.length > 0 && (
                                    <div className="pd-meta__row">
                                        <dt>👤 Auteur(s)</dt>
                                        <dd>{chercheurs.join(', ')}</dd>
                                    </div>
                                )}

                                {domaines.length > 0 && (
                                    <div className="pd-meta__row">
                                        <dt>🏷️ Domaine(s)</dt>
                                        <dd>{domaines.join(', ')}</dd>
                                    </div>
                                )}

                                {/* DOI : lien direct, pas de bouton séparé */}
                                {doiUrl && (
                                    <div className="pd-meta__row">
                                        <dt>🔗 DOI</dt>
                                        <dd>
                                            <a href={doiUrl} target="_blank" rel="noreferrer" className="pd-doi-link">
                                                {pub.doi}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Téléchargement */}
                        <div className="pd-card pd-card--dl">
                            <h3 className="pd-card__title">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                Fichier PDF
                            </h3>

                            {pub.cheminFichier ? (
                                <button
                                    className="pd-btn pd-btn--primary pd-btn--full"
                                    onClick={handleDownload}
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <><span className="pd-btn-spinner" /> Téléchargement…</>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Télécharger le PDF
                                        </>
                                    )}
                                </button>
                            ) : (
                                <p className="pd-empty-text">Aucun fichier disponible.</p>
                            )}
                        </div>

                        <Link to="/publications" className="pd-btn pd-btn--ghost pd-btn--full">
                            ← Retour aux publications
                        </Link>
                    </aside>

                </motion.div>
            </div>
        </div>
    );
};

export default PublicationDetail;