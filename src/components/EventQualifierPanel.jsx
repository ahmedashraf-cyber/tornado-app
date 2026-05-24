import { useState, useEffect, useCallback } from 'react'
import {
  SHOT_TYPE_OPTIONS, SHOT_OUTCOME_OPTIONS, SHOT_BODY_PART_OPTIONS, SHOT_TECHNIQUE_OPTIONS,
  FOUL_TYPE_DROPDOWN,
  TACKLE_OUTCOME_OPTIONS, TACKLE_TYPE_OPTIONS,
  DRIBBLE_OUTCOME_OPTIONS, DRIBBLE_DIRECTION_OPTIONS,
  CLEARANCE_BODY_OPTIONS, CLEARANCE_TYPE_OPTIONS,
  BALL_RECOVERY_OUTCOME_OPTIONS,
  MISCONTROL_TYPE_OPTIONS,
  INTERCEPTION_OUTCOME_OPTIONS,
  CARD_TYPE_OPTIONS,
  STOPPAGE_TYPE_OPTIONS,
  GK_ACTION_OPTIONS, GK_OUTCOME_OPTIONS, GK_BODY_STATE_OPTIONS, GK_TECHNIQUE_OPTIONS,
  HALF_END_EXTRAS,
  SUBSTITUTION_REASON_OPTIONS,
  OUT_LOCATION_OPTIONS,
  BLOCK_OUTCOME_OPTIONS, BLOCK_TYPE_OPTIONS,
  ATTACKING_DIRECTION_OPTIONS,
  PASS_TYPE_DROPDOWN,
  NO_BASE_EVENTS,
} from '../data/eventDefinitions'
import PassQualifierSteps from './PassQualifierSteps'

// Inline dropdown
function QSelect({ label, options, value, onChange, required }) {
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xs text-gray-600">• {label}:</span>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`text-xs border rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 ${
          required && !value ? 'border-red-400 text-red-500' : 'border-gray-300 text-gray-800'
        }`}
      >
        <option value="">–</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </span>
  )
}

// Free-text field
function QText({ label, value, onChange, placeholder = 'Edit field', required }) {
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xs text-gray-600">• {label}:</span>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`text-xs border rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 min-w-[5rem] ${
          required && !value ? 'border-red-400 placeholder-red-300' : 'border-gray-300 text-gray-800 placeholder-gray-400'
        }`}
      />
    </span>
  )
}

// Pass end: Incomplete badge
function PassEndBadge() {
  return (
    <span className="flex items-center gap-1 flex-shrink-0">
      <span className="text-xs text-gray-600">• Pass end:</span>
      <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
        Incomplete
      </span>
    </span>
  )
}

// ── Corner / Goal kick radio (Video 6) ──────────────────────────────────────
// Shown when out_endline → collector picks [6] Corner or [8] Goal kick
function CornerOrGoalKickRadio({ value, onChange }) {
  return (
    <span className="flex items-center gap-3 flex-shrink-0">
      <span className="text-xs text-gray-600">• Type:</span>
      {[
        { key: '6', value: 'corner',    label: 'Corner'    },
        { key: '8', value: 'goal_kick', label: 'Goal kick' },
      ].map(opt => (
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
    </span>
  )
}

// ── Block 2-step qualifier (Video 14) ───────────────────────────────────────
// Step indicator: Type ●————○ Miscommunication
// Step 1 (Type): free text outcome
// Step 2 (Miscommunication): [1] Miscommunication radio
function BlockQualifierSteps({ qualifiers, onQualifierChange, active }) {
  const [activeStep, setActiveStep] = useState('type')

  const steps = [
    { key: 'type',              label: 'Type'              },
    { key: 'miscommunication',  label: 'Miscommunication'  },
  ]

  // Keyboard: [1] on miscommunication step
  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    if (e.key === '1' && activeStep === 'miscommunication') {
      onQualifierChange('blockMiscommunication', 'miscommunication')
    }
  }, [active, activeStep, onQualifierChange])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className="flex flex-col gap-1 flex-shrink-0">
      {/* Step dots */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isActive = step.key === activeStep
          const isDone   = steps.findIndex(s => s.key === activeStep) > i
          const isLast   = i === steps.length - 1
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
                <div className={`h-0.5 w-12 mx-1 mb-3 ${isDone || isActive ? 'bg-gray-400' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      {activeStep === 'type' && (
        <div className="flex items-center gap-2">
          <QSelect
            label="Block type"
            options={BLOCK_TYPE_OPTIONS}
            value={qualifiers.blockType || ''}
            onChange={(v) => { onQualifierChange('blockType', v); setActiveStep('miscommunication') }}
          />
        </div>
      )}
      {activeStep === 'miscommunication' && (
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={qualifiers.blockMiscommunication === 'miscommunication'}
            onChange={() => onQualifierChange('blockMiscommunication', 'miscommunication')}
            className="accent-[#1e3a6e] w-3 h-3"
          />
          <span className="text-xs text-gray-700">
            <span className="text-gray-400 mr-0.5">[1]</span>Miscommunication
          </span>
        </label>
      )}
    </div>
  )
}

export default function EventQualifierPanel({
  activeEvent,
  qualifiers,
  onQualifierChange,
  attackingDirection,
  onAttackingDirectionChange,
  teamsideStep,
  homeTeamName,
  awayTeamName,
  onTeamSelect,
  selectedTeam,
  passEndIncomplete,
  lastEvent,
  outLocation,
}) {
  if (!activeEvent) return null

  const cleanEvent = activeEvent.replace('_away', '')

  // Corner/Goal kick radio: shown when pass is active AND came from endline out
  const isEndlineContext = lastEvent === 'out' && outLocation === 'endline'
  const showCornerGoalKickRadio = cleanEvent === 'pass' && isEndlineContext

  // Keyboard for Corner/Goal kick [6]/[8]
  useEffect(() => {
    if (!showCornerGoalKickRadio || teamsideStep !== 'qualifiers') return
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      if (e.key === '6') onQualifierChange('passType', 'corner')
      if (e.key === '8') onQualifierChange('passType', 'goal_kick')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showCornerGoalKickRadio, teamsideStep, onQualifierChange])

  function q(key) { return qualifiers?.[key] || '' }
  function set(key) { return (val) => onQualifierChange(key, val) }

  const showPassEndBadge = passEndIncomplete && (
    cleanEvent === 'pass' || cleanEvent === 'interception' ||
    cleanEvent === 'ball_recovery' || cleanEvent === 'block'
  )

  return (
    <div className="flex-shrink-0 bg-[#e8eef4] border-b border-gray-300 px-3 py-1.5">

      {/* ── PASS: multi-step OR corner/goal kick radio ── */}
      {cleanEvent === 'pass' && teamsideStep !== 'team_select' && (
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {showPassEndBadge && <PassEndBadge />}

            {/* Corner/Goal kick radio (endline out context) */}
            {showCornerGoalKickRadio ? (
              <CornerOrGoalKickRadio
                value={q('passType')}
                onChange={set('passType')}
              />
            ) : (
              /* Normal Type dropdown */
              <span className="flex items-center gap-1">
                <span className="text-xs text-gray-600">• Type:</span>
                <select
                  value={q('passType')}
                  onChange={set('passType')}
                  className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 text-gray-800"
                >
                  <option value="">–</option>
                  {PASS_TYPE_DROPDOWN.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </span>
            )}
          </div>

          {/* Multi-step Height → Body part → Extras → Technique */}
          <PassQualifierSteps
            passType={q('passType')}
            qualifiers={qualifiers}
            onQualifierChange={onQualifierChange}
            active={teamsideStep === 'qualifiers'}
          />
        </div>
      )}

      {/* ── BLOCK: 2-step UI (Video 14) ── */}
      {cleanEvent === 'block' && teamsideStep !== 'team_select' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5">
          {showPassEndBadge && <PassEndBadge />}
          <QText label="Outcome" value={q('blockOutcome')} onChange={set('blockOutcome')} placeholder="Edit field" />
          <BlockQualifierSteps
            qualifiers={qualifiers}
            onQualifierChange={onQualifierChange}
            active={teamsideStep === 'qualifiers'}
          />
        </div>
      )}

      {/* ── ALL OTHER EVENTS ── */}
      {cleanEvent !== 'pass' && cleanEvent !== 'block' && (
        <div className="flex items-center gap-4 flex-wrap min-h-[1.6rem]">

          {showPassEndBadge && <PassEndBadge />}

          {/* Teams side selection */}
          {teamsideStep === 'team_select' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Teams side</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="teams_side" checked={selectedTeam === 'home'}
                  onChange={() => onTeamSelect('home')} className="accent-blue-600" />
                <span className="text-xs text-gray-700">[1] {homeTeamName}</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="teams_side" checked={selectedTeam === 'away'}
                  onChange={() => onTeamSelect('away')} className="accent-blue-600" />
                <span className="text-xs text-gray-700">[2] {awayTeamName}</span>
              </label>
            </div>
          )}

          {teamsideStep !== 'team_select' && (
            <>
              {cleanEvent === 'half_start' && (
                <QSelect label="Attacking direction" options={ATTACKING_DIRECTION_OPTIONS}
                  value={attackingDirection} onChange={onAttackingDirectionChange} required />
              )}
              {cleanEvent === 'shot' && (
                <>
                  <QSelect label="Type" options={SHOT_TYPE_OPTIONS} value={q('shotType')} onChange={set('shotType')} required />
                  <QSelect label="Outcome" options={SHOT_OUTCOME_OPTIONS} value={q('shotOutcome')} onChange={set('shotOutcome')} required />
                  <QSelect label="Body part" options={SHOT_BODY_PART_OPTIONS} value={q('shotBody')} onChange={set('shotBody')} required />
                  <QSelect label="Technique" options={SHOT_TECHNIQUE_OPTIONS} value={q('shotTechnique')} onChange={set('shotTechnique')} required />
                </>
              )}
              {cleanEvent === 'foul_committed' && (
                <>
                  <QSelect label="Type" options={FOUL_TYPE_DROPDOWN} value={q('foulType')} onChange={set('foulType')} required />
                  <QText label="Outcome" value={q('foulOutcome')} onChange={set('foulOutcome')} placeholder="Edit field" required />
                </>
              )}
              {cleanEvent === 'out' && (
                <QSelect label="Location" options={OUT_LOCATION_OPTIONS} value={q('outLocation')} onChange={set('outLocation')} required />
              )}
              {cleanEvent === 'tackle' && (
                <>
                  <QSelect label="Outcome" options={TACKLE_OUTCOME_OPTIONS} value={q('tackleOutcome')} onChange={set('tackleOutcome')} required />
                  <QSelect label="Type" options={TACKLE_TYPE_OPTIONS} value={q('tackleType')} onChange={set('tackleType')} required />
                </>
              )}
              {cleanEvent === 'dribble' && (
                <>
                  <QSelect label="Outcome" options={DRIBBLE_OUTCOME_OPTIONS} value={q('dribbleOutcome')} onChange={set('dribbleOutcome')} required />
                  <QSelect label="Direction" options={DRIBBLE_DIRECTION_OPTIONS} value={q('dribbleDirection')} onChange={set('dribbleDirection')} required />
                </>
              )}
              {cleanEvent === 'clearance' && (
                <>
                  <QSelect label="Body part" options={CLEARANCE_BODY_OPTIONS} value={q('clearanceBody')} onChange={set('clearanceBody')} required />
                  <QSelect label="Type" options={CLEARANCE_TYPE_OPTIONS} value={q('clearanceType')} onChange={set('clearanceType')} required />
                </>
              )}
              {cleanEvent === 'ball_recovery' && (
                <QSelect label="Outcome" options={BALL_RECOVERY_OUTCOME_OPTIONS} value={q('ballRecoveryOutcome')} onChange={set('ballRecoveryOutcome')} required />
              )}
              {cleanEvent === 'miscontrol' && (
                <QSelect label="Type" options={MISCONTROL_TYPE_OPTIONS} value={q('miscontrolType')} onChange={set('miscontrolType')} required />
              )}
              {cleanEvent === 'interception' && (
                <QSelect label="Outcome" options={INTERCEPTION_OUTCOME_OPTIONS} value={q('interceptionOutcome')} onChange={set('interceptionOutcome')} required />
              )}
              {cleanEvent === 'card' && (
                <QSelect label="Card type" options={CARD_TYPE_OPTIONS} value={q('cardType')} onChange={set('cardType')} required />
              )}
              {cleanEvent === 'stoppage' && (
                <QSelect label="Type" options={STOPPAGE_TYPE_OPTIONS} value={q('stoppageType')} onChange={set('stoppageType')} required />
              )}
              {cleanEvent === 'goal_keeper' && (
                <>
                  <QSelect label="Action" options={GK_ACTION_OPTIONS} value={q('gkAction')} onChange={set('gkAction')} required />
                  <QSelect label="Outcome" options={GK_OUTCOME_OPTIONS} value={q('gkOutcome')} onChange={set('gkOutcome')} required />
                  <QSelect label="Body state" options={GK_BODY_STATE_OPTIONS} value={q('gkBodyState')} onChange={set('gkBodyState')} />
                  <QSelect label="Technique" options={GK_TECHNIQUE_OPTIONS} value={q('gkTechnique')} onChange={set('gkTechnique')} />
                </>
              )}
              {cleanEvent === 'substitution' && (
                <QSelect label="Reason" options={SUBSTITUTION_REASON_OPTIONS} value={q('subReason')} onChange={set('subReason')} required />
              )}
              {cleanEvent === 'half_end' && (
                <QSelect label="Extra" options={HALF_END_EXTRAS} value={q('halfEndExtra')} onChange={set('halfEndExtra')} />
              )}
            </>
          )}
        </div>
      )}

      {/* Teams side for pass */}
      {cleanEvent === 'pass' && teamsideStep === 'team_select' && (
        <div className="flex items-center gap-3 py-0.5">
          <span className="text-xs font-semibold text-gray-700">Teams side</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="teams_side" checked={selectedTeam === 'home'}
              onChange={() => onTeamSelect('home')} className="accent-blue-600" />
            <span className="text-xs text-gray-700">[1] {homeTeamName}</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="teams_side" checked={selectedTeam === 'away'}
              onChange={() => onTeamSelect('away')} className="accent-blue-600" />
            <span className="text-xs text-gray-700">[2] {awayTeamName}</span>
          </label>
        </div>
      )}

      {/* Teams side for block */}
      {cleanEvent === 'block' && teamsideStep === 'team_select' && (
        <div className="flex items-center gap-3 py-0.5">
          <span className="text-xs font-semibold text-gray-700">Teams side</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="teams_side" checked={selectedTeam === 'home'}
              onChange={() => onTeamSelect('home')} className="accent-blue-600" />
            <span className="text-xs text-gray-700">[1] {homeTeamName}</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="teams_side" checked={selectedTeam === 'away'}
              onChange={() => onTeamSelect('away')} className="accent-blue-600" />
            <span className="text-xs text-gray-700">[2] {awayTeamName}</span>
          </label>
        </div>
      )}
    </div>
  )
}
