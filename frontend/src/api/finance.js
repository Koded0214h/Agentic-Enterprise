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
  history: (days = 30, page = 1) => api.get(`/billing/usage/history/?days=${days}&page=${page}`),
  workflowCosts: () => api.get('/billing/workflows/').then(d => d.workflows || []),
  alerts: () => api.get('/billing/alerts/').then(d => d.alerts || []),
}
