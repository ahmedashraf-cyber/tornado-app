import { useState, useEffect, useCallback } from 'react'
import { DRIBBLE_TYPE_RADIO, DRIBBLE_EXTRAS_RADIO } from '../data/eventDefinitions'

// ── Dribble 2-step qualifier (Video: Dribble_Tagging) ──
// Step 1: Type   — [1] Overrun
// Step 2: Extras — [1] No touch  [2] Nutmeg
// Selected extra shown as removable badge

const STEPS = [
  { key: 'type',   label: 'Type' },
  { key: 'extras', label: 'Extras' },
]

export default function DribbleQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('type')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'type') {
      const opt = DRIBBLE_TYPE_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('dribbleType', opt.value); setActiveStep('extras') }
    } else if (activeStep === 'extras') {
      const opt = DRIBBLE_EXTRAS_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('dribbleExtras', opt.value)
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleTypeSelect(val) {
    onQualifierChange('dribbleType', val)
    setActiveStep('extras')
  }
  function handleExtrasSelect(val) {
    onQualifierChange('dribbleExtras', val)
    if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
  }
  function clearExtra() {
    onQualifierChange('dribbleExtras', null)
  }

  const activeStepIdx = STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {/* Step dots */}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isActive = step.key === activeStep
          const isDone = i < activeStepIdx
          const isLast = i === STEPS.length - 1
          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.key)}
                className="flex flex-col items-center gap-0.5 focus:outline-none"
              >
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

      {/* Type step */}
      {activeStep === 'type' && (
        <div className="flex items-center gap-3">
          {DRIBBLE_TYPE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.dribbleType === opt.value}
                onChange={() => handleTypeSelect(opt.value)}
                className="accent-[#1e3a6e] w-3 h-3"
              />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Extras step */}
      {activeStep === 'extras' && (
        <div className="flex items-center gap-3 flex-wrap">
          {qualifiers.dribbleExtras ? (
            // Show selected as removable badge
            <span className="flex items-center gap-1 bg-[#1e3a6e] text-white text-xs px-2 py-0.5 rounded">
              {DRIBBLE_EXTRAS_RADIO.find(o => o.value === qualifiers.dribbleExtras)?.label || qualifiers.dribbleExtras}
              <button onClick={clearExtra} className="text-white/70 hover:text-white ml-0.5 font-bold leading-none">×</button>
            </span>
          ) : (
            DRIBBLE_EXTRAS_RADIO.map(opt => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={qualifiers.dribbleExtras === opt.value}
                  onChange={() => handleExtrasSelect(opt.value)}
                  className="accent-[#1e3a6e] w-3 h-3"
                />
                <span className="text-xs text-gray-700">
                  <span className="text-gray-400 mr-0.5">[{opt.key}]</span>
                  {opt.label}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
