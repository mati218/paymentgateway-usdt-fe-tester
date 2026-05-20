import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Upload, Info, XCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { submitDeposit } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'

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

function FieldError({ msg }) {
  return (
    <p style={{
      marginTop: '.3rem', fontSize: '.78rem', color: 'var(--danger)',
      display: 'flex', alignItems: 'center', gap: '.3rem',
    }}>
      <AlertTriangle size={13} /> {msg}
    </p>
  )
}

export default function Step4Submit({ store }) {
  const {
    baseURL, secretKey,
    submitReference,   setSubmitReference,
    submitTxHash,      setSubmitTxHash,
    submitFromAddress, setSubmitFromAddress,
    submitUserId,      setSubmitUserId,
    submitAmount,      setSubmitAmount,
    submitResult,      setSubmitResult,
    loadingSubmit,     setLoadingSubmit,
    setStatusRef,
    goToStep,
  } = store

  const [localErrors, setLocalErrors] = useState({})

  const serverErrors  = extractFieldErrors(submitResult)
  const fieldError    = (name) => localErrors[name] || serverErrors[name] || null
  const clearLocal    = (name) => {
    if (localErrors[name]) setLocalErrors(prev => { const n = { ...prev }; delete n[name]; return n })
  }

  function fieldStyle(name) {
    if (fieldError(name))  return { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239,68,68,.15)' }
    if (submitResult?.ok)  return { borderColor: 'var(--success)' }
    return {}
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errs = {}
    if (!submitReference.trim())   errs.reference = 'Reference is required'
    if (!submitTxHash.trim())      errs.tx_hash   = 'Transaction hash is required'
    if (!submitUserId.toString().trim() || isNaN(Number(submitUserId)) || Number(submitUserId) <= 0)
                                   errs.user_account_id   = 'User ID must be a positive number'
    if (!submitAmount.toString().trim() || isNaN(Number(submitAmount)) || Number(submitAmount) <= 0)
                                   errs.amount    = 'Amount must be a positive number'
    if (!submitFromAddress.trim()) errs.user_name = 'Username is required'

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
      user_account_id:   String(submitUserId),
      amount:    Number(submitAmount),
      user_name: submitFromAddress,
    })
    setSubmitResult(result)
    setLoadingSubmit(false)

    if (result.ok) {
      setStatusRef(submitReference)
      toast.success('Deposit submitted successfully!')
    } else {
      const msg = result.data?.message || 'Submission failed'
      toast.error(msg)
      const serverErrs = extractFieldErrors(result)
      if (Object.keys(serverErrs).length) {
        toast.error(Object.values(serverErrs)[0], { id: 'field-err' })
      }
    }
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
          flexShrink: 0,
        }}>
          <Upload size={20} style={{ color: '#4ade80' }} />
        </div>
        <div>
          <h2>Step 3 — Submit Deposit</h2>
          <p>After sending USDT on-chain, submit the transaction details here.</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          Paste the blockchain <strong>tx_hash</strong> and fill in the user details.
          All five fields are required by the API.
        </span>
      </div>

      {/* Top-level API error banner */}
      {topMessage && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <XCircle size={16} style={{ flexShrink: 0 }} />
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
            onChange={e => { setSubmitReference(e.target.value); clearLocal('reference') }}
            style={fieldStyle('reference')}
          />
          {fieldError('reference')
            ? <FieldError msg={fieldError('reference')} />
            : <p className="text-xs text-muted mt-1">Auto-filled from Step 2.</p>
          }
        </div>

        {/* TX Hash */}
        <div>
          <label htmlFor="txHash">
            Transaction Hash (tx_hash)
            <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '.4rem', textTransform: 'none', letterSpacing: 0 }}>
              — 64 hex characters
            </span>
          </label>
          <input
            id="txHash"
            type="text"
            placeholder="64-character hex hash…"
            value={submitTxHash}
            onChange={e => { setSubmitTxHash(e.target.value); clearLocal('tx_hash') }}
            className="font-mono"
            style={fieldStyle('tx_hash')}
            maxLength={64}
          />
          <div className="flex justify-between mt-1">
            {fieldError('tx_hash')
              ? <FieldError msg={fieldError('tx_hash')} />
              : <p className="text-xs text-muted">On-chain TRON transaction hash.</p>
            }
            <span style={{
              fontSize: '.72rem', fontFamily: 'monospace', flexShrink: 0, marginLeft: '.5rem',
              color: submitTxHash.length === 64 ? 'var(--success)' : submitTxHash.length > 0 ? 'var(--warning)' : 'var(--muted)',
            }}>
              {submitTxHash.length}/64
            </span>
          </div>
        </div>

        {/* user_account_id + amount — side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* User ID */}
          <div>
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="number"
              placeholder="e.g. 42"
              value={submitUserId}
              onChange={e => { setSubmitUserId(e.target.value); clearLocal('user_account_id') }}
              style={fieldStyle('user_account_id')}
              min="1"
            />
            {fieldError('user_account_id')
              ? <FieldError msg={fieldError('user_account_id')} />
              : <p className="text-xs text-muted mt-1">Numeric user ID.</p>
            }
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount">Amount (USDT)</label>
            <input
              id="amount"
              type="number"
              placeholder="e.g. 100"
              value={submitAmount}
              onChange={e => { setSubmitAmount(e.target.value); clearLocal('amount') }}
              style={fieldStyle('amount')}
              min="0"
              step="0.01"
            />
            {fieldError('amount')
              ? <FieldError msg={fieldError('amount')} />
              : <p className="text-xs text-muted mt-1">Exact USDT amount sent.</p>
            }
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="userName">Username (user_name)</label>
          <input
            id="userName"
            type="text"
            placeholder="e.g. John Doe"
            value={submitFromAddress}
            onChange={e => { setSubmitFromAddress(e.target.value); clearLocal('user_name') }}
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
          <div className="code-block" style={{ maxHeight: 200 }}>
{`POST ${baseURL}/api/deposit/submit
X-SECRET-KEY: ${secretKey ? secretKey.slice(0, 10) + '••••' : '<not set>'}
Content-Type: application/json

{
  "reference": "${submitReference || '<reference>'}",
  "tx_hash":   "${submitTxHash   || '<tx_hash>'}",
  "user_account_id": "${submitUserId   || '<user_account_id>'}",
  "amount":    ${submitAmount   || '<amount>'},
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
            : <><Upload size={16} /> Submit Deposit</>}
        </button>
      </form>

      {submitResult?.ok && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>Deposit submitted! Proceed to Step 4 to check its status.</span>
        </div>
      )}

      <ResponsePanel result={submitResult} title="POST /api/deposit/submit" />

      {/* Navigation */}
      <div className="flex gap-3" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={() => goToStep(3)}>
          <ArrowLeft size={15} /> Back
        </button>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => goToStep(5)}
          disabled={!submitResult?.ok}
        >
          Check Status <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
