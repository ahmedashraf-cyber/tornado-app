import { useState, useEffect, useCallback } from 'react'
import { GK_TYPE_RADIO, GK_OUTCOME_RADIO, GK_MISCOMMUNICATION_RADIO } from '../data/eventDefinitions'

// ── Goalkeeper 3-step qualifier ──
// Step 1: Type    — 8 options in 2 rows
// Step 2: Outcome — [1]Won [3]Success [4]Fail [5]Second effort
// Step 3: Miscommunication — [1] Miscommunication  (video: Punch_Tagging)

const STEPS = [
  { key: 'type',             label: 'Type' },
  { key: 'outcome',          label: 'Outcome' },
  { key: 'miscommunication', label: 'Miscommunication' },
]

export default function GKQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('type')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'type') {
      const opt = GK_TYPE_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('gkType', opt.value); setActiveStep('outcome') }
    } else if (activeStep === 'outcome') {
      const opt = GK_OUTCOME_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('gkOutcome', opt.value); setActiveStep('miscommunication') }
    } else if (activeStep === 'miscommunication') {
      const opt = GK_MISCOMMUNICATION_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('gkMiscommunication', opt.value)
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleTypeSelect(val) {
    onQualifierChange('gkType', val)
    setActiveStep('outcome')
  }
  function handleOutcomeSelect(val) {
    onQualifierChange('gkOutcome', val)
    setActiveStep('miscommunication')
  }
  function handleMiscomSelect(val) {
    onQualifierChange('gkMiscommunication', val)
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
                <div className={`h-0.5 w-14 mx-1 mb-3 ${isDone ? 'bg-[#1e3a6e]' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Type step — 2 rows: [1-5] and [6-8] */}
      {activeStep === 'type' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            {GK_TYPE_RADIO.slice(0, 5).map(opt => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={qualifiers.gkType === opt.value}
                  onChange={() => handleTypeSelect(opt.value)} className="accent-[#1e3a6e] w-3 h-3" />
                <span className="text-xs text-gray-700">
                  <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {GK_TYPE_RADIO.slice(5).map(opt => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={qualifiers.gkType === opt.value}
                  onChange={() => handleTypeSelect(opt.value)} className="accent-[#1e3a6e] w-3 h-3" />
                <span className="text-xs text-gray-700">
                  <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Outcome step */}
      {activeStep === 'outcome' && (
        <div className="flex items-center gap-3 flex-wrap">
          {GK_OUTCOME_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.gkOutcome === opt.value}
                onChange={() => handleOutcomeSelect(opt.value)} className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Miscommunication step */}
      {activeStep === 'miscommunication' && (
        <div className="flex items-center gap-3">
          {GK_MISCOMMUNICATION_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.gkMiscommunication === opt.value}
                onChange={() => handleMiscomSelect(opt.value)} className="accent-[#1e3a6e] w-3 h-3" />
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
