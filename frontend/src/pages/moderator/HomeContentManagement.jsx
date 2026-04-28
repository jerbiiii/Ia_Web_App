import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import homeContentService from '../../services/Homecontent.service.js';
import './HomeContentManagement.css';

const SECTIONS = ['HERO', 'CTA', 'FOOTER'];
const SECTION_LABELS = {
    HERO:   '🏠 Zone principale \"À la une\" (bannière en haut de la page)',
    CTA:    '📢 Bandeau d’appel à l’action (bloc coloré avant le pied de page)',
    FOOTER: '🔻 Pied de page (texte tout en bas)',
};

const HOME_ELEMENTS = [
    {
        cle: 'hero_badge',
        libelle: 'Badge au-dessus du grand titre',
        section: 'HERO',
        type: 'TEXT',
        hint: 'Petit texte à gauche du bloc héros, par ex. \"Plateforme IA-Technology\".'
    },
    {
        cle: 'hero_title',
        libelle: 'Grand titre de la bannière \"À la une\"',
        section: 'HERO',
        type: 'TEXT',
        hint: 'Titre principal très visible au centre de la page d’accueil.'
    },
    {
        cle: 'hero_subtitle',
        libelle: 'Texte d’introduction sous le grand titre',
        section: 'HERO',
        type: 'TEXT',
        hint: 'Phrase de description qui explique la plateforme.'
    },
    {
        cle: 'hero_placeholder',
        libelle: 'Texte dans le champ de recherche',
        section: 'HERO',
        type: 'TEXT',
        hint: 'Placeholder gris dans la barre de recherche (ex. \"Titre, auteur, domaine...\").'
    },
    {
        cle: 'hero_suggestions',
        libelle: 'Mots-clés suggérés sous la recherche',
        section: 'HERO',
        type: 'TEXT',
        hint: 'Liste séparée par des virgules (ex. \"NLP,Cybersécurité,Vision\"), affichée comme tags cliquables.'
    },
    {
        cle: 'cta_title',
        libelle: 'Titre du bloc d’appel à l’action',
        section: 'CTA',
        type: 'TEXT',
        hint: 'Grand titre du bloc coloré (ex. \"Partagez vos travaux avec la communauté\").'
    },
    {
        cle: 'cta_subtitle',
        libelle: 'Texte sous le titre du CTA',
        section: 'CTA',
        type: 'TEXT',
        hint: 'Court paragraphe expliquant pourquoi créer un compte / parcourir les publications.'
    },
    {
        cle: 'cta_btn_register',
        libelle: 'Texte du bouton \"Créer un compte\"',
        section: 'CTA',
        type: 'TEXT',
        hint: 'Libellé du bouton principal à gauche dans le CTA.'
    },
    {
        cle: 'cta_btn_browse',
        libelle: 'Texte du bouton \"Parcourir les publications\"',
        section: 'CTA',
        type: 'TEXT',
        hint: 'Libellé du bouton secondaire à droite dans le CTA.'
    },
    {
        cle: 'footer_description',
        libelle: 'Texte descriptif du pied de page',
        section: 'FOOTER',
        type: 'TEXT',
        hint: 'Petit paragraphe en bas à gauche du footer, décrivant la plateforme.'
    },
];

const HomeContentManagement = () => {
    const { isAdmin, isModerator } = useAuth();

    const [dbContents,    setDbContents]    = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [editingInline, setEditingInline] = useState(null);
    const [inlineValue,   setInlineValue]   = useState('');
    const [savingInline,  setSavingInline]  = useState(false);
    const [message,       setMessage]       = useState({ text: '', type: '' });

    useEffect(() => { fetchContents(); }, []);

    const fetchContents = async () => {
        setLoading(true);
        try {
            const data = await homeContentService.getAll();
            setDbContents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setDbContents([]);
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const getDbEntry = (cle) => dbContents.find(c => c.cle === cle) || null;

    const handleInlineEdit = (element) => {
        const db = getDbEntry(element.cle);
        setEditingInline(element.cle);
        setInlineValue(db ? db.valeur : '');
    };

    const handleInlineSave = async (element) => {
        const db = getDbEntry(element.cle);
        setSavingInline(true);
        try {
            if (db) {
                await homeContentService.updateValeur(db.id, inlineValue);
                setDbContents(prev => prev.map(c => c.id === db.id ? { ...c, valeur: inlineValue } : c));
            } else {
                const created = await homeContentService.create({
                    cle: element.cle, libelle: element.libelle,
                    valeur: inlineValue, type: element.type,
                    section: element.section, actif: true,
                });
                setDbContents(prev => [...prev, created]);
            }
            setEditingInline(null);
            showMsg('Contenu mis à jour ✓');
        } catch (err) {
            showMsg('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSavingInline(false);
        }
    };

    const handleToggleActif = async (element) => {
        const db = getDbEntry(element.cle);
        try {
            if (db) {
                await homeContentService.update(db.id, { ...db, actif: !db.actif });
                setDbContents(prev => prev.map(c => c.id === db.id ? { ...c, actif: !c.actif } : c));
                showMsg(db.actif ? 'Contenu masqué sur la HomePage' : 'Contenu visible sur la HomePage');
            } else {
                const created = await homeContentService.create({
                    cle: element.cle, libelle: element.libelle,
                    valeur: '', type: element.type,
                    section: element.section, actif: false,
                });
                setDbContents(prev => [...prev, created]);
                showMsg('Contenu masqué sur la HomePage');
            }
        } catch (err) {
            showMsg('Erreur', 'error');
        }
    };

    /**
     * ✅ CORRECTION : la suppression est réservée aux ADMIN.
     * Le bouton est masqué pour les MODERATEUR (évite un 403 Forbidden).
     * Côté backend, @PreAuthorize a aussi été mis à jour pour autoriser MODERATEUR.
     */
    const handleDelete = async (element) => {
        const db = getDbEntry(element.cle);
        if (!db) return;
        if (!window.confirm(`Supprimer "${element.libelle}" ? La valeur par défaut sera restaurée sur la HomePage.`)) return;
        try {
            await homeContentService.delete(db.id);
            setDbContents(prev => prev.filter(c => c.id !== db.id));
            showMsg('Supprimé — valeur par défaut restaurée');
        } catch (err) {
            showMsg('Erreur lors de la suppression', 'error');
        }
    };

    if (loading) return <div className="hcm-loading">Chargement...</div>;

    return (
        <motion.div className="hcm-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hcm-header">
                <div>
                    <h2>🏗️ Contenu de la page d'accueil</h2>
                    <p className="hcm-subtitle">
                        Modifiez les textes affichés sur la page d'accueil.
                    </p>
                </div>
            </div>

            {message.text && (
                <div className={`hcm-alert hcm-alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {SECTIONS.map(section => {
                const elements = HOME_ELEMENTS.filter(e => e.section === section);
                return (
                    <div key={section} className="hcm-section-block">
                        <h3 className="hcm-section-title">
                            {SECTION_LABELS[section]}
                            <span className="hcm-count">{elements.length} élément{elements.length > 1 ? 's' : ''}</span>
                        </h3>

                        <div className="hcm-items">
                            {elements.map(element => {
                                const db        = getDbEntry(element.cle);
                                const isInDb    = !!db;
                                const isActif   = db ? db.actif : true;
                                const valeur    = db ? db.valeur : '';
                                const isEditing = editingInline === element.cle;

                                return (
                                    <div key={element.cle} className={`hcm-item ${!isActif ? 'hcm-item-inactive' : ''}`}>
                                        <div className="hcm-item-header">
                                            <div className="hcm-item-meta">
                                                <span className="hcm-cle">{element.cle}</span>
                                                {!isInDb && <span className="hcm-default-badge">Défaut</span>}
                                                {isInDb && !isActif && <span className="hcm-inactive-badge">Masqué</span>}
                                                {isInDb && isActif && <span className="hcm-active-badge">Actif</span>}
                                            </div>
                                            <div className="hcm-item-actions">
                                                <button
                                                    className="btn-icon btn-inline-edit"
                                                    onClick={() => handleInlineEdit(element)}
                                                    title="Modifier"
                                                >✏️ Modifier</button>

                                                <button
                                                    className={`btn-icon ${isActif ? 'btn-deactivate' : 'btn-activate'}`}
                                                    onClick={() => handleToggleActif(element)}
                                                    title={isActif ? 'Masquer' : 'Afficher'}
                                                >{isActif ? '👁️ Visible' : '🙈 Masqué'}</button>

                                                {(isAdmin || isModerator) && (
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDelete(element)}
                                                        title={isInDb ? 'Supprimer (restaure le défaut)' : 'Pas encore modifié'}
                                                        disabled={!isInDb}
                                                    >🗑️ Supprimer</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hcm-libelle">{element.libelle}</div>

                                        {element.hint && (
                                            <div className="hcm-hint">💡 {element.hint}</div>
                                        )}

                                        {isEditing ? (
                                            <div className="hcm-inline-edit">
                                                <textarea
                                                    value={inlineValue}
                                                    onChange={e => setInlineValue(e.target.value)}
                                                    rows="3"
                                                    className="hcm-inline-input"
                                                    autoFocus
                                                />
                                                <div className="hcm-inline-actions">
                                                    <button
                                                        className="btn-inline-save"
                                                        onClick={() => handleInlineSave(element)}
                                                        disabled={savingInline}
                                                    >{savingInline ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}</button>
                                                    <button
                                                        className="btn-inline-cancel"
                                                        onClick={() => setEditingInline(null)}
                                                    >❌ Annuler</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`hcm-valeur ${!isInDb ? 'hcm-valeur-default' : ''}`}>
                                                {valeur}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
};

export default HomeContentManagement;