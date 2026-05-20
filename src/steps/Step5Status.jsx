import React from 'react'
import toast from 'react-hot-toast'
import { Search, RefreshCw, ArrowLeft, Plus, Wifi, WifiOff, Loader2, ExternalLink } from 'lucide-react'
import { checkDepositStatus } from '../api/deposit'
import ResponsePanel from '../components/ResponsePanel'
import { useDepositEcho } from '../lib/useDepositEcho'

/* ── WebSocket status pill (same as user view) ── */
function WsPill({ status }) {
  const map = {
    idle:       { label: 'Waiting…',   cls: 'bg-[var(--border)] text-[var(--muted)]',    icon: <WifiOff  size={11} /> },
    connecting: { label: 'Connecting', cls: 'bg-yellow-500/15 text-yellow-400',           icon: <Loader2  size={11} style={{ animation: 'spin 1s linear infinite' }} /> },
    connected:  { label: 'Live',       cls: 'bg-[rgba(34,197,94,.15)] text-[#4ade80]',    icon: <Wifi     size={11} /> },
    error:      { label: 'WS Error',   cls: 'bg-red-500/15 text-red-400',                 icon: <WifiOff  size={11} /> },
  }
  const { label, cls, icon } = map[status] ?? map.idle
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
    }} className={cls}>
      {icon} {label}
    </span>
  )
}

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
    submitResult,
    goToStep,
  } = store

  // Start WebSocket listener once a deposit has been successfully submitted.
  // Use the internal user_id from the submit response (deposit.{user_id} channel).
  const internalUserId = submitResult?.ok
    ? (submitResult.data?.data?.user_id ?? submitResult.data?.user_id ?? null)
    : null
  const echoRef    = submitResult?.ok ? statusRef : null
  const { depositEvent, wsStatus } = useDepositEcho(internalUserId, secretKey, echoRef)

  // Toast when live event arrives
  React.useEffect(() => {
    if (!depositEvent) return
    if (depositEvent.status === 'completed') {
      toast.success(`Live: Deposit confirmed! Ref: ${depositEvent.reference}`)
    } else if (depositEvent.status === 'failed') {
      toast.error(`Live: Deposit failed. Ref: ${depositEvent.reference}`)
    } else {
      toast(`Live update: status = ${depositEvent.status}`)
    }
  }, [depositEvent])

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

      {/* ── Real-time WebSocket panel ── */}
      <div className="divider" />
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '1rem',
        marginBottom: '1rem',
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '.75rem' }}>
          <div className="flex items-center gap-2">
            <Wifi size={15} style={{ color: '#4ade80' }} />
            <h3 style={{ margin: 0 }}>Real-time Verification</h3>
          </div>
          <WsPill status={wsStatus} />
        </div>

        {!submitResult?.ok && (
          <p className="text-xs text-muted">
            Complete Step 4 (Submit Deposit) to activate the WebSocket listener.
          </p>
        )}

        {submitResult?.ok && !depositEvent && (
          <p className="text-xs text-muted">
            Listening on <code style={{ fontFamily: 'monospace' }}>deposit.{internalUserId ?? '…'}</code> for{' '}
            <code style={{ fontFamily: 'monospace' }}>.deposit.completed</code> event…
          </p>
        )}

        {depositEvent && (
          <div>
            <p className="text-xs text-muted" style={{ marginBottom: '.5rem' }}>
              Event received from Reverb:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
              <tbody>
                {[
                  ['status',    depositEvent.status],
                  ['reference', depositEvent.reference],
                  ['amount',    depositEvent.amount ? `${depositEvent.amount} USDT` : null],
                  ['tx_hash',   depositEvent.tx_hash],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.35rem .5rem', color: 'var(--muted)', width: '30%', fontWeight: 600, fontFamily: 'monospace', fontSize: '.78rem' }}>{k}</td>
                    <td style={{ padding: '.35rem .5rem', fontFamily: 'monospace', fontSize: '.78rem', wordBreak: 'break-all' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {depositEvent.explorer && (
              <a
                href={depositEvent.explorer}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: '.5rem', fontSize: '.8rem', color: '#4ade80' }}
              >
                <ExternalLink size={12} /> View on TronScan
              </a>
            )}
          </div>
        )}
      </div>

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
