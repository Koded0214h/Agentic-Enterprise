import { api } from './client'

export const ops = {
  overview: () => api.get('/ops/overview/'),
  connectors: () => api.get('/ops/connectors/'),
  accounts: {
    list: () => api.get('/ops/accounts/'),
    create: (data) => api.post('/ops/accounts/', data),
  },
  leads: {
    list: () => api.get('/ops/leads/'),
    create: (data) => api.post('/ops/leads/', data),
    convert: (id, data) => api.post(`/ops/leads/${id}/convert/`, data),
    sync: (id, data) => api.post(`/ops/leads/${id}/sync/`, data),
  },
  opportunities: {
    list: () => api.get('/ops/opportunities/'),
    create: (data) => api.post('/ops/opportunities/', data),
    sync: (id, data) => api.post(`/ops/opportunities/${id}/sync/`, data),
  },
  tickets: {
    list: () => api.get('/ops/tickets/'),
    create: (data) => api.post('/ops/tickets/', data),
    resolve: (id, data) => api.post(`/ops/tickets/${id}/resolve/`, data),
    sync: (id, data) => api.post(`/ops/tickets/${id}/sync/`, data),
  },
  touchpoints: {
    list: () => api.get('/ops/touchpoints/'),
    create: (data) => api.post('/ops/touchpoints/', data),
  },
  queue: {
    list: () => api.get('/ops/queue/'),
    process: (limit = 25) => api.post('/ops/queue/process/', { limit }),
    retry: (id) => api.post(`/ops/queue/${id}/retry/`),
  },
}
