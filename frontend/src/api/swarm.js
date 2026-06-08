import { api } from './client'

export const swarm = {
  list:          (projectId) => projectId
    ? api.get(`/swarm/executions/?project_id=${projectId}`)
    : api.get(`/swarm/executions/`),
  getRun:        (runId)     => api.get(`/swarm/run/${runId}/`),
  pollRun:       (runId, from = 0) => api.get(`/swarm/run/${runId}/poll/?from=${from}`),
  cancelRun:     (runId)     => api.post(`/swarm/run/${runId}/cancel/`, {}),
}
