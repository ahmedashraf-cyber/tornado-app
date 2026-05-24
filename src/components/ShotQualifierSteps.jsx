import { useState, useEffect, useCallback } from 'react'

// ── Shot 3-step qualifier (Videos: Shot_Tagging_1/3/4) ──
// Right side of qualifier strip: Body part → Technique → Gk body state
// Left side: Type dropdown (auto-populated)
// After all 3 steps → Outcome step

// Body part — keys are [2][3][4][1] per video
const BODY_PART_RADIO = [
  { key: '2', value: 'right_foot', label: 'Right foot' },
  { key: '3', value: 'left_foot',  label: 'Left foot'  },
  { key: '4', value: 'head',       label: 'Head'       },
  { key: '1', value: 'other',      label: 'Other'      },
]

// Technique — varies by shot type
const TECHNIQUE_OPEN_PLAY = [
  { key: '1', value: 'normal',        label: 'Normal'        },
  { key: '2', value: 'volley',        label: 'Volley'        },
  { key: '3', value: 'half_volley',   label: 'Half volley'   },
  { key: '4', value: 'overhead_kick', label: 'Overhead kick' },
  { key: '5', value: 'lob',          label: 'Lob'           },
  { key: '6', value: 'backheel',      label: 'Backheel'      },
]
const TECHNIQUE_FREE_KICK = [
  { key: '1', value: 'normal',   label: 'Normal'   },
  { key: '2', value: 'lob',      label: 'Lob'      },
  { key: '3', value: 'backheel', label: 'Backheel' },
]

// Gk body state — [1] Set [2] Prone [3] Moving [4] Off camera
const GK_BODY_STATE_RADIO = [
  { key: '1', value: 'set',        label: 'Set'        },
  { key: '2', value: 'prone',      label: 'Prone'      },
  { key: '3', value: 'moving',     label: 'Moving'     },
  { key: '4', value: 'off_camera', label: 'Off camera' },
]

// Outcome (End shot) — [1] Post  [2] Wayward  [3] Out endline
const OUTCOME_RADIO = [
  { key: '1', value: 'post',        label: 'Post'        },
  { key: '2', value: 'wayward',     label: 'Wayward'     },
  { key: '3', value: 'out_endline', label: 'Out endline' },
]

const STEPS = [
  { key: 'body_part',    label: 'Body part'    },
  { key: 'technique',    label: 'Technique'    },
  { key: 'gk_body_state',label: 'Gk body state'},
]

function getTechniqueOptions(shotType) {
  if (shotType === 'free_kick') return TECHNIQUE_FREE_KICK
  return TECHNIQUE_OPEN_PLAY
}

export default function ShotQualifierSteps({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const [activeStep, setActiveStep] = useState('body_part')
  const [showOutcome, setShowOutcome] = useState(false)

  const shotType = qualifiers.shotType || 'open_play'
  const techniqueOptions = getTechniqueOptions(shotType)

  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key

    if (!showOutcome) {
      if (activeStep === 'body_part') {
        const opt = BODY_PART_RADIO.find(o => o.key === key)
        if (opt) { onQualifierChange('shotBody', opt.value); setActiveStep('technique') }
      } else if (activeStep === 'technique') {
        const opt = techniqueOptions.find(o => o.key === key)
        if (opt) { onQualifierChange('shotTechnique', opt.value); setActiveStep('gk_body_state') }
      } else if (activeStep === 'gk_body_state') {
        const opt = GK_BODY_STATE_RADIO.find(o => o.key === key)
        if (opt) { onQualifierChange('shotGkBodyState', opt.value); setShowOutcome(true) }
      }
    } else {
      // Outcome step
      const opt = OUTCOME_RADIO.find(o => o.key === key)
      if (opt) {
        onQualifierChange('shotOutcome', opt.value)
        if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
      }
    }
  }, [active, activeStep, showOutcome, techniqueOptions, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const activeStepIdx = STEPS.findIndex(s => s.key === activeStep)

  // Outcome step — shown after 3 steps complete
  if (showOutcome) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
          <span className="text-xs font-semibold text-[#1e3a6e]">Outcome</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {OUTCOME_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.shotOutcome === opt.value}
                onChange={() => { onQualifierChange('shotOutcome', opt.value); if (onAutoConfirm) setTimeout(onAutoConfirm, 80) }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700">
                <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {/* 3-step progress bar */}
      <div className="flex items-center">
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
              {!isLast && <div className={`h-0.5 w-16 mx-1 mb-3 ${isDone ? 'bg-[#1e3a6e]' : 'bg-gray-300'}`} />}
            </div>
          )
        })}
      </div>

      {/* Body part step */}
      {activeStep === 'body_part' && (
        <div className="flex items-center gap-3 flex-wrap">
          {BODY_PART_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.shotBody === opt.value}
                onChange={() => { onQualifierChange('shotBody', opt.value); setActiveStep('technique') }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Technique step */}
      {activeStep === 'technique' && (
        <div className="flex items-center gap-3 flex-wrap">
          {techniqueOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.shotTechnique === opt.value}
                onChange={() => { onQualifierChange('shotTechnique', opt.value); setActiveStep('gk_body_state') }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Gk body state step */}
      {activeStep === 'gk_body_state' && (
        <div className="flex items-center gap-3 flex-wrap">
          {GK_BODY_STATE_RADIO.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={qualifiers.shotGkBodyState === opt.value}
                onChange={() => { onQualifierChange('shotGkBodyState', opt.value); setShowOutcome(true) }}
                className="accent-[#1e3a6e] w-3 h-3" />
              <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
