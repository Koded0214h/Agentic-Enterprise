import { useCallback, useState } from 'react'
import { agents } from '../api/agents'
import { ops } from '../api/ops'
import { projects } from '../api/projects'
import { swarm } from '../api/swarm'

export function useProjectControls(projectId, onRefresh) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const execute = useCallback(async (key, operation, successMessage) => {
    setBusy(key)
    setError('')
    setMessage('')
    try {
      const result = await operation()
      setMessage(successMessage)
      await onRefresh?.()
      return { ok: true, data: result }
    } catch (err) {
      setError(err?.data?.detail || err?.data?.error || err.message || 'The control action failed')
      return { ok: false, error: err }
    } finally {
      setBusy('')
    }
  }, [onRefresh])

  const setAutomationPaused = useCallback((paused) => execute(
    'automation',
    () => paused ? projects.pauseAutomation(projectId) : projects.resumeAutomation(projectId),
    paused ? 'Project automation paused safely.' : 'Project automation resumed.',
  ), [execute, projectId])

  const intervene = useCallback((payload, context = {}) => execute(
    'intervention',
    async () => {
      if (payload.action === 'STOP_CURRENT_RUNS') {
        const running = (context.runs || []).filter((run) => String(run.status).toLowerCase() === 'running')
        await Promise.all(running.map((run) => swarm.cancelRun(run.id)))
      } else if (payload.action === 'RECOVER_FAILED_QUEUE') {
        await Promise.all((context.failedQueue || []).map((item) => ops.queue.retry(item.id)))
      } else if (payload.action === 'ESCALATE_TO_OPERATOR') {
        await projects.pauseAutomation(projectId)
      }
      return projects.intervene(projectId, payload)
    },
    'Manual intervention completed and recorded in project activity.',
  ), [execute, projectId])

  const decideApproval = useCallback((actionId, decision) => execute(
    `approval-${actionId}`,
    () => decision === 'APPROVED'
      ? agents.approve(actionId, { decision })
      : agents.reject(actionId, { decision }),
    `Action ${decision === 'APPROVED' ? 'approved' : 'rejected'}.`,
  ), [execute])

  const retryQueueItem = useCallback((itemId) => execute(
    `queue-${itemId}`,
    () => ops.queue.retry(itemId),
    'Queue item scheduled for retry.',
  ), [execute])

  const recoverQueue = useCallback((items) => execute(
    'recovery',
    () => Promise.all(items.map((item) => ops.queue.retry(item.id))),
    `${items.length} failed queue item${items.length === 1 ? '' : 's'} scheduled for retry.`,
  ), [execute])

  return {
    busy,
    error,
    message,
    setAutomationPaused,
    intervene,
    decideApproval,
    retryQueueItem,
    recoverQueue,
  }
}
