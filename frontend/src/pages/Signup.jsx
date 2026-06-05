import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../api/auth'
import { api } from '../api/client'
import GoogleSignInButton from '../components/GoogleSignInButton'
import './Auth.css'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', org: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()

  function set(k) {
    return e => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await auth.signup({
        username: form.email,
        email: form.email,
        password: form.password,
        first_name: form.name.split(' ')[0] || form.name,
        last_name: form.name.split(' ').slice(1).join(' ') || '',
        organization: form.org,
      })
      if (res.access) {
        await loginWithTokens(res)
      } else {
        const tokens = await auth.login(form.email, form.password)
        api.setTokens(tokens)
      }
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const data = err.data || {}
      const msg = data.email?.[0] || data.username?.[0] || data.password?.[0] || err.message || 'Signup failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />

      <div className="auth-card card animate-fadeup">
        <Link to="/" className="auth-logo">AOS</Link>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Build your first autonomous company</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Ada Lovelace"
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="org">Company / project name</label>
            <input
              id="org"
              type="text"
              value={form.org}
              onChange={set('org')}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Continue →'}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="auth-sso">
          <GoogleSignInButton text="signup_with" />
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
