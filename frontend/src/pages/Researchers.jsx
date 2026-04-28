import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import researcherService from '../services/researcher.service';
import domainService from '../services/domain.service';
import './Researchers.css';

const fadeUp = {
    hidden:  { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const Researchers = () => {
    const [researchers, setResearchers] = useState([]);
    const [domains,     setDomains]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [searchTerm,     setSearchTerm]     = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [resData, domData] = await Promise.all([
                researcherService.getAllPublic(),
                domainService.getAllPublic()
            ]);
            setResearchers(resData);
            setDomains(domData);
        } catch (error) {
            console.error('Erreur chargement chercheurs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { handleSearch(); }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, selectedDomain]);

    const handleSearch = async () => {
        try {
            const params = {};
            if (searchTerm)     params.nom     = searchTerm;
            if (selectedDomain) params.domaine = selectedDomain;
            const results = (!searchTerm && !selectedDomain)
                ? await researcherService.getAllPublic()
                : await researcherService.searchPublic(params);
            setResearchers(results);
        } catch (error) {
            console.error('Erreur recherche:', error);
        }
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="researchers-page container"
            style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
            >
                Chercheurs
            </motion.h1>

            <motion.div
                className="search-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="search-select"
                >
                    <option value="">Tous les domaines</option>
                    {domains.map(d => (
                        <option key={d.id} value={d.nom}>{d.nom}</option>
                    ))}
                </select>
            </motion.div>

            {researchers.length === 0 ? (
                <p className="no-results">Aucun chercheur trouvé.</p>
            ) : (
                /* ✅ Animation au scroll : grille entière */
                <motion.div
                    className="researchers-grid"
                    variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                >
                    {researchers.map(researcher => (
                        <motion.div
                            key={researcher.id}
                            variants={fadeUp}
                            whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: { duration: 0.2 } }}
                        >
                            <div className="researcher-card">
                                <h3>
                                    <Link to={`/researchers/${researcher.id}`}>
                                        {researcher.prenom} {researcher.nom}
                                    </Link>
                                </h3>
                                <p><strong>Email:</strong> {researcher.email || 'Non renseigné'}</p>
                                <p><strong>Affiliation:</strong> {researcher.affiliation || 'Non renseignée'}</p>
                                <p><strong>Domaine principal:</strong> {researcher.domainePrincipalNom || 'Aucun'}</p>
                                <Link to={`/researchers/${researcher.id}`} className="btn-view">Voir le profil</Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};

export default Researchers;