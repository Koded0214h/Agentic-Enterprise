import { api } from './client'

export const agents = {
  list: () => api.get('/registry/agents/'),
  create: (data) => api.post('/registry/agents/', data),
  get: (id) => api.get(`/registry/agents/${id}/`),
  blueprints: () => api.get('/registry/blueprints/'),
  pendingActions: () => api.get('/intelligence/pending-actions/').then(d => Array.isArray(d) ? { results: d, count: d.length } : d),
  approve: (id) => api.post(`/intelligence/pending-actions/${id}/approve/`),
  reject: (id) => api.post(`/intelligence/pending-actions/${id}/reject/`),
}
