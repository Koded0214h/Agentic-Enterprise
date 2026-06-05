import { api } from './client'

function qs(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString()
  return query ? `?${query}` : ''
}

export const marketing = {
  overview: (params = {}) => api.get(`/marketing/overview/${qs(params)}`),
  campaigns: {
    list: (params = {}) => api.get(`/marketing/campaigns/${qs(params)}`),
    create: (data) => api.post('/marketing/campaigns/', data),
    publish: (id) => api.post(`/marketing/campaigns/${id}/publish/`, {}),
    ingestAnalytics: (id, data = {}) => api.post(`/marketing/campaigns/${id}/ingest_analytics/`, data),
    refreshFeedback: (id) => api.post(`/marketing/campaigns/${id}/refresh_feedback/`, {}),
  },
  calendar: {
    list: (params = {}) => api.get(`/marketing/calendar/${qs(params)}`),
    create: (data) => api.post('/marketing/calendar/', data),
    publish: (id) => api.post(`/marketing/calendar/${id}/publish/`, {}),
    retry: (id) => api.post(`/marketing/calendar/${id}/retry/`, {}),
  },
  metrics: {
    list: (params = {}) => api.get(`/marketing/metrics/${qs(params)}`),
  },
}
