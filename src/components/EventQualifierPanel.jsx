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

// Inline dropdown — "• Label: [value ▾]"
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
}) {
  if (!activeEvent) return null

  const cleanEvent = activeEvent.replace('_away', '')
  const isNoBase = NO_BASE_EVENTS.includes(cleanEvent)

  function q(key) { return qualifiers?.[key] || '' }
  function set(key) { return (val) => onQualifierChange(key, val) }

  const showPassEndBadge = passEndIncomplete && (
    cleanEvent === 'pass' || cleanEvent === 'interception' || cleanEvent === 'ball_recovery'
  )

  return (
    <div className="flex-shrink-0 bg-[#e8eef4] border-b border-gray-300 px-3 py-1.5">

      {/* ── PASS: special multi-step UI ── */}
      {cleanEvent === 'pass' && teamsideStep !== 'team_select' && (
        <div className="flex items-start gap-3 flex-wrap">
          {/* Type dropdown stays on the left as before */}
          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {showPassEndBadge && <PassEndBadge />}
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

      {/* ── ALL OTHER EVENTS: standard inline qualifier row ── */}
      {cleanEvent !== 'pass' && (
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
              {cleanEvent === 'block' && (
                <>
                  <QSelect label="Outcome" options={BLOCK_OUTCOME_OPTIONS} value={q('blockOutcome')} onChange={set('blockOutcome')} required />
                  <QSelect label="Type" options={BLOCK_TYPE_OPTIONS} value={q('blockType')} onChange={set('blockType')} required />
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

      {/* Teams side for pass event */}
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
    </div>
  )
}
