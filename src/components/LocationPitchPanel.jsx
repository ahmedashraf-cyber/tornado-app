import { useRef, useState } from 'react'

// ── LocationPitchPanel ──
// Replaces the left sidebar when Location: Home or Location: Away tasks are booked.
// Video: XY_-_Location.mp4
//
// Shows a LANDSCAPE pitch (horizontal, goals left/right).
// Two clickable dot types:
//   🔵 Player Location  — where the player with the ball is
//   🟠 Desired Location — where the pass is intended (destination)
//
// Label at top: "Location: Actual"
// Legend at bottom: ● Player Location  ● Desired Location  → Attacking Direction

// Pitch dimensions in Statsbomb spec: 120 x 80 (landscape, goals left/right)
// We render at whatever width the panel has, maintaining 120:80 ratio

export default function LocationPitchPanel({
  playerLocation,     // { x, y } in pitch coords (0-120, 0-80) | null
  desiredLocation,    // { x, y } | null
  attackingDirection, // 'left_to_right' | 'right_to_left'
  onPlayerLocation,   // fn({ x, y })
  onDesiredLocation,  // fn({ x, y })
  activeLocationType, // 'player' | 'desired' — which dot the next click places
  onActiveTypeChange, // fn('player'|'desired')
}) {
  const pitchRef = useRef(null)

  function handlePitchClick(e) {
    const rect = pitchRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    // Convert to Statsbomb pitch coords: 0-120 x, 0-80 y
    const x = Math.max(0, Math.min(120, relX * 120))
    const y = Math.max(0, Math.min(80, relY * 80))

    if (activeLocationType === 'player') {
      onPlayerLocation({ x, y })
    } else {
      onDesiredLocation({ x, y })
    }
  }

  // Convert Statsbomb coords to SVG % positions
  function toSvgX(x) { return (x / 120) * 100 }
  function toSvgY(y) { return (y / 80) * 100 }

  return (
    <div className="flex flex-col w-full h-full bg-[#e8eef4] overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 border-b border-gray-200 flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Location: Actual
        </span>
      </div>

      {/* Pitch area — takes available space */}
      <div className="flex-1 p-1 flex items-center justify-center min-h-0">
        <div
          ref={pitchRef}
          onClick={handlePitchClick}
          className="relative cursor-crosshair select-none"
          style={{ width: '100%', aspectRatio: '120/80' }}
        >
          <PitchSvg
            playerLocation={playerLocation}
            desiredLocation={desiredLocation}
            toSvgX={toSvgX}
            toSvgY={toSvgY}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-2 py-1.5 border-t border-gray-200 flex flex-col gap-1">
        {/* Dot type selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onActiveTypeChange('player')}
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              activeLocationType === 'player'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 inline-block" />
            Player Location
          </button>
          <button
            onClick={() => onActiveTypeChange('desired')}
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors ${
              activeLocationType === 'desired'
                ? 'bg-orange-500 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 inline-block" />
            Desired Location
          </button>
        </div>
        {/* Attacking direction */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <span>→</span>
          <span>Attacking Direction is {attackingDirection === 'left_to_right' ? 'Left to right' : 'Right to left'}</span>
        </div>
        {/* Coords display if available */}
        {playerLocation && (
          <div className="text-[10px] text-gray-500">
            Player: ({playerLocation.x.toFixed(1)}, {playerLocation.y.toFixed(1)})
          </div>
        )}
        {desiredLocation && (
          <div className="text-[10px] text-gray-500">
            Desired: ({desiredLocation.x.toFixed(1)}, {desiredLocation.y.toFixed(1)})
          </div>
        )}
      </div>
    </div>
  )
}

// ── SVG Pitch ──
function PitchSvg({ playerLocation, desiredLocation, toSvgX, toSvgY }) {
  // Pitch is 120 x 80 in Statsbomb coords, landscape
  // SVG viewBox matches 120 x 80
  const W = 120, H = 80

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      {/* Pitch background */}
      <rect x={0} y={0} width={W} height={H} fill="#2d7a3a" rx={1} />

      {/* Pitch stripes (vertical, subtle) */}
      {[...Array(6)].map((_, i) => (
        <rect key={i} x={i * 20} y={0} width={10} height={H}
          fill="rgba(255,255,255,0.04)" />
      ))}

      {/* Pitch outline */}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke="white" strokeWidth={0.5} />

      {/* Center line */}
      <line x1={60} y1={0} x2={60} y2={H} stroke="white" strokeWidth={0.5} />

      {/* Center circle */}
      <circle cx={60} cy={40} r={10} fill="none" stroke="white" strokeWidth={0.5} />
      <circle cx={60} cy={40} r={0.8} fill="white" />

      {/* Left penalty box: x 0-18, y 18-62 */}
      <rect x={0} y={18} width={18} height={44} fill="none" stroke="white" strokeWidth={0.5} />
      {/* Left 6-yard box: x 0-6, y 30-50 */}
      <rect x={0} y={30} width={6} height={20} fill="none" stroke="white" strokeWidth={0.5} />
      {/* Left penalty spot */}
      <circle cx={12} cy={40} r={0.6} fill="white" />
      {/* Left penalty arc */}
      <path d={`M 18 33 A 10 10 0 0 1 18 47`} fill="none" stroke="white" strokeWidth={0.5} />

      {/* Right penalty box: x 102-120, y 18-62 */}
      <rect x={102} y={18} width={18} height={44} fill="none" stroke="white" strokeWidth={0.5} />
      {/* Right 6-yard box: x 114-120, y 30-50 */}
      <rect x={114} y={30} width={6} height={20} fill="none" stroke="white" strokeWidth={0.5} />
      {/* Right penalty spot */}
      <circle cx={108} cy={40} r={0.6} fill="white" />
      {/* Right penalty arc */}
      <path d={`M 102 33 A 10 10 0 0 0 102 47`} fill="none" stroke="white" strokeWidth={0.5} />

      {/* Left goal (outside pitch, just indicator) */}
      <rect x={-2} y={36} width={2} height={8} fill="none" stroke="white" strokeWidth={0.5} />
      {/* Right goal */}
      <rect x={120} y={36} width={2} height={8} fill="none" stroke="white" strokeWidth={0.5} />

      {/* Player Location dot (blue) */}
      {playerLocation && (
        <g>
          <circle
            cx={playerLocation.x}
            cy={playerLocation.y}
            r={2.5}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={0.5}
          />
        </g>
      )}

      {/* Desired Location dot (orange) */}
      {desiredLocation && (
        <g>
          <circle
            cx={desiredLocation.x}
            cy={desiredLocation.y}
            r={2.5}
            fill="#f97316"
            stroke="white"
            strokeWidth={0.5}
          />
        </g>
      )}

      {/* Arrow from player to desired if both set */}
      {playerLocation && desiredLocation && (
        <line
          x1={playerLocation.x}
          y1={playerLocation.y}
          x2={desiredLocation.x}
          y2={desiredLocation.y}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={0.6}
          strokeDasharray="2,1"
        />
      )}
    </svg>
  )
}
