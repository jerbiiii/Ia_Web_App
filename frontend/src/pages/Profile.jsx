import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api'; // ✅ FIX: utilise le service api au lieu de fetch codé en dur
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState('success');

    useEffect(() => {
        if (user) {
            setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('Les mots de passe ne correspondent pas.');
            setMsgType('error');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            setMessage('Le mot de passe doit contenir au moins 6 caractères.');
            setMsgType('error');
            return;
        }

        setLoading(true);
        try {
            // ✅ FIX: utilise api (Axios avec intercepteur JWT) au lieu de fetch hardcodé
            const payload = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
            };
            if (formData.password) payload.password = formData.password;

            const response = await api.put('/auth/profile', payload);

            // Mettre à jour le localStorage
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...stored, nom: formData.nom, prenom: formData.prenom, email: formData.email };
            localStorage.setItem('user', JSON.stringify(updated));

            setMessage('Profil mis à jour avec succès !');
            setMsgType('success');
            setFormData(f => ({ ...f, password: '', confirmPassword: '' }));
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour.');
            setMsgType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="profile-page container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2>Mon profil</h2>

            {message && (
                <motion.div
                    className={`alert ${msgType}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
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
                    <label>Nouveau mot de passe <small>(laisser vide pour ne pas changer)</small></label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                </div>

                <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                    {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default Profile;