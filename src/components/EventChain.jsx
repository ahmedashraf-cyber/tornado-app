export default function EventChain({ events, activeIndex, onDelete }) {
  if (!events || events.length === 0) return null

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 px-2">
      {events.map((ev, i) => {
        const isActive = i === activeIndex
        const dots = [0, 1, 2].map(d => (
          <div
            key={d}
            className={`w-1.5 h-1.5 rounded-full ${
              d <= (ev.completeness || 0) ? 'bg-orange-400' : 'bg-gray-400'
            }`}
          />
        ))

        return (
          <div key={ev.id || i} className="flex flex-col items-center gap-0.5 flex-shrink-0">
            {/* Dots above pill */}
            <div className="flex gap-0.5">{dots}</div>
            {/* Pill */}
            <div className="relative group">
              <button
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {ev.label}
              </button>
              {/* Delete button on hover */}
              {onDelete && (
                <button
                  onClick={() => onDelete(i)}
                  className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center text-[10px] leading-none"
                  title="Delete event"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
