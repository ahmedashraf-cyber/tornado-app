// Full event definitions from Statsbomb Data Spec v2.0
// Each event has: id, label, shortcut, group, qualifiers[], followUpEvents[]

export const EVENT_GROUPS = {
  NEW_HALF: 'new_half',       // After Half Start fires
  CARRY:    'carry',          // Ball in possession (carry/open play)
  FLIGHT_O: 'flight_o',      // Ball in flight — offense view
  FLIGHT_D: 'flight_d',      // Ball in flight — defense view
  DEFENSE:  'defense',       // Defensive team sidebar
  STANDARD: 'standard',      // Default sidebar events
}

// ── PASS qualifiers (from spec) ──
export const PASS_TYPE_OPTIONS = [
  { value: 'ground', label: 'Ground Pass' },
  { value: 'low',    label: 'Low Pass' },
  { value: 'high',   label: 'High Pass' },
]

export const PASS_SOURCE_OPTIONS = [
  { value: 'open_play',    label: 'Open play' },
  { value: 'throw_in',     label: 'Throw-In' },
  { value: 'free_kick',    label: 'Free Kick' },
  { value: 'goal_kick',    label: 'Goal Kick' },
  { value: 'corner',       label: 'Corner' },
  { value: 'kick_off',     label: 'Kick Off' },
  { value: 'recovery',     label: 'Recovery' },
  { value: 'interception', label: 'Interception' },
  { value: 'first_time',   label: 'First Time' },
]

export const PASS_BODY_PART_OPTIONS = [
  { value: 'right_foot',  label: 'Right Foot' },
  { value: 'left_foot',   label: 'Left Foot' },
  { value: 'head',        label: 'Head' },
  { value: 'keeper_arm',  label: 'Keeper Arm' },
  { value: 'drop_kick',   label: 'Drop Kick' },
  { value: 'no_touch',    label: 'No Touch' },
  { value: 'other',       label: 'Other' },
  { value: 'none',        label: 'None (throw-in)' },
]

export const PASS_EXTRAS = [
  { value: 'aerial_won',         label: 'Aerial Won' },
  { value: 'miss_communication', label: 'Miss-communication' },
  { value: 'through_ball',       label: 'Through Ball' },
  { value: 'injury_clearance',   label: 'Injury Clearance' },
  { value: 'backheel',           label: 'Backheel' },
  { value: 'inswinging',         label: 'Inswinging' },
  { value: 'outswinging',        label: 'Outswinging' },
  { value: 'straight',           label: 'Straight' },
  { value: 'launch',             label: 'Launch' },
]

// ── SHOT qualifiers ──
export const SHOT_TYPE_OPTIONS = [
  { value: 'open_play',  label: 'Open Play' },
  { value: 'free_kick',  label: 'Free Kick' },
  { value: 'penalty',    label: 'Penalty' },
  { value: 'corner',     label: 'Corner' },
  { value: 'kick_off',   label: 'Kick Off' },
]

export const SHOT_OUTCOME_OPTIONS = [
  { value: 'goal',        label: 'Goal' },
  { value: 'saved',       label: 'Saved' },
  { value: 'blocked',     label: 'Blocked' },
  { value: 'post',        label: 'Post' },
  { value: 'wayward',     label: 'Wayward' },
  { value: 'out_endline', label: 'Out Endline (Off T)' },
]

export const SHOT_BODY_PART_OPTIONS = [
  { value: 'right_foot', label: 'Right Foot' },
  { value: 'left_foot',  label: 'Left Foot' },
  { value: 'head',       label: 'Head' },
  { value: 'other',      label: 'Other' },
]

export const SHOT_TECHNIQUE_OPTIONS = [
  { value: 'normal',        label: 'Normal' },
  { value: 'volley',        label: 'Volley' },
  { value: 'half_volley',   label: 'Half-Volley' },
  { value: 'backheel',      label: 'Backheel' },
  { value: 'lob',           label: 'Lob' },
  { value: 'overhead_kick', label: 'Overhead Kick' },
  { value: 'diving_header', label: 'Diving Header' },
]

// ── FOUL COMMITTED qualifiers ──
export const FOUL_ACTION_OPTIONS = [
  { value: 'no_card',       label: 'No Card' },
  { value: 'yellow',        label: 'Yellow Card' },
  { value: 'second_yellow', label: 'Second Yellow' },
  { value: 'red',           label: 'Red Card' },
]

export const FOUL_TYPE_OPTIONS = [
  { value: 'handball',       label: 'Handball' },
  { value: 'foul_out',       label: 'Foul Out' },
  { value: '6_seconds',      label: '6 Seconds' },
  { value: '8_seconds',      label: '8 Seconds' },
  { value: 'backpass_pick',  label: 'Backpass Pick' },
  { value: 'dangerous_play', label: 'Dangerous Play' },
  { value: 'dive',           label: 'Dive' },
]

export const FOUL_OUTCOME_OPTIONS = [
  { value: 'advantage', label: 'Advantage' },
  { value: 'penalty',   label: 'Penalty' },
  { value: 'none',      label: 'None' },
]

// ── TACKLE qualifiers ──
export const TACKLE_OUTCOME_OPTIONS = [
  { value: 'won',     label: 'Won' },
  { value: 'success', label: 'Success' },
]
export const TACKLE_TYPE_OPTIONS = [
  { value: 'dribble_attempt', label: 'Dribble Attempt' },
  { value: 'none',            label: 'None' },
]

// ── DRIBBLE qualifiers ──
export const DRIBBLE_OUTCOME_OPTIONS = [
  { value: 'overrun', label: 'Overrun' },
  { value: 'none',    label: 'None (Success)' },
]
export const DRIBBLE_DIRECTION_OPTIONS = [
  { value: 'right_take_on', label: 'Right Take On' },
  { value: 'left_take_on',  label: 'Left Take On' },
  { value: 'right',         label: 'Right' },
  { value: 'left',          label: 'Left' },
  { value: 'none',          label: 'None (backward)' },
  { value: 'nutmeg',        label: 'Nutmeg' },
  { value: 'no_touch',      label: 'No Touch' },
  { value: 'sliding',       label: 'Sliding' },
]

// ── CLEARANCE qualifiers ──
export const CLEARANCE_BODY_OPTIONS = [
  { value: 'right_foot', label: 'Right Foot' },
  { value: 'left_foot',  label: 'Left Foot' },
  { value: 'head',       label: 'Head' },
  { value: 'other',      label: 'Other' },
]
export const CLEARANCE_TYPE_OPTIONS = [
  { value: 'regular',    label: 'Regular' },
  { value: 'aerial_won', label: 'Aerial Won' },
]

// ── BALL RECOVERY qualifiers ──
export const BALL_RECOVERY_OUTCOME_OPTIONS = [
  { value: 'complete', label: 'Complete' },
  { value: 'fail',     label: 'Fail' },
]

// ── MISCONTROL qualifiers ──
export const MISCONTROL_TYPE_OPTIONS = [
  { value: 'regular',    label: 'Regular' },
  { value: 'aerial_won', label: 'Aerial Won' },
]

// ── INTERCEPTION qualifiers ──
export const INTERCEPTION_OUTCOME_OPTIONS = [
  { value: 'won',     label: 'Won' },
  { value: 'success', label: 'Success' },
  { value: 'step_in', label: 'Step In' },
]

// ── CARD qualifiers ──
export const CARD_TYPE_OPTIONS = [
  { value: 'yellow',        label: 'Yellow Card' },
  { value: 'second_yellow', label: 'Second Yellow' },
  { value: 'red',           label: 'Red Card' },
]

// ── STOPPAGE qualifiers ──
export const STOPPAGE_TYPE_OPTIONS = [
  { value: 'injury',    label: 'Injury' },
  { value: 'review',    label: 'Review (VAR)' },
  { value: 'abandoned', label: 'Abandoned' },
  { value: 'other',     label: 'Other' },
]

// ── GOALKEEPER qualifiers ──
export const GK_ACTION_OPTIONS = [
  { value: 'collected',        label: 'Collected' },
  { value: 'punch',            label: 'Punch' },
  { value: 'keeper_sweeper',   label: 'Keeper Sweeper' },
  { value: 'save_non_shot',    label: 'Save (Non-Shot)' },
  { value: 'smother',          label: 'Smother' },
  { value: 'save_attempt',     label: 'Save Attempt' },
  { value: 'conceded_no_save', label: 'Conceded No Save' },
]
export const GK_OUTCOME_OPTIONS = [
  { value: 'success',       label: 'Success' },
  { value: 'won',           label: 'Won' },
  { value: 'second_effort', label: 'Second Effort' },
  { value: 'fail',          label: 'Fail' },
  { value: 'clear',         label: 'Clear' },
  { value: 'claim',         label: 'Claim' },
]
export const GK_BODY_STATE_OPTIONS = [
  { value: 'set',    label: 'Set' },
  { value: 'moving', label: 'Moving' },
  { value: 'prone',  label: 'Prone' },
]
export const GK_TECHNIQUE_OPTIONS = [
  { value: 'standing', label: 'Standing' },
  { value: 'diving',   label: 'Diving' },
]

// ── HALF START / HALF END qualifiers ──
export const HALF_START_EXTRAS = [
  { value: 'none',             label: 'None' },
  { value: 'late_video_start', label: 'Late Video Start' },
]
export const HALF_END_EXTRAS = [
  { value: 'none',              label: 'None' },
  { value: 'early_video_end',   label: 'Early Video End' },
  { value: 'match_suspended',   label: 'Match Suspended' },
]

// ── SUBSTITUTION qualifiers ──
export const SUBSTITUTION_REASON_OPTIONS = [
  { value: 'tactical', label: 'Tactical' },
  { value: 'injury',   label: 'Injury' },
]

// ── 50/50 qualifiers ──
export const FIFTY_FIFTY_OUTCOME_OPTIONS = [
  { value: 'won',     label: 'Won' },
  { value: 'success', label: 'Success' },
]
export const FIFTY_FIFTY_EXTRAS = [
  { value: 'sliding_primary',   label: 'Sliding – Primary' },
  { value: 'sliding_secondary', label: 'Sliding – Secondary' },
]

// ── OUT qualifiers ──
export const OUT_EXTRAS = [
  { value: 'sideline', label: 'Sideline (throw-in)' },
  { value: 'endline',  label: 'Endline (corner/goal kick)' },
]

// ── BLOCK qualifiers ──
export const BLOCK_OUTCOME_OPTIONS = [
  { value: 'deflection', label: 'Deflection' },
  { value: 'none',       label: 'Regular' },
]
export const BLOCK_TYPE_OPTIONS = [
  { value: 'save', label: 'Save (prevents goal)' },
  { value: 'none', label: 'None' },
]

// ── ATTACKING DIRECTION ──
export const ATTACKING_DIRECTION_OPTIONS = [
  { value: 'left_to_right', label: 'Left to right' },
  { value: 'right_to_left', label: 'Right to left' },
]

// ── EVENT SEQUENCE RULES ──
// Defines which events can fire next after each event
// This drives the sidebar context switching
export const EVENT_SEQUENCES = {
  half_start:    { offenseGroup: 'new_half',  defenseGroup: 'new_half' },
  pass:          { offenseGroup: 'flight_o',  defenseGroup: 'flight_d' },
  ball_receipt:  { offenseGroup: 'carry',     defenseGroup: 'defense' },
  carry:         { offenseGroup: 'carry',     defenseGroup: 'defense' },
  dribble:       { offenseGroup: 'carry',     defenseGroup: 'defense' },
  shot:          { offenseGroup: 'carry',     defenseGroup: 'defense' },
  default:       { offenseGroup: 'standard',  defenseGroup: 'standard' },
}

// ── SIDEBAR EVENT GROUPS ──
// Each group = the buttons shown in left/right sidebar when that context is active
export const SIDEBAR_GROUPS = {
  new_half: [
    { id: 'pass',   label: 'Pass',   shortcut: 'e' },
    { id: 'shot',   label: 'Shot',   shortcut: 's' },
  ],
  carry: [
    { id: 'dribble',    label: 'Dribble',    shortcut: 'd' },
    { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
    { id: 'pass',       label: 'Pass',       shortcut: 'e' },
    { id: 'reception',  label: 'Reception',  shortcut: 'w' },
    { id: 'shot',       label: 'Shot',       shortcut: 's' },
  ],
  flight_o: [
    { id: 'block',      label: 'Block',      shortcut: 'b' },
    { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
    { id: 'pass',       label: 'Pass',       shortcut: 'q' },
    { id: 'reception',  label: 'Reception',  shortcut: 'w' },
    { id: 'shot',       label: 'Shot',       shortcut: 's' },
  ],
  flight_d: [
    { id: 'ball_recovery',  label: 'Ball recovery',  shortcut: 'r' },
    { id: 'block',          label: 'Block',          shortcut: 'b' },
    { id: 'clearance',      label: 'Clearance',      shortcut: 'f' },
    { id: 'goal_keeper',    label: 'Goal keeper',    shortcut: 'g' },
    { id: 'interception',   label: 'Interception',   shortcut: 'v' },
    { id: 'pass',           label: 'Pass',           shortcut: null, extra: '2,3' },
  ],
  defense: [
    { id: 'goal_keeper', label: 'Goal keeper', shortcut: 'g' },
    { id: 'tackle',      label: 'Tackle',      shortcut: 'a' },
  ],
  standard: [],
}

// Standard events always shown below context group in sidebar
export const STANDARD_EVENTS = [
  { id: 'half_end',        label: 'Half end',         shortcut: null },
  { id: 'foul_committed',  label: 'Foul committed',   shortcut: 'x' },
  { id: 'shield',          label: 'Shield',           shortcut: 'c' },
  { id: 'out',             label: 'Out',              shortcut: 'o' },
  { id: 'stoppage',        label: 'Stoppage',         shortcut: null },
  { id: 'own_goal_against',label: 'Own goal against', shortcut: null },
  { id: 'card',            label: 'Card',             shortcut: null },
  { id: 'substitution',    label: 'Substitution',     shortcut: null },
  { id: 'player_off',      label: 'Player off',       shortcut: null },
]

// Events that have NO base fields (show "Watch, no need to add base")
export const NO_BASE_EVENTS = [
  'half_start', 'half_end', 'out', 'stoppage', 'camera_on', 'camera_off',
  'referee_ball_drop', 'player_on', 'player_off',
]

// ── RESTART CONTEXT SIDEBAR GROUPS ──
// These appear based on the last event that set a restart state

export const RESTART_CONTEXT_GROUPS = {
  restart_foul: [
    { id: 'pass', label: 'Pass', shortcut: 'e' },
    { id: 'shot', label: 'Shot', shortcut: 's' },
  ],
  restart_throw: [
    { id: 'pass', label: 'Pass', shortcut: 'e' },
  ],
  restart_gk_corner: [
    { id: 'pass', label: 'Pass', shortcut: 'e' },
    { id: 'shot', label: 'Shot', shortcut: 's' },
  ],
  idle: [],
}

// ── PASS TYPE AUTO-POPULATION ──
// Based on the previous event / restart context, what Type should be pre-selected
export const PASS_TYPE_AUTO = {
  half_start:        'kick_off',
  foul_committed:    'free_kick',
  out_sideline:      'throw_in',
  out_endline_corner: 'corner',
  out_endline_gk:    'goal_kick',
  default:           'open_play',
}

// ── PASS SOURCE OPTIONS (matches video exactly) ──
export const PASS_TYPE_DROPDOWN = [
  { value: 'kick_off',   label: 'Kick off' },
  { value: 'open_play',  label: 'Open play' },
  { value: 'free_kick',  label: 'Free kick' },
  { value: 'throw_in',   label: 'Throw in' },
  { value: 'corner',     label: 'Corner' },
  { value: 'goal_kick',  label: 'Goal kick' },
]

// ── OUT LOCATION OPTIONS ──
export const OUT_LOCATION_OPTIONS = [
  { value: 'sideline', label: 'Sideline' },
  { value: 'endline',  label: 'Endline' },
]

// ── FOUL COMMITTED QUALIFIER (Outcome is text input, not dropdown) ──
export const FOUL_TYPE_DROPDOWN = [
  { value: 'regular',   label: 'Regular' },
  { value: 'dive',      label: 'Dive' },
  { value: 'handball',  label: 'Handball' },
  { value: 'dangerous', label: 'Dangerous Play' },
  { value: 'foul_out',  label: 'Foul Out' },
]
// Outcome for foul = FREE TEXT FIELD (Edit field placeholder)

// ── SEQUENCE RULES (extended with restart contexts) ──
// lastEvent → which offense/defense group to show on each side
// When away team acts, offense=right, defense=left (sides swap)
export const EVENT_SEQUENCES_V2 = {
  // Standard sequences
  half_start:       { offense: 'new_half',      defense: 'new_half',       restart: null },
  pass:             { offense: 'flight_o',       defense: 'flight_d',       restart: null },
  ball_receipt:     { offense: 'carry',          defense: 'defense',        restart: null },
  reception:        { offense: 'carry',          defense: 'defense',        restart: null },
  carry:            { offense: 'carry',          defense: 'defense',        restart: null },
  dribble:          { offense: 'carry',          defense: 'defense',        restart: null },
  shot:             { offense: 'carry',          defense: 'defense',        restart: null },
  // Restart sequences
  foul_committed:   { offense: 'restart_foul',   defense: 'idle',           restart: 'foul' },
  out:              { offense: 'idle',            defense: null,             restart: 'out' },  // right side determined by out location
  // Default
  default:          { offense: 'standard',        defense: 'standard',       restart: null },
}
