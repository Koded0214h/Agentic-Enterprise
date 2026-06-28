import { api } from './client'

function qs(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  const query = new URLSearchParams(filtered).toString()
  return query ? `?${query}` : ''
}

export const agents = {
  list: () => api.get('/registry/agents/'),
  create: (data) => api.post('/registry/agents/', data),
  get: (id) => api.get(`/registry/agents/${id}/`),
  blueprints: () => api.get('/registry/blueprints/'),
  pendingActions: (params = {}) => api.get(`/intelligence/pending-actions/${qs(params)}`).then(d => Array.isArray(d) ? { results: d, count: d.length } : d),
  approve: (id, data) => api.post(`/intelligence/pending-actions/${id}/approve/`, data || { decision: 'APPROVED' }),
  reject: (id, data) => api.post(`/intelligence/pending-actions/${id}/approve/`, data || { decision: 'DENIED' }),
  escalations: () => api.get('/intelligence/escalations/'),
  escalate: (action_id, reason) => api.post('/intelligence/escalations/', { action_id, reason }),
}
