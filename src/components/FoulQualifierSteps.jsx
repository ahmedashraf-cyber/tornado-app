import { useState, useEffect, useCallback } from 'react'
import { FOUL_TYPE_RADIO, FOUL_OUTCOME_RADIO, FOUL_ACTION_RADIO } from '../data/eventDefinitions'

// ── Foul Committed 3-step qualifier (Video: Foul_Committed_Tag) ──
// Step 1: Type    — [1] Regular [2] Handball [3] Foul out [4] Six seconds [5] Backpass pick [6] Dangerous play [7] Dive [8] Offside
// Step 2: Outcome — [1] Advantage [2] Penalty  (skippable — move to Action if neither applies)
// Step 3: Action  — [1] No card [2] Yellow card [3] Second yellow [4] Red card
// Auto-advances after each selection

function RadioRow({ options, value, onChange }) {
  // Split into rows of max 5
  const row1 = options.slice(0, 5)
  const row2 = options.slice(5)
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-4 flex-wrap">
        {row1.map(opt => (
          <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[#1e3a6e] w-3 h-3"
            />
            <span className="text-xs text-gray-700">
              <span className="text-gray-400 mr-0.5">[{opt.key}]</span>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {row2.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {row2.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
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
    </div>
  )
}

const STEPS = [
  { key: 'type',    label: 'Type' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'action',  label: 'Action' },
]

export default function FoulQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('type')

  // Keyboard [1]-[8] mapped to current step options
  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'type') {
      const opt = FOUL_TYPE_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('foulType', opt.value); setActiveStep('outcome') }
    } else if (activeStep === 'outcome') {
      const opt = FOUL_OUTCOME_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('foulOutcome', opt.value); setActiveStep('action') }
    } else if (activeStep === 'action') {
      const opt = FOUL_ACTION_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('foulAction', opt.value)
        // Auto-confirm after action selected
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleTypeSelect(val) {
    onQualifierChange('foulType', val)
    setActiveStep('outcome')
  }
  function handleOutcomeSelect(val) {
    onQualifierChange('foulOutcome', val)
    setActiveStep('action')
  }
  function handleActionSelect(val) {
    onQualifierChange('foulAction', val)
    if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
  }

  const activeStepIdx = STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {/* Step dots progress bar */}
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

      {/* Step content */}
      {activeStep === 'type' && (
        <RadioRow
          options={FOUL_TYPE_RADIO}
          value={qualifiers.foulType || ''}
          onChange={handleTypeSelect}
        />
      )}
      {activeStep === 'outcome' && (
        <RadioRow
          options={FOUL_OUTCOME_RADIO}
          value={qualifiers.foulOutcome || ''}
          onChange={handleOutcomeSelect}
        />
      )}
      {activeStep === 'action' && (
        <RadioRow
          options={FOUL_ACTION_RADIO}
          value={qualifiers.foulAction || ''}
          onChange={handleActionSelect}
        />
      )}
    </div>
  )
}
