import { useState, useCallback } from 'react'

export function useDepositFlow() {
  const [step, setStep]                   = useState(1) // 1 | 2 | 3 | 'success'
  const [amount, setAmount]               = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [qrImage, setQrImage]             = useState('')
  const [referenceId, setReferenceId]     = useState('')
  const [paymentExpiry, setPaymentExpiry] = useState(null)
  const [txHash, setTxHash]               = useState('')
  const [submitResult, setSubmitResult]   = useState(null)
  const [loading, setLoading]             = useState(false)
  // Internal org user ID returned by the submit response — used for WS channel
  const [internalUserId, setInternalUserId] = useState(null)
  // Pre-populated from the HTTP submit response when deposit is already completed.
  // Shown immediately so the user doesn't wait for a socket event that already fired.
  const [initialDepositEvent, setInitialDepositEvent] = useState(null)

  const goToStep = useCallback((n) => setStep(n), [])

  const reset = useCallback(() => {
    setStep(1)
    setAmount('')
    setWalletAddress('')
    setQrImage('')
    setReferenceId('')
    setPaymentExpiry(null)
    setTxHash('')
    setSubmitResult(null)
    setLoading(false)
    setInternalUserId(null)
    setInitialDepositEvent(null)
  }, [])

  return {
    step, goToStep,
    amount, setAmount,
    walletAddress, setWalletAddress,
    qrImage, setQrImage,
    referenceId, setReferenceId,
    paymentExpiry, setPaymentExpiry,
    txHash, setTxHash,
    submitResult, setSubmitResult,
    loading, setLoading,
    internalUserId, setInternalUserId,
    initialDepositEvent, setInitialDepositEvent,
    reset,
  }
}
