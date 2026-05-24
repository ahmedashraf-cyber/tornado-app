// Formations and their valid positions — from Statsbomb Data Spec v2.0
// Each formation maps to an ordered list of valid position codes

export const FORMATIONS = {
  '4-4-2':    ['GK','LB','LCB','RCB','RB','LM','LCM','RCM','RM','LCF','RCF'],
  '4-4-1-1':  ['GK','LB','LCB','RCB','RB','LM','LCM','RCM','RM','CAM','CF'],
  '4-1-2-1-2':['GK','LB','LCB','RCB','RB','CDM','LCM','RCM','CAM','LCF','RCF'],
  '4-2-2-2':  ['GK','LB','LCB','RCB','RB','LDM','RDM','LAM','RAM','LCF','RCF'],
  '4-3-3':    ['GK','LB','LCB','RCB','RB','CDM','LCM','RCM','LW','RW','CF'],
  '4-5-1':    ['GK','LB','LCB','RCB','RB','CDM','LM','LCM','RCM','RM','CF'],
  '4-1-4-1':  ['GK','LB','LCB','RCB','RB','CDM','LM','LCM','RCM','RM','CF'],
  '4-3-2-1':  ['GK','LB','LCB','RCB','RB','CDM','LCM','RCM','LAM','RAM','CF'],
  '4-2-3-1':  ['GK','LB','LCB','RCB','RB','LDM','RDM','LW','CAM','RW','CF'],
  '3-5-2':    ['GK','LCB','CB','RCB','LWB','CDM','RWB','LCM','RCM','LCF','RCF'],
  '3-5-1-1':  ['GK','LCB','CB','RCB','LWB','CDM','RWB','LCM','RCM','CAM','CF'],
  '3-4-3':    ['GK','LCB','CB','RCB','LWB','LCM','RCM','RWB','LW','RW','CF'],
  '3-4-2-1':  ['GK','LCB','CB','RCB','LWB','LCM','RCM','RWB','LAM','RAM','CF'],
  '3-4-1-2':  ['GK','LCB','CB','RCB','LWB','LCM','RCM','RWB','CAM','LCF','RCF'],
  '3-1-4-2':  ['GK','LCB','CB','RCB','CDM','LM','LCM','RCM','RM','LCF','RCF'],
  '5-4-1':    ['GK','LB','LCB','CB','RCB','RB','LM','LCM','RCM','RM','CF'],
  '3-3-3-1':  ['GK','LCB','CB','RCB','LCM','CM','RCM','LW','CAM','RW','CF'],
  '3-2-4-1':  ['GK','LCB','CB','RCB','LDM','RDM','LM','LCM','RCM','RM','CF'],
}

// Full position grid from Statsbomb spec — all possible positions
export const ALL_POSITIONS = [
  'GK',
  'RB','RCB','CB','LCB','LB',
  'RWB','LWB',
  'RDM','CDM','LDM',
  'RM','RCM','CM','LCM','LM',
  'RAM','CAM','LAM',
  'RW','LW',
  'SS',
  'RCF','CF','LCF',
  'ST',
]

// Position layout coordinates for the pitch grid (x: 0-100, y: 0-100, origin top-left = attacking end)
// Pitch rendered top = attack, bottom = GK
export const POSITION_COORDS = {
  GK:  { x: 50, y: 92 },
  RB:  { x: 82, y: 78 }, LB:  { x: 18, y: 78 },
  RCB: { x: 68, y: 78 }, LCB: { x: 32, y: 78 }, CB: { x: 50, y: 78 },
  RWB: { x: 88, y: 65 }, LWB: { x: 12, y: 65 },
  RDM: { x: 70, y: 62 }, CDM: { x: 50, y: 62 }, LDM: { x: 30, y: 62 },
  RM:  { x: 85, y: 50 }, LM:  { x: 15, y: 50 },
  RCM: { x: 68, y: 50 }, CM:  { x: 50, y: 50 }, LCM: { x: 32, y: 50 },
  RAM: { x: 72, y: 36 }, CAM: { x: 50, y: 36 }, LAM: { x: 28, y: 36 },
  RW:  { x: 82, y: 24 }, LW:  { x: 18, y: 24 },
  SS:  { x: 65, y: 24 },
  RCF: { x: 68, y: 14 }, CF:  { x: 50, y: 14 }, LCF: { x: 32, y: 14 },
  ST:  { x: 50, y: 10 },
}

export const FORMATION_LIST = ['Custom', ...Object.keys(FORMATIONS)]

// Keyboard shortcuts for events (from video)
export const EVENT_SHORTCUTS = {
  's': 'Half start',
  'x': 'Foul committed',
  'o': 'Out',
  'c': 'Shield',
}

// Event buttons shown in left/right sidebars (from video frame 1)
export const EVENT_BUTTONS = [
  { name: 'Card',             shortcut: null },
  { name: 'Foul committed',   shortcut: 'X' },
  { name: 'Half end',         shortcut: null },
  { name: 'Half start',       shortcut: 'S' },
  { name: 'Out',              shortcut: 'O' },
  { name: 'Own goal against', shortcut: null },
  { name: 'Shield',           shortcut: 'C' },
  { name: 'Stoppage',         shortcut: null },
]
