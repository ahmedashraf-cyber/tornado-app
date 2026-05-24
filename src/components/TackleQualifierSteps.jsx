import { useState, useEffect, useCallback } from 'react'
import { TACKLE_OUTCOME_RADIO, TACKLE_TYPE_RADIO } from '../data/eventDefinitions'

// ── Tackle 2-step qualifier (video: Tackle_Tagging_1/2) ──
// Step 1: Outcome — [1] Won  [2] Success  → auto-advances
// Step 2: Type    — [1] Dribble attempted (checkbox, optional) → auto-confirms
//
// After confirm: context → Loose on both sides when ball goes loose

const STEPS = [
  { key: 'outcome', label: 'Outcome' },
  { key: 'type',    label: 'Type'    },
]

export default function TackleQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('outcome')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'outcome') {
      const opt = TACKLE_OUTCOME_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('tackleOutcome', opt.value)
        setActiveStep('type')
      }
    } else if (activeStep === 'type') {
      const opt = TACKLE_TYPE_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('tackleType', opt.value)
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

      {/* Outcome step */}
      {activeStep === 'outcome' && (
        <div className="flex items-center gap-4 flex-wrap">
          {TACKLE_OUTCOME_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.tackleOutcome === opt.value}
                onChange={() => {
                  onQualifierChange('tackleOutcome', opt.value)
                  setActiveStep('type')
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

      {/* Type step — checkbox style (optional) */}
      {activeStep === 'type' && (
        <div className="flex items-center gap-4 flex-wrap">
          {TACKLE_TYPE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.tackleType === opt.value}
                onChange={() => {
                  onQualifierChange('tackleType', opt.value)
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
