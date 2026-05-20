import { useState, useCallback } from 'react'

/**
 * Central state for the entire deposit flow.
 * Exported as a custom hook — no external state library needed.
 */
export function useFlowStore() {
  // ── Config ──────────────────────────────────────────────────
  const [baseURL, setBaseURL]       = useState('https://api.aipay247.com')
  const [secretKey, setSecretKey]   = useState('')

  // ── Step tracking ────────────────────────────────────────────
  // 1 = Secret Key  2 = QR Code  3 = Reference  4 = Submit  5 = Status
  const [currentStep, setCurrentStep] = useState(1)

  // ── API responses ────────────────────────────────────────────
  const [qrResult,        setQrResult]        = useState(null)
  const [referenceResult, setReferenceResult] = useState(null)
  const [submitResult,    setSubmitResult]    = useState(null)
  const [statusResult,    setStatusResult]    = useState(null)

  // ── Reference form fields ────────────────────────────────────
  const [refNetwork, setRefNetwork] = useState('TRC20')
  const [refName,    setRefName]    = useState('')

  // ── Submit form fields ───────────────────────────────────────
  const [submitReference,   setSubmitReference]   = useState('')
  const [submitTxHash,      setSubmitTxHash]      = useState('')
  const [submitFromAddress, setSubmitFromAddress] = useState('')

  // ── Status check ─────────────────────────────────────────────
  const [statusRef, setStatusRef] = useState('')

  // ── Loading flags ────────────────────────────────────────────
  const [loadingQr,        setLoadingQr]        = useState(false)
  const [loadingReference, setLoadingReference] = useState(false)
  const [loadingSubmit,    setLoadingSubmit]    = useState(false)
  const [loadingStatus,    setLoadingStatus]    = useState(false)

  // ── Helpers ──────────────────────────────────────────────────
  const goToStep = useCallback((n) => setCurrentStep(n), [])

  /** Auto-fill reference into submit form after step 3 */
  const applyReferenceToSubmit = useCallback((ref) => {
    setSubmitReference(ref)
  }, [])

  return {
    // config
    baseURL, setBaseURL,
    secretKey, setSecretKey,
    // steps
    currentStep, goToStep,
    // qr
    qrResult, setQrResult,
    loadingQr, setLoadingQr,
    // reference
    referenceResult, setReferenceResult,
    refNetwork, setRefNetwork,
    refName, setRefName,
    loadingReference, setLoadingReference,
    applyReferenceToSubmit,
    // submit
    submitResult, setSubmitResult,
    submitReference, setSubmitReference,
    submitTxHash, setSubmitTxHash,
    submitFromAddress, setSubmitFromAddress,
    loadingSubmit, setLoadingSubmit,
    // status
    statusResult, setStatusResult,
    statusRef, setStatusRef,
    loadingStatus, setLoadingStatus,
  }
}
