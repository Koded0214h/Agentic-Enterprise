import { api } from './client'

export const agents = {
  list: () => api.get('/registry/agents/'),
  create: (data) => api.post('/registry/agents/', data),
  get: (id) => api.get(`/registry/agents/${id}/`),
  blueprints: () => api.get('/registry/blueprints/'),
  pendingActions: () => api.get('/intelligence/pending-actions/').then(d => Array.isArray(d) ? { results: d, count: d.length } : d),
  approve: (id, data) => api.post(`/intelligence/pending-actions/${id}/approve/`, data || { decision: 'APPROVED' }),
  reject: (id, data) => api.post(`/intelligence/pending-actions/${id}/approve/`, data || { decision: 'DENIED' }),
  escalations: () => api.get('/intelligence/escalations/'),
  escalate: (action_id, reason) => api.post('/intelligence/escalations/', { action_id, reason }),
}
