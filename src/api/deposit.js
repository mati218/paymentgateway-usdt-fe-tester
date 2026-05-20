import { buildClient, parseError } from './client'

/**
 * Step 2 — GET /api/deposit/qrcode
 * Returns wallet address + QR code image URL.
 */
export async function getQrCode(baseURL, secretKey) {
  const client = buildClient(baseURL, secretKey)
  try {
    const res = await client.get('/api/deposit/qrcode')
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/**
 * Step 2b — GET /api/wallet-info  (fallback / extra info)
 */
export async function getWalletInfo(baseURL, secretKey) {
  const client = buildClient(baseURL, secretKey)
  try {
    const res = await client.get('/api/wallet-info')
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/**
 * Step 3 — POST /api/deposit/get-reference
 * Body: { network, name }
 */
export async function getReference(baseURL, secretKey, payload) {
  const client = buildClient(baseURL, secretKey)
  try {
    const res = await client.post('/api/deposit/get-reference', payload)
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/**
 * Step 4 — POST /api/deposit/submit
 * Body: { reference, tx_hash, from_address }
 */
export async function submitDeposit(baseURL, secretKey, payload) {
  const client = buildClient(baseURL, secretKey)
  try {
    const res = await client.post('/api/deposit/submit', payload)
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/**
 * Step 5 — GET /api/deposit/status/:ref
 */
export async function checkDepositStatus(baseURL, secretKey, reference) {
  const client = buildClient(baseURL, secretKey)
  try {
    const res = await client.get(`/api/deposit/status/${reference}`)
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}
