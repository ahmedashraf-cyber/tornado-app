// Full event definitions from Statsbomb Data Spec v2.0

export const EVENT_GROUPS = {
  NEW_HALF: 'new_half',
  CARRY:    'carry',
  FLIGHT_O: 'flight_o',
  FLIGHT_D: 'flight_d',
  DEFENSE:  'defense',
  LOOSE_O:  'loose_o',
  LOOSE_D:  'loose_d',
  STANDARD: 'standard',
}

// ── PASS qualifiers ──
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
  { value: 'right_foot', label: 'Right Foot' },
  { value: 'left_foot',  label: 'Left Foot' },
  { value: 'head',       label: 'Head' },
  { value: 'keeper_arm', label: 'Keeper Arm' },
  { value: 'drop_kick',  label: 'Drop Kick' },
  { value: 'no_touch',   label: 'No Touch' },
  { value: 'other',      label: 'Other' },
  { value: 'none',       label: 'None (throw-in)' },
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
  { value: 'open_play', label: 'Open Play' },
  { value: 'free_kick', label: 'Free Kick' },
  { value: 'penalty',   label: 'Penalty' },
  { value: 'corner',    label: 'Corner' },
  { value: 'kick_off',  label: 'Kick Off' },
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

// ── FOUL COMMITTED qualifiers (Video: 3-step — Type → Outcome → Action) ──
// Type step — 8 options with keyboard [1]-[8]
export const FOUL_TYPE_RADIO = [
  { key: '1', value: 'regular',        label: 'Regular' },
  { key: '2', value: 'handball',       label: 'Handball' },
  { key: '3', value: 'foul_out',       label: 'Foul out' },
  { key: '4', value: '6_seconds',      label: 'Six seconds' },
  { key: '5', value: 'backpass_pick',  label: 'Backpass pick' },
  { key: '6', value: 'dangerous_play', label: 'Dangerous play' },
  { key: '7', value: 'dive',           label: 'Dive' },
  { key: '8', value: 'offside',        label: 'Offside' },
]

// Outcome step — 2 options
export const FOUL_OUTCOME_RADIO = [
  { key: '1', value: 'advantage', label: 'Advantage' },
  { key: '2', value: 'penalty',   label: 'Penalty' },
]

// Action step — 4 card options
export const FOUL_ACTION_RADIO = [
  { key: '1', value: 'no_card',       label: 'No card' },
  { key: '2', value: 'yellow',        label: 'Yellow card' },
  { key: '3', value: 'second_yellow', label: 'Second yellow' },
  { key: '4', value: 'red',           label: 'Red card' },
]

// Legacy dropdown kept for backward compat
export const FOUL_TYPE_DROPDOWN = [
  { value: 'regular',        label: 'Regular' },
  { value: 'handball',       label: 'Handball' },
  { value: 'foul_out',       label: 'Foul Out' },
  { value: '6_seconds',      label: '6 Seconds' },
  { value: 'backpass_pick',  label: 'Backpass Pick' },
  { value: 'dangerous_play', label: 'Dangerous Play' },
  { value: 'dive',           label: 'Dive' },
  { value: 'offside',        label: 'Offside' },
]

// ── CARD qualifiers (Video: single Action step, no teams-side) ──
export const CARD_ACTION_RADIO = [
  { key: '1', value: 'yellow',        label: 'Yellow card' },
  { key: '2', value: 'second_yellow', label: 'Second yellow' },
  { key: '3', value: 'red',           label: 'Red card' },
]
// Legacy
export const CARD_TYPE_OPTIONS = [
  { value: 'yellow',        label: 'Yellow Card' },
  { value: 'second_yellow', label: 'Second Yellow' },
  { value: 'red',           label: 'Red Card' },
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

// ── DRIBBLE qualifiers (Video: Type → Extras multi-step) ──
// Type step — only [1] Overrun shown in video
export const DRIBBLE_TYPE_RADIO = [
  { key: '1', value: 'overrun', label: 'Overrun' },
]
// Extras step
export const DRIBBLE_EXTRAS_RADIO = [
  { key: '1', value: 'no_touch', label: 'No touch' },
  { key: '2', value: 'nutmeg',   label: 'Nutmeg' },
]
// Legacy options
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

// ── CLEARANCE qualifiers (Video: Body part → Miscommunication multi-step) ──
export const CLEARANCE_BODY_RADIO = [
  { key: '2', value: 'right_foot', label: 'Right foot' },
  { key: '3', value: 'left_foot',  label: 'Left foot' },
  { key: '4', value: 'head',       label: 'Head' },
  { key: '9', value: 'other',      label: 'Other' },
]
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

// ── GOALKEEPER qualifiers (Video: GK_Against_shots + Keeper_Sweeper) ──
// Type step — 8 options in 2 rows (video: Keeper_Sweeper reveals all)
// Row 1: [1]-[5], Row 2: [6]-[8]  (after row 1 fills, [7]Clear/[8]Claim show in Outcome slot too)
export const GK_TYPE_RADIO = [
  { key: '1', value: 'collected',       label: 'Collected' },
  { key: '2', value: 'punch',           label: 'Punch' },
  { key: '3', value: 'smother',         label: 'Smother' },
  { key: '4', value: 'save_attempt',    label: 'Save attempt' },
  { key: '5', value: 'keeper_sweeper',  label: 'Keeper sweeper' },
  { key: '6', value: 'save',            label: 'Save' },
  { key: '7', value: 'clear',           label: 'Clear' },
  { key: '8', value: 'claim',           label: 'Claim' },
]
// Miscommunication step — 3rd step for GK (video: Punch_Tagging)
export const GK_MISCOMMUNICATION_RADIO = [
  { key: '1', value: 'miscommunication', label: 'Miscommunication' },
]

// Outcome step — per video: [1]Won [3]Success [4]Fail [5]Second effort
export const GK_OUTCOME_RADIO = [
  { key: '1', value: 'won',           label: 'Won' },
  { key: '3', value: 'success',       label: 'Success' },
  { key: '4', value: 'fail',          label: 'Fail' },
  { key: '5', value: 'second_effort', label: 'Second effort' },
]

// Legacy GK options
// GK Body part dropdown (right side of qualifier strip)
export const GK_BODY_PART_OPTIONS = [
  { value: 'both_hands', label: 'Both Hands' },
  { value: 'right_hand', label: 'Right Hand' },
  { value: 'left_hand',  label: 'Left Hand' },
  { value: 'right_foot', label: 'Right Foot' },
  { value: 'left_foot',  label: 'Left Foot' },
  { value: 'head',       label: 'Head' },
  { value: 'chest',      label: 'Chest' },
]

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

// ── BALL RECOVERY qualifiers ──
export const BALL_RECOVERY_OUTCOME_OPTIONS = [
  { value: 'complete', label: 'Complete' },
  { value: 'fail',     label: 'Fail' },
]

// ── MISCONTROL qualifiers (Video: single Type radio step — no base fields) ──
export const MISCONTROL_TYPE_RADIO = [
  { key: '1', value: 'regular',    label: 'Regular' },
  { key: '2', value: 'aerial_won', label: 'Aerial won' },
]
export const MISCONTROL_TYPE_OPTIONS = [
  { value: 'regular',    label: 'Regular' },
  { value: 'aerial_won', label: 'Aerial Won' },
]

// ── INTERCEPTION qualifiers (Video: single Outcome radio step) ──
export const INTERCEPTION_OUTCOME_RADIO = [
  { key: '1', value: 'won',     label: 'Won' },
  { key: '2', value: 'success', label: 'Success' },
]
export const INTERCEPTION_OUTCOME_OPTIONS = [
  { value: 'won',     label: 'Won' },
  { value: 'success', label: 'Success' },
  { value: 'step_in', label: 'Step In' },
]

// ── STOPPAGE qualifiers ──
export const STOPPAGE_TYPE_OPTIONS = [
  { value: 'injury',    label: 'Injury' },
  { value: 'review',    label: 'Review (VAR)' },
  { value: 'abandoned', label: 'Abandoned' },
  { value: 'other',     label: 'Other' },
]

// ── HALF START extras ──
export const HALF_START_EXTRAS = [
  { value: 'late_video_start', label: 'Late Video Start' },
]

// ── HALF END extras ──
export const HALF_END_EXTRAS = [
  { value: 'none',             label: 'None' },
  { value: 'early_video_end',  label: 'Early Video End' },
  { value: 'match_suspended',  label: 'Match Suspended' },
]

// ── PLAYER OFF qualifier (video: Player_off_on_tagging) ──
export const PLAYER_OFF_TYPE_RADIO = [
  { key: '1', value: 'permanent', label: 'Permanent' },
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

// ── OUT qualifiers (Video: Out_Tag — Teams side step, then Location radio) ──
export const OUT_LOCATION_RADIO = [
  { key: '1', value: 'sideline', label: 'Sideline' },
  { key: '2', value: 'endline',  label: 'Endline' },
]
export const OUT_EXTRAS = [
  { value: 'sideline', label: 'Sideline (throw-in)' },
  { value: 'endline',  label: 'Endline (corner/goal kick)' },
]
export const OUT_LOCATION_OPTIONS = [
  { value: 'sideline', label: 'Sideline' },
  { value: 'endline',  label: 'Endline' },
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
export const EVENT_SEQUENCES = {
  half_start:     { offenseGroup: 'new_half',      defenseGroup: 'new_half' },
  pass:           { offenseGroup: 'flight_o',      defenseGroup: 'flight_d' },
  ball_receipt:   { offenseGroup: 'carry',         defenseGroup: 'defense' },
  reception:      { offenseGroup: 'carry',         defenseGroup: 'defense' },
  carry:          { offenseGroup: 'carry',         defenseGroup: 'defense' },
  dribble:        { offenseGroup: 'carry',         defenseGroup: 'defense' },
  // After shot → Shot flight context (video: GK_Against_shots)
  shot:           { offenseGroup: 'shot_flight_o', defenseGroup: 'shot_flight_d' },
  end_shot:       { offenseGroup: 'carry',         defenseGroup: 'defense' },
  // After incomplete pass
  ball_recovery:  { offenseGroup: 'carry',         defenseGroup: 'defense' },
  interception:   { offenseGroup: 'carry',         defenseGroup: 'defense' },
  // After Out → both sides Loose (video: Out_Tag)
  out:            { offenseGroup: 'loose_d',       defenseGroup: 'loose_o' },
  // Stoppage → both sides see stoppage context (End stoppage + Referee ball drop + Shot)
  stoppage:       { offenseGroup: 'stoppage_active', defenseGroup: 'stoppage_active' },
  // End stoppage → restart context (video: Referee_Ball_Drop_Tag)
  end_stoppage:   { offenseGroup: 'restart_stoppage', defenseGroup: 'restart_stoppage' },
  // After Pressure start → pressure context
  pressure_start: { offenseGroup: 'pressure_active', defenseGroup: 'pressure_idle' },
  pressure_end:   { offenseGroup: 'pressure_start',  defenseGroup: 'pressure_start' },
  default:        { offenseGroup: 'standard',      defenseGroup: 'standard' },
}

// After incomplete pass: both sides see loose context
export const LOOSE_SEQUENCES = {
  loose: { offenseGroup: 'loose_o', defenseGroup: 'loose_d' },
}

// ── SIDEBAR EVENT GROUPS ──
export const SIDEBAR_GROUPS = {
  new_half: [
    { id: 'pass', label: 'Pass', shortcut: 'e' },
    { id: 'shot', label: 'Shot', shortcut: 's' },
  ],
  carry: [
    { id: 'dribble',    label: 'Dribble',    shortcut: 'd' },
    { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
    { id: 'pass',       label: 'Pass',       shortcut: 'e' },
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
    { id: 'ball_recovery', label: 'Ball recovery', shortcut: 'r' },
    { id: 'block',         label: 'Block',         shortcut: 'b' },
    { id: 'clearance',     label: 'Clearance',     shortcut: 'f' },
    { id: 'goal_keeper',   label: 'Goal keeper',   shortcut: 'g' },
    { id: 'interception',  label: 'Interception',  shortcut: 'v' },
    { id: 'pass',          label: 'Pass',          shortcut: null, extra: '2,3' },
  ],
  defense: [
    { id: 'goal_keeper', label: 'Goal keeper', shortcut: 'g' },
    { id: 'tackle',      label: 'Tackle',      shortcut: 'a' },
  ],
  // Loose context — after incomplete pass, ball is free for either team
  loose_d: [
    { id: 'ball_recovery', label: 'Ball recovery', shortcut: 'r' },
    { id: 'block',         label: 'Block',         shortcut: 'b' },
    { id: 'clearance',     label: 'Clearance',     shortcut: 'f' },
    { id: 'error',         label: 'Error',         shortcut: null },
    { id: 'fifty_fifty',   label: 'Fifty fifty',   shortcut: null },
    { id: 'goal_keeper',   label: 'Goal keeper',   shortcut: 'g' },
    { id: 'pass',          label: 'Pass',          shortcut: '3' },
  ],
  loose_o: [
    { id: 'ball_recovery', label: 'Ball recovery', shortcut: 'r' },
    { id: 'block',         label: 'Block',         shortcut: 'b' },
    { id: 'clearance',     label: 'Clearance',     shortcut: 'f' },
    { id: 'error',         label: 'Error',         shortcut: null },
    { id: 'fifty_fifty',   label: 'Fifty fifty',   shortcut: null },
    { id: 'goal_keeper',   label: 'Goal keeper',   shortcut: 'g' },
    { id: 'pass',          label: 'Pass',          shortcut: '3' },
  ],
  // Shot flight context — after a shot is taken (video: GK_Against_shots)
  shot_flight_o: [
    { id: 'block',    label: 'Block',    shortcut: 'b' },
    { id: 'end_shot', label: 'End shot', shortcut: 's' },
    { id: 'shot',     label: 'Shot',     shortcut: 'z' },
  ],
  shot_flight_d: [
    { id: 'block',       label: 'Block',       shortcut: 'b' },
    { id: 'goal_keeper', label: 'Goal keeper', shortcut: 'g' },
  ],
  // During a stoppage — shown on both sides (video: Referee_Ball_Drop_Tag frame_0001)
  stoppage_active: [
    { id: 'end_stoppage',      label: 'End stoppage',      shortcut: null },
    { id: 'referee_ball_drop', label: 'Referee ball drop', shortcut: null },
    { id: 'shot',              label: 'Shot',              shortcut: 's'  },
  ],
  // Stoppage restart context — after Stoppage/End stoppage (video: Referee_Ball_Drop_Tag)
  restart_stoppage: [
    { id: 'pass',               label: 'Pass',               shortcut: 'e' },
    { id: 'referee_ball_drop',  label: 'Referee ball drop',  shortcut: null },
    { id: 'shot',               label: 'Shot',               shortcut: 's' },
  ],
  // Pressures Collection mode contexts (video: Pressure_Tag)
  pressure_start: [
    { id: 'pressure_start', label: 'Pressure start', shortcut: 'g' },
  ],
  pressure_active: [
    { id: 'pressure_end', label: 'Pressure end', shortcut: 'g' },
  ],
  pressure_idle: [],
  standard: [],
}

// Standard events always shown below divider in sidebar
export const STANDARD_EVENTS = [
  { id: 'half_end',         label: 'Half end',         shortcut: null },
  { id: 'foul_committed',   label: 'Foul committed',   shortcut: 'x' },
  { id: 'shield',           label: 'Shield',           shortcut: 'c' },
  { id: 'out',              label: 'Out',              shortcut: 'o' },
  { id: 'stoppage',         label: 'Stoppage',         shortcut: null },
  { id: 'own_goal_against', label: 'Own goal against', shortcut: null },
  { id: 'card',             label: 'Card',             shortcut: null },
  { id: 'substitution',     label: 'Substitution',     shortcut: null },
  { id: 'player_off',       label: 'Player off',       shortcut: null },
]

// Stoppage context group — shown both sides during a stoppage
// (replaces standard context; triggered when lastEvent='stoppage')
// After end_stoppage → restart_stoppage context
export const STOPPAGE_CONTEXT_EVENTS = [
  { id: 'end_stoppage',       label: 'End stoppage',      shortcut: null },
  { id: 'referee_ball_drop',  label: 'Referee ball drop', shortcut: null },
  { id: 'shot',               label: 'Shot',              shortcut: 's'  },
]

// Events that need NO qualifiers — save immediately or no base fields
export const NO_BASE_EVENTS = [
  'half_start', 'half_end', 'out', 'stoppage', 'camera_on', 'camera_off',
  'referee_ball_drop', 'player_on', 'player_off', 'reception',
  'error',           // Error: no base fields per video
  'end_shot',        // End shot: no base fields per video
  'referee_ball_drop', // No base fields
  'end_stoppage',    // End stoppage: no base fields
  'pressure_start',  // Pressure start: no base fields
  'pressure_end',    // Pressure end: no base fields
  'player_off_event', // Player Off from pitch grid
  'player_on_event',  // Player On from pitch grid
]

// Events that skip teams-side selection entirely
export const NO_TEAM_SELECT_EVENTS = [
  'card', 'half_start', 'half_end', 'out', 'stoppage',
  'own_goal_against', 'substitution', 'player_off', 'shield',
  'error', 'reception', 'end_shot',
  'referee_ball_drop', 'end_stoppage', 'pressure_start', 'pressure_end',
  'player_off_event', 'player_on_event',
]

// ── RESTART CONTEXT SIDEBAR GROUPS ──
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
export const PASS_TYPE_AUTO = {
  half_start:         'kick_off',
  foul_committed:     'free_kick',
  out_sideline:       'throw_in',
  out_endline_corner: 'corner',
  out_endline_gk:     'goal_kick',
  default:            'open_play',
}

export const PASS_TYPE_DROPDOWN = [
  { value: 'kick_off',     label: 'Kick off' },
  { value: 'open_play',    label: 'Open play' },
  { value: 'free_kick',    label: 'Free kick' },
  { value: 'throw_in',     label: 'Throw in' },
  { value: 'corner',       label: 'Corner' },
  { value: 'goal_kick',    label: 'Goal kick' },
  { value: 'recovery',     label: 'Recovery' },
  { value: 'interception', label: 'Interception' },
  { value: 'first_time',   label: 'First time' },
]

export const EVENT_SEQUENCES_V2 = {
  half_start:     { offense: 'new_half',    defense: 'new_half',  restart: null },
  pass:           { offense: 'flight_o',    defense: 'flight_d',  restart: null },
  ball_receipt:   { offense: 'carry',       defense: 'defense',   restart: null },
  reception:      { offense: 'carry',       defense: 'defense',   restart: null },
  carry:          { offense: 'carry',       defense: 'defense',   restart: null },
  dribble:        { offense: 'carry',       defense: 'defense',   restart: null },
  shot:           { offense: 'carry',       defense: 'defense',   restart: null },
  foul_committed: { offense: 'restart_foul',defense: 'idle',      restart: 'foul' },
  out:            { offense: 'idle',        defense: null,        restart: 'out' },
  default:        { offense: 'standard',    defense: 'standard',  restart: null },
}

export const INCOMPLETE_PASS_TRIGGERS = [
  'interception', 'ball_recovery',
]
