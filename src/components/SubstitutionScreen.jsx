import { useState, useEffect } from 'react'
import { FORMATIONS, ALL_POSITIONS, POSITION_COORDS, FORMATION_LIST } from '../data/formations'

// ── SubstitutionScreen ──
// Full-screen overlay that replaces collection UI when a Substitution event fires.
// Video: Substitution_Tagging.mp4
//
// Layout:
//   Top bar: Formation Layout ▾ | 🏠 HomeTeam | ✈ AwayTeam | Reason: [label] | Submit Changes
//   Left panel: player search + list (all squad members)
//   Center panel: Substitution log (player off red ⊗, player on green ⊕)
//   Right: pitch grid with position cards
//
// Flow:
//   1. Click player in left list → selectedPlayer state
//   2. Click position box with player → marks as subbed off (red ⊗), puts selectedPlayer in that pos
//   3. Reason modal: [1] Tactical  [2] Injury — select → confirm
//   4. Submit Changes → onConfirm(subData) → saves to Firestore, closes

export default function SubstitutionScreen({
  match,
  homeXI,       // { [position]: { number, name } }
  awayXI,
  homeFormation,
  awayFormation,
  subReason,    // pre-filled from qualifier if any
  onConfirm,    // fn(subData) — saves event, closes
  onCancel,
}) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [formation, setFormation] = useState({
    home: homeFormation || 'Custom',
    away: awayFormation || 'Custom',
  })
  const [assignments, setAssignments] = useState({
    home: { ...homeXI },
    away: { ...awayXI },
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null) // player being subbed IN
  const [subLog, setSubLog] = useState([]) // [{ off: {number,name}, on: {number,name}, position }]
  const [reason, setReason] = useState(subReason || '')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [pendingSub, setPendingSub] = useState(null) // { position, playerOff, playerOn }

  const team = activeTeam
  const currentFormation = formation[team]
  const currentAssignments = assignments[team]

  const validPositions = currentFormation === 'Custom'
    ? ALL_POSITIONS
    : (FORMATIONS[currentFormation] || ALL_POSITIONS)

  // Get all players for current team (from assignments)
  const assignedPlayers = Object.values(currentAssignments).filter(Boolean)
  const allPlayers = [...assignedPlayers]
  const filteredPlayers = allPlayers.filter(p =>
    !searchQuery.trim() ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.number).includes(searchQuery)
  )

  // Check if player is subbed off in this session
  function isSubbedOff(number) {
    return subLog.some(s => s.off?.number === number)
  }

  function handlePlayerSelect(player) {
    setSelectedPlayer(player)
  }

  function handlePositionClick(position) {
    const playerInPosition = currentAssignments[position]
    if (!playerInPosition) return

    if (!selectedPlayer) {
      // Just select the player in that position for subbing off
      setSelectedPlayer(playerInPosition)
      return
    }

    if (selectedPlayer.number === playerInPosition.number) {
      setSelectedPlayer(null)
      return
    }

    // Trigger sub: playerInPosition comes off, selectedPlayer comes on
    setPendingSub({ position, playerOff: playerInPosition, playerOn: selectedPlayer })
    setShowReasonModal(true)
  }

  function confirmSubstitution(chosenReason) {
    if (!pendingSub) return
    const { position, playerOff, playerOn } = pendingSub

    // Update pitch
    setAssignments(prev => ({
      ...prev,
      [team]: { ...prev[team], [position]: playerOn }
    }))

    // Add to log
    setSubLog(prev => [...prev, { off: playerOff, on: playerOn, position, reason: chosenReason }])
    setReason(chosenReason)
    setSelectedPlayer(null)
    setPendingSub(null)
    setShowReasonModal(false)
  }

  function handleSubmit() {
    onConfirm({
      team: activeTeam,
      subLog,
      reason,
      formation: formation[team],
      assignments: assignments[team],
    })
  }

  // Keyboard shortcuts in reason modal
  useEffect(() => {
    if (!showReasonModal) return
    function handleKey(e) {
      if (e.key === '1') confirmSubstitution('tactical')
      if (e.key === '2') confirmSubstitution('injury')
      if (e.key === 'Escape') { setPendingSub(null); setShowReasonModal(false) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showReasonModal, pendingSub])

  const homeTeamName = match?.homeTeam || 'Home'
  const awayTeamName = match?.awayTeam || 'Away'

  // Derive formation label string (e.g. "4 3 3")
  const formationLabel = currentFormation !== 'Custom'
    ? currentFormation.replace(/-/g, ' ')
    : ''

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
        {/* Formation dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Formation Layout :</span>
          <select
            value={currentFormation}
            onChange={e => setFormation(prev => ({ ...prev, [team]: e.target.value }))}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#1e3a6e]"
          >
            {FORMATION_LIST.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Team toggle */}
        <div className="flex items-center gap-2 mx-auto">
          <button
            onClick={() => setActiveTeam('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold border transition-colors ${
              activeTeam === 'home'
                ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#1e3a6e]'
            }`}
          >
            🏠 {homeTeamName}
          </button>
          <button
            onClick={() => setActiveTeam('away')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold border transition-colors ${
              activeTeam === 'away'
                ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#1e3a6e]'
            }`}
          >
            ✈ {awayTeamName}
          </button>
        </div>

        {/* Reason display */}
        {reason && (
          <span className="text-sm text-gray-600 flex-shrink-0">
            <span className="font-semibold">Reason:</span>{' '}
            <span className="capitalize">{reason}</span>
          </span>
        )}

        {/* Formation label top right */}
        {formationLabel && (
          <span className="text-xl font-bold text-gray-700 tracking-widest flex-shrink-0 ml-auto mr-4">
            {formationLabel}
          </span>
        )}

        {/* Submit Changes */}
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-[#1e3a6e] text-white text-sm font-semibold rounded hover:bg-[#162d55] transition-colors flex-shrink-0"
        >
          Submit Changes
        </button>
      </div>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — player list */}
        <div className="w-52 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for player"
              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[#1e3a6e]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredPlayers.map(player => {
              const isOff = isSubbedOff(player.number)
              const isSelected = selectedPlayer?.number === player.number
              return (
                <button
                  key={player.number}
                  onClick={() => handlePlayerSelect(player)}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-gray-100 transition-colors ${
                    isSelected
                      ? 'bg-[#1e3a6e] text-white font-semibold'
                      : isOff
                      ? 'bg-red-50 text-red-400 line-through'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {player.number} - {player.name?.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Center panel — sub log */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-white">
            <h3 className="text-sm font-bold text-[#1e3a6e]">Substitution</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {subLog.length === 0 && (
              <p className="text-xs text-gray-400 italic">No substitutions yet</p>
            )}
            {subLog.map((sub, i) => (
              <div key={i} className="flex flex-col gap-1 mb-3">
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <span className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-bold text-[10px]">✕</span>
                  <span>{sub.off?.number} - {sub.off?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 font-bold text-[10px]">+</span>
                  <span>{sub.on?.number} - {sub.on?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — pitch grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <PitchGrid
            validPositions={validPositions}
            assignments={currentAssignments}
            formation={currentFormation}
            selectedPlayer={selectedPlayer}
            subLog={subLog}
            onPositionClick={handlePositionClick}
          />
        </div>
      </div>

      {/* ── Reason modal ── */}
      {showReasonModal && (
        <div className="fixed inset-0 z-60 flex items-start justify-center pt-16 bg-black/20">
          <div className="bg-white rounded-lg shadow-xl px-8 py-6 flex flex-col items-center gap-4 min-w-[280px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1e3a6e]" />
              <span className="text-sm font-bold text-[#1e3a6e]">Reason</span>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={false} onChange={() => confirmSubstitution('tactical')}
                  className="accent-[#1e3a6e]" />
                <span className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs mr-0.5">[1]</span>Tactical
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={false} onChange={() => confirmSubstitution('injury')}
                  className="accent-[#1e3a6e]" />
                <span className="text-sm text-gray-700">
                  <span className="text-gray-400 text-xs mr-0.5">[2]</span>Injury
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PitchGrid subcomponent ──
function PitchGrid({ validPositions, assignments, formation, selectedPlayer, subLog, onPositionClick }) {
  // Lay out position cards on the pitch
  // Use POSITION_COORDS for layout (percent-based top/left)
  return (
    <div
      className="relative bg-white rounded-lg shadow-sm mx-auto"
      style={{ width: '100%', maxWidth: 860, minHeight: 520 }}
    >
      {validPositions.map(pos => {
        const player = assignments[pos]
        const coords = POSITION_COORDS[pos]
        if (!coords) return null

        const isSubbedOff = subLog.some(s => s.off?.number === player?.number)
        const isSubbedOn  = subLog.some(s => s.on?.number === player?.number)
        const isTarget = selectedPlayer && player && selectedPlayer.number !== player.number

        return (
          <div
            key={pos}
            style={{
              position: 'absolute',
              top: `${coords.top}%`,
              left: `${coords.left}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="flex flex-col items-center gap-0.5"
          >
            {/* Swap icons */}
            <div className="flex items-center gap-1 mb-0.5">
              <button className="text-gray-400 hover:text-gray-600 text-xs leading-none">⇄</button>
              <button className="text-gray-400 hover:text-gray-600 text-xs leading-none">→</button>
            </div>

            {/* Position card */}
            <button
              onClick={() => onPositionClick(pos)}
              className={`relative w-28 min-h-[52px] rounded border-2 transition-all text-left px-2 py-1.5 ${
                isSubbedOff
                  ? 'border-red-500 bg-red-50'
                  : isSubbedOn
                  ? 'border-green-500 bg-green-50'
                  : isTarget
                  ? 'border-[#E84C37] bg-orange-50 cursor-pointer hover:shadow-md'
                  : player
                  ? 'border-[#1e3a6e] bg-[#1e3a6e] cursor-pointer hover:shadow-md'
                  : 'border-gray-300 bg-gray-100 cursor-default'
              }`}
            >
              {/* Position label */}
              <div className={`text-[10px] font-bold mb-0.5 ${player ? 'text-blue-200' : 'text-gray-400'}`}>
                {pos}
              </div>
              {/* Player info */}
              {player ? (
                <div className="text-xs text-white font-medium leading-tight">
                  {player.number}. {player.name}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">Empty</div>
              )}
              {/* Sub off indicator */}
              {isSubbedOff && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✕</span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
