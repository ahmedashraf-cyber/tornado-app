import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StartingXI from '../components/collection/StartingXI'
import KeyboardOverlay from '../components/collection/KeyboardOverlay'
import { EVENT_BUTTONS, EVENT_SHORTCUTS } from '../data/formations'

const HALF_LABELS = {
  first_half: 'Part 1', second_half: 'Part 2',
  et1: 'ET Part 1', et2: 'ET Part 2', penalties: 'Penalties',
}

export default function CollectionActivePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { match, half, mode, collectionType } = location.state || {}

  const [videoSrc, setVideoSrc] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showXI, setShowXI] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [xiData, setXiData] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const fileInputRef = useRef()

  if (!match) { navigate('/matches', { replace: true }); return null }

  const halfLabel = HALF_LABELS[half] || half
  const modeLabel = mode === '360' ? '360' : 'OFFLINE'

  useEffect(() => {
    function handleKey(e) {
      if (showXI || showKeyboard) return
      const key = e.key.toLowerCase()
      if (key === 's') { e.preventDefault(); setShowXI(true); return }
      if (EVENT_SHORTCUTS[key]) { e.preventDefault(); setActiveEvent(EVENT_SHORTCUTS[key]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showXI, showKeyboard])

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoSrc(URL.createObjectURL(file))
  }

  function handleXISubmit(data) { setXiData(data); setShowXI(false) }

  const scores = [
    { label: match.homeTeam, score: 0, color: '#1e3a6e' },
    { label: match.awayTeam, score: 0, color: '#1e3a6e' },
    { label: 'Game', score: 0, color: null },
  ]

  const SidePanel = ({ team }) => (
    <div className="w-40 bg-[#e8eef4] flex flex-col flex-shrink-0">
      <div className="flex items-center gap-1 px-2 py-1">
        <span className="text-sm font-semibold text-gray-800 truncate">{team}</span>
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        {EVENT_BUTTONS.map(ev => (
          <button
            key={ev.name}
            onClick={() => ev.name === 'Half start' ? setShowXI(true) : setActiveEvent(ev.name)}
            className="flex items-center justify-between px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <span>{ev.name}</span>
            {ev.shortcut && <span className="text-gray-400 font-mono text-xs">{ev.shortcut}</span>}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#e8eef4] flex flex-col overflow-hidden relative">

      {showXI && (
        <StartingXI
          match={match}
          half={half}
          onSubmit={handleXISubmit}
          onCancel={() => setShowXI(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#e8eef4] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-medium px-2.5 py-0.5 rounded">online</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded">Mode: {modeLabel}</span>
        </div>
        <button className="w-9 h-9 bg-[#1e3a6e] rounded flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"/>
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {['Main','≡','ℹ','≔'].map((ic,i) => (
            <button key={i} className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">{ic}</button>
          ))}
          <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {match.homeTeam?.[0]}{match.awayTeam?.[0]}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="text-center py-0.5 flex-shrink-0">
        <p className="text-[#1e3a6e] text-sm font-medium">
          {activeEvent ? `Active event: ${activeEvent}` : 'There is no active event yet!'}
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <SidePanel team={match.homeTeam} />

        {/* Center: stats + video + scores */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Stats toolbar */}
          <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0 relative">
            <button className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded">Manual</button>
            {[
              { label: '0/0', bg: 'bg-gray-700 text-gray-200' },
              { label: '0/0', bg: 'bg-pink-100 text-gray-700' },
              { label: '0/0', bg: 'bg-blue-100 text-gray-700' },
              { label: '0',   bg: 'bg-green-100 text-gray-700' },
              { label: '0',   bg: 'bg-gray-100 text-gray-700' },
            ].map((item, i) => (
              <div key={i} className={`flex-1 flex items-center justify-center text-xs py-1 rounded ${item.bg}`}>
                {item.label}
              </div>
            ))}
            <button
              onClick={() => setShowKeyboard(v => !v)}
              className="text-gray-400 hover:text-white text-xs px-1"
              title="Keyboard shortcuts"
            >⌨</button>
            <button className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs">×</button>
            {showKeyboard && <KeyboardOverlay onClose={() => setShowKeyboard(false)} />}
          </div>

          {/* Video */}
          <div className="flex-1 bg-black flex flex-col overflow-hidden">
            {videoSrc ? (
              <video src={videoSrc} controls className="w-full h-full object-contain" />
            ) : (
              <div
                className={`flex-1 flex flex-col items-center justify-center gap-3 cursor-pointer ${isDragging ? 'bg-gray-800' : 'bg-black'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
              >
                <p className="text-[#1e3a6e] text-sm bg-[#e8eef4] px-4 py-2 rounded font-medium">
                  Match {match.productionId} — {halfLabel}
                </p>
                <h2 className="text-white text-xl font-bold">{match.matchName}</h2>
                <p className="text-gray-400 text-sm">{match.matchDate}</p>
                <p className="text-gray-500 text-sm mt-2">No video loaded. Drop a video file here or click to browse.</p>
                <svg className="w-8 h-8 text-gray-500 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Scores */}
          <div className="bg-white border-t border-gray-200 flex-shrink-0">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 last:border-b-0">
                {s.color && <div className="w-1 h-4 rounded mr-2 flex-shrink-0" style={{ background: s.color }} />}
                <span className="text-sm font-medium text-gray-800 flex-1">{s.label}</span>
                <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{s.score}</span>
              </div>
            ))}
          </div>
        </div>

        <SidePanel team={match.awayTeam} />
      </div>

      {/* Bottom */}
      <div className="flex justify-center py-1 bg-[#e8eef4] flex-shrink-0">
        <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-medium px-3 py-0.5 rounded">online</span>
      </div>
    </div>
  )
}
