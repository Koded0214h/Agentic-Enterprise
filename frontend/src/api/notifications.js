import { api } from './client'

export const notifications = {
  list: () => api.get('/v1/notifications/').then(d => d.results || d || []),
  unreadCount: () => api.get('/v1/notifications/unread_count/'),
  markRead: (id) => api.post(`/v1/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/v1/notifications/mark_all_read/'),
}
