import { SIDEBAR_GROUPS, STANDARD_EVENTS, RESTART_CONTEXT_GROUPS } from '../data/eventDefinitions'

const ALL_GROUPS = { ...SIDEBAR_GROUPS, ...RESTART_CONTEXT_GROUPS }

const GROUP_LABELS = {
  new_half:        'New half',
  carry:           'Carry',
  flight_o:        'Flight o',
  flight_d:        'Flight d',
  defense:         'Defense',
  restart_foul:    'Restart foul',
  restart_throw:   'Restart throw',
  restart_gk_corner: 'Restart gk corner',
  idle:            'Idle',
  standard:        '',
}

// Orange-tinted groups
const ORANGE_GROUPS = ['defense', 'flight_d', 'restart_foul', 'restart_throw', 'restart_gk_corner']

export default function DynamicSidebar({
  teamName,
  side,          // 'home' | 'away'
  groupKey,      // explicit group key passed from parent
  activeEvent,
  onEventClick,
  showNoBase,
  showSelectTeam,
}) {
  const contextEvents = ALL_GROUPS[groupKey] || []
  const groupLabel = GROUP_LABELS[groupKey] || ''
  const hasGroup = contextEvents.length > 0
  const isOrange = ORANGE_GROUPS.includes(groupKey)
  const isIdle = groupKey === 'idle'

  function isActive(id) {
    return side === 'home' ? activeEvent === id : activeEvent === id + '_away'
  }

  function handleClick(id) {
    if (side === 'home') onEventClick(id, 'home')
    else onEventClick(id, 'away')
  }

  return (
    <div className="w-40 flex-shrink-0 flex flex-col bg-[#e8eef4]">
      {/* Team header */}
      <div className={`flex items-center gap-1 px-2 py-1.5 ${side === 'away' ? 'justify-end' : ''}`}>
        {side === 'home' && (
          <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        )}
        <span className="text-xs font-semibold text-gray-800 truncate">{teamName}</span>
        {side === 'away' && (
          <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-1 overflow-y-auto flex-1">

        {/* "Select Team and Add Base Fields" — shown while teams side step is active */}
        {showSelectTeam && (
          <p className="text-[10px] text-[#1e3a6e] font-medium text-center px-2 py-3 leading-snug">
            Select Team and Add Base Fields
          </p>
        )}

        {/* "Watch, no need to add base" */}
        {showNoBase && !showSelectTeam && (
          <p className="text-[10px] text-gray-500 text-center px-2 py-2 leading-snug">
            Watch, no need to add base
          </p>
        )}

        {/* Context group */}
        {!showSelectTeam && !showNoBase && hasGroup && (
          <>
            {groupLabel && (
              <div className={`text-[10px] font-bold text-center py-1 px-2 rounded text-white mb-0.5 ${
                isOrange ? 'bg-orange-500' : 'bg-[#1e3a6e]'
              }`}>
                {groupLabel}
              </div>
            )}
            {contextEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => handleClick(ev.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs font-medium border transition-colors ${
                  isActive(ev.id)
                    ? (isOrange ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#1e3a6e] text-white border-[#1e3a6e]')
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a6e] hover:bg-blue-50'
                }`}
              >
                <span className="truncate">{ev.label}</span>
                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                  {ev.extra && <span className="text-[9px] text-gray-400">{ev.extra}</span>}
                  {ev.shortcut && (
                    <span className={`text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded ${
                      isActive(ev.id) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ev.shortcut.toUpperCase()}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </>
        )}

        {/* Idle label */}
        {!showSelectTeam && !showNoBase && isIdle && (
          <div className="text-[10px] font-bold text-center py-1 px-2 rounded text-white bg-[#1e3a6e] mb-0.5">
            Idle
          </div>
        )}

        {/* Divider before standard events */}
        {!showSelectTeam && (hasGroup || isIdle) && <div className="border-t border-gray-200 my-1" />}

        {/* Standard events */}
        {!showSelectTeam && STANDARD_EVENTS.map(ev => (
          <button
            key={ev.id}
            onClick={() => handleClick(ev.id)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs font-medium border transition-colors ${
              isActive(ev.id)
                ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a6e] hover:bg-blue-50'
            }`}
          >
            <span className="truncate">{ev.label}</span>
            {ev.shortcut && (
              <span className={`ml-1 text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded flex-shrink-0 ${
                isActive(ev.id) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {ev.shortcut.toUpperCase()}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
