import React, { useState } from 'react'

export default function Step0Config({ user, onConnect }) {
  const [key, setKey]       = useState('')
  const [show, setShow]     = useState(false)
  const [error, setError]   = useState('')

  function handleConnect() {
    if (!key.trim()) { setError('API key is required'); return }
    setError('')
    onConnect(key.trim())
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '2.75rem', marginBottom: '.5rem', lineHeight: 1 }}>🔐</div>
        <h2 style={{ marginBottom: '.3rem' }}>Connect to Payment Gateway</h2>
        <p>Enter your API key to enable secure USDT deposits</p>
      </div>

      {/* User info chip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.75rem',
        background: 'var(--surface2)',
        borderRadius: 10,
        padding: '.65rem 1rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '.9rem', flexShrink: 0, color: '#fff',
        }}>
          {user.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{user.name}</div>
          <div style={{ fontSize: '.73rem', color: 'var(--muted)' }}>ID: {user.id}</div>
        </div>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--muted)',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      </div>

      {/* Key input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>X-SECRET-KEY</label>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            placeholder="Enter your secret API key…"
            value={key}
            onChange={e => { setKey(e.target.value); if (error) setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
            style={{
              paddingRight: '3.5rem',
              fontFamily: show ? 'inherit' : "'Fira Code', monospace",
              letterSpacing: show ? 'normal' : '.1em',
              ...(error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239,68,68,.12)' } : {}),
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            style={{
              position: 'absolute',
              right: '.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              fontSize: '1rem',
              padding: '.25rem',
              lineHeight: 1,
            }}
            tabIndex={-1}
          >
            {show ? '🙈' : '👁'}
          </button>
        </div>
        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '.82rem', marginTop: '.35rem' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0 }}>ℹ</span>
        <div style={{ fontSize: '.82rem', lineHeight: 1.5 }}>
          Your API key is used to authenticate requests to the payment gateway.
          It is kept in memory only and never stored in the browser.
        </div>
      </div>

      <button
        className="btn btn-primary w-full btn-lg"
        onClick={handleConnect}
        disabled={!key.trim()}
        style={{ height: 52, fontSize: '1rem' }}
      >
        Connect →
      </button>
    </div>
  )
}
