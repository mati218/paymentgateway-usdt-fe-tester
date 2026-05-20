import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

function getQrSrc(raw) {
  if (!raw) return null
  if (raw.startsWith('data:') || raw.startsWith('http')) return raw
  return `data:image/png;base64,${raw}`
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  async function handle() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed — select and copy manually.')
    }
  }
  return (
    <button
      onClick={handle}
      className="btn btn-sm btn-outline flex-shrink-0 min-w-[76px]"
    >
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  )
}

function InfoRow({ icon, label, value, mono, copyable }) {
  return (
    <div className="flex items-center gap-3 bg-bg-3 border border-border rounded-lg px-3.5 py-2.5">
      {icon && <span className="text-base flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-content-3 font-semibold uppercase tracking-widest mb-0.5">
          {label}
        </div>
        <div className={`text-sm font-semibold text-content break-all leading-snug ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </div>
      </div>
      {copyable && value && <CopyButton value={value} label={label} />}
    </div>
  )
}

export default function Step2Payment({ walletAddress, qrImage, referenceId, amount, paymentExpiry, onContinue }) {
  const [remaining, setRemaining] = useState(paymentExpiry ? paymentExpiry - Date.now() : 0)

  useEffect(() => {
    if (!paymentExpiry) return
    const id = setInterval(() => {
      const left = paymentExpiry - Date.now()
      setRemaining(left)
      if (left <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [paymentExpiry])

  const expired   = remaining <= 0
  const urgent    = remaining > 0 && remaining < 5 * 60 * 1000
  const qrSrc     = getQrSrc(qrImage)

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-4">

      {/* Timer */}
      {paymentExpiry && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 border text-sm ${
          expired ? 'bg-red-500/8 border-red-500/20'
          : urgent ? 'bg-yellow-400/8 border-yellow-400/20'
          : 'bg-accent/8 border-accent/20'
        }`}>
          <span className={`font-semibold ${expired ? 'text-red-400' : urgent ? 'text-yellow-400' : 'text-accent'}`}>
            {expired ? '⏰ Payment window expired' : urgent ? '⚡ Complete payment within' : '⏱ Complete payment within'}
          </span>
          {!expired && (
            <span className={`font-mono font-bold text-lg ${urgent ? 'text-yellow-400' : 'text-accent'}`}>
              {formatCountdown(remaining)}
            </span>
          )}
        </div>
      )}

      {/* Main card */}
      <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-5">
          <h2 className="mb-1">Send Payment</h2>
          <p>Scan QR or copy the wallet address below</p>
        </div>

        {/* Amount + network badges */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5">
            <span className="font-bold text-accent text-base">
              {parseFloat(amount).toFixed(2)} USDT
            </span>
          </div>
          <span className="badge badge-info">TRC20</span>
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center gap-3 bg-bg-3 border border-border rounded-xl p-5 mb-4">
          {qrSrc ? (
            <div className="bg-white rounded-xl p-3 shadow-lg shadow-black/30">
              <img
                src={qrSrc}
                alt="USDT Deposit QR Code"
                className="w-44 h-44 block rounded"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-xl bg-bg-2 border-2 border-dashed border-border flex flex-col items-center justify-center text-content-3 gap-2">
              <span className="text-3xl">📷</span>
              <span className="text-xs">QR not available</span>
            </div>
          )}
          <p className="text-xs text-content-3">Scan with your crypto wallet app</p>
        </div>

        {/* Wallet + reference */}
        <div className="flex flex-col gap-2">
          <InfoRow icon="📬" label="Wallet Address (TRC20)" value={walletAddress} mono copyable />
          <InfoRow icon="🔖" label="Reference ID"           value={referenceId}   mono copyable />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-bg-2 border border-border rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="font-bold text-sm text-content mb-4 flex items-center gap-2">
          <span>📋</span> How to Complete Your Deposit
        </div>
        <div className="flex flex-col gap-3">
          {[
            { n: 1, text: 'Open your crypto wallet app (Trust Wallet, Binance, etc.)' },
            { n: 2, text: <>Send exactly <strong className="text-content">{parseFloat(amount).toFixed(2)} USDT</strong> using the <strong className="text-content">TRC20 (TRON)</strong> network only</> },
            { n: 3, text: 'After sending, find the Transaction Hash (TX Hash) in your wallet history' },
            { n: 4, text: 'Copy the TX Hash and paste it in the next step to confirm' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0 mt-0.5">
                {n}
              </div>
              <p className="text-sm text-content-2 leading-relaxed pt-0.5">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="alert alert-warning">
        <span className="text-lg flex-shrink-0 mt-0.5">⚠</span>
        <div>
          <div className="font-bold mb-1 text-yellow-300">Network Warning</div>
          <p className="text-xs leading-relaxed text-yellow-200/90">
            Always use the <strong>TRC20 (TRON)</strong> network when sending.
            Sending via ERC20, BEP20, or any other network may result in{' '}
            <strong className="text-yellow-300">permanent and unrecoverable loss of funds</strong>.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-success w-full h-12 text-base"
        onClick={onContinue}
        disabled={expired}
      >
        I've Sent the Payment →
      </button>
    </div>
  )
}
