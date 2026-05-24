import { useState, useRef } from 'react'
import { FORMATIONS, ALL_POSITIONS, POSITION_COORDS, FORMATION_LIST } from '../data/formations'

export default function StartingXIScreen({ match, xiSubmitted, onSubmit, onClose }) {
  const [activeTeam, setActiveTeam] = useState('home')
  const [formation, setFormation] = useState({ home: 'Custom', away: 'Custom' })
  const [assignments, setAssignments] = useState({ home: {}, away: {} }) // { position: { number, name } }
  const [players, setPlayers] = useState({ home: [], away: [] }) // collector-typed players
  const [searchQuery, setSearchQuery] = useState('')
  const [newPlayerNum, setNewPlayerNum] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [draggedPlayer, setDraggedPlayer] = useState(null) // { number, name, fromPosition? }
  const [changeLog, setChangeLog] = useState({ home: [], away: [] })
  const [starredXI, setStarredXI] = useState({ home: false, away: false })
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  const team = activeTeam
  const currentFormation = formation[team]
  const currentAssignments = assignments[team]
  const currentPlayers = players[team]

  // Positions to show based on formation
  const validPositions = currentFormation === 'Custom'
    ? ALL_POSITIONS
    : (FORMATIONS[currentFormation] || ALL_POSITIONS)

  // Players not yet assigned to any position
  const unassignedPlayers = currentPlayers.filter(p =>
    !Object.values(currentAssignments).some(a => a.number === p.number)
  )

  const filteredUnassigned = unassignedPlayers.filter(p =>
    !searchQuery.trim() ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.number).includes(searchQuery)
  )

  // Add player manually
  function addPlayer() {
    if (!newPlayerNum.trim() || !newPlayerName.trim()) return
    const num = parseInt(newPlayerNum)
    if (isNaN(num)) return
    if (currentPlayers.some(p => p.number === num)) return
    setPlayers(prev => ({
      ...prev,
      [team]: [...prev[team], { number: num, name: newPlayerName.trim() }]
    }))
    setNewPlayerNum('')
    setNewPlayerName('')
    setShowAddPlayer(false)
  }

  // Drag from sidebar
  function onDragStartFromList(player) {
    setDraggedPlayer({ ...player, fromPosition: null })
  }

  // Drag from position box
  function onDragStartFromBox(player, position) {
    setDraggedPlayer({ ...player, fromPosition: position })
  }

  // Drop onto position
  function onDropToPosition(position) {
    if (!draggedPlayer) return

    setAssignments(prev => {
      const newA = { ...prev[team] }
      // Remove from old position if came from a box
      if (draggedPlayer.fromPosition) {
        delete newA[draggedPlayer.fromPosition]
      }
      // If position already has someone, swap back to list (just remove)
      newA[position] = { number: draggedPlayer.number, name: draggedPlayer.name }
      return { ...prev, [team]: newA }
    })

    setChangeLog(prev => ({
      ...prev,
      [team]: [...prev[team], `${draggedPlayer.number}. ${draggedPlayer.name} → ${position}`]
    }))
    setDraggedPlayer(null)
  }

  // Remove player from position (back to list)
  function removeFromPosition(position) {
    setAssignments(prev => {
      const newA = { ...prev[team] }
      delete newA[position]
      return { ...prev, [team]: newA }
    })
  }

  // Formation change
  function handleFormationChange(f) {
    setFormation(prev => ({ ...prev, [team]: f }))
  }

  // Submit — saves the XI for this team
  function handleSubmit() {
    onSubmit(team, currentAssignments, currentFormation)
    // Switch to other team if not yet submitted
    if (team === 'home' && !xiSubmitted.away) setActiveTeam('away')
    else if (team === 'away' && !xiSubmitted.home) setActiveTeam('home')
  }

  // Star XI
  function handleStarXI() {
    setStarredXI(prev => ({ ...prev, [team]: true }))
  }

  const assignedCount = Object.keys(currentAssignments).length

  return (
    <div className="fixed inset-0 bg-[#e8eef4] z-50 flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#e8eef4] border-b border-gray-200 flex-shrink-0">
        {/* Online */}
        <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-semibold px-2.5 py-1 rounded">online</span>

        {/* Formation layout */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Formation Layout</span>
          <select
            value={currentFormation}
            onChange={e => handleFormationChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400"
          >
            {FORMATION_LIST.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Team toggle — center */}
        <div className="flex-1 flex justify-center">
          <div className="flex rounded overflow-hidden border border-gray-300">
            <button
              onClick={() => setActiveTeam('home')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTeam === 'home'
                  ? 'bg-[#1e3a6e] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>🏠</span>
              <span>{match.homeTeam}</span>
              {xiSubmitted.home && <span className="text-green-400 text-xs">✓</span>}
            </button>
            <button
              onClick={() => setActiveTeam('away')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTeam === 'away'
                  ? 'bg-[#1e3a6e] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>✈</span>
              <span>{match.awayTeam}</span>
              {xiSubmitted.away && <span className="text-green-400 text-xs">✓</span>}
            </button>
          </div>
        </div>

        {/* Formation summary */}
        <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
          {currentFormation !== 'Custom' ? currentFormation.split('-').join(' ') : ''}
        </span>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
        >
          Submit Changes
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT — Player list */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for player"
              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Add player form */}
          {showAddPlayer ? (
            <div className="p-2 border-b border-gray-100 bg-blue-50">
              <div className="flex gap-1 mb-1">
                <input
                  type="number"
                  value={newPlayerNum}
                  onChange={e => setNewPlayerNum(e.target.value)}
                  placeholder="#"
                  className="w-12 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="Player name"
                  onKeyDown={e => e.key === 'Enter' && addPlayer()}
                  className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-1">
                <button onClick={addPlayer} className="flex-1 bg-[#1e3a6e] text-white text-xs py-1 rounded">Add</button>
                <button onClick={() => setShowAddPlayer(false)} className="flex-1 border border-gray-300 text-gray-600 text-xs py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddPlayer(true)}
              className="mx-2 mt-2 mb-1 text-xs text-blue-600 hover:underline text-left"
            >
              + Add player
            </button>
          )}

          {/* Unassigned players list */}
          <div className="flex-1 overflow-y-auto">
            {filteredUnassigned.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                {currentPlayers.length === 0 ? 'No players added yet' : 'All players assigned'}
              </p>
            )}
            {filteredUnassigned
              .sort((a, b) => a.number - b.number)
              .map(player => (
                <div
                  key={player.number}
                  draggable
                  onDragStart={() => onDragStartFromList(player)}
                  className="px-3 py-2 text-xs font-medium text-gray-800 hover:bg-blue-50 cursor-grab active:cursor-grabbing border-b border-gray-50 uppercase"
                >
                  {player.number} - {player.name}
                </div>
              ))}
          </div>
        </div>

        {/* CENTER-LEFT — Starting XI change log */}
        <div className="w-44 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 text-center">Starting xi</h3>
          {changeLog[team].length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-2">No changes happened yet</p>
          ) : (
            <div className="flex flex-col gap-1 overflow-y-auto">
              {changeLog[team].map((entry, i) => (
                <p key={i} className="text-[10px] text-gray-600 border-b border-gray-50 pb-1">{entry}</p>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Formation pitch */}
        <div className="flex-1 min-h-0 relative bg-[#dde8f0] overflow-auto">
          <div
            className="relative w-full"
            style={{ minHeight: '500px', height: '100%' }}
          >
            {validPositions.map(pos => {
              const coords = POSITION_COORDS[pos]
              if (!coords) return null
              const assigned = currentAssignments[pos]

              return (
                <div
                  key={pos}
                  style={{
                    position: 'absolute',
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDropToPosition(pos)}
                >
                  {/* Position box */}
                  <div className="relative group">
                    {/* Icons above box */}
                    <div className="flex items-center justify-between mb-0.5 px-0.5">
                      <button
                        className="text-gray-400 hover:text-gray-600 cursor-move"
                        title="Move"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
                        </svg>
                      </button>
                      {assigned && (
                        <button
                          onClick={() => removeFromPosition(pos)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Box */}
                    <div
                      className={`border-2 rounded overflow-hidden ${
                        assigned
                          ? 'border-[#1e3a6e] bg-white'
                          : 'border-gray-300 bg-white/60'
                      }`}
                    >
                      {/* Header */}
                      <div className={`text-center text-[10px] font-bold py-0.5 ${
                        assigned ? 'bg-[#1e3a6e] text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {pos}
                      </div>
                      {/* Body */}
                      <div
                        className="text-center text-[10px] text-gray-700 py-2 px-1 min-h-[2.5rem] flex items-center justify-center cursor-pointer"
                        draggable={!!assigned}
                        onDragStart={() => assigned && onDragStartFromBox(assigned, pos)}
                      >
                        {assigned ? (
                          <span className="leading-tight font-medium">
                            {assigned.number}. {assigned.name}
                          </span>
                        ) : (
                          <span className="text-gray-300">·</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR — team name + Star XI + assigned count ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            {activeTeam === 'home' ? match.homeTeam : match.awayTeam}
          </span>
          <span className="text-xs text-gray-400">{assignedCount}/11 assigned</span>
        </div>
        <div className="flex items-center gap-2">
          {assignedCount > 0 && (
            <button
              onClick={handleStarXI}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                starredXI[team]
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {starredXI[team] ? '★ Starred' : 'Star XI'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
