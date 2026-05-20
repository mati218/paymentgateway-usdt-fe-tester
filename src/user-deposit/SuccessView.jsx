import { CheckCircle, Lightbulb, Wifi, WifiOff, Loader2, ExternalLink } from 'lucide-react'

/* ── WebSocket status pill ── */
function WsPill({ status }) {
  const map = {
    idle:       { label: 'Waiting…',    cls: 'bg-border text-content-3',          icon: <WifiOff  size={11} /> },
    connecting: { label: 'Connecting',  cls: 'bg-yellow-500/15 text-yellow-400',  icon: <Loader2  size={11} className="animate-spin" /> },
    connected:  { label: 'Live',        cls: 'bg-accent/15 text-accent',           icon: <Wifi     size={11} /> },
    error:      { label: 'WS Error',    cls: 'bg-red-500/15 text-red-400',         icon: <WifiOff  size={11} /> },
  }
  const { label, cls, icon } = map[status] ?? map.idle
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {icon} {label}
    </span>
  )
}

export default function SuccessView({ amount, referenceId, txHash, wsStatus, depositEvent, onReset }) {
  const isVerified = depositEvent?.status === 'confirmed'
  const isFailed   = depositEvent?.status === 'failed'

  const rows = [
    { label: 'Amount',       value: `${parseFloat(amount).toFixed(2)} USDT`, mono: false },
    { label: 'Network',      value: 'TRC20 (TRON)',                          mono: false },
    { label: 'Reference ID', value: referenceId,                             mono: true  },
    { label: 'TX Hash',      value: txHash,                                  mono: true  },
  ]

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-md mx-auto text-center">

      {/* Icon — changes when verified */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 transition-colors duration-500 ${
        isVerified
          ? 'bg-accent/20 border-accent'
          : isFailed
            ? 'bg-red-500/10 border-red-500/40'
            : 'bg-accent/10 border-accent/30'
      }`}>
        <CheckCircle size={40} className={isVerified ? 'text-accent' : isFailed ? 'text-red-400' : 'text-accent'} />
      </div>

      <h2 className={isVerified ? 'text-accent' : isFailed ? 'text-red-400' : 'text-accent'}>
        {isVerified ? 'Deposit Confirmed!' : isFailed ? 'Deposit Failed' : 'Deposit Submitted!'}
      </h2>
      <p className="mb-4">
        {isVerified
          ? 'Your payment has been verified and your balance has been credited.'
          : isFailed
            ? 'Verification failed. Please contact support with your reference ID.'
            : 'Your deposit is being verified. Funds will be credited within a few minutes.'}
      </p>

      {/* Live status indicator */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="text-xs text-content-3">Real-time verification:</span>
        <WsPill status={wsStatus} />
      </div>

      {/* Live event data — shown once the event fires */}
      {depositEvent && (
        <div className="bg-bg-3 border border-border rounded-xl overflow-hidden mb-5 text-left">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <Wifi size={13} className="text-accent" />
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest">Live Update</span>
          </div>
          {[
            ['Status',    depositEvent.status],
            ['Amount',    depositEvent.amount ? `${depositEvent.amount} USDT` : null],
            ['Reference', depositEvent.reference],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="flex gap-4 items-center px-4 py-2.5 border-b border-border last:border-0">
              <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest min-w-[80px] flex-shrink-0">
                {label}
              </div>
              <div className="text-sm text-content font-medium break-all">{value}</div>
            </div>
          ))}
          {depositEvent.explorer && (
            <div className="px-4 py-2.5">
              <a
                href={depositEvent.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
              >
                <ExternalLink size={12} /> View on TronScan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Summary table */}
      <div className="bg-bg-3 border border-border rounded-xl overflow-hidden mb-5 text-left">
        {rows.map(({ label, value, mono }, i) => (
          <div
            key={label}
            className={`flex gap-4 items-center px-4 py-3 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest min-w-[90px] flex-shrink-0">
              {label}
            </div>
            <div className={`text-sm text-content break-all leading-snug flex-1 ${mono ? 'font-mono' : 'font-medium'}`}>
              {value}
            </div>
          </div>
        ))}
        {/* Status row — updates live */}
        <div className="flex gap-4 items-center px-4 py-3">
          <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest min-w-[90px] flex-shrink-0">
            Status
          </div>
          {isVerified
            ? <span className="badge badge-confirmed">Confirmed</span>
            : isFailed
              ? <span className="badge badge-failed">Failed</span>
              : <span className="badge badge-pending">Pending Verification</span>
          }
        </div>
      </div>

      {!depositEvent && (
        <div className="alert alert-success mb-5 text-left">
          <Lightbulb size={16} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Verification typically takes <strong>2–5 minutes</strong>.
            This page will update automatically when your payment is confirmed.
          </p>
        </div>
      )}

      <button className="btn btn-outline w-full" onClick={onReset}>
        Make Another Deposit
      </button>
    </div>
  )
}
