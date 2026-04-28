import api from './api.js';

class PublicationService {
    // ── Endpoints PUBLICS (sans authentification) ──
    getAllPublic() {
        return api.get('/public/publications').then(res => res.data);
    }

    getByIdPublic(id) {
        return api.get(`/public/publications/${id}`).then(res => res.data);
    }

    searchPublic(params) {
        return api.get('/public/publications/search', { params }).then(res => res.data);
    }

    // ── Endpoints PRIVÉS (authentification requise) ──
    getAll() {
        return api.get('/publications').then(res => res.data);
    }

    getById(id) {
        return api.get(`/publications/${id}`).then(res => res.data);
    }

    create(formData) {
        return api.post('/publications', formData).then(res => res.data);
    }

    update(id, formData) {
        return api.put(`/publications/${id}`, formData).then(res => res.data);
    }

    delete(id) {
        return api.delete(`/publications/${id}`).then(res => res.data);
    }

    downloadFile(id) {
        return api.get(`/public/publications/${id}/download`, {
            responseType: 'blob'
        }).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `publication_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }

    getByChercheurId(chercheurId) {
        return api.get('/publications/search', { params: { chercheurId } }).then(res => res.data);
    }

    search(params) {
        return api.get('/publications/search', { params }).then(res => res.data);
    }
}

export default new PublicationService();