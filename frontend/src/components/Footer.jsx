import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="footer__inner">
            <div className="footer__brand">
                <span>🔬 IA-Technology</span>
                <p>Plateforme de gestion des publications et travaux scientifiques</p>
            </div>
            <div className="footer__links">
                <h4>Navigation</h4>
                <Link to="/">Accueil</Link>
                <Link to="/publications">Publications</Link>
                <Link to="/researchers">Chercheurs</Link>
                <Link to="/search">Recherche</Link>
            </div>
            <div className="footer__links">
                <h4>Compte</h4>
                <Link to="/login">Connexion</Link>
                <Link to="/register">S'inscrire</Link>
            </div>
        </div>
        <div className="footer__bottom">
            © {new Date().getFullYear()} IA-Technology. Tous droits réservés.
        </div>
    </footer>
);

export default Footer;