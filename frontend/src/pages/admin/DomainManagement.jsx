import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import domainService from '../../services/domain.service';
import './DomainManagement.css';

const DomainManagement = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingDomain, setEditingDomain] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        parentId: ''
    });
    const [parentOptions, setParentOptions] = useState([]);

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        } else {
            fetchDomains();
        }
    }, [searchTerm]);

    const fetchDomains = async () => {
        try {
            const data = await domainService.getAll();
            setDomains(data);
            // Pour le select parent, on veut tous les domaines sauf celui en cours d'édition
            const options = data.filter(d => !editingDomain || d.id !== editingDomain.id);
            setParentOptions(options);
        } catch (error) {
            console.error('Erreur chargement domaines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const results = await domainService.search(searchTerm);
            setDomains(results);
        } catch (error) {
            console.error('Erreur recherche:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDomain) {
                await domainService.update(editingDomain.id, formData);
            } else {
                await domainService.create(formData);
            }
            fetchDomains();
            resetForm();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (domain) => {
        setEditingDomain(domain);
        setFormData({
            nom: domain.nom || '',
            description: domain.description || '',
            parentId: domain.parentId || ''
        });
        setShowForm(true);
        // Mettre à jour les options parent en excluant ce domaine
        setParentOptions(domains.filter(d => d.id !== domain.id));
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce domaine ?')) {
            try {
                await domainService.delete(id);
                fetchDomains();
            } catch (error) {
                alert(error.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingDomain(null);
        setFormData({ nom: '', description: '', parentId: '' });
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="domain-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <button className="btn-back" onClick={() => navigate('/admin')}>
                ← Retour au tableau de bord
            </button>
            <h2>Gestion des domaines</h2>

            {/* Barre de recherche */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Rechercher un domaine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button className="btn-clear" onClick={() => setSearchTerm('')}>✕</button>
                )}
            </div>

            {/* Bouton d'ajout */}
            <button className="btn-add" onClick={() => setShowForm(true)}>
                + Ajouter un domaine
            </button>

            {/* Formulaire d'ajout/édition */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        ref={formRef}
                        className="form-modal"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h3>{editingDomain ? 'Modifier' : 'Ajouter'} un domaine</h3>
                        <form onSubmit={handleSubmit} className="domain-form">
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                            </div>
                            <div className="form-group">
                                <label>Domaine parent (optionnel)</label>
                                <select name="parentId" value={formData.parentId} onChange={handleInputChange}>
                                    <option value="">Aucun (domaine racine)</option>
                                    {parentOptions.map(d => (
                                        <option key={d.id} value={d.id}>{d.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingDomain ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Liste des domaines */}
            <div className="domains-list">
                {domains.length === 0 ? (
                    <p className="no-results">Aucun domaine trouvé.</p>
                ) : (
                    <div className="domains-grid">
                        {domains.map(domain => (
                            <motion.div
                                key={domain.id}
                                className="domain-card"
                                whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                            >
                                <h3>{domain.nom}</h3>
                                <p className="domain-description">{domain.description || 'Aucune description'}</p>
                                <p className="domain-parent">
                                    {domain.parentId ? `Parent: ${domains.find(d => d.id === domain.parentId)?.nom || 'Inconnu'}` : 'Domaine racine'}
                                </p>
                                <div className="card-actions">
                                    <button onClick={() => handleEdit(domain)} className="btn-edit">Modifier</button>
                                    <button onClick={() => handleDelete(domain.id)} className="btn-delete">Supprimer</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DomainManagement;