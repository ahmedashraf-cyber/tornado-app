import { useState } from 'react'
import {
  PASS_TYPE_OPTIONS, PASS_SOURCE_OPTIONS, PASS_BODY_PART_OPTIONS, PASS_EXTRAS,
  SHOT_TYPE_OPTIONS, SHOT_OUTCOME_OPTIONS, SHOT_BODY_PART_OPTIONS, SHOT_TECHNIQUE_OPTIONS,
  FOUL_ACTION_OPTIONS, FOUL_TYPE_OPTIONS, FOUL_OUTCOME_OPTIONS,
  TACKLE_OUTCOME_OPTIONS, TACKLE_TYPE_OPTIONS,
  DRIBBLE_OUTCOME_OPTIONS, DRIBBLE_DIRECTION_OPTIONS,
  CLEARANCE_BODY_OPTIONS, CLEARANCE_TYPE_OPTIONS,
  BALL_RECOVERY_OUTCOME_OPTIONS,
  MISCONTROL_TYPE_OPTIONS,
  INTERCEPTION_OUTCOME_OPTIONS,
  CARD_TYPE_OPTIONS,
  STOPPAGE_TYPE_OPTIONS,
  GK_ACTION_OPTIONS, GK_OUTCOME_OPTIONS, GK_BODY_STATE_OPTIONS, GK_TECHNIQUE_OPTIONS,
  HALF_START_EXTRAS, HALF_END_EXTRAS,
  SUBSTITUTION_REASON_OPTIONS,
  FIFTY_FIFTY_OUTCOME_OPTIONS, FIFTY_FIFTY_EXTRAS,
  OUT_EXTRAS,
  BLOCK_OUTCOME_OPTIONS, BLOCK_TYPE_OPTIONS,
  ATTACKING_DIRECTION_OPTIONS,
  NO_BASE_EVENTS,
} from '../data/eventDefinitions'

function QSelect({ label, options, value, onChange, required }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300 whitespace-nowrap">• {label}:</span>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`bg-[#1e3a6e] text-white text-xs border rounded px-2 py-1 focus:outline-none ${
          required && !value ? 'border-red-400' : 'border-[#2d5a9e]'
        }`}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default function EventQualifierPanel({
  activeEvent,
  timestamp,
  qualifiers,
  onQualifierChange,
  attackingDirection,
  onAttackingDirectionChange,
}) {
  if (!activeEvent) return null

  const isNoBase = NO_BASE_EVENTS.includes(activeEvent)

  function q(key) { return qualifiers?.[key] || '' }
  function set(key) { return (val) => onQualifierChange(key, val) }

  return (
    <div className="flex-shrink-0 bg-[#0f2548] border-b border-[#1e3a6e]">
      {/* Timestamp + qualifiers row */}
      <div className="flex items-center gap-3 px-2 py-1.5 min-h-[2.5rem] flex-wrap">

        {/* Timestamp box */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 6h12M4 10h12M4 14h12"/>
            </svg>
          </button>
          <div className="bg-[#1e3a6e] text-white text-sm font-mono font-bold px-3 py-1 rounded min-w-[5rem] text-center">
            {timestamp || '0:00.000'}
          </div>
        </div>

        {/* Attacking direction (always shown) */}
        {activeEvent === 'half_start' && (
          <QSelect
            label="Attacking direction"
            options={ATTACKING_DIRECTION_OPTIONS}
            value={attackingDirection}
            onChange={onAttackingDirectionChange}
            required
          />
        )}

        {/* Per-event qualifiers */}
        {!isNoBase && (
          <>
            {/* PASS */}
            {(activeEvent === 'pass' || activeEvent === 'ground_pass' || activeEvent === 'low_pass' || activeEvent === 'high_pass') && (
              <>
                <QSelect label="Type" options={PASS_TYPE_OPTIONS} value={q('passType')} onChange={set('passType')} required />
                <QSelect label="Source" options={PASS_SOURCE_OPTIONS} value={q('passSource')} onChange={set('passSource')} required />
                <QSelect label="Body part" options={PASS_BODY_PART_OPTIONS} value={q('passBody')} onChange={set('passBody')} required />
                <QSelect label="Extra" options={PASS_EXTRAS} value={q('passExtra')} onChange={set('passExtra')} />
              </>
            )}

            {/* SHOT */}
            {activeEvent === 'shot' && (
              <>
                <QSelect label="Type" options={SHOT_TYPE_OPTIONS} value={q('shotType')} onChange={set('shotType')} required />
                <QSelect label="Outcome" options={SHOT_OUTCOME_OPTIONS} value={q('shotOutcome')} onChange={set('shotOutcome')} required />
                <QSelect label="Body part" options={SHOT_BODY_PART_OPTIONS} value={q('shotBody')} onChange={set('shotBody')} required />
                <QSelect label="Technique" options={SHOT_TECHNIQUE_OPTIONS} value={q('shotTechnique')} onChange={set('shotTechnique')} required />
              </>
            )}

            {/* FOUL COMMITTED */}
            {activeEvent === 'foul_committed' && (
              <>
                <QSelect label="Action" options={FOUL_ACTION_OPTIONS} value={q('foulAction')} onChange={set('foulAction')} required />
                <QSelect label="Type" options={FOUL_TYPE_OPTIONS} value={q('foulType')} onChange={set('foulType')} />
                <QSelect label="Outcome" options={FOUL_OUTCOME_OPTIONS} value={q('foulOutcome')} onChange={set('foulOutcome')} required />
              </>
            )}

            {/* TACKLE */}
            {activeEvent === 'tackle' && (
              <>
                <QSelect label="Outcome" options={TACKLE_OUTCOME_OPTIONS} value={q('tackleOutcome')} onChange={set('tackleOutcome')} required />
                <QSelect label="Type" options={TACKLE_TYPE_OPTIONS} value={q('tackleType')} onChange={set('tackleType')} required />
              </>
            )}

            {/* DRIBBLE */}
            {activeEvent === 'dribble' && (
              <>
                <QSelect label="Outcome" options={DRIBBLE_OUTCOME_OPTIONS} value={q('dribbleOutcome')} onChange={set('dribbleOutcome')} required />
                <QSelect label="Direction" options={DRIBBLE_DIRECTION_OPTIONS} value={q('dribbleDirection')} onChange={set('dribbleDirection')} required />
              </>
            )}

            {/* CLEARANCE */}
            {activeEvent === 'clearance' && (
              <>
                <QSelect label="Body part" options={CLEARANCE_BODY_OPTIONS} value={q('clearanceBody')} onChange={set('clearanceBody')} required />
                <QSelect label="Type" options={CLEARANCE_TYPE_OPTIONS} value={q('clearanceType')} onChange={set('clearanceType')} required />
              </>
            )}

            {/* BALL RECOVERY */}
            {activeEvent === 'ball_recovery' && (
              <QSelect label="Outcome" options={BALL_RECOVERY_OUTCOME_OPTIONS} value={q('ballRecoveryOutcome')} onChange={set('ballRecoveryOutcome')} required />
            )}

            {/* MISCONTROL */}
            {activeEvent === 'miscontrol' && (
              <QSelect label="Type" options={MISCONTROL_TYPE_OPTIONS} value={q('miscontrolType')} onChange={set('miscontrolType')} required />
            )}

            {/* INTERCEPTION */}
            {activeEvent === 'interception' && (
              <QSelect label="Outcome" options={INTERCEPTION_OUTCOME_OPTIONS} value={q('interceptionOutcome')} onChange={set('interceptionOutcome')} required />
            )}

            {/* CARD */}
            {activeEvent === 'card' && (
              <QSelect label="Card type" options={CARD_TYPE_OPTIONS} value={q('cardType')} onChange={set('cardType')} required />
            )}

            {/* STOPPAGE */}
            {activeEvent === 'stoppage' && (
              <QSelect label="Type" options={STOPPAGE_TYPE_OPTIONS} value={q('stoppageType')} onChange={set('stoppageType')} required />
            )}

            {/* GOAL KEEPER */}
            {activeEvent === 'goal_keeper' && (
              <>
                <QSelect label="Action" options={GK_ACTION_OPTIONS} value={q('gkAction')} onChange={set('gkAction')} required />
                <QSelect label="Outcome" options={GK_OUTCOME_OPTIONS} value={q('gkOutcome')} onChange={set('gkOutcome')} required />
                <QSelect label="Body state" options={GK_BODY_STATE_OPTIONS} value={q('gkBodyState')} onChange={set('gkBodyState')} />
                <QSelect label="Technique" options={GK_TECHNIQUE_OPTIONS} value={q('gkTechnique')} onChange={set('gkTechnique')} />
              </>
            )}

            {/* BLOCK */}
            {activeEvent === 'block' && (
              <>
                <QSelect label="Outcome" options={BLOCK_OUTCOME_OPTIONS} value={q('blockOutcome')} onChange={set('blockOutcome')} required />
                <QSelect label="Type" options={BLOCK_TYPE_OPTIONS} value={q('blockType')} onChange={set('blockType')} required />
              </>
            )}

            {/* SUBSTITUTION */}
            {activeEvent === 'substitution' && (
              <QSelect label="Reason" options={SUBSTITUTION_REASON_OPTIONS} value={q('subReason')} onChange={set('subReason')} required />
            )}

            {/* 50/50 */}
            {activeEvent === 'fifty_fifty' && (
              <>
                <QSelect label="Outcome" options={FIFTY_FIFTY_OUTCOME_OPTIONS} value={q('fiftyOutcome')} onChange={set('fiftyOutcome')} required />
                <QSelect label="Extra" options={FIFTY_FIFTY_EXTRAS} value={q('fiftyExtra')} onChange={set('fiftyExtra')} />
              </>
            )}

            {/* OUT */}
            {activeEvent === 'out' && (
              <QSelect label="Direction" options={OUT_EXTRAS} value={q('outDirection')} onChange={set('outDirection')} required />
            )}

            {/* HALF END */}
            {activeEvent === 'half_end' && (
              <QSelect label="Extra" options={HALF_END_EXTRAS} value={q('halfEndExtra')} onChange={set('halfEndExtra')} />
            )}
          </>
        )}

        {/* No base fields notice */}
        {isNoBase && activeEvent !== 'half_start' && (
          <span className="text-gray-400 text-xs italic">No base fields for this event</span>
        )}
      </div>
    </div>
  )
}
