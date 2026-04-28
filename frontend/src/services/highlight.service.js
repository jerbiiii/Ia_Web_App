import api from './api.js';

class HighlightService {
    // Public
    getActive() {
        return api.get('/public/highlights').then(res => res.data);
    }

    getByIdPublic(id) {
        return api.get(`/public/highlights/${id}`).then(res => res.data);
    }

    // Modérateur/Admin
    getAll() {
        return api.get('/moderator/highlights').then(res => res.data);
    }

    getById(id) {
        return api.get(`/moderator/highlights/${id}`).then(res => res.data);
    }

    create(data) {
        return api.post('/moderator/highlights', data).then(res => res.data);
    }

    update(id, data) {
        return api.put(`/moderator/highlights/${id}`, data).then(res => res.data);
    }

    delete(id) {
        return api.delete(`/moderator/highlights/${id}`).then(res => res.data);
    }
}

export default new HighlightService();