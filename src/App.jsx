import React from 'react'
import { useFlowStore } from './store/flowStore'
import StepIndicator from './components/StepIndicator'
import Step1SecretKey from './steps/Step1SecretKey'
import Step2QrCode    from './steps/Step2QrCode'
import Step3Reference from './steps/Step3Reference'
import Step4Submit    from './steps/Step4Submit'
import Step5Status    from './steps/Step5Status'

export default function App() {
  const store = useFlowStore()
  const { currentStep, secretKey, baseURL } = store

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>💎</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>AIPay247</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>User Deposit Flow Tester</div>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2" style={{ fontSize: '.78rem' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: secretKey ? 'var(--success)' : 'var(--muted)',
            display: 'inline-block',
          }} />
          <span style={{ color: 'var(--muted)' }}>
            {secretKey
              ? <>{baseURL} · Key: {secretKey.slice(0, 8)}••••</>
              : 'Not configured'}
          </span>
          {secretKey && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => store.goToStep(1)}
              style={{ marginLeft: '.5rem' }}
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {/* Page title */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '.35rem' }}>AIPAY Deposit Flow</h1>
          <p>Complete API tester for the user deposit journey — from authentication to confirmation.</p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={currentStep} />

        {/* Step panels */}
        {currentStep === 1 && <Step1SecretKey store={store} />}
        {currentStep === 2 && <Step2QrCode    store={store} />}
        {currentStep === 3 && <Step3Reference store={store} />}
        {currentStep === 4 && <Step4Submit    store={store} />}
        {currentStep === 5 && <Step5Status    store={store} />}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '.75rem 1.5rem',
        textAlign: 'center',
        fontSize: '.75rem',
        color: 'var(--muted)',
      }}>
        AIPay247 User Flow Tester · USDT TRC20 Payment Gateway ·{' '}
        <span style={{ color: 'var(--primary-h)' }}>All requests go directly to your backend</span>
      </footer>
    </div>
  )
}
