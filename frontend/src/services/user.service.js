import api from './api.js';

class UserService {
    getAll() {
        return api.get('/users').then(res => res.data);
    }

    getById(id) {
        return api.get(`/users/${id}`).then(res => res.data);
    }

    create(userData) {
        return api.post('/users', userData).then(res => res.data);
    }

    updateRole(id, role) {
        return api.put(`/users/${id}/role`, { role }).then(res => res.data);
    }

    delete(id) {
        return api.delete(`/users/${id}`).then(res => res.data);
    }
}

export default new UserService();