import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

import './SearchPage.css';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [results,  setResults]  = useState([]);
    const [domains,  setDomains]  = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [searched, setSearched] = useState(false);

    const [query,    setQuery]    = useState(searchParams.get('q')         || '');
    const [domainId, setDomainId] = useState(searchParams.get('domaineId') || '');
    const [author,   setAuthor]   = useState(searchParams.get('chercheur') || '');

    // Chargement des domaines
    useEffect(() => {
        api.get('/public/domains')
            .then(r => setDomains(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    const doSearch = async (q, dId, ch) => {
        const backendParams = {};
        if (q)   backendParams.keyword   = q;
        if (dId) backendParams.domaineId = Number(dId);
        if (ch)  backendParams.chercheur = ch;

        setLoading(true);
        setSearched(true);
        try {
            const r = await api.get('/public/publications/search', { params: backendParams });
            const data = r.data;
            setResults(Array.isArray(data) ? data : (data.content ?? []));
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Lancement auto si URL a déjà des params
    useEffect(() => {
        const q   = searchParams.get('q')         || '';
        const dId = searchParams.get('domaineId') || '';
        const ch  = searchParams.get('chercheur') || '';
        if (q || dId || ch) doSearch(q, dId, ch);
    }, []); // eslint-disable-line

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query && !domainId && !author) return;
        const params = {};
        if (query)    params.q         = query;
        if (domainId) params.domaineId = domainId;
        if (author)   params.chercheur = author;
        setSearchParams(params);
        doSearch(query, domainId, author);
    };

    return (
        <div className="sp-page">

            {/* ── En-tête ── */}
            <div className="sp-header">
                <h1 className="sp-header__title">Recherche de publications</h1>
                <p className="sp-header__sub">Recherchez par mot-clé, domaine ou nom de chercheur</p>
            </div>

            {/* ── Formulaire ── */}
            <form className="sp-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="sp-form__input"
                    placeholder="🔍  Mots-clés (titre, résumé...)"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <select
                    className="sp-form__input"
                    value={domainId}
                    onChange={e => setDomainId(e.target.value)}
                >
                    <option value="">Tous les domaines</option>
                    {domains.map(d => (
                        <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                </select>
                <input
                    type="text"
                    className="sp-form__input"
                    placeholder="👤  Nom du chercheur"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                />
                <button type="submit" className="sp-form__btn">
                    Rechercher
                </button>
            </form>

            {/* ── Résultats ── */}
            {loading && (
                <div className="sp-loading">
                    <div className="sp-spinner" />
                    Recherche en cours...
                </div>
            )}

            {!loading && searched && (
                <>
                    <p className="sp-count">
                        {results.length === 0
                            ? 'Aucune publication trouvée.'
                            : `${results.length} publication(s) trouvée(s)`}
                    </p>

                    <div className="sp-list">
                        {results.map(pub => {
                            const annee      = pub.datePublication
                                ? new Date(pub.datePublication).getFullYear()
                                : null;
                            const chercheurs = Array.isArray(pub.chercheursNoms)
                                ? pub.chercheursNoms
                                : [];
                            const domaines   = Array.isArray(pub.domainesNoms)
                                ? pub.domainesNoms
                                : [];

                            return (
                                <motion.div 
                                    key={pub.id} 
                                    className="sp-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >

                                    {/* Colonne gauche : contenu */}
                                    <div className="sp-card__body">

                                        <div className="sp-card__top">
                                            <span className="sp-card__badge">Article de recherche</span>
                                            {annee && (
                                                <span className="sp-card__year">{annee}</span>
                                            )}
                                        </div>

                                        <h2 className="sp-card__title">{pub.titre}</h2>

                                        {chercheurs.length > 0 && (
                                            <p className="sp-card__authors">
                                                {chercheurs.join(' · ')}
                                            </p>
                                        )}

                                        {pub.resume && (
                                            <p className="sp-card__abstract">
                                                {pub.resume.length > 200
                                                    ? pub.resume.slice(0, 200) + '…'
                                                    : pub.resume}
                                            </p>
                                        )}

                                        {domaines.length > 0 && (
                                            <div className="sp-card__tags">
                                                {domaines.map((d, i) => (
                                                    <span key={i} className="sp-card__tag">{d}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Colonne droite : action */}
                                    <div className="sp-card__action">
                                        <Link
                                            to={`/publications/${pub.id}`}
                                            className="sp-card__btn"
                                        >
                                            Voir la publication
                                        </Link>
                                        {pub.doi && (
                                            <span className="sp-card__doi">DOI</span>
                                        )}
                                    </div>

                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {!loading && !searched && (
                <div className="sp-hint">
                    <span>🔍</span>
                    <p>Entrez un mot-clé pour commencer votre recherche</p>
                </div>
            )}
        </div>
    );
};

export default SearchPage;