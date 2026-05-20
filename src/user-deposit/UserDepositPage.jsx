import React from 'react'
import toast from 'react-hot-toast'
import { Check, KeyRound } from 'lucide-react'
import { useDepositFlow } from './useDepositFlow'
import { useDepositEcho } from '../lib/useDepositEcho'
import { generateDepositQR, generateReference, submitUserDeposit } from '../api/userDeposit'
import Step1Amount  from './Step1Amount'
import Step2Payment from './Step2Payment'
import Step3TxHash  from './Step3TxHash'
import SuccessView  from './SuccessView'

const MOCK_USER = {
  id:     42,
  name:   'Alex Johnson',
  email:  'alex.johnson@example.com',
  avatar: 'AJ',
}

function extractQrData(d) {
  const inner = d?.data ?? d
  return {
    walletAddress: inner?.wallet_address ?? inner?.address ?? inner?.wallet ?? '',
    qrImage:       inner?.qr_code ?? inner?.qr_code_url ?? inner?.qr_image ?? inner?.qr ?? '',
  }
}

function extractReference(d) {
  const inner = d?.data ?? d
  return inner?.reference ?? inner?.reference_id ?? inner?.payment_id ?? inner?.ref ?? ''
}

function extractServerError(data) {
  if (!data) return 'An error occurred. Please try again.'
  if (typeof data === 'string') return data
  return data.message ?? data.error ?? JSON.stringify(data)
}

/* ── 3-step deposit indicator ── */
const STEPS = ['Enter Amount', 'Send Payment', 'Submit TX Hash']

function DepositSteps({ current }) {
  const n = current === 'success' ? 4 : current
  return (
    <div className="flex items-center justify-center mb-7 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const num    = i + 1
        const done   = n > num
        const active = n === num
        return (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`step-circle ${done ? 'done' : active ? 'active' : ''}`}>
                {done ? <Check size={14} /> : num}
              </div>
              <span className={`step-label ${done ? 'done' : active ? 'active' : ''}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${done ? 'done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── Prompt shown when key is not yet entered ── */
function NoKeyPrompt() {
  return (
    <div className="bg-bg-2 border border-border rounded-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-md mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <KeyRound size={32} className="text-accent" />
      </div>
      <h2 className="mb-2">API Key Required</h2>
      <p className="mb-4">
        Enter your <strong className="text-content">X-SECRET-KEY</strong> in the
        navigation bar above to start a deposit.
      </p>
      <div className="alert alert-info text-left">
        <span className="flex-shrink-0">↑</span>
        <p className="text-xs leading-relaxed">
          Look for the <strong>X-SECRET-KEY</strong> field at the top of the page.
          The key applies to both User View and Dev Tester simultaneously.
        </p>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function UserDepositPage({ secretKey }) {
  const flow = useDepositFlow()
  const [serverError, setServerError] = React.useState('')

  // Start WebSocket listener once deposit is submitted (step === 'success')
  // internalUserId = org's DB user ID from submit response (used for WS channel)
  const echoUserId = flow.step === 'success' ? flow.internalUserId : null
  const echoRef    = flow.step === 'success' ? flow.referenceId    : null
  const { depositEvent: socketEvent, wsStatus } = useDepositEcho(echoUserId, secretKey, echoRef)

  // Use socket event if it arrives, otherwise fall back to the pre-populated
  // event from the HTTP response (deposit was already completed server-side)
  const depositEvent = socketEvent ?? flow.initialDepositEvent

  // Toast when live socket event arrives (not for the pre-populated one)
  React.useEffect(() => {
    if (!socketEvent) return
    if (socketEvent.status === 'completed') {
      toast.success('Payment confirmed! Your balance has been credited.')
    } else if (socketEvent.status === 'failed') {
      toast.error('Payment verification failed. Please contact support.')
    }
  }, [socketEvent])

  async function handleStep1Next(amount) {
    flow.setLoading(true)
    setServerError('')
    try {
      const [qrRes, refRes] = await Promise.all([
        generateDepositQR(secretKey),
        generateReference(secretKey, { network: 'TRC20', user_account_id: MOCK_USER.id, user_name: MOCK_USER.name }),
      ])

      if (!qrRes.ok)  { toast.error(extractServerError(qrRes.data));  return }
      if (!refRes.ok) { toast.error(extractServerError(refRes.data)); return }

      const { walletAddress, qrImage } = extractQrData(qrRes.data)
      const referenceId = extractReference(refRes.data)

      flow.setAmount(amount)
      flow.setWalletAddress(walletAddress)
      flow.setQrImage(qrImage)
      flow.setReferenceId(referenceId)
      flow.setPaymentExpiry(Date.now() + 30 * 60 * 1000)
      flow.goToStep(2)
      toast.success('Payment details ready!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      flow.setLoading(false)
    }
  }

  async function handleStep3Submit(txHash) {
    flow.setLoading(true)
    setServerError('')
    try {
      const result = await submitUserDeposit(secretKey, {
        reference: flow.referenceId,
        tx_hash:   txHash,
        user_account_id:   String(MOCK_USER.id),
        amount:    flow.amount,
        user_name: MOCK_USER.name,
      })

      if (!result.ok) {
        const msg = extractServerError(result.data)
        setServerError(msg)
        toast.error(msg)
        return
      }

      const data = result.data?.data ?? result.data

      flow.setTxHash(txHash)
      // Capture the internal org user_id for WebSocket channel subscription
      flow.setInternalUserId(data?.user_id ?? null)

      // If the server already completed the deposit (status = 'completed'),
      // pre-populate the deposit event so the UI shows confirmed immediately.
      // The WebSocket subscription is still started as a live fallback.
      if (data?.status === 'completed') {
        flow.setInitialDepositEvent({
          reference:       data.reference,
          tx_hash:         data.tx_hash,
          amount:          data.amount,
          status:          'completed',
          user_account_id: data.user_account_id,
          user_name:       data.user_name,
          explorer:        data.explorer,
          verified_at:     null,
        })
        toast.success('Deposit confirmed!')
      } else {
        toast.success('Deposit submitted! Waiting for confirmation…')
      }

      flow.goToStep('success')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      flow.setLoading(false)
    }
  }

  const hasKey    = !!secretKey
  const showSteps = hasKey && flow.step !== 'success'

  return (
    <div className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">

      {flow.step !== 'success' && (
        <div className="text-center mb-6">
          <h1 className="mb-1">Deposit Funds</h1>
          <p>Fast, secure USDT deposits via TRC20 network</p>
        </div>
      )}

      {showSteps && <DepositSteps current={flow.step} />}

      {!hasKey && <NoKeyPrompt />}

      {hasKey && flow.step === 1 && (
        <Step1Amount user={MOCK_USER} loading={flow.loading} onNext={handleStep1Next} />
      )}

      {hasKey && flow.step === 2 && (
        <Step2Payment
          walletAddress={flow.walletAddress}
          qrImage={flow.qrImage}
          referenceId={flow.referenceId}
          amount={flow.amount}
          paymentExpiry={flow.paymentExpiry}
          onBack={() => { setServerError(''); flow.goToStep(1) }}
          onContinue={() => { setServerError(''); flow.goToStep(3) }}
        />
      )}

      {hasKey && flow.step === 3 && (
        <Step3TxHash
          user={MOCK_USER}
          amount={flow.amount}
          referenceId={flow.referenceId}
          loading={flow.loading}
          serverError={serverError}
          onBack={() => { setServerError(''); flow.goToStep(2) }}
          onSubmit={handleStep3Submit}
        />
      )}

      {flow.step === 'success' && (
        <SuccessView
          amount={flow.amount}
          referenceId={flow.referenceId}
          txHash={flow.txHash}
          wsStatus={wsStatus}
          depositEvent={depositEvent}
          onReset={flow.reset}
        />
      )}
    </div>
  )
}
