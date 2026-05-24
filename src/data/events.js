// Event definitions with keyboard shortcuts — from the video
// Each event has: id, label, shortcut (key), team (home | away | both)

export const HOME_EVENTS = [
  { id: 'card',            label: 'Card',            shortcut: null },
  { id: 'foul_committed',  label: 'Foul committed',  shortcut: 'x' },
  { id: 'half_end',        label: 'Half end',         shortcut: null },
  { id: 'half_start',      label: 'Half start',       shortcut: 's' },
  { id: 'out',             label: 'Out',              shortcut: 'o' },
  { id: 'own_goal_against',label: 'Own goal against', shortcut: null },
  { id: 'shield',          label: 'Shield',           shortcut: 'c' },
  { id: 'stoppage',        label: 'Stoppage',         shortcut: null },
]

export const AWAY_EVENTS = [...HOME_EVENTS]

// All keyboard shortcuts mapped
export const KEYBOARD_SHORTCUTS = {
  's': { event: 'half_start', team: 'home' },
  'x': { event: 'foul_committed', team: 'home' },
  'o': { event: 'out', team: 'home' },
  'c': { event: 'shield', team: 'home' },
}
