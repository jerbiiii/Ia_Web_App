import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const PrivateRoute = ({ children, roles }) => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. Pas connecté → login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Rôle insuffisant → accueil
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // 3. Accès autorisé
    return children;
};

export default PrivateRoute;