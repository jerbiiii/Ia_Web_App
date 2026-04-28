import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setLastLoginTime } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const isAdmin = user?.role === 'ADMIN';
    const isModerator = user?.role === 'MODERATEUR' || user?.role === 'ADMIN';
    const isAuthenticated = !!user;

    const login = async (email, password) => {

        const response = await api.post('/auth/signin', { email, password });
        const userData = response.data;

        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));

        setLastLoginTime(); // no-op now but kept for compat
        setUser(userData);
        return userData;
    };

    const register = async (nom, prenom, email, password) => {
        const response = await api.post('/auth/signup', { nom, prenom, email, password });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        const handleForceLogout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setShouldRedirect(true);
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    // Sync entre onglets
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'user') {
                try {
                    setUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch {
                    setUser(null);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated, isAdmin, isModerator,
            login, logout, register,
            shouldRedirect, setShouldRedirect,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const RedirectGuard = () => {
    const { shouldRedirect, setShouldRedirect } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (shouldRedirect) {
            setShouldRedirect(false);
            navigate('/login', { replace: true });
        }
    }, [shouldRedirect]);

    return null;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

export { AuthContext };
export default AuthContext;