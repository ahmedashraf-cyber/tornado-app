import { useRef } from 'react'

export default function PitchView({ settings, onLocationClick, playerLocation, desiredLocation }) {
  const pitchRef = useRef()

  const {
    pitchColor = '#2d8a4e',
    rowsCount = 0,
    colsCount = 6,
    rowsTransparency = 0.2,
    colsTransparency = 0.2,
    invertRight = false,
    invertLeft = false,
    showXY = false,
    teamAColor = '#ffffff',
    teamBColor = '#ffff00',
  } = settings

  function handleClick(e) {
    if (!onLocationClick) return
    const rect = pitchRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
    onLocationClick({ x: parseFloat(x), y: parseFloat(y) })
  }

  // Draw grid lines
  const colLines = []
  if (colsCount > 0) {
    for (let i = 1; i < colsCount; i++) {
      const pct = (i / colsCount) * 100
      colLines.push(
        <line
          key={`col-${i}`}
          x1={`${pct}%`} y1="0%"
          x2={`${pct}%`} y2="100%"
          stroke="white"
          strokeWidth="1"
          strokeOpacity={colsTransparency}
        />
      )
    }
  }

  const rowLines = []
  if (rowsCount > 0) {
    for (let i = 1; i < rowsCount; i++) {
      const pct = (i / rowsCount) * 100
      rowLines.push(
        <line
          key={`row-${i}`}
          x1="0%" y1={`${pct}%`}
          x2="100%" y2={`${pct}%`}
          stroke="white"
          strokeWidth="1"
          strokeOpacity={rowsTransparency}
        />
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Labels */}
      <div className="flex items-center justify-between px-2 py-1 bg-blue-100 border-b border-blue-200">
        <span className="text-xs font-medium text-blue-700">Location: Actual</span>
        <span className="text-xs text-gray-500">Players: Player id</span>
      </div>

      {/* Pitch */}
      <div
        ref={pitchRef}
        className="flex-1 relative cursor-crosshair"
        style={{ backgroundColor: pitchColor }}
        onClick={handleClick}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Pitch markings — white lines */}
          {/* Outer boundary */}
          <rect x="2" y="3" width="96" height="94" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>

          {/* Center line */}
          <line x1="50" y1="3" x2="50" y2="97" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>

          {/* Center circle */}
          <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>
          <circle cx="50" cy="50" r="0.5" fill="white" fillOpacity="0.7"/>

          {/* Left penalty area */}
          <rect x="2" y="25" width="16" height="50" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>
          {/* Left goal area */}
          <rect x="2" y="36" width="6" height="28" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>
          {/* Left penalty spot */}
          <circle cx="14" cy="50" r="0.5" fill="white" fillOpacity="0.7"/>
          {/* Left goal */}
          <rect x="0" y="42" width="2" height="16" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5"/>

          {/* Right penalty area */}
          <rect x="82" y="25" width="16" height="50" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>
          {/* Right goal area */}
          <rect x="92" y="36" width="6" height="28" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.7"/>
          {/* Right penalty spot */}
          <circle cx="86" cy="50" r="0.5" fill="white" fillOpacity="0.7"/>
          {/* Right goal */}
          <rect x="98" y="42" width="2" height="16" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.5"/>

          {/* Grid overlay */}
          {colLines}
          {rowLines}

          {/* Player location marker */}
          {playerLocation && (
            <circle
              cx={playerLocation.x}
              cy={playerLocation.y}
              r="2"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="0.5"
            />
          )}

          {/* Desired location marker */}
          {desiredLocation && (
            <text
              x={desiredLocation.x}
              y={desiredLocation.y}
              textAnchor="middle"
              fontSize="4"
              fill="#f59e0b"
            >★</text>
          )}

          {/* XY coordinates display */}
          {showXY && playerLocation && (
            <text x="3" y="8" fontSize="3" fill="white" fillOpacity="0.9">
              x:{playerLocation.x} y:{playerLocation.y}
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-2 py-1 bg-white border-t border-gray-200 text-[10px] text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Player Location</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span>Desired location</span>
        </div>
        <div className="flex items-center gap-1">
          <span>→</span>
          <span>Attacking Direction Is Left to right</span>
        </div>
      </div>
    </div>
  )
}
