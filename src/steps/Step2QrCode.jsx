import React from 'react'
import toast from 'react-hot-toast'
import { getQrCode } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'
import CopyRow from '../components/CopyRow'

export default function Step2QrCode({ store }) {
  const {
    baseURL, secretKey,
    qrResult, setQrResult,
    loadingQr, setLoadingQr,
    goToStep,
  } = store

  async function fetchQr() {
    setLoadingQr(true)
    const result = await getQrCode(baseURL, secretKey)
    setQrResult(result)
    setLoadingQr(false)
    if (result.ok) {
      toast.success('QR code loaded successfully')
    } else {
      toast.error(`Error ${result.status}: ${result.data?.message || 'Failed to fetch QR code'}`)
    }
  }

  // Extract wallet address and QR URL from various response shapes
  const walletAddress = qrResult?.data?.wallet_address
    || qrResult?.data?.data?.wallet_address
    || qrResult?.data?.address
    || null

  const qrUrl = qrResult?.data?.qr_code
    || qrResult?.data?.data?.qr_code
    || qrResult?.data?.qr_code_url
    || null

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'rgba(99,102,241,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>📷</div>
        <div>
          <h2>Step 1 — Get QR Code</h2>
          <p>Fetch the deposit wallet address and QR code image.</p>
        </div>
      </div>

      {/* Request preview */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Request</label>
        <div className="code-block" style={{ maxHeight: 80 }}>
{`GET ${baseURL}/api/deposit/qrcode
X-SECRET-KEY: ${secretKey ? secretKey.slice(0, 10) + '••••' : '<not set>'}`}
        </div>
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={fetchQr}
        disabled={loadingQr}
      >
        {loadingQr ? <><span className="spinner" /> Fetching…</> : '🔍 Fetch QR Code'}
      </button>

      {/* QR display */}
      {qrResult?.ok && (
        <>
          <div className="divider" />
          <div className="qr-container">
            {qrUrl ? (
              <img src={qrUrl} alt="Deposit QR Code" />
            ) : (
              <div className="qr-placeholder">No QR image in response</div>
            )}
            {walletAddress && (
              <div style={{ width: '100%' }}>
                <label>Wallet Address (TRC20)</label>
                <CopyRow value={walletAddress} label="Wallet address" />
              </div>
            )}
            <div className="alert alert-warning" style={{ width: '100%' }}>
              <span>⚠️</span>
              <span>Send <strong>USDT TRC20 only</strong> to this address. Other tokens will be lost.</span>
            </div>
          </div>
        </>
      )}

      <ResponsePanel result={qrResult} title="GET /api/deposit/qrcode" />

      {/* Navigation */}
      <div className="flex gap-3" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={() => goToStep(1)}>← Back</button>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => goToStep(3)}
          disabled={!qrResult?.ok}
        >
          Continue to Reference →
        </button>
      </div>
    </div>
  )
}
