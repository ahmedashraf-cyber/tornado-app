import { useState, useEffect } from 'react'
import { FORMATIONS, ALL_POSITIONS, POSITION_COORDS, FORMATION_LIST } from '../data/formations'

// ── TacticalShiftScreen ──
// Full-screen overlay triggered by Tactical Shift event (video: Tactical_Shift_Tagging.mp4)
//
// Layout:
//   Top bar: Formation Layout ▾ | 🏠 HomeTeam | ✈ AwayTeam | formation digits | Submit Changes
//   Left panel: remaining/unassigned players
//   Right: pitch grid — players can be moved between positions
//
// Flow:
//   1. Formation dropdown → changes pitch layout, highlights positions with no player in red
//   2. Click player in left list → selectedPlayer
//   3. Click empty position → assigns player there
//   4. Click occupied position → swaps or reassigns
//   5. Submit Changes → onConfirm(shiftData)

export default function TacticalShiftScreen({
  match,
  homeXI,
  awayXI,
  homeFormation,
  awayFormation,
  onConfirm,
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
  const [selectedPlayer, setSelectedPlayer] = useState(null) // player being moved
  const [changeLog, setChangeLog] = useState([])

  const team = activeTeam
  const currentFormation = formation[team]
  const currentAssignments = assignments[team]

  const validPositions = currentFormation === 'Custom'
    ? ALL_POSITIONS
    : (FORMATIONS[currentFormation] || ALL_POSITIONS)

  // Players assigned but not in valid positions for new formation → shown in left panel
  const allAssigned = Object.entries(currentAssignments).map(([pos, player]) => ({ ...player, pos })).filter(Boolean)
  const unplacedPlayers = allAssigned.filter(p => !validPositions.includes(p.pos))
  const filteredUnplaced = unplacedPlayers.filter(p =>
    !searchQuery.trim() ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.number).includes(searchQuery)
  )

  function handlePlayerSelect(player) {
    setSelectedPlayer(player)
  }

  function handlePositionClick(position) {
    const playerInPos = currentAssignments[position]

    if (selectedPlayer) {
      // Move selectedPlayer to this position
      const newAssignments = { ...currentAssignments }

      // If selectedPlayer was in a position, clear that spot
      if (selectedPlayer.pos) {
        newAssignments[selectedPlayer.pos] = null
      }
      // If someone is already here, move them to selectedPlayer's old spot
      if (playerInPos && selectedPlayer.pos) {
        newAssignments[selectedPlayer.pos] = playerInPos
      }

      newAssignments[position] = { number: selectedPlayer.number, name: selectedPlayer.name }

      setAssignments(prev => ({ ...prev, [team]: newAssignments }))
      setChangeLog(prev => [...prev, {
        player: selectedPlayer.name,
        from: selectedPlayer.pos || 'unassigned',
        to: position,
      }])
      setSelectedPlayer(null)
    } else if (playerInPos) {
      // Select this player to move
      setSelectedPlayer({ ...playerInPos, pos: position })
    }
  }

  function handleSubmit() {
    onConfirm({
      team: activeTeam,
      formation: formation[team],
      assignments: assignments[team],
      changeLog,
    })
  }

  const homeTeamName = match?.homeTeam || 'Home'
  const awayTeamName = match?.awayTeam || 'Away'
  const formationLabel = currentFormation !== 'Custom'
    ? currentFormation.replace(/-/g, ' ')
    : ''

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Formation Layout</span>
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

        {/* Formation label large */}
        {formationLabel && (
          <span className="text-xl font-bold text-gray-700 tracking-widest flex-shrink-0">
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
        {/* Left panel — unplaced / search players */}
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
          {filteredUnplaced.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b">
                Unplaced Players
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredUnplaced.map(player => {
                  const isSelected = selectedPlayer?.number === player.number
                  return (
                    <button
                      key={player.number}
                      onClick={() => handlePlayerSelect(player)}
                      className={`w-full text-left px-3 py-2 text-xs border-b border-gray-100 transition-colors ${
                        isSelected
                          ? 'bg-[#1e3a6e] text-white font-semibold'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {player.number} - {player.name?.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {filteredUnplaced.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-400 italic px-3 text-center">
                All players placed
              </p>
            </div>
          )}
        </div>

        {/* Right — pitch grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <TacticalPitchGrid
            validPositions={validPositions}
            assignments={currentAssignments}
            selectedPlayer={selectedPlayer}
            onPositionClick={handlePositionClick}
          />
        </div>
      </div>
    </div>
  )
}

// ── TacticalPitchGrid subcomponent ──
function TacticalPitchGrid({ validPositions, assignments, selectedPlayer, onPositionClick }) {
  return (
    <div
      className="relative bg-white rounded-lg shadow-sm mx-auto"
      style={{ width: '100%', maxWidth: 860, minHeight: 520 }}
    >
      {validPositions.map(pos => {
        const player = assignments[pos]
        const coords = POSITION_COORDS[pos]
        if (!coords) return null

        const isSelected = selectedPlayer?.pos === pos
        const isTarget = selectedPlayer && !isSelected

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
            {/* Move icons */}
            <div className="flex items-center gap-1 mb-0.5">
              <button className="text-gray-400 hover:text-gray-600 text-xs leading-none">⇄</button>
              <button className="text-gray-400 hover:text-gray-600 text-xs leading-none">→</button>
            </div>

            {/* Position card */}
            <button
              onClick={() => onPositionClick(pos)}
              className={`relative w-28 min-h-[52px] rounded border-2 transition-all text-left px-2 py-1.5 ${
                isSelected
                  ? 'border-[#E84C37] bg-[#E84C37] shadow-lg'
                  : player
                  ? 'border-[#1e3a6e] bg-[#1e3a6e] cursor-pointer hover:shadow-md'
                  : isTarget
                  ? 'border-dashed border-[#1e3a6e] bg-blue-50 cursor-pointer'
                  : 'border-gray-300 bg-gray-100 cursor-default'
              }`}
            >
              <div className={`text-[10px] font-bold mb-0.5 ${player ? 'text-blue-200' : 'text-gray-400'}`}>
                {pos}
              </div>
              {player ? (
                <div className="text-xs text-white font-medium leading-tight">
                  {player.number}. {player.name}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic text-center py-1">·</div>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
