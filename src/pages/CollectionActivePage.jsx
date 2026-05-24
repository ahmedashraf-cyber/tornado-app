import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StartingXIScreen from '../components/StartingXIScreen'
import KeyboardOverlay from '../components/KeyboardOverlay'
import HamburgerMenu from '../components/HamburgerMenu'
import PitchView from '../components/PitchView'
import { HOME_EVENTS } from '../data/events'

const HALF_LABELS = {
  first_half: 'Part 1', second_half: 'Part 2',
  et1: 'ET Part 1', et2: 'ET Part 2', penalties: 'Penalties',
}

const DEFAULT_SETTINGS = {
  rowsCount: 0, rowsTransparency: 0.2,
  colsCount: 6, colsTransparency: 0.2,
  pitchColor: '#2d8a4e',
  invertRight: false, invertLeft: false, showXY: false,
  teamAColor: '#ffffff', teamBColor: '#ffff00',
}

export default function CollectionActivePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { match, half, mode, collectionType } = location.state || {}

  const [videoSrc, setVideoSrc] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showXI, setShowXI] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeKey, setActiveKey] = useState(null)
  const [xiSubmitted, setXISubmitted] = useState({ home: false, away: false })
  const [activeEvent, setActiveEvent] = useState(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [playerLocation, setPlayerLocation] = useState(null)
  const [desiredLocation, setDesiredLocation] = useState(null)

  // Pitch visible when settings have been interacted with
  const showPitch = settings.colsCount > 0 || settings.rowsCount > 0

  const fileInputRef = useRef()
  const videoRef = useRef()

  const halfLabel = HALF_LABELS[half] || half
  const modeLabel = mode === '360' ? '360' : 'OFFLINE'

  const handleKeyDown = useCallback((e) => {
    if (showXI || showMenu) return
    const key = e.key.toLowerCase()
    setActiveKey(key)
    if (key === 's') {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 600)
    }
    if (key === 'escape') { setShowXI(false); setShowKeyboard(false); setShowMenu(false) }
  }, [showXI, showMenu])

  const handleKeyUp = useCallback(() => setActiveKey(null), [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [handleKeyDown, handleKeyUp])

  if (!match) { navigate('/matches', { replace: true }); return null }

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoSrc(URL.createObjectURL(file))
  }

  function handleEventClick(eventId) {
    if (eventId === 'half_start') {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 400)
      return
    }
    setActiveEvent(prev => prev === eventId ? null : eventId)
  }

  function handleXISubmit(team) {
    setXISubmitted(prev => ({ ...prev, [team]: true }))
    const both = team === 'home' ? xiSubmitted.away : xiSubmitted.home
    if (both) setShowXI(false)
  }

  function handleSettingsChange(patch) {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  return (
    <div className="flex flex-col h-screen bg-[#e8eef4] overflow-hidden select-none">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#e8eef4] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-semibold px-2.5 py-1 rounded">online</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded">Mode: {modeLabel}</span>
        </div>
        <button
          onClick={() => setShowMenu(true)}
          className="w-9 h-9 bg-[#1e3a6e] rounded flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/>
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {['Main','⊞','ℹ'].map((icon, i) => (
            <button key={i} className="h-8 px-2 bg-blue-500 rounded-full text-white text-xs font-medium">{icon}</button>
          ))}
          <button className="w-8 h-8 bg-blue-600 rounded-full text-white text-xs font-bold">
            {match.trainer?.[0] || 'A'}
          </button>
        </div>
      </div>

      {/* ── STATUS ── */}
      <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 flex-shrink-0">
        {activeEvent ? `Active event: ${activeEvent.replace('_away','').replace('_',' ')}` : 'There is no active event yet!'}
      </p>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR — Home team */}
        <div className="w-40 flex-shrink-0 flex flex-col bg-[#e8eef4] pr-1">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            <span className="text-xs font-semibold text-gray-800 truncate">{match.homeTeam}</span>
          </div>
          <div className="flex flex-col gap-0.5 px-1 overflow-y-auto">
            {HOME_EVENTS.map(ev => (
              <button key={ev.id} onClick={() => handleEventClick(ev.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs font-medium border transition-colors ${
                  activeEvent === ev.id ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a6e] hover:bg-blue-50'}`}>
                <span>{ev.label}</span>
                {ev.shortcut && <span className={`ml-1 text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded ${activeEvent === ev.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{ev.shortcut.toUpperCase()}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex min-w-0">

          {/* Pitch (shown when settings active) */}
          {showPitch && (
            <div className="w-56 flex-shrink-0 border-r border-gray-300">
              <PitchView
                settings={settings}
                onLocationClick={setPlayerLocation}
                playerLocation={playerLocation}
                desiredLocation={desiredLocation}
              />
            </div>
          )}

          {/* Video column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Stats toolbar */}
            <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0">
              <button onClick={() => handleEventClick('manual')} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">Manual</button>
              {[
                { label: `${Object.keys({}).length}/0`, bg:'bg-gray-700 text-gray-300' },
                { label:'0/0', bg:'bg-pink-100 text-gray-700', icon:'📷' },
                { label:'0/0', bg:'bg-blue-100 text-gray-700', icon:'📸' },
                { label:'0', bg:'bg-green-100 text-gray-700', icon:'👁' },
                { label:'0', bg:'bg-gray-100 text-gray-600', icon:'🚫' },
              ].map((item,i) => (
                <div key={i} className={`flex-1 flex items-center justify-center gap-0.5 ${item.bg} rounded py-1 text-xs font-medium min-w-0`}>
                  {item.icon && <span className="text-xs">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              ))}
              <button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0">×</button>
            </div>

            {/* Video / keyboard */}
            <div className="flex-1 bg-black relative min-h-0">
              {showKeyboard && <KeyboardOverlay activeKey={activeKey} />}
              {!showKeyboard && videoSrc ? (
                <video ref={videoRef} src={videoSrc} controls className="w-full h-full object-contain" />
              ) : !showKeyboard ? (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer ${isDragging ? 'bg-gray-800' : 'bg-black'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
                >
                  <p className="text-[#e8eef4] bg-[#1e3a6e] text-xs px-4 py-2 rounded text-center max-w-xs">No video for this match and part. Ask the video team for more details.</p>
                  <p className="text-gray-400 text-xs">return to <button onClick={e=>{e.stopPropagation();navigate(-1)}} className="text-blue-400 hover:underline">Part select</button></p>
                  <p className="text-gray-500 text-xs">Or</p>
                  <p className="text-gray-400 text-xs">return to <button onClick={e=>{e.stopPropagation();navigate('/matches')}} className="text-blue-400 hover:underline">match select</button></p>
                  <p className="text-gray-500 text-xs">Or</p>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    <p className="text-gray-300 text-xs">Drop video here or <span className="text-blue-400">browse to select</span></p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e=>handleFile(e.target.files[0])} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — Away team */}
        <div className="w-40 flex-shrink-0 flex flex-col bg-[#e8eef4] pl-1">
          <div className="flex items-center gap-1 px-2 py-1.5 justify-end">
            <span className="text-xs font-semibold text-gray-800 truncate">{match.awayTeam}</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
          <div className="flex flex-col gap-0.5 px-1 overflow-y-auto">
            {HOME_EVENTS.map(ev => (
              <button key={ev.id} onClick={() => handleEventClick(ev.id + '_away')}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs font-medium border transition-colors ${
                  activeEvent === ev.id+'_away' ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a6e] hover:bg-blue-50'}`}>
                <span>{ev.label}</span>
                {ev.shortcut && <span className="ml-1 text-[10px] font-bold uppercase w-4 h-4 flex items-center justify-center rounded bg-gray-100 text-gray-500">{ev.shortcut.toUpperCase()}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SCORE SECTION ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        {[{ label: match.homeTeam, score: homeScore }, { label: match.awayTeam, score: awayScore }, { label: 'Game', score: homeScore + awayScore }].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-800">{item.label}</span>
            <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{item.score}</span>
          </div>
        ))}
      </div>

      {/* ── OVERLAYS ── */}
      {showXI && (
        <StartingXIScreen match={match} xiSubmitted={xiSubmitted} onSubmit={handleXISubmit} onClose={() => setShowXI(false)} />
      )}

      <HamburgerMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        match={match}
        half={half}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
