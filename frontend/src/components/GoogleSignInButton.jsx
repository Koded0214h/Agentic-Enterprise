/**
 * Google Sign-In button using Google Identity Services (GIS).
 *
 * Loads the GIS script lazily, renders the official Google button, and on
 * credential receipt POSTs the id_token to /auth/sso/google/.
 *
 * Requires VITE_GOOGLE_CLIENT_ID in env. If unset, the button is hidden.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client'

let _scriptPromise = null
function loadGoogleScript() {
  if (_scriptPromise) return _scriptPromise
  _scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = GSI_SCRIPT
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  return _scriptPromise
}

export default function GoogleSignInButton({
  text = 'signin_with',
  theme = 'filled_black',
  size = 'large',
}) {
  const buttonRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId || !buttonRef.current) return
    let mounted = true

    loadGoogleScript().then(() => {
      if (!mounted || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) return
          setBusy(true)
          setError('')
          try {
            const data = await auth.googleSSO(credential)
            await loginWithTokens({ access: data.access, refresh: data.refresh })
            navigate('/app')
          } catch (e) {
            setError(e?.data?.error || e?.message || 'Sign-in failed')
          } finally {
            setBusy(false)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme,
        size,
        text,
        shape: 'pill',
        width: 320,
      })
    }).catch(() => setError('Could not load Google Sign-In.'))

    return () => { mounted = false }
  }, [clientId, theme, size, text, loginWithTokens, navigate])

  if (!clientId) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div ref={buttonRef} style={{ opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }} />
      {error && (
        <span style={{ color: 'var(--red, #ff6b6b)', fontSize: 12 }}>{error}</span>
      )}
    </div>
  )
}
