import React from 'react'
import toast from 'react-hot-toast'
import { getReference } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'
import CopyRow from '../components/CopyRow'

export default function Step3Reference({ store }) {
  const {
    baseURL, secretKey,
    refNetwork,       setRefNetwork,
    refName,          setRefName,          // user_name
    refUserAccountId, setRefUserAccountId, // user_account_id
    referenceResult,  setReferenceResult,
    loadingReference, setLoadingReference,
    applyReferenceToSubmit,
    goToStep,
  } = store

  async function handleSubmit(e) {
    e.preventDefault()
    if (!refUserAccountId.toString().trim() || isNaN(Number(refUserAccountId))) {
      toast.error('User Account ID is required')
      return
    }
    if (!refName.trim()) {
      toast.error('Username (user_name) is required')
      return
    }

    setLoadingReference(true)
    const result = await getReference(baseURL, secretKey, {
      network:         refNetwork,
      user_account_id: Number(refUserAccountId),
      user_name:       refName,
    })
    setReferenceResult(result)
    setLoadingReference(false)

    if (result.ok) {
      const ref = result.data?.reference
        || result.data?.data?.reference
        || result.data?.payment_id
        || result.data?.data?.payment_id
        || ''
      if (ref) {
        applyReferenceToSubmit(ref)
        toast.success(`Reference generated: ${ref}`)
      } else {
        toast.success('Reference created — check the response below')
      }
    } else {
      toast.error(`Error ${result.status}: ${result.data?.message || 'Failed to create reference'}`)
    }
  }

  const reference = referenceResult?.data?.reference
    || referenceResult?.data?.data?.reference
    || referenceResult?.data?.payment_id
    || referenceResult?.data?.data?.payment_id
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
        }}>🔖</div>
        <div>
          <h2>Step 2 — Create Reference</h2>
          <p>Generate a unique deposit reference / payment ID before sending USDT.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Network */}
        <div>
          <label htmlFor="network">Network</label>
          <select
            id="network"
            value={refNetwork}
            onChange={e => setRefNetwork(e.target.value)}
          >
            <option value="TRC20">TRC20 (TRON)</option>
            <option value="ERC20">ERC20 (Ethereum)</option>
          </select>
        </div>

        {/* user_account_id + user_name — side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="refUserId">User Account ID</label>
            <input
              id="refUserId"
              type="number"
              placeholder="e.g. 1"
              value={refUserAccountId}
              onChange={e => setRefUserAccountId(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted mt-1">Numeric account ID.</p>
          </div>

          <div>
            <label htmlFor="refName">Username (user_name)</label>
            <input
              id="refName"
              type="text"
              placeholder="e.g. Test Org"
              value={refName}
              onChange={e => setRefName(e.target.value)}
            />
            <p className="text-xs text-muted mt-1">Username for this deposit.</p>
          </div>
        </div>

        {/* Request preview */}
        <div>
          <label>Request Preview</label>
          <div className="code-block" style={{ maxHeight: 140 }}>
{`POST ${baseURL}/api/deposit/get-reference
X-SECRET-KEY: ${secretKey ? secretKey.slice(0, 10) + '••••' : '<not set>'}
Content-Type: application/json

{
  "network":         "${refNetwork}",
  "user_account_id": ${refUserAccountId || '<user_account_id>'},
  "user_name":       "${refName || '<user_name>'}"
}`}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loadingReference}
        >
          {loadingReference
            ? <><span className="spinner" /> Generating…</>
            : '🔖 Generate Reference'}
        </button>
      </form>

      {/* Reference display */}
      {reference && (
        <>
          <div className="divider" />
          <div className="alert alert-success">
            <span>✅</span>
            <div style={{ flex: 1 }}>
              <strong>Reference generated — auto-filled in Step 3</strong>
              <div style={{ marginTop: '.4rem' }}>
                <CopyRow value={reference} label="Reference" />
              </div>
            </div>
          </div>
        </>
      )}

      <ResponsePanel result={referenceResult} title="POST /api/deposit/get-reference" />

      {/* Navigation */}
      <div className="flex gap-3" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={() => goToStep(2)}>← Back</button>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => goToStep(4)}
          disabled={!referenceResult?.ok}
        >
          Continue to Submit →
        </button>
      </div>
    </div>
  )
}
