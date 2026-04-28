import api from './api.js';

class AuditService {
    getAll() {
        return api.get('/admin/audit').then(res => res.data);
    }

    filter(params) {
        return api.get('/admin/audit/filter', { params }).then(res => res.data);
    }
}

export default new AuditService();