import { useState, useEffect, useCallback } from 'react'
import {
  GK_TYPE_RADIO, GK_OUTCOME_RADIO, GK_MISCOMMUNICATION_RADIO,
  GK_SMOTHER_KIND_RADIO, GK_SMOTHER_EXTRAS_RADIO
} from '../data/eventDefinitions'

// ── Goalkeeper multi-step qualifier ──
// Normal GK (non-smother):  3 steps: Type → Outcome → Miscommunication
// Smother (video Smother_Tag_1/2):  4 steps: Type → Outcome → Kind (checkbox) → Extras (checkboxes)
//
// Kind step:   [1] Dribble attempted  — checkbox, optional → auto-advances
// Extras step: [1] No touch  [2] Nutmeg — checkboxes, optional → confirm via Enter or autoconfirm

const NORMAL_STEPS = [
  { key: 'type',             label: 'Type'             },
  { key: 'outcome',          label: 'Outcome'          },
  { key: 'miscommunication', label: 'Miscommunication' },
]
const SMOTHER_STEPS = [
  { key: 'type',    label: 'Type'    },
  { key: 'outcome', label: 'Outcome' },
  { key: 'kind',    label: 'Kind'    },
  { key: 'extras',  label: 'Extras'  },
]

export default function GKQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const isSmother = qualifiers.gkType === 'smother'
  const STEPS = isSmother ? SMOTHER_STEPS : NORMAL_STEPS
  const [activeStep, setActiveStep] = useState('type')

  // Reset step when gkType changes to smother or away from smother
  useEffect(() => {
    if (activeStep === 'miscommunication' && isSmother) setActiveStep('kind')
    if ((activeStep === 'kind' || activeStep === 'extras') && !isSmother) setActiveStep('miscommunication')
  }, [isSmother])

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'type') {
      const opt = GK_TYPE_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('gkType', opt.value)
        setActiveStep('outcome')
      }
    } else if (activeStep === 'outcome') {
      const opt = GK_OUTCOME_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('gkOutcome', opt.value)
        setActiveStep(qualifiers.gkType === 'smother' || opt.value === 'smother' ? 'kind' : 'miscommunication')
      }
    } else if (activeStep === 'kind') {
      const opt = GK_SMOTHER_KIND_RADIO.find(o => o.key === key)
      if (opt) {
        // Toggle checkbox
        const current = qualifiers.gkSmotherKind
        onQualifierChange('gkSmotherKind', current === opt.value ? '' : opt.value)
        setActiveStep('extras')
      }
    } else if (activeStep === 'extras') {
      const opt = GK_SMOTHER_EXTRAS_RADIO.find(o => o.key === key)
      if (opt) {
        // Toggle extras checkbox
        const current = qualifiers.gkSmotherExtras || []
        const updated = current.includes(opt.value)
          ? current.filter(v => v !== opt.value)
          : [...current, opt.value]
        onQualifierChange('gkSmotherExtras', updated)
      }
    } else if (activeStep === 'miscommunication') {
      const opt = GK_MISCOMMUNICATION_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('gkMiscommunication', opt.value)
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, qualifiers, onQualifierChange, onAutoConfirm])

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
    // After outcome: smother → kind, others → miscommunication
    setActiveStep(isSmother ? 'kind' : 'miscommunication')
  }
  function handleMiscomSelect(val) {
    onQualifierChange('gkMiscommunication', val)
    if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
  }
  function toggleKind(val) {
    const current = qualifiers.gkSmotherKind
    onQualifierChange('gkSmotherKind', current === val ? '' : val)
    setActiveStep('extras')
  }
  function toggleExtras(val) {
    const current = qualifiers.gkSmotherExtras || []
    const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
    onQualifierChange('gkSmotherExtras', updated)
  }

  const activeStepIdx = STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {/* Step progress dots */}
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
                <div className={`h-0.5 w-12 mx-1 mb-3 ${isDone ? 'bg-[#1e3a6e]' : 'bg-gray-300'}`} />
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

      {/* Kind step — checkbox (Smother only) */}
      {activeStep === 'kind' && (
        <div className="flex items-center gap-4 flex-wrap">
          {GK_SMOTHER_KIND_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={qualifiers.gkSmotherKind === opt.value}
                onChange={() => toggleKind(opt.value)}
                className="accent-[#1e3a6e] w-3 h-3"
              />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Extras step — checkboxes (Smother only) */}
      {activeStep === 'extras' && (
        <div className="flex items-center gap-4 flex-wrap">
          {/* Show selected Kind as removable badge */}
          {qualifiers.gkSmotherKind && (
            <span className="flex items-center gap-1 bg-[#1e3a6e] text-white text-xs px-2 py-0.5 rounded-full">
              {GK_SMOTHER_KIND_RADIO.find(o => o.value === qualifiers.gkSmotherKind)?.label}
              <button
                onClick={() => onQualifierChange('gkSmotherKind', '')}
                className="ml-1 text-white/70 hover:text-white text-xs leading-none"
              >×</button>
            </span>
          )}
          {GK_SMOTHER_EXTRAS_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={(qualifiers.gkSmotherExtras || []).includes(opt.value)}
                onChange={() => toggleExtras(opt.value)}
                className="accent-[#1e3a6e] w-3 h-3"
              />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Miscommunication step (non-smother) */}
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
