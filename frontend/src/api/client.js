const DEFAULT_API_URL = 'http://127.0.0.1:8000/api'
const BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

function getAccess() {
  return localStorage.getItem('aos_access')
}
function getRefresh() {
  return localStorage.getItem('aos_refresh')
}
function setTokens({ access, refresh }) {
  localStorage.setItem('aos_access', access)
  if (refresh) localStorage.setItem('aos_refresh', refresh)
}
function clearTokens() {
  localStorage.removeItem('aos_access')
  localStorage.removeItem('aos_refresh')
}

async function refreshAccess() {
  const refresh = getRefresh()
  if (!refresh) throw new Error('No refresh token')
  const res = await fetch(`${BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('Session expired')
  }
  const data = await res.json()
  setTokens(data)
  return data.access
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const access = getAccess()
  if (access) headers['Authorization'] = `Bearer ${access}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && getRefresh()) {
    try {
      const newAccess = await refreshAccess()
      headers['Authorization'] = `Bearer ${newAccess}`
      res = await fetch(`${BASE}${path}`, { ...options, headers })
    } catch {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status, data: err })
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
  setTokens,
  clearTokens,
  getAccess,
}
