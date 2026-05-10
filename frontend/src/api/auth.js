import { api } from './client'

export const auth = {
  login: (email, password) =>
    fetch('/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw Object.assign(new Error(err.detail || 'Login failed'), { data: err })
      }
      return res.json()
    }),

  signup: (data) => api.post('/gateway/auth/register/', data),

  googleSSO: (id_token) => api.post('/gateway/auth/sso/google/', { id_token }),

  githubSSO: (code, redirect_uri) =>
    api.post('/gateway/auth/sso/github/', { code, redirect_uri }),

  me: () => api.get('/gateway/auth/me/'),
}
