import { useState } from 'react'
import { Link2, AlertTriangle, Tag, Coins, Globe, User, ArrowLeft } from 'lucide-react'

const TX_REGEX = /^[a-fA-F0-9]{64}$/

function ReadonlyField({ label, value, icon, mono }) {
  return (
    <div>
      <label className="flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className={`w-full bg-bg-4 border border-border rounded-lg px-3.5 py-2.5 text-sm text-content-3 break-all leading-snug ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  )
}

export default function Step3TxHash({ user, amount, referenceId, loading, serverError, onBack, onSubmit }) {
  const [txHash, setTxHash] = useState('')
  const [error, setError]   = useState('')

  function validate() {
    const t = txHash.trim()
    if (!t)             { setError('TX Hash is required'); return null }
    if (!TX_REGEX.test(t)) { setError('TX Hash must be exactly 64 hexadecimal characters'); return null }
    setError('')
    return t
  }

  function handleSubmit() {
    const hash = validate()
    if (hash) onSubmit(hash)
  }

  const count = txHash.trim().length

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Link2 size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="mb-0">Submit Transaction Hash</h2>
          <p>Paste your TX Hash so we can verify and credit your deposit.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">

        {/* TX Hash */}
        <div>
          <label>Transaction Hash (TX Hash)</label>
          <div className="relative">
            <textarea
              placeholder="Paste your 64-character transaction hash here…"
              value={txHash}
              onChange={e => { setTxHash(e.target.value); if (error) setError('') }}
              rows={3}
              disabled={loading}
              className={`font-mono text-sm resize-none pb-7 ${
                error || serverError ? 'border-red-500 ring-2 ring-red-500/10' : ''
              }`}
            />
            <span className={`absolute bottom-2.5 right-3 text-xs font-mono pointer-events-none ${
              count === 64 ? 'text-accent' : count > 64 ? 'text-red-400' : 'text-content-3'
            }`}>
              {count}/64
            </span>
          </div>
          {(error || serverError) && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertTriangle size={13} /> {error || serverError}
            </p>
          )}
        </div>

        {/* Readonly context fields */}
        <ReadonlyField label="Reference ID" value={referenceId}                            icon={<Tag    size={13} className="text-content-3" />} mono />
        <ReadonlyField label="Amount"       value={`${parseFloat(amount).toFixed(2)} USDT`} icon={<Coins  size={13} className="text-content-3" />} />
        <ReadonlyField label="Network"      value="TRC20 (TRON)"                           icon={<Globe  size={13} className="text-content-3" />} />
        <ReadonlyField label="Account ID"   value={String(user.id)}                        icon={<User   size={13} className="text-content-3" />} />

        {/* Info */}
        <div className="alert alert-info">
          <span className="flex-shrink-0 text-base">ℹ</span>
          <p className="text-xs leading-relaxed">
            Find your TX Hash in your wallet's transaction history after sending.
            It is a 64-character string of letters and numbers (e.g.{' '}
            <code className="font-mono text-[11px] opacity-80">a3f9d1…e7ef8</code>).
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            className="btn btn-outline flex-shrink-0"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            className="btn btn-primary flex-1 h-11"
            onClick={handleSubmit}
            disabled={loading || !txHash.trim()}
          >
            {loading
              ? <><span className="spinner" /> Submitting…</>
              : 'Confirm Deposit'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
