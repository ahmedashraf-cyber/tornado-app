import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TASKS = [
  { key: 'base',           label: 'Base' },
  { key: 'extras',         label: 'Extras' },
  { key: 'players_home',   label: 'Players: Home' },
  { key: 'players_away',   label: 'Players: Away' },
  { key: 'location_home',  label: 'Location: Home' },
  { key: 'location_away',  label: 'Location: Away' },
  { key: 'impact',         label: 'Impact' },
  { key: 'goal_location',  label: 'Goal location' },
  { key: 'clocks',         label: 'Clocks' },
  { key: 'formation',      label: 'Formation' },
  { key: 'ball_placement', label: 'Ball placement' },
]

// Simulated booking states — in real app these come from Firestore
const MOCK_BOOKINGS = {
  base:         { checked: true,  status: 'other' },
  extras:       { checked: true,  status: 'other' },
  players_home: { checked: true,  status: 'me' },
  players_away: { checked: true,  status: 'me' },
  location_home:  { checked: false, status: null },
  location_away:  { checked: false, status: null },
  impact:         { checked: false, status: null },
  goal_location:  { checked: false, status: null },
  clocks:         { checked: false, status: null },
  formation:      { checked: false, status: null },
  ball_placement: { checked: false, status: null },
}

export default function HamburgerMenu({
  isOpen,
  onClose,
  match,
  half,
  settings,
  onSettingsChange,
  bookedTasks = {},
  onBookTask,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tasksOpen, setTasksOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const halfLabel = half === 'first_half' ? '1'
    : half === 'second_half' ? '2'
    : half === 'et1' ? 'ET1'
    : half === 'et2' ? 'ET2'
    : half === 'penalties' ? 'PEN' : '1'

  function handleGoToOtherHalf() {
    onClose()
    navigate('/matches')
  }

  function handleLogout() {
    logout()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#f0f2f5] flex flex-col shadow-xl">

        {/* ── Header ── */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4">
          {/* Home icon */}
          <div className="text-[#1e3a6e] mb-2">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          {/* Collector name */}
          <p className="text-[#1e3a6e] font-semibold text-sm mb-3">
            {user?.email?.split('@')[0] || 'Collector'}
          </p>
          {/* Match info */}
          <p className="font-bold text-sm text-gray-800 text-center">{match?.competition} {match?.season} GW {match?.gameWeek}</p>
          <p className="font-bold text-sm text-gray-800 text-center mt-0.5">{match?.matchDate} {match?.matchName}</p>
          <p className="font-bold text-sm text-gray-800 mt-0.5">Half: {halfLabel}</p>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-2">

          {/* Tasks accordion */}
          <button
            onClick={() => setTasksOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1e3a6e] text-white rounded text-sm font-medium mb-1"
          >
            <span>Tasks</span>
            <svg className={`w-4 h-4 transition-transform ${tasksOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {tasksOpen && (
            <div className="mb-2 bg-white rounded border border-gray-200">
              {TASKS.map(task => {
                const status = bookedTasks[task.key] || MOCK_BOOKINGS[task.key]?.status || null
                const isChecked = status === 'me' || status === 'other'
                const isMe = status === 'me'
                const isOther = status === 'other'
                return (
                  <div key={task.key} className="flex items-center justify-between px-3 py-1.5 border-b border-gray-50 last:border-b-0">
                    <div className="flex items-center gap-2">
                      {/* Clickable radio to book/unbook */}
                      <button
                        onClick={() => {
                          if (isMe) {
                            // Unbook
                            onBookTask && onBookTask(task.key, null)
                          } else if (!isOther) {
                            // Book as me
                            onBookTask && onBookTask(task.key, 'me')
                          }
                        }}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isMe
                            ? 'bg-blue-500 border-blue-500'
                            : isOther
                            ? 'bg-gray-300 border-gray-300'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isMe && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                      <span className="text-xs text-gray-700">{task.label}:</span>
                    </div>
                    {isOther && (
                      <span className="text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded">Booked by other</span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-semibold bg-green-500 text-white px-2 py-0.5 rounded">Booked by me</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Settings accordion */}
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1e3a6e] text-white rounded text-sm font-medium mb-1"
          >
            <span>Settings</span>
            <svg className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {settingsOpen && (
            <div className="mb-2 bg-white rounded border border-gray-200 p-3">
              {/* Grid controls */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Rows count</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      value={settings.rowsCount}
                      onChange={e => onSettingsChange({ rowsCount: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs outline-none"
                      min={0} max={20}
                    />
                    <div className="flex flex-col border-l border-gray-300">
                      <button onClick={() => onSettingsChange({ rowsCount: settings.rowsCount + 1 })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▲</button>
                      <button onClick={() => onSettingsChange({ rowsCount: Math.max(0, settings.rowsCount - 1) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▼</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Rows transparency</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      value={settings.rowsTransparency}
                      onChange={e => onSettingsChange({ rowsTransparency: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs outline-none"
                      min={0} max={1} step={0.1}
                    />
                    <div className="flex flex-col border-l border-gray-300">
                      <button onClick={() => onSettingsChange({ rowsTransparency: Math.min(1, +(settings.rowsTransparency + 0.1).toFixed(1)) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▲</button>
                      <button onClick={() => onSettingsChange({ rowsTransparency: Math.max(0, +(settings.rowsTransparency - 0.1).toFixed(1)) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▼</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Columns count</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      value={settings.colsCount}
                      onChange={e => onSettingsChange({ colsCount: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs outline-none"
                      min={0} max={20}
                    />
                    <div className="flex flex-col border-l border-gray-300">
                      <button onClick={() => onSettingsChange({ colsCount: settings.colsCount + 1 })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▲</button>
                      <button onClick={() => onSettingsChange({ colsCount: Math.max(0, settings.colsCount - 1) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▼</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Columns transparency</label>
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      type="number"
                      value={settings.colsTransparency}
                      onChange={e => onSettingsChange({ colsTransparency: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs outline-none"
                      min={0} max={1} step={0.1}
                    />
                    <div className="flex flex-col border-l border-gray-300">
                      <button onClick={() => onSettingsChange({ colsTransparency: Math.min(1, +(settings.colsTransparency + 0.1).toFixed(1)) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▲</button>
                      <button onClick={() => onSettingsChange({ colsTransparency: Math.max(0, +(settings.colsTransparency - 0.1).toFixed(1)) })} className="px-1 py-0.5 hover:bg-gray-100 text-[10px]">▼</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch Color */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 block mb-1.5">Pitch Color</label>
                <div className="flex gap-2">
                  {['#2d8a4e', '#1a1a1a'].map(color => (
                    <button
                      key={color}
                      onClick={() => onSettingsChange({ pitchColor: color })}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.pitchColor === color ? '#3b82f6' : 'transparent',
                      }}
                    >
                      {settings.pitchColor === color && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { key: 'invertRight', label: 'Invert Right Side' },
                { key: 'invertLeft',  label: 'Invert Left Side' },
                { key: 'showXY',      label: 'Show x,y' },
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-700">{toggle.label}</span>
                  <button
                    onClick={() => onSettingsChange({ [toggle.key]: !settings[toggle.key] })}
                    className={`relative w-9 h-5 rounded-full transition-colors ${settings[toggle.key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[toggle.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}

              {/* Team colors */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {['Team a', 'Team b'].map((team, i) => (
                  <div key={i} className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-700">{team}</span>
                    <input
                      type="color"
                      value={i === 0 ? settings.teamAColor : settings.teamBColor}
                      onChange={e => onSettingsChange({ [i === 0 ? 'teamAColor' : 'teamBColor']: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Go To Other Half button ── */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleGoToOtherHalf}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded transition-colors"
          >
            Go To Other Half
          </button>
        </div>

        {/* ── Logout icon ── */}
        <div className="px-3 pb-4 flex justify-start">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 p-1"
            title="Sign out"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
