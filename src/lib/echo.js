import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_BASE_URL } from '../api/client'

window.Pusher = Pusher

// Reverb WebSocket connection details
// HOST  = public domain (never 0.0.0.0 — that's the server bind address)
// PORT  = 443 when Nginx terminates SSL and proxies /app → Reverb internally
const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST   ?? 'api.aipay247.com'
const REVERB_PORT   = Number(import.meta.env.VITE_REVERB_PORT   ?? 443)
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'https'
const REVERB_KEY    = import.meta.env.VITE_REVERB_APP_KEY ?? 'bmr3rrg1fb2vysugfufv'

console.log('[Echo] Config →', {
  host:   REVERB_HOST,
  port:   REVERB_PORT,
  scheme: REVERB_SCHEME,
  key:    REVERB_KEY,
  authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
})

/**
 * Create and return a Laravel Echo instance connected to Reverb.
 *
 * The authEndpoint uses the same base URL as all other API calls (API_BASE_URL)
 * so there is never a CORS mismatch.
 *
 * @param {string} secretKey  The X-SECRET-KEY used to authenticate private channels.
 * @returns {Echo}
 */
export function createEcho(secretKey) {
  const echo = new Echo({
    broadcaster: 'reverb',
    key: REVERB_KEY,

    // WebSocket connection — Reverb runs on port 8081
    wsHost:   REVERB_HOST,
    wsPort:   Number(REVERB_PORT),
    wssPort:  Number(REVERB_PORT),
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],

    // Auth endpoint — same origin as all other API calls
    authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        'X-SECRET-KEY': secretKey,
      },
    },
  })

  // ── Connection lifecycle logging ──────────────────────────────────────────
  const pusher = echo.connector?.pusher
  if (pusher) {
    pusher.connection.bind('connecting', () => {
      console.log('[Echo] 🔄 Connecting to Reverb…', `${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}`)
    })

    pusher.connection.bind('connected', () => {
      console.log('[Echo] ✅ Connected to Reverb!', {
        socketId: pusher.connection.socket_id,
        host: REVERB_HOST,
        port: REVERB_PORT,
      })
    })

    pusher.connection.bind('disconnected', () => {
      console.warn('[Echo] ⚠️ Disconnected from Reverb')
    })

    pusher.connection.bind('failed', () => {
      console.error('[Echo] ❌ Connection FAILED — check host/port/TLS config')
    })

    pusher.connection.bind('error', (err) => {
      console.error('[Echo] ❌ Connection error', err)
    })

    pusher.connection.bind('state_change', ({ previous, current }) => {
      console.log(`[Echo] State: ${previous} → ${current}`)
    })
  }

  return echo
}
