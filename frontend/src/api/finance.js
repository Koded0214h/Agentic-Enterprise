import { api } from './client'

export const finance = {
  usage: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/billing/usage/${qs ? '?' + qs : ''}`)
      .then(d => Array.isArray(d) ? d : (d.results || []))
  },
  budgets: () => api.get('/billing/budgets/')
    .then(d => Array.isArray(d) ? d : (d.results || [])),
  departments: () => api.get('/billing/departments/')
    .then(d => Array.isArray(d) ? d : (d.results || [])),
}
