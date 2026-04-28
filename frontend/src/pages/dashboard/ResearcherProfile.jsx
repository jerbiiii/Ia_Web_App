import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './ResearcherProfile.css';


const ResearcherProfile = ({ researcher }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData,  setFormData]  = useState({
        nom:         researcher.nom         || '',
        prenom:      researcher.prenom      || '',
        email:       researcher.email       || '',
        affiliation: researcher.affiliation || '',
    });
    const [message, setMessage] = useState('');
    const [saving,  setSaving]  = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            // ✅ On utilise l'endpoint profil utilisateur (accessible à tous)
            // au lieu de PUT /researchers/{id} (ADMIN uniquement).
            // Seuls nom, prenom et email sont modifiables par l'utilisateur lui-même.
            await api.put('/auth/profile', {
                nom:    formData.nom,
                prenom: formData.prenom,
                email:  formData.email,
            });

            // Mise à jour du localStorage pour refléter les changements dans la Navbar
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...stored,
                nom:    formData.nom,
                prenom: formData.prenom,
                email:  formData.email,
            }));

            // Mise à jour locale de l'affichage (sans rechargement parent)
            researcher.nom    = formData.nom;
            researcher.prenom = formData.prenom;
            researcher.email  = formData.email;

            setMessage('Profil mis à jour avec succès');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setMessage('Vous n\'avez pas les droits pour effectuer cette modification.');
            } else {
                setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour');
            }
        } finally {
            setSaving(false);
        }
    };

    if (isEditing) {
        return (
            <motion.div 
                className="profile-edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h3>Modifier mon profil</h3>
                {message && (
                    <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom</label>
                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Prénom</label>
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Affiliation</label>
                        <input
                            type="text"
                            name="affiliation"
                            value={formData.affiliation}
                            onChange={handleChange}
                            disabled
                            title="Contactez un administrateur pour modifier votre affiliation"
                        />
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '.8rem' }}>
                            ℹ️ L'affiliation ne peut être modifiée que par un administrateur.
                        </small>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => { setIsEditing(false); setMessage(''); }}>
                            Annuler
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="profile-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h3>Mon profil chercheur</h3>
            {message && (
                <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
            <p><strong>Nom :</strong> {researcher.nom} {researcher.prenom}</p>
            <p><strong>Email :</strong> {researcher.email || 'Non renseigné'}</p>
            <p><strong>Affiliation :</strong> {researcher.affiliation || 'Non renseignée'}</p>
            <p><strong>Domaine principal :</strong> {researcher.domainePrincipalNom || 'Non défini'}</p>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>Modifier</button>
        </motion.div>
    );
};

export default ResearcherProfile;