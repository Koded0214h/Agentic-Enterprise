import { api } from './client'

export const auth = {
  login: (email, password) =>
    api.post('/token/', { username: email, password }),

  signup: (data) => api.post('/gateway/auth/register/', data),

  googleSSO: (id_token) => api.post('/gateway/auth/sso/google/', { id_token }),

  githubSSO: (code, redirect_uri) =>
    api.post('/gateway/auth/sso/github/', { code, redirect_uri }),

  me: () => api.get('/gateway/auth/me/'),
}
