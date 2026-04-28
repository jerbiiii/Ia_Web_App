import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

// ── JWT helpers ────────────────────────────────────────────────────────────

/**
 * Decode the JWT payload (client-side only, no signature check).
 * Returns the expiry in ms, or null if the token can't be parsed.
 */
function getTokenExpiryMs(token) {
    try {
        const base64 = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    if (!token) return true;
    const expiry = getTokenExpiryMs(token);
    if (expiry === null) return false; // can't determine → don't force logout
    return Date.now() > expiry;
}

// ── Intercepteur request : JWT ─────────────────────────────────────────────

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
}, error => Promise.reject(error));

// ── Intercepteur response : gestion expiration JWT ─────────────────────────

let isRedirecting = false;

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && !isRedirecting) {
            const url = error.config?.url || '';
            const isLoginRoute = url.includes('/auth/signin');
            const isPublicRoute = url.includes('/public/');

            // On ne redirige vers login QUE si ce n'est pas une route publique
            if (!isLoginRoute && !isPublicRoute) {
                const token = localStorage.getItem('token');

                if (!token || isTokenExpired(token)) {
                    isRedirecting = true;
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('auth:logout'));
                    setTimeout(() => { isRedirecting = false; }, 3000);
                }
            }
        }
        return Promise.reject(error);
    }
);

// ── Utilitaire lecture cookie ──────────────────────────────────────────────

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

export default api;

// Kept for backward-compatibility — no longer needed for the interceptor logic
export function setLastLoginTime() { }