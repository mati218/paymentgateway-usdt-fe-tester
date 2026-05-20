import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { submitDeposit } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'

/**
 * Extract field-level validation errors from the API response.
 * Handles: { errors: { field: ["msg"] } }  or  { errors: { field: "msg" } }
 */
function extractFieldErrors(result) {
  if (!result || result.ok) return {}
  const raw = result.data?.errors
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [field, val] of Object.entries(raw)) {
    out[field] = Array.isArray(val) ? val[0] : String(val)
  }
  return out
}

export default function Step4Submit({ store }) {
  const {
    baseURL, secretKey,
    submitReference, setSubmitReference,
    submitTxHash, setSubmitTxHash,
    submitFromAddress, setSubmitFromAddress,
    submitResult, setSubmitResult,
    loadingSubmit, setLoadingSubmit,
    setStatusRef,
    goToStep,
  } = store

  // Local client-side validation errors (cleared on each submit)
  const [localErrors, setLocalErrors] = useState({})

  // Derive server-side field errors from the last result
  const serverErrors = extractFieldErrors(submitResult)

  // Merge: local errors take priority while typing; server errors shown after submit
  const fieldError = (name) => localErrors[name] || serverErrors[name] || null

  function clearLocalError(name) {
    if (localErrors[name]) setLocalErrors(prev => { const n = { ...prev }; delete n[name]; return n })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Client-side required checks
    const errs = {}
    if (!submitReference.trim())   errs.reference    = 'Reference is required'
    if (!submitTxHash.trim())      errs.tx_hash      = 'Transaction hash is required'
    if (!submitFromAddress.trim()) errs.user_name    = 'Username is required'

    if (Object.keys(errs).length) {
      setLocalErrors(errs)
      toast.error('Please fill in all required fields')
      return
    }
    setLocalErrors({})

    setLoadingSubmit(true)
    const result = await submitDeposit(baseURL, secretKey, {
      reference: submitReference,
      tx_hash:   submitTxHash,
      user_name: submitFromAddress,
    })
    setSubmitResult(result)
    setLoadingSubmit(false)

    if (result.ok) {
      setStatusRef(submitReference)
      toast.success('Deposit submitted successfully!')
    } else {
      // Show a toast for the top-level message
      const msg = result.data?.message || 'Submission failed'
      toast.error(`${msg}`)

      // If there are field errors, also toast a hint
      const errsFromServer = extractFieldErrors(result)
      if (Object.keys(errsFromServer).length) {
        const first = Object.values(errsFromServer)[0]
        toast.error(first, { id: 'field-err' })
      }
    }
  }

  // Determine border style for a field
  function fieldStyle(name) {
    const err = fieldError(name)
    if (err) return { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239,68,68,.15)' }
    // Green border if field has value and no error and result was ok
    if (submitResult?.ok) return { borderColor: 'var(--success)' }
    return {}
  }

  const hasServerErrors = !submitResult?.ok && Object.keys(serverErrors).length > 0
  const topMessage = submitResult && !submitResult.ok
    ? (submitResult.data?.message || `HTTP ${submitResult.status} error`)
    : null

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'rgba(34,197,94,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>📤</div>
        <div>
          <h2>Step 4 — Submit Deposit</h2>
          <p>After sending USDT on-chain, submit the transaction hash here.</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <span>ℹ️</span>
        <span>
          Send USDT to the wallet address from Step 2, then paste the blockchain
          <strong> tx_hash</strong> and your <strong>username</strong> below.
        </span>
      </div>

      {/* ── Top-level API error banner ─────────────────────── */}
      {topMessage && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <span>❌</span>
          <div style={{ flex: 1 }}>
            <strong>{topMessage}</strong>
            {hasServerErrors && (
              <ul style={{ marginTop: '.4rem', paddingLeft: '1rem', listStyle: 'disc' }}>
                {Object.entries(serverErrors).map(([field, msg]) => (
                  <li key={field} style={{ fontSize: '.82rem', marginTop: '.2rem' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--warning)' }}>{field}</span>
                    {' — '}{msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Reference */}
        <div>
          <label htmlFor="submitRef">Reference (Payment ID)</label>
          <input
            id="submitRef"
            type="text"
            placeholder="DEP-XXXXXXXXXXXXXXX"
            value={submitReference}
            onChange={e => { setSubmitReference(e.target.value); clearLocalError('reference') }}
            style={fieldStyle('reference')}
          />
          {fieldError('reference')
            ? <FieldError msg={fieldError('reference')} />
            : <p className="text-xs text-muted mt-1">Auto-filled from Step 3.</p>
          }
        </div>

        {/* TX Hash */}
        <div>
          <label htmlFor="txHash">
            Transaction Hash (tx_hash)
            <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '.4rem', textTransform: 'none', letterSpacing: 0 }}>
              — must be exactly 64 characters
            </span>
          </label>
          <input
            id="txHash"
            type="text"
            placeholder="64-character hex hash, e.g. 7eb9feea19ffeef3…"
            value={submitTxHash}
            onChange={e => { setSubmitTxHash(e.target.value); clearLocalError('tx_hash') }}
            className="font-mono"
            style={fieldStyle('tx_hash')}
            maxLength={64}
          />
          {/* Live character counter */}
          <div className="flex justify-between mt-1">
            {fieldError('tx_hash')
              ? <FieldError msg={fieldError('tx_hash')} />
              : <p className="text-xs text-muted">Blockchain transaction hash from your TRON wallet.</p>
            }
            <span style={{
              fontSize: '.72rem',
              fontFamily: 'monospace',
              color: submitTxHash.length === 64 ? 'var(--success)' : submitTxHash.length > 0 ? 'var(--warning)' : 'var(--muted)',
              flexShrink: 0,
              marginLeft: '.5rem',
            }}>
              {submitTxHash.length}/64
            </span>
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="fromAddr">Username</label>
          <input
            id="fromAddr"
            type="text"
            placeholder="e.g. john_doe"
            value={submitFromAddress}
            onChange={e => { setSubmitFromAddress(e.target.value); clearLocalError('user_name') }}
            style={fieldStyle('user_name')}
          />
          {fieldError('user_name')
            ? <FieldError msg={fieldError('user_name')} />
            : <p className="text-xs text-muted mt-1">The username associated with this deposit.</p>
          }
        </div>

        {/* Request preview */}
        <div>
          <label>Request Preview</label>
          <div className="code-block" style={{ maxHeight: 160 }}>
{`POST ${baseURL}/api/deposit/submit
X-SECRET-KEY: ${secretKey ? secretKey.slice(0, 10) + '••••' : '<not set>'}
Content-Type: application/json

{
  "reference": "${submitReference || '<reference>'}",
  "tx_hash":   "${submitTxHash || '<tx_hash>'}",
  "user_name": "${submitFromAddress || '<user_name>'}"
}`}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success btn-lg w-full"
          disabled={loadingSubmit}
        >
          {loadingSubmit
            ? <><span className="spinner" /> Submitting…</>
            : '📤 Submit Deposit'}
        </button>
      </form>

      {submitResult?.ok && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <span>✅</span>
          <span>Deposit submitted! Proceed to Step 5 to check its status.</span>
        </div>
      )}

      <ResponsePanel result={submitResult} title="POST /api/deposit/submit" />

      {/* Navigation */}
      <div className="flex gap-3" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={() => goToStep(3)}>← Back</button>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => goToStep(5)}
          disabled={!submitResult?.ok}
        >
          Check Status →
        </button>
      </div>
    </div>
  )
}

/** Inline field error message */
function FieldError({ msg }) {
  return (
    <p style={{
      marginTop: '.3rem',
      fontSize: '.78rem',
      color: 'var(--danger)',
      display: 'flex',
      alignItems: 'center',
      gap: '.3rem',
    }}>
      <span>⚠</span> {msg}
    </p>
  )
}
