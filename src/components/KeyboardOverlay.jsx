// Keyboard shortcut overlay — shown briefly when collector presses a shortcut key
// Matches the exact keyboard layout shown in the video

const KEYBOARD_ROWS = [
  ['ESC', 'F1[F11]', 'F2[F12]', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'NML', 'PRTS', 'DEL'],
  ['-`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', 'BACKSPACE'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '/'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'ENTER'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'SHIFT'],
  ['CTRL', 'FN', 'SPC', 'ALT', '', 'ALT', 'CTRL'],
]

// Which keys have shortcuts assigned (shown highlighted)
const SHORTCUT_KEYS = {
  's': 'Half start',
  'x': 'Foul committed',
  'o': 'Out',
  'c': 'Shield',
}

export default function KeyboardOverlay({ activeKey }) {
  return (
    <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
      <div className="bg-white border border-gray-200 rounded-lg p-4 w-full max-w-3xl mx-4">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 mb-1 justify-center">
            {row.map((key, keyIdx) => {
              if (key === '') return <div key={keyIdx} className="flex-1 min-w-[3rem]" />
              const keyLower = key.toLowerCase()
              const isShortcut = !!SHORTCUT_KEYS[keyLower]
              const isActive = activeKey === keyLower
              const isWide = ['ESC','TAB','CAPS','SHIFT','CTRL','FN','SPC','ALT','BACKSPACE','ENTER'].includes(key)

              return (
                <div
                  key={keyIdx}
                  className={`
                    flex items-center justify-center rounded border text-[10px] font-semibold
                    ${isWide ? 'px-3 py-2 min-w-[2.5rem]' : 'w-8 h-8'}
                    ${isActive
                      ? 'bg-red-500 text-white border-red-600'
                      : isShortcut
                        ? 'bg-red-50 border-red-300 text-red-600'
                        : 'bg-white border-gray-300 text-gray-600'
                    }
                  `}
                >
                  {key}
                </div>
              )
            })}
          </div>
        ))}

        {/* Shortcut legend */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-center">
          {Object.entries(SHORTCUT_KEYS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="bg-red-50 border border-red-300 text-red-600 font-bold px-1.5 py-0.5 rounded text-[10px]">
                {key.toUpperCase()}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
