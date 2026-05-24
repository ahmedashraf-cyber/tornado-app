// Event sequence rules from Statsbomb Data Spec v2.0
// Defines: after event X is logged, what events can follow on each side

// Each state has: offenseEvents[], defenseEvents[], label for the group header

export const EVENT_STATES = {

  // Initial state — before any event
  idle: {
    offenseLabel: null,
    defenseLabel: null,
    offenseEvents: [],
    defenseEvents: [],
  },

  // After Half Start is logged — "New half" state
  new_half: {
    offenseLabel: 'New half',
    defenseLabel: 'New half',
    offenseEvents: [
      { id: 'pass',      label: 'Pass',      shortcut: 'e' },
      { id: 'shot',      label: 'Shot',      shortcut: 's' },
    ],
    defenseEvents: [
      { id: 'pass',      label: 'Pass',      shortcut: 'e' },
      { id: 'shot',      label: 'Shot',      shortcut: 's' },
    ],
  },

  // Ball is being carried — Carry state
  carry: {
    offenseLabel: 'Carry',
    defenseLabel: 'Defense',
    offenseEvents: [
      { id: 'dribble',    label: 'Dribble',    shortcut: 'd' },
      { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
      { id: 'pass',       label: 'Pass',       shortcut: 'e' },
      { id: 'reception',  label: 'Reception',  shortcut: 'w' },
      { id: 'shot',       label: 'Shot',       shortcut: 's' },
    ],
    defenseEvents: [
      { id: 'goal_keeper',  label: 'Goal keeper',  shortcut: 'g' },
      { id: 'tackle',       label: 'Tackle',       shortcut: 'a' },
      { id: 'foul_committed', label: 'Foul committed', shortcut: 'x' },
      { id: 'interception', label: 'Interception', shortcut: 'v' },
    ],
  },

  // Pass in flight — offense and defense view
  flight: {
    offenseLabel: 'Flight o',
    defenseLabel: 'Flight d',
    offenseEvents: [
      { id: 'block',      label: 'Block',      shortcut: 'b' },
      { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
      { id: 'pass',       label: 'Pass',       shortcut: 'q' },
      { id: 'reception',  label: 'Reception',  shortcut: 'w' },
      { id: 'shot',       label: 'Shot',       shortcut: 's' },
    ],
    defenseEvents: [
      { id: 'ball_recovery', label: 'Ball recovery', shortcut: 'r' },
      { id: 'block',         label: 'Block',         shortcut: 'b' },
      { id: 'clearance',     label: 'Clearance',     shortcut: 'f' },
      { id: 'goal_keeper',   label: 'Goal keeper',   shortcut: 'g' },
      { id: 'interception',  label: 'Interception',  shortcut: 'v' },
      { id: 'pass',          label: 'Pass',          shortcut: null, badge: '2,3' },
    ],
  },

  // After reception
  reception: {
    offenseLabel: 'Carry',
    defenseLabel: 'Defense',
    offenseEvents: [
      { id: 'dribble',    label: 'Dribble',    shortcut: 'd' },
      { id: 'miscontrol', label: 'Miscontrol', shortcut: 't' },
      { id: 'pass',       label: 'Pass',       shortcut: 'e' },
      { id: 'shot',       label: 'Shot',       shortcut: 's' },
    ],
    defenseEvents: [
      { id: 'goal_keeper',    label: 'Goal keeper',    shortcut: 'g' },
      { id: 'tackle',         label: 'Tackle',         shortcut: 'a' },
      { id: 'foul_committed', label: 'Foul committed', shortcut: 'x' },
      { id: 'pressure',       label: 'Pressure',       shortcut: 'p' },
    ],
  },
}

// Map from event id → next state
export const EVENT_NEXT_STATE = {
  half_start: 'new_half',
  pass:       'flight',
  reception:  'carry',
  dribble:    'carry',
  shot:       'idle',
  block:      'idle',
  tackle:     'idle',
  interception: 'carry',
  ball_recovery: 'carry',
  clearance:  'idle',
  foul_committed: 'idle',
  miscontrol: 'idle',
  half_end:   'idle',
  out:        'idle',
  goal_keeper: 'idle',
  pressure:   'carry',
  card:       'idle',
  stoppage:   'idle',
  own_goal_against: 'idle',
  shield:     'idle',
}

// Standard events always shown below the dynamic section
export const STANDARD_EVENTS_HOME = [
  { id: 'half_end',         label: 'Half end',         shortcut: null },
  { id: 'foul_committed',   label: 'Foul committed',   shortcut: 'x' },
  { id: 'shield',           label: 'Shield',           shortcut: 'c' },
  { id: 'out',              label: 'Out',              shortcut: 'o' },
  { id: 'stoppage',         label: 'Stoppage',         shortcut: null },
  { id: 'own_goal_against', label: 'Own goal against', shortcut: null },
  { id: 'card',             label: 'Card',             shortcut: null },
]

export const STANDARD_EVENTS_AWAY = [...STANDARD_EVENTS_HOME]
