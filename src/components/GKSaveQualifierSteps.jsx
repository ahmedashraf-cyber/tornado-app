import { useState, useEffect, useCallback } from 'react'
import { GK_BODY_PART_OPTIONS, GK_TECHNIQUE_OPTIONS } from '../data/eventDefinitions'

// ── GK Save Attempt 5-step qualifier (Video: Save_Tagging) ──
// Only triggered when gkType = 'save_attempt'
// Steps: Body state → Body part → Technique → Extras → Miscommunication

const BODY_STATE_RADIO = [
  { key: '1', value: 'set',    label: 'Set'    },
  { key: '2', value: 'prone',  label: 'Prone'  },
  { key: '3', value: 'moving', label: 'Moving' },
]

const TECHNIQUE_RADIO = [
  { key: '1', value: 'diving',   label: 'Diving'   },
  { key: '2', value: 'standing', label: 'Standing' },
]

const STEPS = [
  { key: 'body_state',         label: 'Body state'       },
  { key: 'body_part',          label: 'Body part'        },
  { key: 'technique',          label: 'Technique'        },
  { key: 'extras',             label: 'Extras'           },
  { key: 'miscommunication',   label: 'Miscommunication' },
]

export default function GKSaveQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('body_state')

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (activeStep === 'body_state') {
      const opt = BODY_STATE_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('gkBodyState', opt.value); setActiveStep('body_part') }
    } else if (activeStep === 'technique') {
      const opt = TECHNIQUE_RADIO.find(o => o.key === key)
      if (opt) { onQualifierChange('gkTechnique', opt.value); setActiveStep('extras') }
    }
    // body_part, extras, miscommunication handled by dropdowns/text inputs
  }, [active, activeStep, onQualifierChange])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const q = (k) => qualifiers[k] || ''
  const set = (k) => (v) => onQualifierChange(k, v)
  const activeStepIdx = STEPS.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* 5-step progress bar */}
      <div className="flex items-center flex-wrap gap-0">
        {STEPS.map((step, i) => {
          const isActive = step.key === activeStep
          const isDone = i < activeStepIdx
          const isLast = i === STEPS.length - 1
          return (
            <div key={step.key} className="flex items-center">
              <button onClick={() => setActiveStep(step.key)} className="flex flex-col items-center gap-0.5 focus:outline-none">
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${isActive || isDone ? 'bg-[#1e3a6e] border-[#1e3a6e]' : 'bg-white border-gray-400'}`} />
                <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive || isDone ? 'text-[#1e3a6e]' : 'text-gray-400'}`}>{step.label}</span>
              </button>
              {!isLast && <div className={`h-0.5 w-10 mx-0.5 mb-3 ${isDone ? 'bg-[#1e3a6e]' : 'bg-gray-300'}`} />}
            </div>
          )
        })}
      </div>

      {/* Body state step */}
      {activeStep === 'body_state' && (
        <div className="flex items-center gap-3 flex-wrap">
          {BODY_STATE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={q('gkBodyState') === opt.value}
                onChange={() => { onQualifierChange('gkBodyState', opt.value); setActiveStep('body_part') }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Body part step — dropdown */}
      {activeStep === 'body_part' && (
        <div className="flex items-center gap-2">
          <select value={q('gkBodyPart')} onChange={e => { set('gkBodyPart')(e.target.value); setActiveStep('technique') }}
            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 text-gray-800">
            <option value="">– Body part –</option>
            {GK_BODY_PART_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Technique step */}
      {activeStep === 'technique' && (
        <div className="flex items-center gap-3 flex-wrap">
          {TECHNIQUE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={q('gkTechnique') === opt.value}
                onChange={() => { onQualifierChange('gkTechnique', opt.value); setActiveStep('extras') }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Extras step — free text */}
      {activeStep === 'extras' && (
        <div className="flex items-center gap-2">
          <input type="text" value={q('gkExtras')} onChange={e => set('gkExtras')(e.target.value)}
            placeholder="Edit field" onKeyDown={e => { if (e.key === 'Enter') setActiveStep('miscommunication') }}
            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 min-w-[7rem] text-gray-800 placeholder-gray-400" />
          <button onClick={() => setActiveStep('miscommunication')}
            className="text-xs text-[#1e3a6e] underline">Next →</button>
        </div>
      )}

      {/* Miscommunication step — free text + auto-confirm */}
      {activeStep === 'miscommunication' && (
        <div className="flex items-center gap-2">
          <input type="text" value={q('gkMiscommunicationText')} onChange={e => set('gkMiscommunicationText')(e.target.value)}
            placeholder="Edit field"
            className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 min-w-[7rem] text-gray-800 placeholder-gray-400" />
          {onAutoConfirm && (
            <button onClick={onAutoConfirm}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded">✓</button>
          )}
        </div>
      )}
    </div>
  )
}
