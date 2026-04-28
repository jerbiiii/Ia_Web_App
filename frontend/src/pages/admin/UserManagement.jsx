import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../services/user.service';
import './UserManagement.css';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'UTILISATEUR'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await userService.create(newUser);
            fetchUsers();
            setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'UTILISATEUR' });
            setShowForm(false);
        } catch (error) {
            alert('Erreur lors de la création : ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Erreur lors du changement de rôle');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await userService.delete(userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                alert('Erreur lors de la suppression');
            }
        }
    };

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="user-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <button className="btn-back" onClick={() => navigate('/admin')}>
                ← Retour au tableau de bord
            </button>
            <h2>Gestion des utilisateurs</h2>

            <button className="btn-add" onClick={() => setShowForm(true)}>
                + Créer un utilisateur
            </button>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="form-modal"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h3>Nouvel utilisateur</h3>
                        <form onSubmit={handleCreateUser} className="user-form">
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="nom" value={newUser.nom} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input type="text" name="prenom" value={newUser.prenom} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Mot de passe</label>
                                <input type="password" name="password" value={newUser.password} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Rôle</label>
                                <select name="role" value={newUser.role} onChange={handleInputChange}>
                                    <option value="UTILISATEUR">Utilisateur</option>
                                    <option value="MODERATEUR">Modérateur</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Créer</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <table className="user-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date inscription</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nom}</td>
                        <td>{user.prenom}</td>
                        <td>{user.email}</td>
                        <td>
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="role-select"
                            >
                                <option value="UTILISATEUR">Utilisateur</option>
                                <option value="MODERATEUR">Modérateur</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </td>
                        <td>{user.dateInscription ? new Date(user.dateInscription).toLocaleDateString('fr-FR') : ''}</td>
                        <td>
                            <button onClick={() => handleDelete(user.id)} className="btn-delete">Supprimer</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </motion.div>
    );
};

export default UserManagement;