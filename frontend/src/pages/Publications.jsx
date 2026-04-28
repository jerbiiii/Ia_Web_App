import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Publications.css';

const IconSearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const IconBook = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const IconFilter = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>;
const IconCalendar = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconUser = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconArrow = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const IconX = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

const ITEMS_PER_PAGE = 12;

// ── Utilitaire : extrait un tableau depuis une réponse Spring (Page ou Array) ──
function extractList(data) {
    if (!data) return { list: [], total: 0 };
    // ✅ BUG 4 FIX : /public/publications retourne un Page object Spring :
    // { content: [...], totalElements: N, totalPages: N, ... }
    // Array.isArray(data) === false → l'original faisait pubs = [] systématiquement.
    if (data.content !== undefined) {
        return { list: data.content, total: data.totalElements ?? data.content.length };
    }
    if (Array.isArray(data)) {
        return { list: data, total: data.length };
    }
    return { list: [], total: 0 };
}

function PublicationCard({ pub }) {
    const authors = Array.isArray(pub.chercheursNoms) ? pub.chercheursNoms : [];
    const domains = Array.isArray(pub.domainesNoms) ? pub.domainesNoms : [];
    const year = pub.datePublication ? new Date(pub.datePublication).getFullYear() : null;

    return (
        <article className="plist-card">
            <div className="plist-card__left">
                <div className="plist-card__type"><IconBook /> Article</div>
                <Link to={`/publications/${pub.id}`}>
                    <h3 className="plist-card__title">{pub.titre}</h3>
                </Link>
                {authors.length > 0 && (
                    <p className="plist-card__authors">
                        <span className="plist-card__authors-icon"><IconUser /></span>
                        {authors.slice(0, 3).join(', ')}{authors.length > 3 ? ` + ${authors.length - 3}` : ''}
                    </p>
                )}
                {pub.resume && (
                    <p className="plist-card__abstract">
                        {pub.resume.slice(0, 200)}{pub.resume.length > 200 ? '…' : ''}
                    </p>
                )}
                <div className="plist-card__meta">
                    {year && <span className="plist-card__meta-item"><IconCalendar /> {year}</span>}
                    {domains.slice(0, 2).map((d, i) => (
                        <span key={i} className="badge badge-primary">{d}</span>
                    ))}
                </div>
            </div>
            <div className="plist-card__right">
                <Link to={`/publications/${pub.id}`} className="btn btn-outline btn-sm">
                    Consulter <IconArrow />
                </Link>
            </div>
        </article>
    );
}

export default function Publications() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [publications, setPublications] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const searchQ = searchParams.get('q') || '';
    const domainF = searchParams.get('domain') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [localSearch, setLocalSearch] = useState(searchQ);

    // Chargement initial des domaines pour la sidebar et la résolution d'IDs
    useEffect(() => {
        api.get('/public/domains')
            .then(res => setDomains(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erreur domaines:", err));
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Résolution de l'ID du domaine si un filtre par nom est actif
                let domainId = null;
                if (domainF && domains.length > 0) {
                    const found = domains.find(d => d.nom.toLowerCase() === domainF.toLowerCase());
                    if (found) domainId = found.id;
                }

                let response;
                const commonParams = { page: page - 1, size: ITEMS_PER_PAGE };

                if (searchQ || domainF) {
                    // Utilisation de l'endpoint de recherche (Côté Serveur)
                    response = await api.get('/public/publications/search', {
                        params: {
                            ...commonParams,
                            keyword: searchQ || undefined,
                            domaineId: domainId || undefined
                        }
                    });
                } else {
                    // Liste standard (Côté Serveur)
                    response = await api.get('/public/publications', { params: commonParams });
                }

                const { list, total: serverTotal } = extractList(response.data);
                setPublications(list);
                setTotal(serverTotal);
            } catch (e) {
                console.error("Erreur chargement publications:", e);
                setPublications([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        // On attend que les domaines soient chargés pour pouvoir résoudre l'ID si domainF est présent
        if (!domainF || (domainF && domains.length > 0)) {
            load();
        }
    }, [searchQ, domainF, page, domains.length]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete('page');
        setSearchParams(next);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setParam('q', localSearch.trim());
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return (
        <div className="page-content">
            <div className="plist-header">
                <div className="container">
                    <nav className="breadcrumb" aria-label="Fil d'Ariane">
                        <Link to="/">Accueil</Link>
                        <span className="breadcrumb__sep" aria-hidden="true">/</span>
                        <span aria-current="page">Publications</span>
                    </nav>
                    <h1 className="plist-header__title">Publications</h1>
                    <p className="plist-header__sub">
                        {loading ? 'Chargement…' : `${total} publication${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>

            <div className="container plist-layout">
                {/* Sidebar */}
                <aside className="plist-sidebar" aria-label="Filtres">
                    <div className="plist-sidebar__block">
                        <h3 className="plist-sidebar__title"><IconSearch /> Recherche</h3>
                        <form onSubmit={handleSearch}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="search"
                                    className="form-input"
                                    placeholder="Titre, auteur, mot-clé…"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    style={{ paddingRight: '40px', fontSize: '.88rem', height: 40 }}
                                />
                                <button type="submit" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }}>
                                    <IconSearch />
                                </button>
                            </div>
                        </form>
                    </div>

                    {(searchQ || domainF) && (
                        <div className="plist-sidebar__block">
                            <h3 className="plist-sidebar__title"><IconFilter /> Filtres actifs</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {searchQ && (
                                    <div className="plist-active-filter">
                                        <span>"{searchQ}"</span>
                                        <button onClick={() => { setLocalSearch(''); setParam('q', ''); }} aria-label="Supprimer"><IconX /></button>
                                    </div>
                                )}
                                {domainF && (
                                    <div className="plist-active-filter">
                                        <span>{domainF}</span>
                                        <button onClick={() => setParam('domain', '')} aria-label="Supprimer"><IconX /></button>
                                    </div>
                                )}
                                <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', fontSize: '.8rem', color: 'var(--color-error)' }}
                                    onClick={() => { setLocalSearch(''); setSearchParams({}); }}>
                                    Effacer tout
                                </button>
                            </div>
                        </div>
                    )}

                    {domains.length > 0 && (
                        <div className="plist-sidebar__block">
                            <h3 className="plist-sidebar__title">Domaines</h3>
                            <div className="plist-sidebar__domains">
                                {domains.map((d, i) => (
                                    <button key={i} className={`plist-domain-btn ${domainF === d.nom ? 'active' : ''}`}
                                        onClick={() => setParam('domain', domainF === d.nom ? '' : d.nom)}>
                                        {d.nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main */}
                <main className="plist-main" aria-label="Liste des publications">
                    {loading ? (
                        <div className="plist-list">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="plist-card" style={{ minHeight: 120 }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 10 }} />
                                        <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                                        <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 10 }} />
                                        <div className="skeleton" style={{ height: 12, width: '50%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : publications.length > 0 ? (
                        <>
                            <div className="plist-list">
                                {publications.map((pub, i) => (
                                    <div key={pub.id || i} className="anim-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                                        <PublicationCard pub={pub} />
                                    </div>
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <nav className="plist-pagination" aria-label="Pagination">
                                    <button className="pagination__btn" onClick={() => setParam('page', String(page - 1))} disabled={page <= 1}>
                                        ← Précédent
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, i) =>
                                            p === '…'
                                                ? <span key={`e-${i}`} style={{ color: 'var(--color-text-light)', padding: '0 4px' }}>…</span>
                                                : <button key={p} className={`pagination__btn ${p === page ? 'active' : ''}`} onClick={() => setParam('page', String(p))} aria-current={p === page ? 'page' : undefined}>{p}</button>
                                        )}
                                    <button className="pagination__btn" onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages}>
                                        Suivant →
                                    </button>
                                </nav>
                            )}
                        </>
                    ) : (
                        <div className="plist-empty">
                            <div className="plist-empty__icon"><IconBook /></div>
                            <h3>Aucune publication trouvée</h3>
                            <p>Essayez de modifier vos critères de recherche ou de supprimer les filtres actifs.</p>
                            {(searchQ || domainF) && (
                                <button className="btn btn-outline btn-sm" onClick={() => { setLocalSearch(''); setSearchParams({}); }} style={{ marginTop: 12 }}>
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}