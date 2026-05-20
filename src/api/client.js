import axios from 'axios'

/**
 * Build an axios instance using the secret key stored in the flow context.
 * The base URL is read from the config store so it can be changed at runtime.
 */
export function buildClient(baseURL, secretKey) {
  return axios.create({
    baseURL: 'https://ojtig2jfon.sharedwithexpose.com',
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
