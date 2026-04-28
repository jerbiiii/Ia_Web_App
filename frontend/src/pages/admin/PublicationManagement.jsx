import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import publicationService from '../../services/publication.service';
import researcherService from '../../services/researcher.service';
import domainService from '../../services/domain.service';
import './PublicationManagement.css';

const PublicationManagement = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [publications, setPublications] = useState([]);
    const [researchers, setResearchers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPublication, setEditingPublication] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        resume: '',
        datePublication: '',
        doi: '',
        chercheursIds: [],
        domainesIds: [],
        fichier: null
    });
    const [filePreview, setFilePreview] = useState(null);
    const [classifyResult, setClassifyResult] = useState({}); // { [pubId]: { domaine, score } }
    const [classifyLoading, setClassifyLoading] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const extractList = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.content !== undefined) return data.content;
        return [];
    };

    const fetchData = async () => {
        try {
            const [pubs, res, dom] = await Promise.all([
                publicationService.getAll(),
                researcherService.getAll(),
                domainService.getAll()
            ]);
            setPublications(extractList(pubs));
            setResearchers(extractList(res));
            setDomains(extractList(dom));
        } catch (error) {
            console.error('Erreur chargement:', error);
            setPublications([]);
            setResearchers([]);
            setDomains([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData({ ...formData, fichier: file });
            if (file) {
                setFilePreview(file.name);
            } else {
                setFilePreview(null);
            }
        } else if (type === 'select-multiple') {
            const options = e.target.options;
            const selected = [];
            for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    selected.push(Number(options[i].value));
                }
            }
            setFormData({ ...formData, [name]: selected });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            const publicationJson = {
                titre: formData.titre,
                resume: formData.resume,
                datePublication: formData.datePublication,
                doi: formData.doi,
                chercheursIds: formData.chercheursIds,
                domainesIds: formData.domainesIds
            };
            formDataToSend.append('publication', new Blob([JSON.stringify(publicationJson)], { type: 'application/json' }));
            if (formData.fichier) {
                formDataToSend.append('fichier', formData.fichier);
            }

            if (editingPublication) {
                await publicationService.update(editingPublication.id, formDataToSend);
            } else {
                await publicationService.create(formDataToSend);
            }
            fetchData();
            resetForm();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleEdit = (pub) => {
        setEditingPublication(pub);
        setFormData({
            titre: pub.titre || '',
            resume: pub.resume || '',
            datePublication: pub.datePublication ? pub.datePublication.substring(0,10) : '',
            doi: pub.doi || '',
            chercheursIds: pub.chercheursIds || [],
            domainesIds: pub.domainesIds || [],
            fichier: null
        });
        setFilePreview(pub.cheminFichier ? 'Fichier existant: ' + pub.cheminFichier : null);
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette publication ?')) {
            try {
                await publicationService.delete(id);
                fetchData();
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingPublication(null);
        setFormData({
            titre: '',
            resume: '',
            datePublication: '',
            doi: '',
            chercheursIds: [],
            domainesIds: [],
            fichier: null
        });
        setFilePreview(null);
    };


    const handleClassify = async (pub) => {
        setClassifyLoading(prev => ({ ...prev, [pub.id]: true }));
        try {
            const res = await fetch('http://localhost:8080/api/public/ia/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titre: pub.titre, resume: pub.resume || '' })
            });
            const data = await res.json();
            setClassifyResult(prev => ({
                ...prev,
                [pub.id]: { domaine: data.domaine_principal, score: Math.round(data.score * 100) }
            }));
        } catch (e) {
            setClassifyResult(prev => ({ ...prev, [pub.id]: { domaine: 'Erreur IA', score: 0 } }));
        } finally {
            setClassifyLoading(prev => ({ ...prev, [pub.id]: false }));
        }
    };

    const handleDownload = (id) => {
        publicationService.downloadFile(id).catch(err => alert('Erreur téléchargement'));
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="publication-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <button className="btn-back" onClick={() => navigate('/admin')}>
                ← Retour au tableau de bord
            </button>
            <h2>Gestion des publications</h2>

            <button className="btn-add" onClick={() => setShowForm(true)}>
                + Ajouter une publication
            </button>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        ref={formRef}
                        className="form-modal"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h3>{editingPublication ? 'Modifier' : 'Ajouter'} une publication</h3>
                        <form onSubmit={handleSubmit} className="publication-form" encType="multipart/form-data">
                            <div className="form-group">
                                <label>Titre *</label>
                                <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Résumé</label>
                                <textarea name="resume" rows="4" value={formData.resume} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Date de publication</label>
                                <input type="date" name="datePublication" value={formData.datePublication} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>DOI (Optionnel)</label>
                                <input type="text" name="doi" value={formData.doi} onChange={handleInputChange} placeholder="Ex: 10.1000/xyz123" />
                            </div>
                            <div className="form-group">
                                <label>Chercheurs</label>
                                <select multiple name="chercheursIds" value={formData.chercheursIds} onChange={handleInputChange} className="multi-select">
                                    {researchers.map(r => (
                                        <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>
                                    ))}
                                </select>
                                <small>Maintenez Ctrl pour sélectionner plusieurs</small>
                            </div>
                            <div className="form-group">
                                <label>Domaines</label>
                                <select multiple name="domainesIds" value={formData.domainesIds} onChange={handleInputChange} className="multi-select">
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id}>{d.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fichier PDF</label>
                                <input type="file" name="fichier" accept=".pdf" onChange={handleInputChange} />
                                {filePreview && <p className="file-preview">{filePreview}</p>}
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingPublication ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="publications-list">
                {publications.map(pub => (
                    <motion.div
                        key={pub.id}
                        className="publication-card"
                        whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                    >
                        <h3>{pub.titre}</h3>
                        <p className="abstract">{pub.resume ? (pub.resume.length > 150 ? pub.resume.substring(0,150)+'...' : pub.resume) : 'Aucun résumé'}</p>
                        <p><strong>Date:</strong> {pub.datePublication ? new Date(pub.datePublication).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
                        {pub.doi && <p><strong>DOI:</strong> {pub.doi}</p>}
                        <p><strong>Chercheurs:</strong> {pub.chercheursNoms ? Array.from(pub.chercheursNoms).join(', ') : 'Aucun'}</p>
                        <p><strong>Domaines:</strong> {pub.domainesNoms ? Array.from(pub.domainesNoms).join(', ') : 'Aucun'}</p>
                        {pub.cheminFichier && (
                            <button onClick={() => handleDownload(pub.id)} className="btn-download">
                                Télécharger PDF
                            </button>
                        )}
                        <div className="card-actions">
                            <button onClick={() => handleEdit(pub)} className="btn-edit">Modifier</button>
                            <button onClick={() => handleDelete(pub.id)} className="btn-delete">Supprimer</button>
                            <button
                                onClick={() => handleClassify(pub)}
                                className="btn-classify"
                                disabled={classifyLoading[pub.id]}
                                title="Classifier automatiquement par IA"
                            >
                                {classifyLoading[pub.id] ? '⏳ Classification...' : '🤖 Classifier IA'}
                            </button>
                        </div>
                        {classifyResult[pub.id] && (
                            <div className="classify-badge">
                                🏷️ <strong>{classifyResult[pub.id].domaine}</strong>
                                <span className="classify-score"> ({classifyResult[pub.id].score}% confiance)</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default PublicationManagement;