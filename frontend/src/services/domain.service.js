import api from './api.js';

class DomainService {
    // ── Endpoint PUBLIC ──
    getAllPublic() {
        return api.get('/public/domains').then(res => res.data);
    }

    // ── Endpoints PRIVÉS ──
    getAll() {
        return api.get('/domains').then(res => res.data);
    }

    getRoots() {
        return api.get('/domains/roots').then(res => res.data);
    }

    getById(id) {
        return api.get(`/domains/${id}`).then(res => res.data);
    }

    create(data) {
        return api.post('/domains', data).then(res => res.data);
    }

    update(id, data) {
        return api.put(`/domains/${id}`, data).then(res => res.data);
    }

    delete(id) {
        return api.delete(`/domains/${id}`).then(res => res.data);
    }

    search(keyword) {
        return api.get('/domains/search', { params: { keyword } }).then(res => res.data);
    }
}

export default new DomainService();