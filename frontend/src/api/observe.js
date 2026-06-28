import { api } from './client'

const BASE = (import.meta.env.VITE_API_URL || 'https://aos-api.viewdns.net/api').replace(/\/+$/, '')

function qs(params = {}) {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  const query = new URLSearchParams(filtered).toString()
  return query ? `?${query}` : ''
}

export const observe = {
  tasks: (params = {}) => {
    return api.get(`/intelligence/tasks/${qs(params)}`)
      .then(d => Array.isArray(d) ? { results: d, count: d.length } : d)
  },
  conversations: (params = {}) => {
    return api.get(`/intelligence/conversations/${qs(params)}`)
      .then(d => Array.isArray(d) ? { results: d, count: d.length } : d)
  },
  executionReplay: (executionId) =>
    api.get(`/swarm/executions/${executionId}/replay/`),

  recentRuns: (params = 'template') => {
    const queryParams = typeof params === 'string' ? { type: params } : params
    return api.get(`/swarm/executions/${qs(queryParams)}`)
  },
  failureAnalytics: () => api.get('/intelligence/analytics/failures/'),
  retryAnalytics: () => api.get('/intelligence/analytics/retries/'),
  workflowGraph: () => api.get('/intelligence/analytics/workflow-graph/'),

  /**
   * Open an SSE stream for a native execution.
   * Returns an EventSource. Caller must call .close() when done.
   *
   * Usage:
   *   const es = observe.streamExecution(id, onEvent, onDone, onError)
   *   // cleanup: es.close()
   */
  streamExecution: (executionId, onEvent, onDone, onError) => {
    const token = localStorage.getItem('token') || ''
    // EventSource doesn't support Authorization headers — pass token as query param.
    // The Django view reads this via request.query_params['token'].
    const url = `${BASE}/swarm/executions/${executionId}/stream/?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'done') {
          onDone?.(data)
          es.close()
        } else if (data.type === 'ping' || data.type === 'connected') {
          // ignore keepalives
        } else {
          onEvent?.(data)
        }
      } catch { /* ignore malformed frames */ }
    }

    es.onerror = (err) => {
      onError?.(err)
      es.close()
    }

    return es
  },
}
