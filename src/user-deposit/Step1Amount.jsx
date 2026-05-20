import { useState } from 'react'

const PRESETS = [50, 100, 200, 500]
const MIN_AMOUNT = 10

export default function Step1Amount({ user, loading, onNext }) {
  const [amount, setAmount] = useState('')
  const [error, setError]   = useState('')

  function validate() {
    const num = parseFloat(amount)
    if (!amount || isNaN(num))  { setError('Please enter a valid amount'); return null }
    if (num <= 0)               { setError('Amount must be greater than 0'); return null }
    if (num < MIN_AMOUNT)       { setError(`Minimum deposit is ${MIN_AMOUNT} USDT`); return null }
    setError('')
    return num
  }

  function handleNext() {
    const num = validate()
    if (num !== null) onNext(num)
  }

  return (
    <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-md mx-auto">

      {/* Title */}
      <div className="text-center mb-7">
        <div className="text-4xl mb-2 leading-none">💳</div>
        <h2 className="mb-1">Deposit USDT</h2>
        <p>Add funds to your account instantly via TRC20</p>
      </div>

      {/* User chip */}
      <div className="flex items-center gap-3 bg-bg-3 border border-border rounded-xl px-4 py-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          {user.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-content">{user.name}</div>
          <div className="text-[11px] text-content-3">ID: {user.id}</div>
        </div>
        <span className="badge badge-info">TRC20</span>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label>Deposit Amount</label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); if (error) setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            className={`pr-16 text-2xl font-bold h-14 ${
              error ? 'border-red-500 ring-2 ring-red-500/10' : ''
            }`}
            min="0"
            step="0.01"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-accent text-sm pointer-events-none tracking-wider">
            USDT
          </span>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {PRESETS.map(v => (
          <button
            key={v}
            onClick={() => { setAmount(String(v)); setError('') }}
            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
              parseFloat(amount) === v
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-transparent border-border-2 text-content-2 hover:border-accent hover:text-accent'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Network info */}
      <div className="alert alert-info mb-6">
        <span className="flex-shrink-0">🌐</span>
        <div>
          <div className="font-semibold mb-0.5 text-blue-200">Network: TRC20 (TRON)</div>
          <div className="text-xs opacity-85">
            Min. deposit: {MIN_AMOUNT} USDT &nbsp;·&nbsp; Processing: ~2–5 min
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary w-full h-12 text-base"
        onClick={handleNext}
        disabled={loading || !amount}
      >
        {loading
          ? <><span className="spinner" /> Generating Payment Details…</>
          : 'Generate Payment →'
        }
      </button>
    </div>
  )
}
