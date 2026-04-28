import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import './PublicationCard.css';

const PublicationCard = ({ publication }) => {
    const date = new Date(publication.datePublication).toLocaleDateString('fr-FR');

    return (
        <motion.div
            className="publication-card"
            whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <h3 className="card-title">
                <Link to={`/publications/${publication.id}`}>{publication.titre}</Link>
            </h3>
            <p className="card-abstract">{publication.resume?.substring(0, 150)}...</p>
            <div className="card-meta">
                <span><FaCalendarAlt /> {date}</span>
                {publication.cheminFichier && (
                    <span className="pdf-badge"><FaFilePdf /> PDF</span>
                )}
            </div>
        </motion.div>
    );
};

export default PublicationCard;