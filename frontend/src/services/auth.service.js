import axios from './api';

const API_URL = '/auth/';

class AuthService {
    login(email, password) {
        return axios
            .post(API_URL + 'signin', { email, password })
            .then(response => {
                if (response.data.token) {
                    // Normaliser : le backend envoie role:"ADMIN", on stocke roles:["ROLE_ADMIN"]
                    const userData = {
                        ...response.data,
                        roles: ['ROLE_' + response.data.role]
                    };
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('token', response.data.token);
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    register(nom, prenom, email, password) {
        return axios.post(API_URL + 'signup', { nom, prenom, email, password });
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    }
}

export default new AuthService();