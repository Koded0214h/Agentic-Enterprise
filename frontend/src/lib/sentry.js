/**
 * Sentry browser error tracking. Loads the CDN bundle only when VITE_SENTRY_DSN is set.
 */

let initialized = false

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || initialized) return
  initialized = true

  const script = document.createElement('script')
  script.src = 'https://browser.sentry-cdn.com/8.55.0/bundle.tracing.replay.min.js'
  script.crossOrigin = 'anonymous'
  script.onload = () => {
    if (typeof window.Sentry === 'undefined') return
    window.Sentry.init({
      dsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
      integrations: [
        window.Sentry.browserTracingIntegration(),
        window.Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
    })
  }
  document.head.appendChild(script)
}

export function captureException(error, context = {}) {
  if (typeof window.Sentry !== 'undefined') {
    window.Sentry.captureException(error, { extra: context })
  }
}
