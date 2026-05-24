import {
  PASS_TYPE_DROPDOWN,
  PASS_BODY_PART_OPTIONS, PASS_EXTRAS,
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
  FIFTY_FIFTY_OUTCOME_OPTIONS,
  OUT_LOCATION_OPTIONS,
  BLOCK_OUTCOME_OPTIONS, BLOCK_TYPE_OPTIONS,
  ATTACKING_DIRECTION_OPTIONS,
  NO_BASE_EVENTS,
} from '../data/eventDefinitions'

// Dropdown qualifier
function QSelect({ label, options, value, onChange, required }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-xs text-gray-300 whitespace-nowrap">• {label}:</span>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`bg-[#1e3a6e] text-white text-xs border rounded px-2 py-1 focus:outline-none min-w-[7rem] ${
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

// Free-text field (for Foul Outcome = "Edit field")
function QText({ label, value, onChange, placeholder = 'Edit field', required }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-xs text-gray-300 whitespace-nowrap">• {label}:</span>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-[#1e3a6e] text-white text-xs border rounded px-2 py-1 focus:outline-none min-w-[7rem] placeholder-gray-500 ${
          required && !value ? 'border-red-400' : 'border-[#2d5a9e]'
        }`}
      />
    </div>
  )
}

// "Pass end: Incomplete" badge — shown in qualifier strip when last pass wasn't received
function PassEndBadge({ incomplete }) {
  if (!incomplete) return null
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-xs text-gray-300 whitespace-nowrap">• Pass end:</span>
      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
        Incomplete
      </span>
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
  // Teams side state
  teamsideStep,       // 'team_select' | 'qualifiers' | null
  homeTeamName,
  awayTeamName,
  onTeamSelect,       // (team: 'home'|'away') => void
  selectedTeam,
  // Pass end incomplete badge
  passEndIncomplete,
  lastEvent,
}) {
  if (!activeEvent) return null

  const cleanEvent = activeEvent.replace('_away', '')
  const isNoBase = NO_BASE_EVENTS.includes(cleanEvent)

  function q(key) { return qualifiers?.[key] || '' }
  function set(key) { return (val) => onQualifierChange(key, val) }

  // "Pass end: Incomplete" badge shows when:
  // - current event is a pass (we're now logging the pass after the incomplete)
  // - OR when logging an interception/ball_recovery after a pass
  const showPassEndBadge = passEndIncomplete && (cleanEvent === 'pass' || cleanEvent === 'interception' || cleanEvent === 'ball_recovery')

  return (
    <div className="flex-shrink-0 bg-[#0f2548] border-b border-[#1e3a6e]">
      <div className="flex items-center gap-3 px-2 py-1.5 min-h-[2.5rem] flex-wrap">

        {/* Timestamp */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="text-gray-500 hover:text-gray-300 text-xs">≡</button>
          <div className="bg-[#1e3a6e] text-white text-sm font-mono font-bold px-3 py-1 rounded min-w-[5rem] text-center">
            {timestamp || '0:00.000'}
          </div>
        </div>

        {/* Pass end: Incomplete badge — shown when relevant */}
        {showPassEndBadge && <PassEndBadge incomplete={passEndIncomplete} />}

        {/* Teams side selection step */}
        {teamsideStep === 'team_select' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white">Teams side</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="teams_side"
                checked={selectedTeam === 'home'}
                onChange={() => onTeamSelect('home')}
                className="accent-blue-400"
              />
              <span className="text-xs text-gray-200">[1] {homeTeamName}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="teams_side"
                checked={selectedTeam === 'away'}
                onChange={() => onTeamSelect('away')}
                className="accent-blue-400"
              />
              <span className="text-xs text-gray-200">[2] {awayTeamName}</span>
            </label>
          </div>
        )}

        {/* Per-event qualifiers (shown after team selected) */}
        {teamsideStep !== 'team_select' && (
          <>
            {/* Half Start — attacking direction */}
            {cleanEvent === 'half_start' && (
              <QSelect label="Attacking direction" options={ATTACKING_DIRECTION_OPTIONS}
                value={attackingDirection} onChange={onAttackingDirectionChange} required />
            )}

            {/* PASS — Type dropdown (auto-populated) + Body part + Extra */}
            {cleanEvent === 'pass' && (
              <>
                <QSelect label="Type" options={PASS_TYPE_DROPDOWN} value={q('passType')} onChange={set('passType')} required />
                <QSelect label="Body part" options={PASS_BODY_PART_OPTIONS} value={q('passBody')} onChange={set('passBody')} required />
                <QSelect label="Extra" options={PASS_EXTRAS} value={q('passExtra')} onChange={set('passExtra')} />
              </>
            )}

            {/* SHOT */}
            {cleanEvent === 'shot' && (
              <>
                <QSelect label="Type" options={SHOT_TYPE_OPTIONS} value={q('shotType')} onChange={set('shotType')} required />
                <QSelect label="Outcome" options={SHOT_OUTCOME_OPTIONS} value={q('shotOutcome')} onChange={set('shotOutcome')} required />
                <QSelect label="Body part" options={SHOT_BODY_PART_OPTIONS} value={q('shotBody')} onChange={set('shotBody')} required />
                <QSelect label="Technique" options={SHOT_TECHNIQUE_OPTIONS} value={q('shotTechnique')} onChange={set('shotTechnique')} required />
              </>
            )}

            {/* FOUL COMMITTED — Type dropdown + Outcome text input */}
            {cleanEvent === 'foul_committed' && (
              <>
                <QSelect label="Type" options={FOUL_TYPE_DROPDOWN} value={q('foulType')} onChange={set('foulType')} required />
                <QText label="Outcome" value={q('foulOutcome')} onChange={set('foulOutcome')} placeholder="Edit field" required />
              </>
            )}

            {/* OUT — Location dropdown */}
            {cleanEvent === 'out' && (
              <QSelect label="Location" options={OUT_LOCATION_OPTIONS} value={q('outLocation')} onChange={set('outLocation')} required />
            )}

            {/* TACKLE */}
            {cleanEvent === 'tackle' && (
              <>
                <QSelect label="Outcome" options={TACKLE_OUTCOME_OPTIONS} value={q('tackleOutcome')} onChange={set('tackleOutcome')} required />
                <QSelect label="Type" options={TACKLE_TYPE_OPTIONS} value={q('tackleType')} onChange={set('tackleType')} required />
              </>
            )}

            {/* DRIBBLE */}
            {cleanEvent === 'dribble' && (
              <>
                <QSelect label="Outcome" options={DRIBBLE_OUTCOME_OPTIONS} value={q('dribbleOutcome')} onChange={set('dribbleOutcome')} required />
                <QSelect label="Direction" options={DRIBBLE_DIRECTION_OPTIONS} value={q('dribbleDirection')} onChange={set('dribbleDirection')} required />
              </>
            )}

            {/* CLEARANCE */}
            {cleanEvent === 'clearance' && (
              <>
                <QSelect label="Body part" options={CLEARANCE_BODY_OPTIONS} value={q('clearanceBody')} onChange={set('clearanceBody')} required />
                <QSelect label="Type" options={CLEARANCE_TYPE_OPTIONS} value={q('clearanceType')} onChange={set('clearanceType')} required />
              </>
            )}

            {/* BALL RECOVERY */}
            {cleanEvent === 'ball_recovery' && (
              <QSelect label="Outcome" options={BALL_RECOVERY_OUTCOME_OPTIONS} value={q('ballRecoveryOutcome')} onChange={set('ballRecoveryOutcome')} required />
            )}

            {/* MISCONTROL */}
            {cleanEvent === 'miscontrol' && (
              <QSelect label="Type" options={MISCONTROL_TYPE_OPTIONS} value={q('miscontrolType')} onChange={set('miscontrolType')} required />
            )}

            {/* INTERCEPTION */}
            {cleanEvent === 'interception' && (
              <QSelect label="Outcome" options={INTERCEPTION_OUTCOME_OPTIONS} value={q('interceptionOutcome')} onChange={set('interceptionOutcome')} required />
            )}

            {/* CARD */}
            {cleanEvent === 'card' && (
              <QSelect label="Card type" options={CARD_TYPE_OPTIONS} value={q('cardType')} onChange={set('cardType')} required />
            )}

            {/* STOPPAGE */}
            {cleanEvent === 'stoppage' && (
              <QSelect label="Type" options={STOPPAGE_TYPE_OPTIONS} value={q('stoppageType')} onChange={set('stoppageType')} required />
            )}

            {/* GOAL KEEPER */}
            {cleanEvent === 'goal_keeper' && (
              <>
                <QSelect label="Action" options={GK_ACTION_OPTIONS} value={q('gkAction')} onChange={set('gkAction')} required />
                <QSelect label="Outcome" options={GK_OUTCOME_OPTIONS} value={q('gkOutcome')} onChange={set('gkOutcome')} required />
                <QSelect label="Body state" options={GK_BODY_STATE_OPTIONS} value={q('gkBodyState')} onChange={set('gkBodyState')} />
                <QSelect label="Technique" options={GK_TECHNIQUE_OPTIONS} value={q('gkTechnique')} onChange={set('gkTechnique')} />
              </>
            )}

            {/* BLOCK */}
            {cleanEvent === 'block' && (
              <>
                <QSelect label="Outcome" options={BLOCK_OUTCOME_OPTIONS} value={q('blockOutcome')} onChange={set('blockOutcome')} required />
                <QSelect label="Type" options={BLOCK_TYPE_OPTIONS} value={q('blockType')} onChange={set('blockType')} required />
              </>
            )}

            {/* SUBSTITUTION */}
            {cleanEvent === 'substitution' && (
              <QSelect label="Reason" options={SUBSTITUTION_REASON_OPTIONS} value={q('subReason')} onChange={set('subReason')} required />
            )}

            {/* HALF END */}
            {cleanEvent === 'half_end' && (
              <QSelect label="Extra" options={HALF_END_EXTRAS} value={q('halfEndExtra')} onChange={set('halfEndExtra')} />
            )}

            {/* RECEPTION — no base fields, just show the event name */}
            {cleanEvent === 'reception' && (
              <span className="text-gray-400 text-xs italic">Reception — no qualifiers needed</span>
            )}

            {/* No base fields for other no-base events */}
            {isNoBase && !['half_start', 'out', 'reception'].includes(cleanEvent) && (
              <span className="text-gray-500 text-xs italic">No base fields for this event</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
