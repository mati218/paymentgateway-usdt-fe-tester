import React from 'react'

const STEPS = [
  { n: 1, label: 'QR Code' },
  { n: 2, label: 'Reference' },
  { n: 3, label: 'Submit' },
  { n: 4, label: 'Status' },
]

export default function StepIndicator({ current }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const isDone   = s.n < current
        const isActive = s.n === current
        return (
          <React.Fragment key={s.n}>
            <div className="step-item">
              <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {isDone ? '✓' : s.n}
              </div>
              <span className={`step-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${isDone ? 'done' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
