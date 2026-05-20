import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_BASE_URL } from '../api/client'

window.Pusher = Pusher

// Reverb WebSocket connection details (separate from the HTTP API port)
const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST   ?? '192.168.101.2'
const REVERB_PORT   = import.meta.env.VITE_REVERB_PORT   ?? 8080
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'http'
const REVERB_KEY    = import.meta.env.VITE_REVERB_APP_KEY ?? 'bmr3rrg1fb2vysugfufv'

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
  return new Echo({
    broadcaster: 'reverb',
    key: REVERB_KEY,

    // WebSocket connection — Reverb runs on its own port (8080)
    wsHost:   REVERB_HOST,
    wsPort:   Number(REVERB_PORT),
    wssPort:  Number(REVERB_PORT),
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws'],

    // Auth endpoint — MUST use the same origin as all other API calls
    // so the browser doesn't trigger a cross-origin CORS preflight to a different host
    authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
    auth: {
      headers: {
        'X-SECRET-KEY': secretKey,
      },
    },
  })
}
