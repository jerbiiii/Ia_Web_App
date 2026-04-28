import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const IconSearch   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconArrow    = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconBook     = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconUsers    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconDomain   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalendar = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

function useIntersection(threshold = 0.1) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, visible];
}

function AnimatedNumber({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [ref, visible] = useIntersection();
    useEffect(() => {
        if (!visible) return;
        const duration = 1400;
        const start    = Date.now();
        const tick     = () => {
            const elapsed  = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [visible, target]);
    return <span ref={ref}>{count}{suffix}</span>;
}

function PublicationCard({ pub, delay = 0 }) {
    const chercheurs = Array.isArray(pub.chercheursNoms) ? pub.chercheursNoms : [];
    const domaines   = Array.isArray(pub.domainesNoms)   ? pub.domainesNoms   : [];

    return (
        <article className="pub-card anim-fade-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="pub-card__type"><IconBook /> Article de recherche</div>
            <Link to={`/publications/${pub.id}`}>
                <h3 className="pub-card__title">{pub.titre}</h3>
            </Link>
            {chercheurs.length > 0 && (
                <p className="pub-card__authors">{chercheurs.join(', ')}</p>
            )}
            <div className="pub-card__meta">
                {pub.datePublication && (
                    <span className="pub-card__meta-item">
                        <IconCalendar />
                        {new Date(pub.datePublication).getFullYear()}
                    </span>
                )}
                {domaines.length > 0 && (
                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                        {domaines[0]}
                    </span>
                )}
            </div>
        </article>
    );
}

function DomainChip({ domain, delay = 0 }) {
    return (
        <Link
            to={`/search?domaineId=${domain.id}`}
            className="domain-chip anim-fade-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            {domain.nom}
        </Link>
    );
}

function ActualiteCard({ item, delay = 0 }) {
    return (
        <article className="actu-card anim-fade-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="actu-card__date">
                <IconCalendar />
                {new Date(item.datePublication || item.date || Date.now()).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })}
            </div>
            <h4 className="actu-card__title">{item.titre}</h4>
            {item.contenu && (
                <p className="actu-card__excerpt">
                    {item.contenu.slice(0, 130)}{item.contenu.length > 130 ? '…' : ''}
                </p>
            )}
        </article>
    );
}

function HighlightCard({ item, delay = 0 }) {
    return (
        <Link
            to={`/highlights/${item.id}`}
            className="actu-card anim-fade-up"
            style={{ animationDelay: `${delay}ms`, textDecoration: 'none', color: 'inherit' }}
        >
            {item.imageUrl && (
                <div className="actu-card__image">
                    <img src={item.imageUrl} alt={item.titre} />
                </div>
            )}
            <h4 className="actu-card__title">{item.titre}</h4>
            {item.description && (
                <p className="actu-card__excerpt">
                    {item.description.slice(0, 130)}{item.description.length > 130 ? '…' : ''}
                </p>
            )}
        </Link>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [searchQuery,  setSearchQuery]  = useState('');
    const [publications, setPublications] = useState([]);
    const [domains,      setDomains]      = useState([]);
    const [actualites,   setActualites]   = useState([]);
    const [highlights,   setHighlights]   = useState([]);
    const [stats,        setStats]        = useState({ publications: 0, chercheurs: 0, domaines: 0 });
    const [loading,      setLoading]      = useState(true);
    const [homeContent,  setHomeContent]  = useState({});

    const hc = (cle) => homeContent[cle] ?? '';

    const [statsRef, statsVisible] = useIntersection(0.2);
    const [pubsRef,  pubsVisible]  = useIntersection(0.1);
    const [domsRef,  domsVisible]  = useIntersection(0.1);
    const [actusRef, actusVisible] = useIntersection(0.1);
    const [hlRef,    hlVisible]    = useIntersection(0.1);

    useEffect(() => {
        const load = async () => {
            try {
                const [pubRes, domRes, actRes, cherRes, hcRes, hlRes] = await Promise.allSettled([
                    api.get('/public/publications'),
                    api.get('/public/domains'),
                    api.get('/public/actualites'),
                    api.get('/public/researchers'),
                    api.get('/public/home-content'),
                    api.get('/public/highlights'),
                ]);

                if (pubRes.status === 'fulfilled') {
                    const data = pubRes.value.data;
                    let list, total;
                    if (data && data.content !== undefined) {
                        list  = data.content;
                        total = data.totalElements;
                    } else if (Array.isArray(data)) {
                        list  = data;
                        total = data.length;
                    } else {
                        list  = [];
                        total = 0;
                    }
                    setPublications(list.slice(0, 6));
                    setStats(prev => ({ ...prev, publications: total }));
                }

                if (domRes.status === 'fulfilled') {
                    const doms = domRes.value.data;
                    const list = Array.isArray(doms) ? doms : [];
                    setDomains(list.slice(0, 12));
                    setStats(prev => ({ ...prev, domaines: list.length }));
                }

                if (actRes.status === 'fulfilled') {
                    const acts = actRes.value.data;
                    const list = Array.isArray(acts) ? acts : (acts?.content ?? []);
                    setActualites(list.slice(0, 3));
                }

                if (cherRes.status === 'fulfilled') {
                    const chers = cherRes.value.data;
                    const count = Array.isArray(chers) ? chers.length : (chers?.totalElements ?? 0);
                    setStats(prev => ({ ...prev, chercheurs: count }));
                }

                if (hcRes.status === 'fulfilled') {
                    const hcList = Array.isArray(hcRes.value.data) ? hcRes.value.data : [];
                    const hcMap  = {};
                    hcList.forEach(item => { if (item.actif) hcMap[item.cle] = item.valeur; });
                    setHomeContent(hcMap);
                }

                if (hlRes.status === 'fulfilled') {
                    const hs = hlRes.value.data;
                    const list = Array.isArray(hs) ? hs : [];
                    setHighlights(list);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    // ✅ Suggestions dynamiques : depuis la BDD ou valeur par défaut
    const suggestions = (hc('hero_suggestions') || 'Machine Learning,Bioinformatique,IoT,Cybersécurité')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    return (
        <div className="homepage">

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero__bg" aria-hidden="true">
                    <div className="hero__bg-circle hero__bg-circle--1" />
                    <div className="hero__bg-circle hero__bg-circle--2" />
                    <div className="hero__bg-grid" />
                </div>

                <div className="container hero__inner">
                    <div className="hero__content">
                        {hc('hero_badge') && (
                            <div className="hero__eyebrow anim-fade-up">
                                <span className="badge badge-accent">{hc('hero_badge')}</span>
                            </div>
                        )}
                        {hc('hero_title') && (
                            <h1 className="hero__title anim-fade-up anim-delay-1">
                                {hc('hero_title').includes('|') ? (
                                    <>
                                        {hc('hero_title').split('|')[0]}
                                        <em className="hero__title-em">{hc('hero_title').split('|')[1]}</em>
                                        {hc('hero_title').split('|')[2]}
                                    </>
                                ) : hc('hero_title')}
                            </h1>
                        )}
                        {hc('hero_subtitle') && (
                            <p className="hero__subtitle anim-fade-up anim-delay-2">
                                {hc('hero_subtitle')}
                            </p>
                        )}

                        {/* ✅ FIX : input correctement fermé, placeholder dynamique */}
                        <form className="hero__search anim-fade-up anim-delay-3" onSubmit={handleSearch} role="search">
                            <div className="hero__search-input-wrap">
                                <span className="hero__search-icon" aria-hidden="true"><IconSearch /></span>
                                <input
                                    type="search"
                                    className="hero__search-input"
                                    placeholder={hc('hero_placeholder') || "Titre, auteur, domaine, mot-clé..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Recherche"
                                />
                            </div>
                            <button type="submit" className="btn btn-accent btn-lg hero__search-btn">
                                <IconSearch /> Rechercher
                            </button>
                        </form>

                        {/* ✅ FIX : suggestions dynamiques correctement placées APRÈS le form */}
                        <div className="hero__suggestions anim-fade-up anim-delay-4">
                            <span className="hero__suggestions-label">Populaire :</span>
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    className="hero__tag"
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hero__illustration anim-fade-up anim-delay-3" aria-hidden="true">
                        <div className="hero__card-stack">
                            <div className="hero__float-card hero__float-card--1">
                                <div className="hero__float-card-icon"><IconBook /></div>
                                <div>
                                    <div className="hero__float-card-title" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {publications[0]?.titre ?? 'Chargement…'}
                                    </div>
                                    <div className="hero__float-card-sub">
                                        Publié {publications[0]?.datePublication ? new Date(publications[0].datePublication).getFullYear() : '—'}
                                    </div>
                                </div>
                            </div>
                            <div className="hero__float-card hero__float-card--2">
                                <div className="hero__float-card-icon" style={{background:'rgba(232,119,34,.15)',color:'var(--color-accent)'}}>
                                    <IconUsers />
                                </div>
                                <div>
                                    <div className="hero__float-card-title">{stats.chercheurs} Chercheurs</div>
                                    <div className="hero__float-card-sub">Actifs</div>
                                </div>
                            </div>
                            <div className="hero__book-visual">
                                <div className="hero__book-spine" />
                                <div className="hero__book-page">
                                    <div className="hero__book-line" />
                                    <div className="hero__book-line hero__book-line--short" />
                                    <div className="hero__book-line" />
                                    <div className="hero__book-line hero__book-line--mid" />
                                    <div className="hero__book-line" />
                                    <div className="hero__book-line hero__book-line--short" />
                                    <div className="hero__book-line" />
                                    <div className="hero__book-badge"><span>Open<br/>Access</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className={`stats-section ${statsVisible ? 'stats-section--visible' : ''}`} ref={statsRef}>
                <div className="container">
                    <div className="stats-grid">
                        {[
                            { icon: <IconBook />,   value: stats.publications, suffix: '+', label: 'Publications',          color: 'var(--color-primary)' },
                            { icon: <IconUsers />,  value: stats.chercheurs,   suffix: '',  label: 'Chercheurs',            color: 'var(--color-accent)'  },
                            { icon: <IconDomain />, value: stats.domaines,     suffix: '',  label: 'Domaines de recherche', color: '#22863A'              },
                        ].map((stat, i) => (
                            <div key={i} className="stat-card" style={{ '--stat-color': stat.color }}>
                                <div className="stat-card__icon">{stat.icon}</div>
                                <div className="stat-card__value">
                                    <AnimatedNumber target={stat.value || 0} suffix={stat.suffix} />
                                </div>
                                <div className="stat-card__label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Domaines ── */}
            {domains.length > 0 && (
                <section className="section" ref={domsRef}>
                    <div className="container">
                        <div className="section-header">
                            <div className="section-header__label">Explorer</div>
                            <h2>Domaines de recherche</h2>
                            <p>Naviguez par thématique scientifique pour trouver les publications qui vous intéressent.</p>
                        </div>
                        <div className={`domains-grid ${domsVisible ? 'is-visible' : ''}`}>
                            {domains.map((dom, i) => (
                                <DomainChip key={dom.id || i} domain={dom} delay={i * 50} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Projets à la une (highlights) ── */}
            {highlights.length > 0 && (
                <section className="section" ref={hlRef}>
                    <div className="container">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <div className="section-header__label">À la une</div>
                                <h2>Projets récents d'IA-Technology</h2>
                                <p>Mise en avant des projets stratégiques sélectionnés par l’équipe éditoriale.</p>
                            </div>
                            <Link to="/highlights" className="btn btn-outline btn-sm">Voir tous les projets <IconArrow /></Link>
                        </div>
                        <div className={`actu-grid ${hlVisible ? 'is-visible' : ''}`}>
                            {highlights.map((item, i) => (
                                <HighlightCard key={item.id || i} item={item} delay={i * 100} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Publications récentes ── */}
            <section className="section section--alt" ref={pubsRef}>
                <div className="container">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div className="section-header__label">Publications</div>
                            <h2>Publications récentes</h2>
                        </div>
                        <Link to="/publications" className="btn btn-outline btn-sm">Voir tout <IconArrow /></Link>
                    </div>

                    {loading ? (
                        <div className="pub-grid">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="pub-card">
                                    <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
                                    <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                                    <div className="skeleton" style={{ height: 18, width: '75%', marginBottom: 12 }} />
                                    <div className="skeleton" style={{ height: 13, width: '50%' }} />
                                </div>
                            ))}
                        </div>
                    ) : publications.length > 0 ? (
                        <div className={`pub-grid ${pubsVisible ? 'is-visible' : ''}`}>
                            {publications.map((pub, i) => (
                                <PublicationCard key={pub.id || i} pub={pub} delay={i * 80} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon"><IconBook /></div>
                            <p>Aucune publication disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Actualités ── */}
            {actualites.length > 0 && (
                <section className="section" ref={actusRef}>
                    <div className="container">
                        <div className="section-header">
                            <div className="section-header__label">Actualités</div>
                            <h2>Dernières nouvelles</h2>
                        </div>
                        <div className={`actu-grid ${actusVisible ? 'is-visible' : ''}`}>
                            {actualites.map((item, i) => (
                                <ActualiteCard key={item.id || i} item={item} delay={i * 100} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA — affiché uniquement pour les visiteurs non connectés ── */}
            {!isAuthenticated && <section className="cta-section">
                <div className="container">
                    <div className="cta-inner">
                        <div className="cta-inner__deco" aria-hidden="true" />
                        <div className="cta-inner__content">
                            {hc('cta_title') && <h2>{hc('cta_title')}</h2>}
                            {hc('cta_subtitle') && <p>{hc('cta_subtitle')}</p>}

                            {/* ✅ FIX : boutons CTA dynamiques correctement placés */}
                            <div className="cta-inner__actions">
                                <Link to="/register" className="btn btn-accent btn-lg">
                                    {hc('cta_btn_register') || 'Créer un compte gratuit'}
                                </Link>
                                <Link
                                    to="/publications"
                                    className="btn btn-outline btn-lg"
                                    style={{ '--outline-c': 'white', color: 'white', borderColor: 'rgba(255,255,255,.4)' }}
                                >
                                    {hc('cta_btn_browse') || 'Parcourir les publications'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>}

            {/* ── Footer ── */}
            <footer className="footer">
                <div className="container">
                    <div className="footer__grid">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36">
                                    <defs>
                                        <linearGradient id="fb" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor:'#0066b4',stopOpacity:1}} />
                                            <stop offset="100%" style={{stopColor:'#003d6e',stopOpacity:1}} />
                                        </linearGradient>
                                        <linearGradient id="fa" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor:'#eb3700',stopOpacity:1}} />
                                            <stop offset="100%" style={{stopColor:'#c42d00',stopOpacity:1}} />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="32" cy="32" r="32" fill="url(#fb)" />
                                    <circle cx="14" cy="20" r="4" fill="white" opacity="0.9"/>
                                    <circle cx="14" cy="32" r="4" fill="white" opacity="0.9"/>
                                    <circle cx="14" cy="44" r="4" fill="white" opacity="0.9"/>
                                    <circle cx="32" cy="14" r="4" fill="url(#fa)"/>
                                    <circle cx="32" cy="26" r="4" fill="url(#fa)"/>
                                    <circle cx="32" cy="38" r="4" fill="url(#fa)"/>
                                    <circle cx="32" cy="50" r="4" fill="url(#fa)"/>
                                    <circle cx="50" cy="24" r="4" fill="white" opacity="0.9"/>
                                    <circle cx="50" cy="40" r="4" fill="white" opacity="0.9"/>
                                    <line x1="18" y1="20" x2="28" y2="14" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="18" y1="20" x2="28" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="18" y1="32" x2="28" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="18" y1="32" x2="28" y2="38" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="18" y1="44" x2="28" y2="38" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="18" y1="44" x2="28" y2="50" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="14" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="26" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="26" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="38" x2="46" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="38" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                    <line x1="36" y1="50" x2="46" y2="40" stroke="white" strokeWidth="1.2" opacity="0.4"/>
                                </svg>
                                <span style={{ fontFamily: 'var(--font-serif)', color: 'white', fontWeight: 700 }}>IATech Research</span>
                            </div>
                            {hc('footer_description') && (
                                <p style={{ fontSize: '.85rem', lineHeight: 1.7, maxWidth: 260, color: 'rgba(255,255,255,.55)' }}>
                                    {hc('footer_description')}
                                </p>
                            )}
                        </div>
                        <div>
                            <h4 className="footer__title">Accès rapide</h4>
                            <ul className="footer__links">
                                <li><Link to="/">Accueil</Link></li>
                                <li><Link to="/publications">Publications</Link></li>
                                <li><Link to="/researchers">Chercheurs</Link></li>
                                <li><Link to="/search">Recherche</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="footer__title">Compte</h4>
                            <ul className="footer__links">
                                <li><Link to="/login">Connexion</Link></li>
                                <li><Link to="/register">Inscription</Link></li>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="footer__title">À propos</h4>
                            <ul className="footer__links">
                                <li><a href="#">Notre mission</a></li>
                                <li><a href="#">Politique de confidentialité</a></li>
                                <li><a href="#">Conditions d'utilisation</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer__bottom">
                        <span>© {new Date().getFullYear()} IATech Research. Tous droits réservés.</span>
                        <span>Plateforme de publication scientifique</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}