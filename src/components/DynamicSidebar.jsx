import { SIDEBAR_GROUPS, STANDARD_EVENTS, RESTART_CONTEXT_GROUPS } from '../data/eventDefinitions'

const ALL_GROUPS = { ...SIDEBAR_GROUPS, ...RESTART_CONTEXT_GROUPS }

// Group label text color — matches video exactly
// "Flight o" = blue text, "Flight d" / "Defense" / restart = orange/red text, "New half" / "Carry" = blue
const GROUP_LABEL_COLOR = {
  new_half:          'text-[#1e3a6e]',
  carry:             'text-[#1e3a6e]',
  flight_o:          'text-[#1e3a6e]',
  flight_d:          'text-[#E84C37]',
  defense:           'text-[#E84C37]',
  restart_foul:      'text-[#E84C37]',
  restart_throw:     'text-[#E84C37]',
  restart_gk_corner: 'text-[#E84C37]',
  idle:              'text-gray-400',
}

const GROUP_LABELS = {
  new_half:          'New half',
  carry:             'Carry',
  flight_o:          'Flight o',
  flight_d:          'Flight d',
  defense:           'Defense',
  restart_foul:      'Restart foul',
  restart_throw:     'Restart throw',
  restart_gk_corner: 'Restart gk corner',
  idle:              'Idle',
  standard:          '',
}

// Orange groups for button active state
const ORANGE_GROUPS = ['defense', 'flight_d', 'restart_foul', 'restart_throw', 'restart_gk_corner']

export default function DynamicSidebar({
  teamName, side, groupKey, activeEvent, onEventClick, showNoBase, showSelectTeam,
}) {
  const contextEvents = ALL_GROUPS[groupKey] || []
  const groupLabel = GROUP_LABELS[groupKey] || ''
  const hasGroup = contextEvents.length > 0
  const isOrange = ORANGE_GROUPS.includes(groupKey)
  const isIdle = groupKey === 'idle'
  const labelColor = GROUP_LABEL_COLOR[groupKey] || 'text-[#1e3a6e]'

  function isActive(id) {
    return side === 'home' ? activeEvent === id : activeEvent === id + '_away'
  }

  function handleClick(id) {
    onEventClick(id, side === 'home' ? 'home' : 'away')
  }

  return (
    <div className="w-[9.5rem] flex-shrink-0 flex flex-col bg-[#e8eef4]">

      {/* Team header — matches video: team name with swap icon */}
      <div className={`flex items-center gap-1 px-2 py-1 border-b border-gray-200 ${side === 'away' ? 'justify-end' : ''}`}>
        {side === 'home' && (
          <svg className="w-3 h-3 text-[#1e3a6e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        )}
        <span className="text-xs font-semibold text-[#1e3a6e] truncate">{teamName}</span>
        {side === 'away' && (
          <svg className="w-3 h-3 text-[#1e3a6e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        )}
      </div>

      <div className="flex flex-col overflow-y-auto flex-1">

        {/* "Select Team" message */}
        {showSelectTeam && (
          <p className="text-[10px] text-[#1e3a6e] font-medium text-center px-2 py-3 leading-snug">
            Select Team and Add Base Fields
          </p>
        )}

        {/* "Watch" message */}
        {showNoBase && !showSelectTeam && (
          <p className="text-[10px] text-gray-500 text-center px-2 py-2 leading-snug">
            Watch, no need to add base
          </p>
        )}

        {/* Context group */}
        {!showSelectTeam && !showNoBase && (
          <>
            {/* Group label — plain bold colored text, no filled background */}
            {groupLabel && !isIdle && (
              <div className={`text-[11px] font-bold px-2 pt-1.5 pb-0.5 ${labelColor}`}>
                {groupLabel}
              </div>
            )}
            {isIdle && (
              <div className="text-[11px] font-bold px-2 pt-1.5 pb-0.5 text-gray-400">
                Idle
              </div>
            )}

            {/* Context event buttons — flat rows matching video */}
            {contextEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => handleClick(ev.id)}
                className={`flex items-center justify-between px-2 py-1 text-left text-xs transition-colors border-b border-gray-100 ${
                  isActive(ev.id)
                    ? (isOrange
                        ? 'bg-[#E84C37] text-white'
                        : 'bg-[#1e3a6e] text-white')
                    : 'bg-transparent text-gray-800 hover:bg-gray-200'
                }`}
              >
                <span className="truncate">{ev.label}</span>
                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                  {ev.extra && <span className="text-[9px] opacity-60">{ev.extra}</span>}
                  {ev.shortcut && (
                    <span className={`text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded ${
                      isActive(ev.id) ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {ev.shortcut.toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* Divider before standard events */}
            {(hasGroup || isIdle) && <div className="border-t border-gray-300 my-0.5" />}

            {/* Standard events */}
            {STANDARD_EVENTS.map(ev => (
              <button
                key={ev.id}
                onClick={() => handleClick(ev.id)}
                className={`flex items-center justify-between px-2 py-1 text-left text-xs transition-colors border-b border-gray-100 ${
                  isActive(ev.id)
                    ? 'bg-[#1e3a6e] text-white'
                    : 'bg-transparent text-gray-800 hover:bg-gray-200'
                }`}
              >
                <span className="truncate">{ev.label}</span>
                {ev.shortcut && (
                  <span className={`ml-1 text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded flex-shrink-0 ${
                    isActive(ev.id) ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {ev.shortcut.toUpperCase()}
                  </span>
                )}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
