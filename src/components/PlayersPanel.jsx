import { useState } from 'react'
import { FORMATIONS, POSITION_COORDS } from '../data/formations'

// Grid layout: pitch divided into rows/cols matching video exactly
// Panel title: "Players: Player id"
// Each position cell shows: shirt icon + jersey number + player name
// Selected player = red/orange border highlight

// Map formation positions to a grid-friendly layout
// We use absolute positioning on a relative pitch container (portrait)
function ShirtIcon({ number, name, selected, onClick, hasPlayer }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded transition-all
        ${hasPlayer ? 'cursor-pointer' : 'cursor-default opacity-30'}
        ${selected ? 'ring-2 ring-[#E84C37] bg-red-50' : 'bg-gray-100 hover:bg-gray-200'}
      `}
      style={{ width: 52, height: 56, padding: 2 }}
      disabled={!hasPlayer}
    >
      {/* Shirt SVG */}
      <svg viewBox="0 0 40 36" className="w-6 h-6 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2 L2 8 L6 14 L10 12 L10 34 L30 34 L30 12 L34 14 L38 8 L26 2 C26 2 23 5 20 5 C17 5 14 2 14 2Z"
          fill={selected ? '#E84C37' : '#6b7280'}
          stroke="white"
          strokeWidth="1"
        />
        <text
          x="20" y="24"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="white"
          fontFamily="sans-serif"
        >
          {number || '?'}
        </text>
      </svg>
      {/* Player name */}
      <span className="text-[9px] leading-tight text-gray-600 text-center truncate w-full px-0.5 mt-0.5">
        {name ? name.split(' ')[0] : '—'}
      </span>
    </button>
  )
}

export default function PlayersPanel({
  team,           // 'home' | 'away'
  teamName,       // display name
  formation,      // e.g. '4-3-3'
  assignments,    // { [position]: { number, name } }
  selectedPlayerId,    // currently selected position key
  onSelectPlayer, // (positionKey) => void
}) {
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const formationPositions = FORMATIONS[formation] || []
  const allCoords = POSITION_COORDS

  return (
    <div className="flex flex-col w-full h-full bg-[#e8eef4] select-none overflow-hidden">

      {/* Panel title */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-300 bg-white flex-shrink-0">
        <span className="text-[11px] font-semibold text-[#1e3a6e] truncate">
          Players: Player id
        </span>
        <div className="flex items-center gap-1">
          {/* Grid view toggle */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-0.5 rounded ${viewMode === 'grid' ? 'text-[#1e3a6e]' : 'text-gray-400'}`}
            title="Pitch view"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          {/* List view toggle */}
          <button
            onClick={() => setViewMode('list')}
            className={`p-0.5 rounded ${viewMode === 'list' ? 'text-[#1e3a6e]' : 'text-gray-400'}`}
            title="List view"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
              <rect x="1" y="2" width="14" height="2.5" rx="1"/>
              <rect x="1" y="6.5" width="14" height="2.5" rx="1"/>
              <rect x="1" y="11" width="14" height="2.5" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Customize button */}
      <div className="flex items-center px-2 py-1 border-b border-gray-200 bg-white flex-shrink-0">
        <button className="flex items-center gap-1 text-[10px] text-[#1e3a6e] font-medium hover:underline">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M13.5 1.5l1 1-9.5 9.5-3 .5.5-3L13.5 1.5z"/>
          </svg>
          Customize
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'grid' ? (
          <PitchGrid
            formationPositions={formationPositions}
            assignments={assignments || {}}
            allCoords={allCoords}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onSelectPlayer}
          />
        ) : (
          <ListView
            formationPositions={formationPositions}
            assignments={assignments || {}}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={onSelectPlayer}
          />
        )}
      </div>
    </div>
  )
}

// Portrait pitch grid — positions placed by POSITION_COORDS
function PitchGrid({ formationPositions, assignments, allCoords, selectedPlayerId, onSelectPlayer }) {
  return (
    <div
      className="relative bg-[#2d8a4e] mx-1 my-1 rounded overflow-hidden"
      style={{ height: 320 }}
    >
      {/* Pitch markings */}
      <PitchMarkings />

      {/* Player cards */}
      {formationPositions.map((pos) => {
        const coord = allCoords[pos]
        if (!coord) return null
        const player = assignments[pos]
        const isSelected = selectedPlayerId === pos

        // Convert percentage coords to actual px positions
        // x: 0-100 (left to right), y: 0-100 (top to bottom, top=attack)
        const left = `${coord.x}%`
        const top = `${coord.y}%`

        return (
          <div
            key={pos}
            className="absolute"
            style={{
              left,
              top,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
          >
            <ShirtIcon
              number={player?.number}
              name={player?.name}
              selected={isSelected}
              hasPlayer={!!player}
              onClick={() => player && onSelectPlayer(pos)}
            />
          </div>
        )
      })}
    </div>
  )
}

function PitchMarkings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity: 0.4 }}
    >
      {/* Outer border */}
      <rect x="5" y="2" width="90" height="96" fill="none" stroke="white" strokeWidth="0.8"/>
      {/* Centre line */}
      <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.6"/>
      {/* Centre circle */}
      <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.6"/>
      {/* Top penalty area */}
      <rect x="25" y="2" width="50" height="16" fill="none" stroke="white" strokeWidth="0.6"/>
      {/* Top goal area */}
      <rect x="36" y="2" width="28" height="7" fill="none" stroke="white" strokeWidth="0.6"/>
      {/* Bottom penalty area */}
      <rect x="25" y="82" width="50" height="16" fill="none" stroke="white" strokeWidth="0.6"/>
      {/* Bottom goal area */}
      <rect x="36" y="91" width="28" height="7" fill="none" stroke="white" strokeWidth="0.6"/>
    </svg>
  )
}

// List view — simple scrollable list of players
function ListView({ formationPositions, assignments, selectedPlayerId, onSelectPlayer }) {
  return (
    <div className="flex flex-col gap-0.5 p-1">
      {formationPositions.map((pos) => {
        const player = assignments[pos]
        const isSelected = selectedPlayerId === pos
        return (
          <button
            key={pos}
            onClick={() => player && onSelectPlayer(pos)}
            disabled={!player}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all
              ${!player ? 'opacity-40 cursor-default' : 'cursor-pointer'}
              ${isSelected ? 'bg-[#E84C37] text-white' : 'bg-white hover:bg-gray-100 text-gray-800'}
            `}
          >
            <span className={`text-[10px] font-bold w-6 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
              {pos}
            </span>
            <span className="text-[11px] font-bold w-5 flex-shrink-0">
              {player?.number || '—'}
            </span>
            <span className="text-[10px] truncate">
              {player?.name || 'Empty'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
