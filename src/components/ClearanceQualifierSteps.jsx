import { useState, useEffect, useCallback } from 'react'
import { CLEARANCE_BODY_RADIO } from '../data/eventDefinitions'

// ── Clearance 2-step qualifier (Video: Clear_Tag) ──
// Step 1: Body part  — [2] Right foot  [3] Left foot  [4] Head  [9] Other
// Step 2: Miscommunication — [1] Miscommunication

const STEPS = [
  { key: 'body',             label: 'Body part' },
  { key: 'miscommunication', label: 'Miscommunication' },
]

export default function ClearanceQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('body')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'body') {
      const opt = CLEARANCE_BODY_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('clearanceBody', opt.value); setActiveStep('miscommunication') }
    } else if (activeStep === 'miscommunication') {
      if (key === '1') {
        onQualifierChange('clearanceMiscommunication', 'miscommunication')
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleBodySelect(val) {
    onQualifierChange('clearanceBody', val)
    setActiveStep('miscommunication')
  }
  function handleMiscomSelect(val) {
    onQualifierChange('clearanceMiscommunication', val)
    if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
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

      {/* Body part step */}
      {activeStep === 'body' && (
        <div className="flex items-center gap-3 flex-wrap">
          {CLEARANCE_BODY_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={qualifiers.clearanceBody === opt.value}
                onChange={() => handleBodySelect(opt.value)}
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

      {/* Miscommunication step */}
      {activeStep === 'miscommunication' && (
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={qualifiers.clearanceMiscommunication === 'miscommunication'}
            onChange={() => handleMiscomSelect('miscommunication')}
            className="accent-[#1e3a6e] w-3 h-3"
          />
          <span className="text-xs text-gray-700">
            <span className="text-gray-400 mr-0.5">[1]</span>
            Miscommunication
          </span>
        </label>
      )}
    </div>
  )
}
