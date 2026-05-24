import { useState, useEffect, useCallback } from 'react'

// ── Pass step definitions per Type ──────────────────────────────────────────

const HEIGHT_OPTIONS = [
  { key: '1', value: 'ground', label: 'Ground' },
  { key: '2', value: 'low',    label: 'Low'    },
  { key: '3', value: 'high',   label: 'High'   },
]

const BODY_PART_OPTIONS = [
  { key: '2', value: 'right_foot',  label: 'Right foot'  },
  { key: '3', value: 'left_foot',   label: 'Left foot'   },
  { key: '4', value: 'head',        label: 'Head'        },
  { key: '5', value: 'keeper_arm',  label: 'Keeper arm'  },
  { key: '6', value: 'drop_kick',   label: 'Drop kick'   },
  { key: '7', value: 'no_touch',    label: 'No touch'    },
  { key: '1', value: 'other',       label: 'Other'       },
]

// Extras vary by pass type
const EXTRAS_BY_TYPE = {
  // Open play, kick_off, free_kick, goal_kick, recovery, interception, first_time
  default: [
    { key: '1', value: 'through_ball',      label: 'Through ball'    },
    { key: '2', value: 'backheel',          label: 'Backheel'        },
    { key: '3', value: 'injury_clearance',  label: 'Injury clearance'},
  ],
  // Aerial won available as extra when head is body part
  aerial: [
    { key: '1', value: 'through_ball',      label: 'Through ball'    },
    { key: '2', value: 'aerial_won',        label: 'Aerial won'      },
    { key: '3', value: 'injury_clearance',  label: 'Injury clearance'},
  ],
  // Corner pass extras
  corner: [
    { key: '1', value: 'inswinging',        label: 'Inswinging'      },
    { key: '2', value: 'outswinging',       label: 'Outswinging'     },
    { key: '3', value: 'straight',          label: 'Straight'        },
  ],
  // Throw-in: no extras step (body part = None auto)
  throw_in: [],
}

// Technique step — only for corner
const TECHNIQUE_OPTIONS = [
  { key: '1', value: 'near_post',  label: 'Near post'  },
  { key: '2', value: 'far_post',   label: 'Far post'    },
  { key: '3', value: 'short',      label: 'Short'       },
]

// Get steps for a given pass type + body part selection
function getSteps(passType, bodyPart) {
  const isCorner   = passType === 'corner'
  const isThrowIn  = passType === 'throw_in'
  const isAerial   = bodyPart === 'head'

  const extrasOptions = isCorner  ? EXTRAS_BY_TYPE.corner
                      : isThrowIn ? EXTRAS_BY_TYPE.throw_in
                      : isAerial  ? EXTRAS_BY_TYPE.aerial
                      : EXTRAS_BY_TYPE.default

  const steps = [
    { key: 'height',    label: 'Height',    options: HEIGHT_OPTIONS },
    { key: 'body_part', label: 'Body part', options: BODY_PART_OPTIONS },
  ]

  if (!isThrowIn) {
    steps.push({ key: 'extras', label: 'Extras', options: extrasOptions })
  }

  if (isCorner) {
    steps.push({ key: 'technique', label: 'Technique', options: TECHNIQUE_OPTIONS })
  }

  return steps
}

// ── Step indicator (the ●————○————○ line) ───────────────────────────────────
function StepIndicator({ steps, activeStep, onStepClick }) {
  return (
    <div className="flex items-center gap-0 flex-shrink-0">
      {steps.map((step, i) => {
        const isActive   = step.key === activeStep
        const isDone     = steps.findIndex(s => s.key === activeStep) > i
        const isLast     = i === steps.length - 1

        return (
          <div key={step.key} className="flex items-center">
            {/* Step dot + label */}
            <button
              onClick={() => onStepClick(step.key)}
              className="flex flex-col items-center gap-0.5 focus:outline-none"
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                isActive
                  ? 'bg-[#1e3a6e] border-[#1e3a6e]'
                  : isDone
                  ? 'bg-[#1e3a6e] border-[#1e3a6e]'
                  : 'bg-white border-gray-400'
              }`} />
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                isActive ? 'text-[#1e3a6e]' : isDone ? 'text-[#1e3a6e]' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </button>
            {/* Connector line */}
            {!isLast && (
              <div className={`h-0.5 w-16 mx-1 mb-3 ${isDone || isActive ? 'bg-gray-400' : 'bg-gray-300'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Radio option row ─────────────────────────────────────────────────────────
function RadioOptions({ options, value, onChange }) {
  if (!options || options.length === 0) {
    return <span className="text-xs text-gray-400 italic">No options for this type</span>
  }
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="radio"
            name={`pass_step_${opt.value}`}
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
  )
}

// ── Main PassQualifierSteps component ───────────────────────────────────────
export default function PassQualifierSteps({ passType, qualifiers, onQualifierChange, active }) {
  const [activeStep, setActiveStep] = useState('height')

  const steps = getSteps(passType, qualifiers.passBody)

  // Auto-advance to next step when a value is selected
  function handleSelect(stepKey, value) {
    // Map step key → qualifier key
    const qMap = {
      height:    'passHeight',
      body_part: 'passBody',
      extras:    'passExtra',
      technique: 'passTechnique',
    }
    onQualifierChange(qMap[stepKey], value)

    // Auto-advance to next step
    const idx = steps.findIndex(s => s.key === stepKey)
    if (idx < steps.length - 1) {
      setActiveStep(steps[idx + 1].key)
    }
  }

  // Keyboard: number keys select radio option on active step
  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key
    const currentStep = steps.find(s => s.key === activeStep)
    if (!currentStep) return
    const opt = currentStep.options.find(o => o.key === key)
    if (opt) {
      handleSelect(activeStep, opt.value)
    }
  }, [activeStep, steps, qualifiers])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Reset to height step when pass type changes
  useEffect(() => {
    setActiveStep('height')
  }, [passType])

  // When body part changes to/from head, re-check extras step options
  // (steps recalculated above via getSteps)

  const currentStep = steps.find(s => s.key === activeStep)
  const qMap = { height: 'passHeight', body_part: 'passBody', extras: 'passExtra', technique: 'passTechnique' }
  const currentValue = qualifiers[qMap[activeStep]] || ''

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0 py-1 px-3">
      {/* Step indicator row */}
      <StepIndicator
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
      />
      {/* Radio options row */}
      {currentStep && (
        <RadioOptions
          options={currentStep.options}
          value={currentValue}
          onChange={(val) => handleSelect(activeStep, val)}
        />
      )}
    </div>
  )
}
