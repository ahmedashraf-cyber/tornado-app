// Keyboard shortcut overlay — shown when collector presses a modifier key
// Matches the video: full keyboard layout with event shortcuts highlighted

const KEYBOARD_ROWS = [
  ['ESC', 'F1[F11]', 'F2[F12]', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'NML', 'PRTS', 'DEL'],
  ['-`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', 'BACKSPACE'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '/'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'ENTER'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'SHIFT'],
  ['CTRL', 'FN', 'SPC', 'ALT', '', 'ALT', 'CTRL'],
]

// Keys that are active shortcuts (from video: S=Half start, X=Foul committed, O=Out, C=Shield)
const ACTIVE_KEYS = new Set(['S', 'X', 'O', 'C'])

export default function KeyboardOverlay({ onClose }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-3xl"
        onClick={e => e.stopPropagation()}
        style={{ background: '#f5f5f5' }}
      >
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1 mb-1 justify-center">
            {row.map((key, ki) => {
              const displayKey = key.replace(/\[.*\]/, '')
              const isActive = ACTIVE_KEYS.has(key)
              const isWide = ['ESC','TAB','CAPS','SHIFT','BACKSPACE','ENTER','CTRL','FN','SPC','ALT'].includes(displayKey) || key === '' || key === 'SHIFT'
              const isEmpty = key === ''

              return (
                <div
                  key={ki}
                  className={`
                    flex items-center justify-center rounded border text-xs font-medium select-none
                    ${isEmpty ? 'flex-1 opacity-0' : ''}
                    ${isWide ? 'px-3 py-2 min-w-[50px]' : 'w-9 h-9'}
                    ${isActive
                      ? 'bg-red-500 border-red-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700'}
                  `}
                >
                  {!isEmpty && displayKey}
                </div>
              )
            })}
          </div>
        ))}
        <div className="flex justify-center mt-3">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Click anywhere to close
          </button>
        </div>
      </div>
    </div>
  )
}
