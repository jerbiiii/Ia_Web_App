import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import researcherService from '../../services/researcher.service';
import domainService from '../../services/domain.service';
import userService from '../../services/user.service';
import './ResearcherManagement.css';

const ResearcherManagement = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [researchers, setResearchers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDomain, setSearchDomain] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingResearcher, setEditingResearcher] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        affiliation: '',
        domainePrincipalId: '',
        autresDomainesIds: [],
        userId: null
    });


    const debounceRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Debounce 300ms : on attend que l'utilisateur arrête de taper
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, searchDomain]);

    const fetchData = async () => {
        try {
            const [resData, domData, usersData] = await Promise.all([
                researcherService.getAll(),
                domainService.getAll(),
                userService.getAll()
            ]);
            setResearchers(resData);
            setDomains(domData);
            setUsers(usersData);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const params = {};
            if (searchTerm) params.nom = searchTerm; // ou prénom selon le besoin
            if (searchDomain) params.domaine = searchDomain;
            const results = await researcherService.search(params);
            setResearchers(results);
        } catch (error) {
            console.error('Erreur recherche:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'autresDomainesIds') {
            // Gestion des checkbox multiples
            const current = [...formData.autresDomainesIds];
            const id = parseInt(value);
            if (checked) {
                setFormData({ ...formData, autresDomainesIds: [...current, id] });
            } else {
                setFormData({ ...formData, autresDomainesIds: current.filter(d => d !== id) });
            }
        } else if (name === 'userId' || name === 'domainePrincipalId') {
            setFormData({ ...formData, [name]: value ? parseInt(value) : null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingResearcher) {
                await researcherService.update(editingResearcher.id, formData);
            } else {
                await researcherService.create(formData);
            }
            fetchData();
            resetForm();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (researcher) => {
        setEditingResearcher(researcher);
        setFormData({
            nom: researcher.nom || '',
            prenom: researcher.prenom || '',
            email: researcher.email || '',
            affiliation: researcher.affiliation || '',
            domainePrincipalId: researcher.domainePrincipalId || '',
            autresDomainesIds: researcher.autresDomainesIds || [],
            userId: researcher.userId || null
        });
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce chercheur ?')) {
            try {
                await researcherService.delete(id);
                fetchData();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingResearcher(null);
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            affiliation: '',
            domainePrincipalId: '',
            autresDomainesIds: [],
            userId: null
        });
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="researcher-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <button className="btn-back" onClick={() => navigate('/admin')}>
                ← Retour au tableau de bord
            </button>
            <h2>Gestion des chercheurs</h2>

            {/* Barre de recherche */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    className="search-select"
                >
                    <option value="">Tous les domaines</option>
                    {domains.map(d => (
                        <option key={d.id} value={d.nom}>{d.nom}</option>
                    ))}
                </select>
            </div>

            {/* Bouton d'ajout */}
            <button className="btn-add" onClick={() => setShowForm(true)}>
                + Ajouter un chercheur
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
                        <h3>{editingResearcher ? 'Modifier' : 'Ajouter'} un chercheur</h3>
                        <form onSubmit={handleSubmit} className="researcher-form">
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Affiliation</label>
                                <input type="text" name="affiliation" value={formData.affiliation} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Domaine principal</label>
                                <select name="domainePrincipalId" value={formData.domainePrincipalId} onChange={handleInputChange}>
                                    <option value="">Sélectionner</option>
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id}>{d.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Compte Utilisateur lié</label>
                                <select name="userId" value={formData.userId || ''} onChange={handleInputChange}>
                                    <option value="">Aucun compte lié</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Autres domaines</label>
                                <div className="checkbox-group">
                                    {domains.map(d => (
                                        <label key={d.id}>
                                            <input
                                                type="checkbox"
                                                name="autresDomainesIds"
                                                value={d.id}
                                                checked={formData.autresDomainesIds.includes(d.id)}
                                                onChange={handleInputChange}
                                            />
                                            {d.nom}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingResearcher ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Liste des chercheurs */}
            <div className="researchers-grid">
                {researchers.map(researcher => (
                    <motion.div
                        key={researcher.id}
                        className="researcher-card"
                        whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                    >
                        <h3>{researcher.prenom} {researcher.nom}</h3>
                        <p><strong>Email:</strong> {researcher.email || 'Non renseigné'}</p>
                        <p><strong>Affiliation:</strong> {researcher.affiliation || 'Non renseignée'}</p>
                        <p><strong>Domaine principal:</strong> {researcher.domainePrincipalNom || 'Aucun'}</p>
                        <div className="card-actions">
                            <button onClick={() => handleEdit(researcher)} className="btn-edit">Modifier</button>
                            <button onClick={() => handleDelete(researcher.id)} className="btn-delete">Supprimer</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default ResearcherManagement;