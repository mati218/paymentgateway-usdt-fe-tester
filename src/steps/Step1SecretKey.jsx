import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function Step1SecretKey({ store }) {
  const { baseURL, setBaseURL, secretKey, setSecretKey, goToStep } = store
  const [showKey, setShowKey] = useState(false)

  function handleContinue(e) {
    e.preventDefault()
    if (!baseURL.trim()) {
      toast.error('Base URL is required')
      return
    }
    if (!secretKey.trim()) {
      toast.error('Secret key (X-SECRET-KEY) is required')
      return
    }
    toast.success('Credentials saved — proceeding to QR Code')
    goToStep(2)
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'rgba(99,102,241,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>🔑</div>
        <div>
          <h2>Step 1 — Authentication</h2>
          <p>Enter your API base URL and secret key to begin.</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <span>ℹ️</span>
        <span>
          Your <strong>X-SECRET-KEY</strong> is sent as a request header on every API call.
          You can obtain it by logging in via <code style={{ fontFamily: 'monospace' }}>POST /api/auth/login</code>.
        </span>
      </div>

      <form onSubmit={handleContinue} className="flex flex-col gap-4">
        {/* Base URL */}
        {/* <div>
          <label htmlFor="baseURL">API Base URL</label>
          <input
            id="baseURL"
            type="url"
            placeholder="http://localhost:8000"
            value={baseURL}
            onChange={e => setBaseURL(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-muted mt-1">
            The root URL of your USDT Payment Gateway backend.
          </p>
        </div> */}

        {/* Secret Key */}
        <div>
          <label htmlFor="secretKey">X-SECRET-KEY</label>
          <div style={{ position: 'relative' }}>
            <input
              id="secretKey"
              type={showKey ? 'text' : 'password'}
              placeholder="Paste your secret API key here…"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              autoComplete="off"
              style={{ paddingRight: '5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '.78rem', fontWeight: 600,
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-muted mt-1">
            This key is stored only in memory and never persisted.
          </p>
        </div>

        {/* Preview */}
        {secretKey && (
          <div className="code-block" style={{ maxHeight: 60, fontSize: '.75rem' }}>
            {`X-SECRET-KEY: ${showKey ? secretKey : secretKey.slice(0, 8) + '••••••••••••'}`}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '.5rem' }}>
          Continue to QR Code →
        </button>
      </form>
    </div>
  )
}
