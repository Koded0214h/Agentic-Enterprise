import assert from 'node:assert/strict'
import test from 'node:test'
import { agents } from '../src/api/agents.js'
import { ops } from '../src/api/ops.js'
import { projects } from '../src/api/projects.js'

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

function capture(responseBody = {}) {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return { ok: true, status: 200, json: async () => responseBody }
  }
  return calls
}

test('pause and resume use the Project status supported by the backend', async () => {
  const calls = capture({ id: 'p1' })
  await projects.pauseAutomation('p1')
  await projects.resumeAutomation('p1')
  assert.equal(calls[0].options.method, 'PATCH')
  assert.deepEqual(JSON.parse(calls[0].options.body), { status: 'PAUSED' })
  assert.deepEqual(JSON.parse(calls[1].options.body), { status: 'ACTIVE' })
})

test('manual intervention is persisted as project activity', async () => {
  const calls = capture({ id: 'activity-1' })
  await projects.intervene('p1', { action: 'REPLAN_PROJECT', reason: 'Targets changed' })
  assert.match(calls[0].url, /\/projects\/projects\/p1\/activity\/$/)
  const body = JSON.parse(calls[0].options.body)
  assert.equal(body.kind, 'operator.intervention')
  assert.equal(body.metadata.action, 'REPLAN_PROJECT')
})

test('approvals and queue recovery remain project-addressable', async () => {
  const calls = capture({ results: [] })
  await agents.pendingActions({ project_id: 'p1' })
  await ops.queue.retry('queue-1')
  assert.match(calls[0].url, /pending-actions\/\?project_id=p1$/)
  assert.match(calls[1].url, /ops\/queue\/queue-1\/retry\/$/)
  assert.equal(calls[1].options.method, 'POST')
})
