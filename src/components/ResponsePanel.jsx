import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ResponsePanel({ result, title = 'Response' }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const isOk = result.ok
  const json  = JSON.stringify(result.data, null, 2)

  function copyJson() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="response-panel">
      <div className="response-header">
        <span>
          <span className={`status-dot ${isOk ? 'ok' : 'err'}`} />
          {title} — HTTP {result.status}
        </span>
        <button className="btn btn-outline btn-sm" onClick={copyJson}>
          {copied ? '✓ Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="code-block">{json}</pre>
    </div>
  )
}
