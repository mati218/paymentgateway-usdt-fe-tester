import { useState, useEffect } from 'react'
import UserDepositPage from './user-deposit/UserDepositPage'
import { useFlowStore } from './store/flowStore'
import StepIndicator from './components/StepIndicator'
import Step2QrCode    from './steps/Step2QrCode'
import Step3Reference from './steps/Step3Reference'
import Step4Submit    from './steps/Step4Submit'
import Step5Status    from './steps/Step5Status'

export default function App() {
  const [mode, setMode]           = useState('user')
  const [secretKey, setSecretKey] = useState('')
  const [showKey, setShowKey]     = useState(false)

  const store = useFlowStore()

  useEffect(() => {
    store.setSecretKey(secretKey)
  }, [secretKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode === 'dev' && store.currentStep === 1) store.goToStep(2)
  }, [mode, store.currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-bg text-content">

      {/* ── Navbar ── */}
      <header className="bg-bg-2 border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-50 flex-wrap">

        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <div className="font-bold text-sm text-content leading-tight">AIPay247</div>
            <div className="text-[11px] text-content-3">USDT Gateway</div>
          </div>
        </div>

        {/* X-SECRET-KEY input */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <span className="text-[10px] font-bold text-content-3 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            X-SECRET-KEY
          </span>
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Paste your secret key…"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              className={`pr-9 text-xs font-mono py-2 ${secretKey ? 'border-accent/60' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowKey(v => !v)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-3 hover:text-content transition-colors text-base leading-none bg-transparent border-0 cursor-pointer p-0"
            >
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          {/* Connected dot */}
          <span
            title={secretKey ? 'Key is set' : 'No key entered'}
            className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
              secretKey ? 'bg-accent' : 'bg-border-2'
            }`}
          />
        </div>

        {/* Mode toggle */}
        <div className="flex bg-bg-3 border border-border rounded-lg p-1 gap-1 flex-shrink-0 ml-auto">
          {[
            { key: 'user', label: 'User View' },
            { key: 'dev',  label: 'Dev Tester' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 border-0 cursor-pointer whitespace-nowrap ${
                mode === key
                  ? 'bg-accent text-white'
                  : 'bg-transparent text-content-3 hover:text-content'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col">
        {mode === 'user' && <UserDepositPage secretKey={secretKey} />}

        {mode === 'dev' && (
          <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
            <div className="text-center mb-7">
              <h1 className="mb-1">AIPAY Deposit Flow Tester</h1>
              <p>Step-by-step API tester for the full deposit journey.</p>
            </div>
            <StepIndicator current={store.currentStep - 1} />
            {store.currentStep === 2 && <Step2QrCode    store={store} />}
            {store.currentStep === 3 && <Step3Reference store={store} />}
            {store.currentStep === 4 && <Step4Submit    store={store} />}
            {store.currentStep === 5 && <Step5Status    store={store} />}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-3 text-center text-[11px] text-content-3">
        AIPay247 · USDT TRC20 Payment Gateway ·{' '}
        <span className="text-accent">Secured by blockchain</span>
      </footer>
    </div>
  )
}
