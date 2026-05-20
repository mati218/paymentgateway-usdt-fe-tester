import { CheckCircle, Clock, XCircle, Wifi, WifiOff, Loader2, ExternalLink, RefreshCw } from 'lucide-react'

// Socket event payload from DepositCompleted:
// { reference, tx_hash, amount, status, user_account_id, user_name, verified_at, explorer }
// status values: 'completed' | 'failed' | 'pending'

/* ── WS connection pill ── */
function WsPill({ status }) {
  const cfg = {
    idle:       { label: 'Waiting',     cls: 'text-content-3 bg-bg-4 border-border',              dot: 'bg-content-3',  icon: <WifiOff size={10} /> },
    connecting: { label: 'Connecting',  cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400 animate-pulse', icon: <Loader2 size={10} className="animate-spin" /> },
    connected:  { label: 'Live',        cls: 'text-accent bg-accent/10 border-accent/20',          dot: 'bg-accent animate-pulse',  icon: <Wifi size={10} /> },
    error:      { label: 'WS Error',    cls: 'text-red-400 bg-red-500/10 border-red-500/20',       dot: 'bg-red-400',    icon: <WifiOff size={10} /> },
  }
  const { label, cls, dot, icon } = cfg[status] ?? cfg.idle
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {icon}
      {label}
    </span>
  )
}

/* ── Single summary row ── */
function Row({ label, value, mono, accent, children }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest w-[88px] flex-shrink-0 pt-0.5">
        {label}
      </div>
      {children ?? (
        <div className={`text-sm break-all leading-snug flex-1 ${mono ? 'font-mono text-content-2' : 'font-medium'} ${accent ? 'text-accent' : 'text-content'}`}>
          {value}
        </div>
      )}
    </div>
  )
}

/* ── Status badge ── */
function StatusBadge({ event }) {
  // Socket sends status = 'completed' when verified
  if (!event) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <Clock size={11} /> Pending Verification
      </span>
    )
  }
  if (event.status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
        <CheckCircle size={11} /> Confirmed
      </span>
    )
  }
  if (event.status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={11} /> Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
      <Clock size={11} /> {event.status}
    </span>
  )
}

export default function SuccessView({ amount, referenceId, txHash, wsStatus, depositEvent, onReset }) {
  // Socket sends 'completed' when deposit is verified
  const isCompleted = depositEvent?.status === 'completed'
  const isFailed    = depositEvent?.status === 'failed'
  const isPending   = !depositEvent

  // Use on-chain amount from socket if available (authoritative), else submitted amount
  const displayAmount = depositEvent?.amount
    ? `${parseFloat(depositEvent.amount).toFixed(2)} USDT`
    : `${parseFloat(amount).toFixed(2)} USDT`

  const explorerUrl = depositEvent?.explorer
    ?? (txHash ? `https://tronscan.org/#/transaction/${txHash}` : null)

  return (
    <div className="max-w-md mx-auto w-full">

      {/* ── Hero icon + heading ── */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 transition-all duration-700 ${
          isCompleted ? 'bg-accent/15 border-accent shadow-[0_0_32px_rgba(34,197,94,0.2)]'
          : isFailed  ? 'bg-red-500/10 border-red-500/30'
          :              'bg-bg-3 border-border'
        }`}>
          {isCompleted
            ? <CheckCircle size={40} className="text-accent" />
            : isFailed
              ? <XCircle size={40} className="text-red-400" />
              : <RefreshCw size={36} className="text-content-3 animate-spin" style={{ animationDuration: '3s' }} />
          }
        </div>

        <h2 className={`mb-1 transition-colors duration-500 ${
          isCompleted ? 'text-accent' : isFailed ? 'text-red-400' : 'text-content'
        }`}>
          {isCompleted ? 'Deposit Confirmed!' : isFailed ? 'Deposit Failed' : 'Verifying Payment…'}
        </h2>

        <p className="text-sm text-content-3">
          {isCompleted
            ? 'Your USDT has been verified and your balance has been credited.'
            : isFailed
              ? 'Verification failed. Contact support with your reference ID.'
              : 'Waiting for blockchain confirmation. This updates automatically.'}
        </p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-bg-2 border border-border rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden mb-4">

        {/* Card header — WS status */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-3/50">
          <span className="text-[11px] font-semibold text-content-3 uppercase tracking-widest">
            Transaction Summary
          </span>
          <WsPill status={wsStatus} />
        </div>

        {/* Rows */}
        <Row label="Status">
          <StatusBadge event={depositEvent} />
        </Row>

        <Row label="Amount" value={displayAmount} />

        <Row label="Network" value="TRC20 (TRON)" />

        <Row
          label="Reference"
          value={depositEvent?.reference ?? referenceId}
          mono
        />

        <Row
          label="TX Hash"
          value={depositEvent?.tx_hash ?? txHash}
          mono
        />

        {/* Verified at — only shown after confirmation */}
        {isCompleted && depositEvent?.verified_at && (
          <Row
            label="Verified"
            value={new Date(depositEvent.verified_at).toLocaleString()}
          />
        )}

        {/* Explorer link */}
        {explorerUrl && (
          <div className="px-4 py-3">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
            >
              <ExternalLink size={12} />
              View on TronScan
            </a>
          </div>
        )}
      </div>

      {/* ── Info banner — only while pending ── */}
      {isPending && (
        <div className="alert alert-info mb-4">
          <Wifi size={14} className="flex-shrink-0 text-accent mt-0.5" />
          <p className="text-xs leading-relaxed">
            Connected via WebSocket — this page will update <strong>instantly</strong> when
            your transaction is confirmed on the blockchain.
          </p>
        </div>
      )}

      {/* ── Success banner — shown after confirmation ── */}
      {isCompleted && (
        <div className="alert alert-success mb-4">
          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong>{displayAmount}</strong> has been credited to your account.
            Your balance is now updated.
          </p>
        </div>
      )}

      {/* ── Failed banner ── */}
      {isFailed && (
        <div className="alert alert-danger mb-4">
          <XCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Deposit verification failed. Please contact support with reference{' '}
            <code className="font-mono text-[11px]">{referenceId}</code>.
          </p>
        </div>
      )}

      <button className="btn btn-outline w-full" onClick={onReset}>
        Make Another Deposit
      </button>
    </div>
  )
}
