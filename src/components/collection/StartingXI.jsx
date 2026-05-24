import { useState, useRef } from 'react'
import { FORMATIONS, FORMATION_LIST } from '../../data/formations'

// Position layout for the pitch grid — rows from attack (top) to defense (bottom, GK)
// Each row: positions displayed left→right on screen
const PITCH_ROWS = [
  ['LF','LW','LAM','LM','LWB','LB'],
  ['LCF','LAM','LCM','LDM',null,'LCB'],
  ['CF','CAM','CM','CDM',null,'CB'],
  ['RCF','RAM','RCM','RDM',null,'RCB'],
  ['RF','RW','RAM','RM','RWB','RB'],
  [null,null,'SS','GK',null,null],
]

function PositionBox({ posCode, player, onDrop, onRemove, onDragStart }) {
  const [dragOver, setDragOver] = useState(false)
  const filled = !!player

  return (
    <div
      className={`relative rounded border-2 transition-all select-none
        ${filled ? 'border-[#1e3a6e] bg-[#1e3a6e]' : dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
        min-w-[100px] min-h-[60px] flex flex-col`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(posCode) }}
    >
      {/* Position header */}
      <div className={`text-xs font-bold px-2 py-0.5 flex items-center justify-between
        ${filled ? 'text-white' : 'text-gray-500'}`}>
        <div className="flex items-center gap-1">
          {/* Drag icon */}
          <span
            className={`cursor-grab text-xs ${filled ? 'text-white' : 'text-gray-400'}`}
            draggable={filled}
            onDragStart={e => filled && onDragStart(e, posCode)}
          >⇄</span>
          {/* Remove icon */}
          {filled && (
            <button
              onClick={() => onRemove(posCode)}
              className="text-white hover:text-red-300 text-xs leading-none"
            >←</button>
          )}
        </div>
        <span>{posCode}</span>
      </div>

      {/* Player name body */}
      <div className={`flex-1 flex items-center justify-center px-2 py-1 text-center
        ${filled ? 'bg-white' : 'bg-transparent'}`}>
        {filled ? (
          <span className="text-xs text-gray-800 leading-tight">
            {player.number}. {player.name}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">·</span>
        )}
      </div>
    </div>
  )
}

export default function StartingXI({ match, half, onSubmit, onCancel }) {
  const [activeTeam, setActiveTeam] = useState('home') // 'home' | 'away'
  const [formation, setFormation] = useState('Custom')

  // Players state: { home: { [posCode]: {name, number} }, away: {...} }
  const [assignments, setAssignments] = useState({ home: {}, away: {} })

  // Manually added players list per team
  const [playerList, setPlayerList] = useState({ home: [], away: [] })
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerNum, setNewPlayerNum] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [starredTeams, setStarredTeams] = useState({ home: false, away: false })
  const [changelog, setChangelog] = useState([]) // [{team, pos, player}]

  const dragSource = useRef(null) // {team, posCode} when dragging from pitch

  const teamAssignments = assignments[activeTeam]
  const validPositions = FORMATIONS[formation]?.positions || FORMATIONS['Custom'].positions

  // Players not yet assigned to any position
  const assignedPlayers = Object.values(teamAssignments)
  const unassignedPlayers = playerList[activeTeam].filter(
    p => !assignedPlayers.find(a => a.number === p.number && a.name === p.name)
  )
  const filteredPlayers = unassignedPlayers.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.number).includes(searchQuery)
  )

  function addPlayer() {
    const name = newPlayerName.trim()
    const num = parseInt(newPlayerNum)
    if (!name || isNaN(num)) return
    if (playerList[activeTeam].find(p => p.number === num)) return // duplicate number
    setPlayerList(prev => ({
      ...prev,
      [activeTeam]: [...prev[activeTeam], { name, number: num }].sort((a,b) => a.number - b.number)
    }))
    setNewPlayerName('')
    setNewPlayerNum('')
  }

  function handleDropOnPosition(posCode) {
    if (dragSource.current) {
      // Moving from another position on the pitch
      const { team, posCode: fromPos } = dragSource.current
      if (team !== activeTeam) return
      const player = assignments[team][fromPos]
      if (!player) return
      setAssignments(prev => {
        const updated = { ...prev[team] }
        delete updated[fromPos]
        updated[posCode] = player
        return { ...prev, [team]: updated }
      })
      addToChangelog(posCode, player)
      dragSource.current = null
      return
    }
    // Check HTML drag data (from player list)
  }

  function handleDropFromList(posCode, playerJson) {
    try {
      const player = JSON.parse(playerJson)
      setAssignments(prev => ({
        ...prev,
        [activeTeam]: { ...prev[activeTeam], [posCode]: player }
      }))
      addToChangelog(posCode, player)
    } catch {}
  }

  function handlePositionDrop(posCode) {
    // Try list drag first
    // handled via onDrop combining both sources
  }

  function handleRemoveFromPosition(posCode) {
    setAssignments(prev => {
      const updated = { ...prev[activeTeam] }
      delete updated[posCode]
      return { ...prev, [activeTeam]: updated }
    })
  }

  function handlePitchDragStart(e, posCode) {
    dragSource.current = { team: activeTeam, posCode }
    const player = teamAssignments[posCode]
    if (player) e.dataTransfer.setData('player', JSON.stringify(player))
  }

  function handleListDragStart(e, player) {
    dragSource.current = null
    e.dataTransfer.setData('player', JSON.stringify(player))
  }

  function handlePitchDrop(posCode) {
    // Check if from pitch or list
    if (dragSource.current && dragSource.current.team === activeTeam) {
      const fromPos = dragSource.current.posCode
      const player = assignments[activeTeam][fromPos]
      if (player) {
        setAssignments(prev => {
          const updated = { ...prev[activeTeam] }
          delete updated[fromPos]
          // If target has a player, swap
          if (updated[posCode]) {
            updated[fromPos] = updated[posCode]
          }
          updated[posCode] = player
          return { ...prev, [activeTeam]: updated }
        })
        addToChangelog(posCode, player)
      }
    }
    dragSource.current = null
  }

  function addToChangelog(posCode, player) {
    setChangelog(prev => [...prev, {
      team: activeTeam,
      pos: posCode,
      player: `${player.number}. ${player.name}`
    }])
  }

  function handleStarXI() {
    setStarredTeams(prev => ({ ...prev, [activeTeam]: true }))
  }

  const bothStarred = starredTeams.home && starredTeams.away
  const homeCount = Object.keys(assignments.home).length
  const awayCount = Object.keys(assignments.away).length

  function handleSubmit() {
    if (!starredTeams.home || !starredTeams.away) return
    onSubmit({
      home: { formation, players: assignments.home },
      away: { formation, players: assignments.away },
    })
  }

  // Build pitch display
  // Only show positions valid for selected formation
  const pitchPositions = validPositions

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">online</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Formation Layout</label>
          <select
            value={formation}
            onChange={e => setFormation(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white"
          >
            {FORMATION_LIST.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Team toggle */}
        <div className="flex items-center gap-1 mx-auto">
          <button
            onClick={() => setActiveTeam('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTeam === 'home'
                ? 'bg-[#1e3a6e] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏠 {match.homeTeam}
          </button>
          <button
            onClick={() => setActiveTeam('away')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTeam === 'away'
                ? 'bg-[#1e3a6e] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✈ {match.awayTeam}
          </button>
        </div>

        {/* Formation summary */}
        <span className="text-sm text-gray-500 font-mono">
          {formation !== 'Custom' ? formation.split('-').join(' ') : ''}
        </span>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!bothStarred}
          className={`ml-auto px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            bothStarred
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Changes
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Player list + add form ── */}
        <div className="w-56 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for player"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto">
            {filteredPlayers.map(player => (
              <div
                key={player.number}
                draggable
                onDragStart={e => handleListDragStart(e, player)}
                className="px-3 py-2 text-xs border-b border-gray-100 cursor-grab hover:bg-blue-50 active:bg-blue-100 select-none"
              >
                {player.number} - {player.name.toUpperCase()}
              </div>
            ))}
            {filteredPlayers.length === 0 && playerList[activeTeam].length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4 px-2">Add players below</p>
            )}
          </div>

          {/* Add player form */}
          <div className="p-2 border-t border-gray-200 bg-white">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Add player</p>
            <div className="flex gap-1 mb-1">
              <input
                type="number"
                value={newPlayerNum}
                onChange={e => setNewPlayerNum(e.target.value)}
                placeholder="#"
                className="w-12 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400"
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
              />
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                placeholder="Player name"
                className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400"
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <button
              onClick={addPlayer}
              className="w-full bg-[#1e3a6e] hover:bg-[#16305c] text-white text-xs py-1.5 rounded transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* ── Center: Changelog panel ── */}
        <div className="w-44 border-r border-gray-200 flex flex-col bg-white overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Starting xi</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {changelog.length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-4">No changes happened yet</p>
            ) : (
              changelog.map((entry, i) => (
                <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-100">
                  <span className="font-medium">{entry.pos}:</span> {entry.player}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Pitch ── */}
        <div
          className="flex-1 overflow-auto p-4"
          style={{ background: '#e8eaf0' }}
          onDragOver={e => e.preventDefault()}
        >
          {/* Position boxes — grid layout */}
          <div className="flex flex-wrap gap-3 content-start justify-center">
            {pitchPositions.map(posCode => (
              <div
                key={posCode}
                style={{ width: 130 }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const playerData = e.dataTransfer.getData('player')
                  if (playerData) {
                    try {
                      const player = JSON.parse(playerData)
                      if (dragSource.current && dragSource.current.team === activeTeam) {
                        // Swap from pitch
                        const fromPos = dragSource.current.posCode
                        setAssignments(prev => {
                          const updated = { ...prev[activeTeam] }
                          const fromPlayer = updated[fromPos]
                          if (updated[posCode]) updated[fromPos] = updated[posCode]
                          else delete updated[fromPos]
                          updated[posCode] = fromPlayer || player
                          return { ...prev, [activeTeam]: updated }
                        })
                        addToChangelog(posCode, player)
                        dragSource.current = null
                      } else {
                        // From list
                        setAssignments(prev => ({
                          ...prev,
                          [activeTeam]: { ...prev[activeTeam], [posCode]: player }
                        }))
                        addToChangelog(posCode, player)
                        dragSource.current = null
                      }
                    } catch {}
                  }
                }}
              >
                <PositionBox
                  posCode={posCode}
                  player={teamAssignments[posCode] || null}
                  onDrop={() => {}}
                  onRemove={handleRemoveFromPosition}
                  onDragStart={handlePitchDragStart}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: team label + Star XI ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-700">
          {activeTeam === 'home' ? match.homeTeam : match.awayTeam}
        </span>

        <button
          onClick={handleStarXI}
          disabled={starredTeams[activeTeam]}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            starredTeams[activeTeam]
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-[#1e3a6e] hover:bg-[#16305c] text-white'
          }`}
        >
          {starredTeams[activeTeam] ? '★ Starred' : 'Star XI'}
        </button>

        <div className="ml-auto flex gap-4 text-xs text-gray-500">
          <span>🏠 {match.homeTeam}: {homeCount} placed {starredTeams.home ? '★' : ''}</span>
          <span>✈ {match.awayTeam}: {awayCount} placed {starredTeams.away ? '★' : ''}</span>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
