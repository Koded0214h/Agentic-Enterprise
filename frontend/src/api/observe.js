import { api } from './client'

export const observe = {
  tasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/intelligence/tasks/${qs ? '?' + qs : ''}`)
      .then(d => Array.isArray(d) ? { results: d, count: d.length } : d)
  },
  conversations: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/intelligence/conversations/${qs ? '?' + qs : ''}`)
      .then(d => Array.isArray(d) ? { results: d, count: d.length } : d)
  },
}
