import { useRef } from 'react'

// PitchView — vertical/portrait orientation matching the video exactly
// Goals at TOP and BOTTOM, pitch is tall and narrow
// viewBox is 68 x 105 (standard football pitch ratio, portrait)

export default function PitchView({ settings, onLocationClick, playerLocation, desiredLocation }) {
  const pitchRef = useRef()

  const {
    pitchColor = '#2d8a4e',
    rowsCount = 0,
    colsCount = 0,
    rowsTransparency = 0.2,
    colsTransparency = 0.2,
    showXY = false,
    attackingDirection = 'left_to_right',
  } = settings

  function handleClick(e) {
    if (!onLocationClick) return
    const rect = pitchRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 68).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 105).toFixed(1)
    onLocationClick({ x: parseFloat(x), y: parseFloat(y) })
  }

  // Grid lines — portrait orientation
  const colLines = []
  if (colsCount > 0) {
    for (let i = 1; i < colsCount; i++) {
      const pct = (i / colsCount) * 68
      colLines.push(
        <line key={`col-${i}`}
          x1={pct} y1={0} x2={pct} y2={105}
          stroke="white" strokeWidth="0.4" strokeOpacity={colsTransparency}
        />
      )
    }
  }

  const rowLines = []
  if (rowsCount > 0) {
    for (let i = 1; i < rowsCount; i++) {
      const pct = (i / rowsCount) * 105
      rowLines.push(
        <line key={`row-${i}`}
          x1={0} y1={pct} x2={68} y2={pct}
          stroke="white" strokeWidth="0.4" strokeOpacity={rowsTransparency}
        />
      )
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ minWidth: 0 }}>

      {/* Top label bar — matches video */}
      <div className="flex items-center justify-between px-2 py-0.5 bg-[#d0dff0] border-b border-blue-200 flex-shrink-0">
        <span className="text-[10px] font-medium text-[#1e3a6e]">Location: Actual</span>
        <span className="text-[10px] text-gray-500">Players: Player id</span>
      </div>

      {/* Pitch SVG — portrait, fills all available height */}
      <div
        ref={pitchRef}
        className="flex-1 relative cursor-crosshair overflow-hidden"
        style={{ backgroundColor: pitchColor }}
        onClick={handleClick}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 68 105"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Pitch background */}
          <rect x="0" y="0" width="68" height="105" fill={pitchColor} />

          {/* Outer boundary */}
          <rect x="1" y="1" width="66" height="103" fill="none" stroke="white" strokeWidth="0.6" opacity="0.85"/>

          {/* Halfway line */}
          <line x1="1" y1="52.5" x2="67" y2="52.5" stroke="white" strokeWidth="0.6" opacity="0.85"/>

          {/* Center circle */}
          <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="white" strokeWidth="0.6" opacity="0.85"/>
          <circle cx="34" cy="52.5" r="0.4" fill="white" opacity="0.85"/>

          {/* Center spot */}
          <circle cx="34" cy="52.5" r="0.5" fill="white" opacity="0.7"/>

          {/* ── TOP GOAL & PENALTY AREA ── */}
          {/* Top goal */}
          <rect x="24.84" y="0" width="18.32" height="2.44" fill="none" stroke="white" strokeWidth="0.6" opacity="0.7"/>
          {/* Top goal area (6-yard box) */}
          <rect x="20.16" y="1" width="27.68" height="5.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8"/>
          {/* Top penalty area (18-yard box) */}
          <rect x="11" y="1" width="46" height="16.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8"/>
          {/* Top penalty spot */}
          <circle cx="34" cy="12" r="0.5" fill="white" opacity="0.7"/>
          {/* Top penalty arc */}
          <path d="M 24 17.5 A 9.15 9.15 0 0 1 44 17.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.6"/>

          {/* ── BOTTOM GOAL & PENALTY AREA ── */}
          {/* Bottom goal */}
          <rect x="24.84" y="102.56" width="18.32" height="2.44" fill="none" stroke="white" strokeWidth="0.6" opacity="0.7"/>
          {/* Bottom goal area (6-yard box) */}
          <rect x="20.16" y="98.5" width="27.68" height="5.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8"/>
          {/* Bottom penalty area (18-yard box) */}
          <rect x="11" y="87.5" width="46" height="16.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.8"/>
          {/* Bottom penalty spot */}
          <circle cx="34" cy="93" r="0.5" fill="white" opacity="0.7"/>
          {/* Bottom penalty arc */}
          <path d="M 24 87.5 A 9.15 9.15 0 0 0 44 87.5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.6"/>

          {/* Corner arcs */}
          <path d="M 1 3.5 A 2 2 0 0 0 3.5 1" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7"/>
          <path d="M 64.5 1 A 2 2 0 0 0 67 3.5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7"/>
          <path d="M 1 101.5 A 2 2 0 0 1 3.5 104" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7"/>
          <path d="M 64.5 104 A 2 2 0 0 1 67 101.5" fill="none" stroke="white" strokeWidth="0.4" opacity="0.7"/>

          {/* Grid overlay */}
          {colLines}
          {rowLines}

          {/* Player location marker — blue dot */}
          {playerLocation && (
            <circle cx={playerLocation.x} cy={playerLocation.y} r="1.5"
              fill="#3b82f6" stroke="white" strokeWidth="0.4" />
          )}

          {/* Desired location marker — yellow star */}
          {desiredLocation && (
            <text x={desiredLocation.x} y={desiredLocation.y}
              textAnchor="middle" fontSize="3" fill="#f59e0b">★</text>
          )}

          {showXY && playerLocation && (
            <text x="2" y="6" fontSize="2.5" fill="white" opacity="0.9">
              x:{playerLocation.x} y:{playerLocation.y}
            </text>
          )}
        </svg>
      </div>

      {/* Bottom legend — matches video */}
      <div className="flex items-start gap-3 px-2 py-1 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-[9px] text-gray-600 leading-tight">Player<br/>Location</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border border-gray-400 flex-shrink-0" />
          <span className="text-[9px] text-gray-600 leading-tight">Desired<br/>location</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gray-500">—</span>
          <span className="text-[9px] text-gray-600 leading-tight">Attacking<br/>Direction is<br/>Left to right</span>
        </div>
      </div>
    </div>
  )
}
