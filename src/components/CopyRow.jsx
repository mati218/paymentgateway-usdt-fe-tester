import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Copy, Check } from 'lucide-react'

export default function CopyRow({ value, label }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      toast.success(`${label || 'Value'} copied!`)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="copy-row">
      <span title={value}>{value}</span>
      <button className="btn btn-outline btn-sm" onClick={copy} style={{ flexShrink: 0 }}>
        {copied
          ? <><Check size={13} /> Copied</>
          : <><Copy size={13} /> Copy</>}
      </button>
    </div>
  )
}
