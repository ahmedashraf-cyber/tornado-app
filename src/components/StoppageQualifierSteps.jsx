import { useState, useEffect, useCallback } from 'react'
import { STOPPAGE_TYPE_RADIO, STOPPAGE_PAUSED_RADIO } from '../data/eventDefinitions'

// ── Stoppage 2-step qualifier (video: Stoppage_Tag) ──
// Step 1: Type   — [1] Injury  [2] Review  [3] Other  [4] Abandoned → auto-advances
// Step 2: Paused — [1] Yes  [2] No → auto-confirms
//
// Left summary: • Type: Injury ▾  • Paused: Yes ▾

const STEPS = [
  { key: 'type',   label: 'Type'   },
  { key: 'paused', label: 'Paused' },
]

export default function StoppageQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('type')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'type') {
      const opt = STOPPAGE_TYPE_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('stoppageType', opt.value)
        setActiveStep('paused')
      }
    } else if (activeStep === 'paused') {
      const opt = STOPPAGE_PAUSED_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('stoppagePaused', opt.value)
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const activeIdx = STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {/* Progress bar */}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isActive = step.key === activeStep
          const isDone = i < activeIdx
          const isLast = i === STEPS.length - 1
          return (
            <div key={step.key} className="flex items-center">
              <button onClick={() => setActiveStep(step.key)} className="flex flex-col items-center gap-0.5 focus:outline-none">
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  isActive || isDone ? 'bg-[#1e3a6e] border-[#1e3a6e]' : 'bg-white border-gray-400'
                }`} />
                <span className={`text-[10px] font-semibold whitespace-nowrap ${
                  isActive || isDone ? 'text-[#1e3a6e]' : 'text-gray-400'
                }`}>{step.label}</span>
              </button>
              {!isLast && (
                <div className={`h-0.5 w-16 mx-1 mb-3 ${isDone ? 'bg-[#1e3a6e]' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Type step — 4 options in one row */}
      {activeStep === 'type' && (
        <div className="flex items-center gap-4 flex-wrap">
          {STOPPAGE_TYPE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.stoppageType === opt.value}
                onChange={() => {
                  onQualifierChange('stoppageType', opt.value)
                  setActiveStep('paused')
                }}
                className="accent-[#1e3a6e] w-3 h-3"
              />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Paused step */}
      {activeStep === 'paused' && (
        <div className="flex items-center gap-4 flex-wrap">
          {STOPPAGE_PAUSED_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.stoppagePaused === opt.value}
                onChange={() => {
                  onQualifierChange('stoppagePaused', opt.value)
                  if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
                }}
                className="accent-[#1e3a6e] w-3 h-3"
              />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
