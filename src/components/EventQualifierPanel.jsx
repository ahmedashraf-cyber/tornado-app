import { useState, useEffect, useCallback } from 'react'
import {
  SHOT_TYPE_OPTIONS, SHOT_OUTCOME_OPTIONS, SHOT_BODY_PART_OPTIONS, SHOT_TECHNIQUE_OPTIONS,
  TACKLE_OUTCOME_OPTIONS, TACKLE_TYPE_OPTIONS,
  BALL_RECOVERY_OUTCOME_OPTIONS,
  MISCONTROL_TYPE_OPTIONS, MISCONTROL_TYPE_RADIO,
  INTERCEPTION_OUTCOME_OPTIONS, INTERCEPTION_OUTCOME_RADIO,
  CARD_ACTION_RADIO,
  STOPPAGE_TYPE_OPTIONS,
  HALF_END_EXTRAS,
  SUBSTITUTION_REASON_OPTIONS,
  OUT_LOCATION_OPTIONS, OUT_LOCATION_RADIO,
  BLOCK_OUTCOME_OPTIONS, BLOCK_TYPE_OPTIONS,
  ATTACKING_DIRECTION_OPTIONS,
  PASS_TYPE_DROPDOWN,
  NO_BASE_EVENTS,
  FIFTY_FIFTY_OUTCOME_OPTIONS, FIFTY_FIFTY_EXTRAS,
} from '../data/eventDefinitions'
import PassQualifierSteps from './PassQualifierSteps'
import FoulQualifierSteps from './FoulQualifierSteps'
import DribbleQualifierSteps from './DribbleQualifierSteps'
import ClearanceQualifierSteps from './ClearanceQualifierSteps'
import GKQualifierSteps from './GKQualifierSteps'
import GKSaveQualifierSteps from './GKSaveQualifierSteps'
import ShotQualifierSteps from './ShotQualifierSteps'
import TackleQualifierSteps from './TackleQualifierSteps'
import StoppageQualifierSteps from './StoppageQualifierSteps'

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

// Corner / Goal kick radio (endline Out → collector picks type)
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

// ── Card: single Action step, NO teams-side (Video: Card_Tag) ──
function CardQualifier({ qualifiers, onQualifierChange, active, onAutoConfirm }) {
  const handleKey = useCallback((e) => {
    if (!active) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const opt = CARD_ACTION_RADIO.find(o => o.key === e.key)
    if (opt) {
      onQualifierChange('cardType', opt.value)
      if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
    }
  }, [active, onQualifierChange, onAutoConfirm])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className="flex flex-col gap-1">
      {/* Blue filled dot + "Action" label matching video */}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
        <span className="text-xs font-semibold text-[#1e3a6e]">Action</span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {CARD_ACTION_RADIO.map(opt => (
          <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              checked={qualifiers.cardType === opt.value}
              onChange={() => {
                onQualifierChange('cardType', opt.value)
                if (onAutoConfirm) setTimeout(onAutoConfirm, 80)
              }}
              className="accent-[#1e3a6e] w-3 h-3"
            />
            <span className="text-xs text-gray-700">
              <span className="text-gray-400 mr-0.5">[{opt.key}]</span>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Block 2-step qualifier
function BlockQualifierSteps({ qualifiers, onQualifierChange, active }) {
  const [activeStep, setActiveStep] = useState('type')

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

  const steps = [
    { key: 'type',             label: 'Type' },
    { key: 'miscommunication', label: 'Miscommunication' },
  ]
  const activeIdx = steps.findIndex(s => s.key === activeStep)

  return (
    <div className="flex flex-col gap-1 flex-shrink-0">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isActive = step.key === activeStep
          const isDone = i < activeIdx
          const isLast = i === steps.length - 1
          return (
            <div key={step.key} className="flex items-center">
              <button onClick={() => setActiveStep(step.key)} className="flex flex-col items-center gap-0.5 focus:outline-none">
                <div className={`w-3 h-3 rounded-full border-2 transition-colors ${isActive || isDone ? 'bg-[#1e3a6e] border-[#1e3a6e]' : 'bg-white border-gray-400'}`} />
                <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive || isDone ? 'text-[#1e3a6e]' : 'text-gray-400'}`}>{step.label}</span>
              </button>
              {!isLast && <div className={`h-0.5 w-12 mx-1 mb-3 ${isDone || isActive ? 'bg-gray-400' : 'bg-gray-300'}`} />}
            </div>
          )
        })}
      </div>
      {activeStep === 'type' && (
        <QSelect label="Block type" options={BLOCK_TYPE_OPTIONS} value={qualifiers.blockType || ''}
          onChange={(v) => { onQualifierChange('blockType', v); setActiveStep('miscommunication') }} />
      )}
      {activeStep === 'miscommunication' && (
        <label className="flex items-center gap-1 cursor-pointer">
          <input type="radio" checked={qualifiers.blockMiscommunication === 'miscommunication'}
            onChange={() => onQualifierChange('blockMiscommunication', 'miscommunication')}
            className="accent-[#1e3a6e] w-3 h-3" />
          <span className="text-xs text-gray-700"><span className="text-gray-400 mr-0.5">[1]</span>Miscommunication</span>
        </label>
      )}
    </div>
  )
}

// Teams side radio (used by pass, block, and most events)
function TeamsSideRadio({ homeTeamName, awayTeamName, selectedTeam, onTeamSelect }) {
  return (
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
  )
}

// ── Main EventQualifierPanel ──
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
  onAutoConfirm,  // callback to auto-confirm when last qualifier step done
}) {
  const cleanEvent = activeEvent?.replace('_away', '') || ''
  const showPassEndBadge = passEndIncomplete && ['block', 'interception', 'ball_recovery', 'clearance'].includes(cleanEvent)

  const q = (k) => qualifiers[k] || ''
  const set = (k) => (v) => onQualifierChange(k, v)

  const isNeedTeamSelect = teamsideStep === 'team_select'
  const isQualifiers = teamsideStep === 'qualifiers'

  // Card event: no teams side, just show action step immediately
  if (cleanEvent === 'card') {
    return (
      <div className="px-3 py-1.5">
        {isQualifiers && (
          <CardQualifier
            qualifiers={qualifiers}
            onQualifierChange={onQualifierChange}
            active={isQualifiers}
            onAutoConfirm={onAutoConfirm}
          />
        )}
      </div>
    )
  }

  // Error / reception / other no-base events: show nothing (handled by parent status text)
  if (NO_BASE_EVENTS.includes(cleanEvent) && cleanEvent !== 'half_start' && cleanEvent !== 'out') {
    return null
  }

  return (
    <div className="px-3 py-1.5 min-w-0">

      {/* ── PASS event ── */}
      {cleanEvent === 'pass' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5">
          {showPassEndBadge && <PassEndBadge />}
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <>
              {/* Pass Type — auto-populated or corner/gk radio */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {outLocation === 'endline' ? (
                  <CornerOrGoalKickRadio value={q('passType')} onChange={set('passType')} />
                ) : (
                  <span className="flex items-center gap-1 flex-shrink-0">
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
              <PassQualifierSteps
                passType={q('passType')}
                qualifiers={qualifiers}
                onQualifierChange={onQualifierChange}
                active={isQualifiers}
              />
            </>
          )}
        </div>
      )}

      {/* ── BLOCK event ── */}
      {cleanEvent === 'block' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5">
          {showPassEndBadge && <PassEndBadge />}
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <>
              <QText label="Outcome" value={q('blockOutcome')} onChange={set('blockOutcome')} placeholder="Edit field" />
              <BlockQualifierSteps qualifiers={qualifiers} onQualifierChange={onQualifierChange} active={isQualifiers} />
            </>
          )}
        </div>
      )}

      {/* ── FOUL COMMITTED — 3-step multi-step (Video: Foul_Committed_Tag) ── */}
      {cleanEvent === 'foul_committed' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5 min-w-0">
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <>
              {/* Summary display on left */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {qualifiers.foulType && (
                  <span className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">• Type:</span>
                    <span className="text-xs text-gray-800 border border-gray-300 rounded px-1.5 py-0.5 bg-white">
                      {qualifiers.foulType}
                    </span>
                  </span>
                )}
                <QText label="Outcome" value={q('foulOutcome')} onChange={set('foulOutcome')} placeholder="Edit field" />
              </div>
              <FoulQualifierSteps
                qualifiers={qualifiers}
                onQualifierChange={onQualifierChange}
                active={isQualifiers}
                onAutoConfirm={onAutoConfirm}
              />
            </>
          )}
        </div>
      )}

      {/* ── CLEARANCE — 2-step (Video: Clear_Tag) ── */}
      {cleanEvent === 'clearance' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5">
          {showPassEndBadge && <PassEndBadge />}
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <ClearanceQualifierSteps
              qualifiers={qualifiers}
              onQualifierChange={onQualifierChange}
              active={isQualifiers}
              onAutoConfirm={onAutoConfirm}
            />
          )}
        </div>
      )}

      {/* ── DRIBBLE — 2-step (Video: Dribble_Tagging) ── */}
      {cleanEvent === 'dribble' && (
        <div className="flex items-start gap-4 flex-wrap py-0.5">
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <DribbleQualifierSteps
              qualifiers={qualifiers}
              onQualifierChange={onQualifierChange}
              active={isQualifiers}
              onAutoConfirm={onAutoConfirm}
            />
          )}
        </div>
      )}

      {/* ── GOALKEEPER — multi-step (Video: GK_Against_shots + Smother_Tag) ── */}
      {cleanEvent === 'goal_keeper' && (
        <div className="flex flex-col gap-1 py-0.5">
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <div className="flex items-start gap-6 flex-wrap">
              {/* Left summary when save_attempt is selected */}
              {qualifiers.gkType === 'save_attempt' && (
                <div className="flex items-center gap-2 flex-shrink-0 mt-5">
                  <span className="text-xs text-gray-600">• Type:</span>
                  <span className="text-xs text-gray-800 border border-gray-300 rounded px-1.5 py-0.5 bg-white">Save attempt</span>
                  {qualifiers.gkOutcome && <><span className="text-xs text-gray-600">• Outcome:</span>
                  <span className="text-xs text-gray-800 border border-gray-300 rounded px-1.5 py-0.5 bg-white">{qualifiers.gkOutcome}</span></>}
                </div>
              )}
              {/* Save attempt → 5-step save qualifier */}
              {qualifiers.gkType === 'save_attempt' ? (
                <GKSaveQualifierSteps
                  qualifiers={qualifiers}
                  onQualifierChange={onQualifierChange}
                  active={isQualifiers}
                  onAutoConfirm={onAutoConfirm}
                />
              ) : (
                <>
                  {/* Standard GK: 3-step Type→Outcome→Miscommunication */}
                  <GKQualifierSteps
                    qualifiers={qualifiers}
                    onQualifierChange={onQualifierChange}
                    active={isQualifiers}
                    onAutoConfirm={onAutoConfirm}
                  />
                  {/* Right: supplemental dropdowns */}
                  {qualifiers.gkType && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <QSelect label="Body part" options={GK_BODY_PART_OPTIONS} value={q('gkBodyPart')} onChange={set('gkBodyPart')} />
                      <QSelect label="Technique" options={GK_TECHNIQUE_OPTIONS} value={q('gkTechnique')} onChange={set('gkTechnique')} />
                      <QSelect label="Gk body state" options={GK_BODY_STATE_OPTIONS} value={q('gkBodyState')} onChange={set('gkBodyState')} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SHOT — multi-step (Videos: Shot_Tagging_1/3/4) ── */}
      {cleanEvent === 'shot' && (
        <div className="flex flex-col gap-1 py-0.5">
          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}
          {isQualifiers && (
            <div className="flex items-start gap-4 flex-wrap">
              {/* Left: Type dropdown (auto-populated) */}
              <span className="flex items-center gap-1 flex-shrink-0 mt-5">
                <span className="text-xs text-gray-600">• Type:</span>
                <select value={q('shotType') || 'open_play'} onChange={set('shotType')}
                  className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 text-gray-800">
                  {[
                    { value: 'open_play',  label: 'Open play'  },
                    { value: 'free_kick',  label: 'Free kick'  },
                    { value: 'penalty',    label: 'Penalty'    },
                    { value: 'corner',     label: 'Corner'     },
                    { value: 'kick_off',   label: 'Kick off'   },
                    { value: 'first_time', label: 'First time' },
                    { value: 'redirect',   label: 'Redirect'   },
                  ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </span>
              {/* Right: 3-step Body part → Technique → Gk body state → Outcome */}
              <ShotQualifierSteps
                qualifiers={qualifiers}
                onQualifierChange={onQualifierChange}
                active={isQualifiers}
                onAutoConfirm={onAutoConfirm}
              />
            </div>
          )}
        </div>
      )}

      {/* ── ALL OTHER EVENTS ── */}
      {!['pass', 'block', 'foul_committed', 'clearance', 'dribble', 'goal_keeper', 'card', 'shot'].includes(cleanEvent) && (
        <div className="flex items-center gap-4 flex-wrap min-h-[1.6rem]">
          {showPassEndBadge && <PassEndBadge />}

          {isNeedTeamSelect && (
            <TeamsSideRadio homeTeamName={homeTeamName} awayTeamName={awayTeamName}
              selectedTeam={selectedTeam} onTeamSelect={onTeamSelect} />
          )}

          {isQualifiers && (
            <>
              {cleanEvent === 'half_start' && (
                <QSelect label="Attacking direction" options={ATTACKING_DIRECTION_OPTIONS}
                  value={attackingDirection} onChange={onAttackingDirectionChange} required />
              )}
              {cleanEvent === 'shot' && (
                null /* handled outside this block — see below */
              )}
              {cleanEvent === 'out' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
                    <span className="text-xs font-semibold text-[#1e3a6e]">Location</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {OUT_LOCATION_RADIO.map(opt => (
                      <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={q('outLocation') === opt.value}
                          onChange={() => { set('outLocation')(opt.value); if (onAutoConfirm) setTimeout(onAutoConfirm, 80) }}
                          className="accent-[#1e3a6e] w-3 h-3" />
                        <span className="text-xs text-gray-700">
                          <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {cleanEvent === 'tackle' && (
                <TackleQualifierSteps
                  qualifiers={qualifiers}
                  onQualifierChange={onQualifierChange}
                  active={isQualifiers}
                  onAutoConfirm={onAutoConfirm}
                />
              )}
              {cleanEvent === 'ball_recovery' && (
                <QSelect label="Outcome" options={BALL_RECOVERY_OUTCOME_OPTIONS} value={q('ballRecoveryOutcome')} onChange={set('ballRecoveryOutcome')} required />
              )}
              {cleanEvent === 'miscontrol' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
                    <span className="text-xs font-semibold text-[#1e3a6e]">Type</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {MISCONTROL_TYPE_RADIO.map(opt => (
                      <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={q('miscontrolType') === opt.value}
                          onChange={() => { set('miscontrolType')(opt.value); if (onAutoConfirm) setTimeout(onAutoConfirm, 80) }}
                          className="accent-[#1e3a6e] w-3 h-3" />
                        <span className="text-xs text-gray-700">
                          <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {cleanEvent === 'interception' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
                    <span className="text-xs font-semibold text-[#1e3a6e]">Outcome</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {INTERCEPTION_OUTCOME_RADIO.map(opt => (
                      <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={q('interceptionOutcome') === opt.value}
                          onChange={() => { set('interceptionOutcome')(opt.value); if (onAutoConfirm) setTimeout(onAutoConfirm, 80) }}
                          className="accent-[#1e3a6e] w-3 h-3" />
                        <span className="text-xs text-gray-700">
                          <span className="text-gray-400 mr-0.5">[{opt.key}]</span>{opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {cleanEvent === 'stoppage' && (
                <StoppageQualifierSteps
                  qualifiers={qualifiers}
                  onQualifierChange={onQualifierChange}
                  active={isQualifiers}
                  onAutoConfirm={onAutoConfirm}
                />
              )}
              {cleanEvent === 'substitution' && (
                <QSelect label="Reason" options={SUBSTITUTION_REASON_OPTIONS} value={q('subReason')} onChange={set('subReason')} required />
              )}
              {cleanEvent === 'half_end' && (
                <QSelect label="Extra" options={HALF_END_EXTRAS} value={q('halfEndExtra')} onChange={set('halfEndExtra')} />
              )}
              {cleanEvent === 'fifty_fifty' && (
                <>
                  <QSelect label="Outcome" options={FIFTY_FIFTY_OUTCOME_OPTIONS} value={q('fiftyFiftyOutcome')} onChange={set('fiftyFiftyOutcome')} required />
                  <QSelect label="Extra" options={FIFTY_FIFTY_EXTRAS} value={q('fiftyFiftyExtra')} onChange={set('fiftyFiftyExtra')} />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
