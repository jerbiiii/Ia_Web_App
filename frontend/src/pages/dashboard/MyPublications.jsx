import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import publicationService from '../../services/publication.service';
import './MyPublications.css';

const MyPublications = ({ chercheurId }) => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (chercheurId) {
            fetchPublications();
        }
    }, [chercheurId]);

    const fetchPublications = async () => {
        try {
            const data = await publicationService.getByChercheurId(chercheurId);
            setPublications(data);
        } catch (error) {
            console.error('Erreur chargement publications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            await publicationService.downloadFile(id);
        } catch (error) {
            alert('Erreur lors du téléchargement');
        }
    };

    if (loading) return <div className="loader">Chargement de vos publications...</div>;

    if (publications.length === 0) {
        return (
            <div className="no-publications">
                <p>Vous n'avez pas encore de publications.</p>
                <Link to="/publications" className="btn-primary">Explorer les publications</Link>
            </div>
        );
    }

    return (
        <div className="my-publications">
            <h2>Mes publications</h2>
            <div className="publications-list">
                {publications.map(pub => (
                    <motion.div
                        key={pub.id}
                        className="publication-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                    >
                        <h3>
                            <Link to={`/publications/${pub.id}`}>{pub.titre}</Link>
                        </h3>
                        <p className="abstract">{pub.resume ? (pub.resume.length > 150 ? pub.resume.substring(0,150)+'...' : pub.resume) : 'Aucun résumé'}</p>
                        <div className="meta">
                            <span><FaCalendarAlt /> {pub.datePublication ? new Date(pub.datePublication).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                            {pub.cheminFichier && (
                                <button onClick={() => handleDownload(pub.id)} className="btn-download">
                                    <FaFilePdf /> Télécharger PDF
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MyPublications;