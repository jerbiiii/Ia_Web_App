import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import highlightService from '../../services/highlight.service';
import './HighlightManagement.css';

const HighlightManagement = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        imageUrl: '',
        actif: true
    });

    useEffect(() => {
        fetchHighlights();
    }, []);

    const fetchHighlights = async () => {
        try {
            const data = await highlightService.getAll();
            setHighlights(data);
        } catch (error) {
            console.error('Erreur chargement highlights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHighlight) {
                await highlightService.update(editingHighlight.id, formData);
            } else {
                await highlightService.create(formData);
            }
            fetchHighlights();
            resetForm();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (item) => {
        setEditingHighlight(item);
        setFormData({
            titre: item.titre,
            description: item.description,
            imageUrl: item.imageUrl || '',
            actif: item.actif
        });
        setShowForm(true);
        // Scroll vers le formulaire après son apparition
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce projet à la une ?')) {
            try {
                await highlightService.delete(id);
                fetchHighlights();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingHighlight(null);
        setFormData({
            titre: '',
            description: '',
            imageUrl: '',
            actif: true
        });
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="highlight-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="header-actions">
                <button className="btn-back" onClick={() => navigate('/moderateur')}>
                    ← Retour
                </button>
                <h2>Projets à la une</h2>
                <button className="btn-add" onClick={() => setShowForm(true)}>
                    + Nouveau projet
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        ref={formRef}
                        className="form-modal"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h3>{editingHighlight ? 'Modifier' : 'Créer'} un projet à la une</h3>
                        <form onSubmit={handleSubmit} className="highlight-form">
                            <div className="form-group">
                                <label>Titre *</label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>URL de l'image</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="actif"
                                        checked={formData.actif}
                                        onChange={handleInputChange}
                                    />
                                    Actif (affiché sur la page d'accueil)
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingHighlight ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="highlights-list">
                {highlights.length === 0 ? (
                    <p className="no-data">Aucun projet à la une.</p>
                ) : (
                    highlights.map(item => (
                        <motion.div
                            key={item.id}
                            className="highlight-card"
                            whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                        >
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.titre} className="highlight-image" />
                            )}
                            <div className="highlight-content">
                                <h3>{item.titre}</h3>
                                <p className="description">{item.description}</p>
                                <p className="status">
                                    Statut: <span className={item.actif ? 'badge-actif' : 'badge-inactif'}>
                    {item.actif ? 'Actif' : 'Inactif'}
                  </span>
                                </p>
                                <div className="card-actions">
                                    <button onClick={() => handleEdit(item)} className="btn-edit">Modifier</button>
                                    <button onClick={() => handleDelete(item.id)} className="btn-delete">Supprimer</button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default HighlightManagement;