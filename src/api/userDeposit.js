import { buildClient, parseError } from './client'

/** GET /api/deposit/qrcode — returns wallet address + QR image */
export async function generateDepositQR(secretKey) {
  const client = buildClient('', secretKey)
  try {
    const res = await client.get('/api/deposit/qrcode')
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/** POST /api/deposit/get-reference — body: { network, user_account_id, user_name } */
export async function generateReference(secretKey, payload) {
  const client = buildClient('', secretKey)
  try {
    const res = await client.post('/api/deposit/get-reference', payload)
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}

/** POST /api/deposit/submit — body: { reference, tx_hash, user_account_id, amount, user_name } */
export async function submitUserDeposit(secretKey, payload) {
  const client = buildClient('', secretKey)
  try {
    const res = await client.post('/api/deposit/submit', payload)
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    return { ok: false, ...parseError(err) }
  }
}
