import { api } from './client.js'

function qs(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  const query = new URLSearchParams(filtered).toString()
  return query ? `?${query}` : ''
}

export const projects = {
  list: (params = {}) => api.get(`/projects/projects/${qs(params)}`),
  create: (data) => api.post('/projects/projects/', data),
  get: (id) => api.get(`/projects/projects/${id}/`),
  overview: (id) => api.get(`/projects/projects/${id}/overview/`),
  update: (id, data) => api.patch(`/projects/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/projects/${id}/`),
  archive: (id) => api.post(`/projects/projects/${id}/archive/`, {}),
  pauseAutomation: (id) => api.patch(`/projects/projects/${id}/`, { status: 'PAUSED' }),
  resumeAutomation: (id) => api.patch(`/projects/projects/${id}/`, { status: 'ACTIVE' }),
  intervene: (id, data) => api.post(`/projects/projects/${id}/activity/`, {
    kind: 'operator.intervention',
    summary: data.action,
    body: data.reason,
    metadata: { action: data.action, source: 'command-center' },
  }),
  addMember: (id, data) => api.post(`/projects/projects/${id}/add_member/`, data),
  activity: (id, data) => api.post(`/projects/projects/${id}/activity/`, data),
  goals: {
    list: (params = {}) => api.get(`/projects/goals/${qs(params)}`),
    create: (data) => api.post('/projects/goals/', data),
    update: (id, data) => api.patch(`/projects/goals/${id}/`, data),
  },
  artifacts: {
    list: (params = {}) => api.get(`/projects/artifacts/${qs(params)}`),
    create: (data) => api.post('/projects/artifacts/', data),
  },
  members: (params = {}) => api.get(`/projects/members/${qs(params)}`),
  activities: (params = {}) => api.get(`/projects/activities/${qs(params)}`),
  timeline: (id) => api.get(`/projects/projects/${id}/timeline/`),
  readiness: (id) => api.get(`/projects/projects/${id}/readiness/`),
  runs: (id) => api.get(`/projects/projects/${id}/runs/`),
}
