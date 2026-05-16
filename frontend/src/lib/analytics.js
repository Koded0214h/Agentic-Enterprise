/**
 * Client-side product analytics (PostHog, Mixpanel, or backend relay).
 * No SDK dependencies — uses fetch so CI/Vercel builds stay lean.
 */

const DISTINCT_ID_KEY = 'aos_distinct_id'

let provider = null

function getDistinctId() {
  let id = localStorage.getItem(DISTINCT_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DISTINCT_ID_KEY, id)
  }
  return id
}

function apiBase() {
  const base = import.meta.env.VITE_API_URL || '/api'
  return base.replace(/\/$/, '')
}

function posthogCapture(event, distinctId, properties) {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  const host = (import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com').replace(/\/$/, '')
  fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties: { ...properties, $lib: 'aos-frontend' },
    }),
  }).catch(() => {})
}

function mixpanelTrack(event, distinctId, properties) {
  const token = import.meta.env.VITE_MIXPANEL_TOKEN
  if (!token) return
  const payload = {
    event,
    properties: { token, distinct_id: distinctId, ...properties },
  }
  const data = btoa(JSON.stringify(payload))
  fetch(`https://api.mixpanel.com/track?data=${encodeURIComponent(data)}`).catch(() => {})
}

function relayTrack(event, distinctId, properties) {
  fetch(`${apiBase()}/auth/analytics/track/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, distinct_id: distinctId, properties }),
  }).catch(() => {})
}

export function initAnalytics() {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    provider = 'posthog'
  } else if (import.meta.env.VITE_MIXPANEL_TOKEN) {
    provider = 'mixpanel'
  } else {
    provider = 'relay'
  }
}

export function trackEvent(event, properties = {}) {
  if (!provider) initAnalytics()
  const distinctId = getDistinctId()
  if (provider === 'posthog') posthogCapture(event, distinctId, properties)
  else if (provider === 'mixpanel') mixpanelTrack(event, distinctId, properties)
  else relayTrack(event, distinctId, properties)
}

export function identifyUser(distinctId, properties = {}) {
  if (!provider) initAnalytics()
  if (provider === 'posthog' && import.meta.env.VITE_POSTHOG_KEY) {
    const host = (import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com').replace(/\/$/, '')
    fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: import.meta.env.VITE_POSTHOG_KEY,
        event: '$identify',
        distinct_id: distinctId,
        properties: { $set: properties },
      }),
    }).catch(() => {})
  }
  localStorage.setItem(DISTINCT_ID_KEY, distinctId)
}
