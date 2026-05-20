import React from 'react'
import toast from 'react-hot-toast'
import { Search, RefreshCw, ArrowLeft, Plus } from 'lucide-react'
import { checkDepositStatus } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'

const STATUS_BADGE = {
  pending:   'badge badge-pending',
  confirmed: 'badge badge-confirmed',
  failed:    'badge badge-failed',
}

export default function Step5Status({ store }) {
  const {
    baseURL, secretKey,
    statusRef, setStatusRef,
    statusResult, setStatusResult,
    loadingStatus, setLoadingStatus,
    goToStep,
  } = store

  async function handleCheck(e) {
    e.preventDefault()
    if (!statusRef.trim()) { toast.error('Reference is required'); return }

    setLoadingStatus(true)
    const result = await checkDepositStatus(baseURL, secretKey, statusRef)
    setStatusResult(result)
    setLoadingStatus(false)

    if (result.ok) {
      const status = result.data?.status || result.data?.data?.status || 'unknown'
      toast.success(`Status: ${status}`)
    } else {
      toast.error(`Error ${result.status}: ${result.data?.message || 'Status check failed'}`)
    }
  }

  function resetFlow() {
    store.setQrResult(null)
    store.setReferenceResult(null)
    store.setSubmitResult(null)
    store.setStatusResult(null)
    store.setRefName('')
    store.setSubmitReference('')
    store.setSubmitTxHash('')
    store.setSubmitFromAddress('')
    store.setStatusRef('')
    goToStep(2)
    toast('Flow reset — ready for a new deposit')
  }

  const depositStatus = statusResult?.data?.status
    || statusResult?.data?.data?.status
    || null

  const depositData = statusResult?.data?.data || statusResult?.data || null

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'rgba(245,158,11,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Search size={20} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h2>Step 5 — Check Deposit Status</h2>
          <p>Poll the status of your submitted deposit by reference.</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col gap-4">
        <div>
          <label htmlFor="statusRef">Reference (Payment ID)</label>
          <input
            id="statusRef"
            type="text"
            placeholder="DEP-XXXXXXXXXXXXXXX"
            value={statusRef}
            onChange={e => setStatusRef(e.target.value)}
          />
          <p className="text-xs text-muted mt-1">
            Auto-filled from Step 4. You can also enter any reference manually.
          </p>
        </div>

        {/* Request preview */}
        <div>
          <label>Request Preview</label>
          <div className="code-block" style={{ maxHeight: 80 }}>
{`GET ${baseURL}/api/deposit/status/${statusRef || '<reference>'}
X-SECRET-KEY: ${secretKey ? secretKey.slice(0, 10) + '••••' : '<not set>'}`}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loadingStatus}
        >
          {loadingStatus
            ? <><span className="spinner" /> Checking…</>
            : <><Search size={15} /> Check Status</>}
        </button>
      </form>

      {/* Status summary card */}
      {statusResult?.ok && depositData && (
        <>
          <div className="divider" />
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '1rem',
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '.75rem' }}>
              <h3>Deposit Summary</h3>
              {depositStatus && (
                <span className={STATUS_BADGE[depositStatus] || 'badge badge-info'}>
                  {depositStatus}
                </span>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <tbody>
                {[
                  ['Reference',    depositData.reference || depositData.payment_id],
                  ['Amount',       depositData.amount ? `${depositData.amount} USDT` : null],
                  ['Network',      depositData.network],
                  ['TX Hash',      depositData.tx_hash],
                  ['From Address', depositData.from_address],
                  ['Created',      depositData.created_at],
                  ['Updated',      depositData.updated_at],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.4rem .5rem', color: 'var(--muted)', width: '38%', fontWeight: 600 }}>{k}</td>
                    <td style={{ padding: '.4rem .5rem', fontFamily: 'monospace', fontSize: '.8rem', wordBreak: 'break-all' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ResponsePanel result={statusResult} title="GET /api/deposit/status/:ref" />

      {/* Navigation */}
      <div className="flex gap-3" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-outline" onClick={() => goToStep(4)}>
          <ArrowLeft size={15} /> Back
        </button>
        <button
          className="btn btn-outline"
          onClick={handleCheck}
          disabled={loadingStatus || !statusRef.trim()}
        >
          <RefreshCw size={15} /> Refresh
        </button>
        <button
          className="btn btn-success"
          style={{ marginLeft: 'auto' }}
          onClick={resetFlow}
        >
          <Plus size={15} /> New Deposit
        </button>
      </div>
    </div>
  )
}
