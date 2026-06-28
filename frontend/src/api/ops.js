import { api } from './client'

function qs(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  const query = new URLSearchParams(filtered).toString()
  return query ? `?${query}` : ''
}

export const ops = {
  overview: (params = {}) => {
    return api.get(`/ops/overview/${qs(params)}`)
  },
  connectors: () => api.get('/ops/connectors/'),
  accounts: {
    list: (params = {}) => api.get(`/ops/accounts/${qs(params)}`),
    create: (data) => api.post('/ops/accounts/', data),
  },
  leads: {
    list: (params = {}) => api.get(`/ops/leads/${qs(params)}`),
    create: (data) => api.post('/ops/leads/', data),
    convert: (id, data) => api.post(`/ops/leads/${id}/convert/`, data),
    sync: (id, data) => api.post(`/ops/leads/${id}/sync/`, data),
  },
  opportunities: {
    list: (params = {}) => api.get(`/ops/opportunities/${qs(params)}`),
    create: (data) => api.post('/ops/opportunities/', data),
    sync: (id, data) => api.post(`/ops/opportunities/${id}/sync/`, data),
  },
  tickets: {
    list: (params = {}) => api.get(`/ops/tickets/${qs(params)}`),
    create: (data) => api.post('/ops/tickets/', data),
    resolve: (id, data) => api.post(`/ops/tickets/${id}/resolve/`, data),
    sync: (id, data) => api.post(`/ops/tickets/${id}/sync/`, data),
  },
  touchpoints: {
    list: (params = {}) => api.get(`/ops/touchpoints/${qs(params)}`),
    create: (data) => api.post('/ops/touchpoints/', data),
  },
  queue: {
    list: (params = {}) => api.get(`/ops/queue/${qs(params)}`),
    process: (limit = 25, params = {}) => api.post('/ops/queue/process/', { limit, ...params }),
    retry: (id) => api.post(`/ops/queue/${id}/retry/`),
  },
}
