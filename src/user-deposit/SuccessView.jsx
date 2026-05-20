export default function SuccessView({ amount, referenceId, txHash, onReset }) {
  const rows = [
    { label: 'Amount',       value: `${parseFloat(amount).toFixed(2)} USDT`, mono: false },
    { label: 'Network',      value: 'TRC20 (TRON)',                          mono: false },
    { label: 'Reference ID', value: referenceId,                             mono: true  },
    { label: 'TX Hash',      value: txHash,                                  mono: true  },
  ]

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-md mx-auto text-center">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-4xl mx-auto mb-5">
        ✅
      </div>

      <h2 className="text-accent mb-2">Deposit Submitted!</h2>
      <p className="mb-7">
        Your deposit is being verified. Funds will be credited to your account within a few minutes.
      </p>

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
        {/* Status row */}
        <div className="flex gap-4 items-center px-4 py-3">
          <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest min-w-[90px] flex-shrink-0">
            Status
          </div>
          <span className="badge badge-pending">Pending Verification</span>
        </div>
      </div>

      <div className="alert alert-success mb-5 text-left">
        <span className="flex-shrink-0">💡</span>
        <p className="text-xs leading-relaxed">
          Verification typically takes <strong>2–5 minutes</strong>.
          You'll receive a notification once your balance is updated.
        </p>
      </div>

      <button className="btn btn-outline w-full" onClick={onReset}>
        Make Another Deposit
      </button>
    </div>
  )
}
