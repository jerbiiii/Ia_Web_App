import api from './api';


const ActualiteService = {

    // ── Lecture (public) ──────────────────────────────────────────────────
    getAll: () =>
        api.get('/actualites'),

    getActives: () =>
        api.get('/public/actualites'),           // homepage : uniquement actif=true

    getById: (id) =>
        api.get(`/actualites/${id}`),

    // ── Écriture (modérateur / admin) ─────────────────────────────────────
    create: (data) =>
        api.post('/actualites', data),

    update: (id, data) =>
        api.put(`/actualites/${id}`, data),


    delete: (id) =>
        api.delete(`/actualites/${id}`),
};

export default ActualiteService;