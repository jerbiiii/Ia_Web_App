import api from './api.js';

class HomeContentService {
    getAll() {
        return api.get('/moderator/home-content').then(res => res.data);
    }

    getPublic() {
        return api.get('/public/home-content').then(res => res.data);
    }

    create(data) {
        return api.post('/moderator/home-content', data).then(res => res.data);
    }

    update(id, data) {
        return api.put(`/moderator/home-content/${id}`, data).then(res => res.data);
    }

    updateValeur(id, valeur) {
        return api.patch(`/moderator/home-content/${id}/valeur`, { valeur }).then(res => res.data);
    }

    delete(id) {
        return api.delete(`/moderator/home-content/${id}`).then(res => res.data);
    }
}

export default new HomeContentService();