import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import researcherService from '../services/researcher.service.js';
import MyPublications from './dashboard/MyPublications';
import ResearcherProfile from './dashboard/ResearcherProfile';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [researcher, setResearcher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('publications');

    useEffect(() => {
        const fetchResearcher = async () => {
            if (user?.id) {
                try {
                    const data = await researcherService.getByUserId(user.id);
                    setResearcher(data);
                } catch (error) {
                    console.log('Aucun profil chercheur associé');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchResearcher();
    }, [user]);

    if (loading) return <div className="loader">Chargement...</div>;

    return (
        <motion.div
            className="dashboard container"
            style={{ paddingTop: 'calc(var(--navbar-h, 70px) + 32px)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h1>Tableau de bord</h1>
            <p>Bienvenue, {user?.prenom} {user?.nom} !</p>

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'publications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('publications')}
                >
                    Mes publications
                </button>
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Mon profil chercheur
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'publications' && (
                    researcher ? (
                        <MyPublications chercheurId={researcher.id} />
                    ) : (
                        <div className="no-profile-message">
                            <p>Vous n'avez pas encore de profil chercheur.</p>
                            <p>Contactez un administrateur pour créer votre profil.</p>
                        </div>
                    )
                )}

                {activeTab === 'profile' && (
                    researcher ? (
                        <ResearcherProfile researcher={researcher} />
                    ) : (
                        <div className="no-profile-message">
                            <p>Aucun profil chercheur associé à votre compte.</p>
                        </div>
                    )
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;