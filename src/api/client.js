import axios from 'axios'

// Single source of truth for the API base URL.
// Change this one line if the backend moves.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

/**
 * Build an axios instance using the secret key stored in the flow context.
 */
export function buildClient(baseURL, secretKey) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(secretKey ? { 'X-SECRET-KEY': secretKey } : {}),
    },
    timeout: 15000,
  })
}

/**
 * Normalise an axios error into a plain object for display.
 */
export function parseError(err) {
  if (err.response) {
    return {
      status: err.response.status,
      data: err.response.data,
    }
  }
  if (err.request) {
    return { status: 0, data: { message: 'No response from server. Check the base URL and CORS.' } }
  }
  return { status: 0, data: { message: err.message } }
}
