import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import StartingXIScreen from '../components/StartingXIScreen'
import KeyboardOverlay from '../components/KeyboardOverlay'
import HamburgerMenu from '../components/HamburgerMenu'
import PitchView from '../components/PitchView'
import DynamicSidebar from '../components/DynamicSidebar'
import EventQualifierPanel from '../components/EventQualifierPanel'
import EventChain from '../components/EventChain'
import { EVENT_SEQUENCES, NO_BASE_EVENTS, STANDARD_EVENTS, SIDEBAR_GROUPS } from '../data/eventDefinitions'

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
  const { user } = useAuth()
  const { match, half, mode, collectionType } = location.state || {}

  const [videoSrc, setVideoSrc] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showXI, setShowXI] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeKey, setActiveKey] = useState(null)
  const [xiSubmitted, setXISubmitted] = useState({ home: false, away: false })

  // Active event state
  const [activeEvent, setActiveEvent] = useState(null)   // current event id being tagged
  const [lastEvent, setLastEvent] = useState('default')  // drives sidebar context
  const [qualifiers, setQualifiers] = useState({})        // qualifier values for active event
  const [currentTimestamp, setCurrentTimestamp] = useState('0:00.000')

  // Event chain (logged events)
  const [eventChain, setEventChain] = useState([])

  // Attacking direction — set once at half start
  const [attackingDirection, setAttackingDirection] = useState('left_to_right')
  const [attackingDirectionSet, setAttackingDirectionSet] = useState(false)

  // Settings + pitch
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [playerLocation, setPlayerLocation] = useState(null)

  // Score
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  const fileInputRef = useRef()
  const videoRef = useRef()

  const halfLabel = HALF_LABELS[half] || half
  const modeLabel = mode === '360' ? '360' : 'OFFLINE'
  const showPitch = settings.colsCount > 0 || settings.rowsCount > 0
  const isNoBase = activeEvent ? NO_BASE_EVENTS.includes(activeEvent.replace('_away', '')) : false
  const showNoBase = isNoBase && activeEvent && activeEvent !== 'half_start'

  // Get current video timestamp
  function getTimestamp() {
    if (!videoRef.current) return '0:00.000'
    const t = videoRef.current.currentTime
    const mins = Math.floor(t / 60)
    const secs = (t % 60).toFixed(3).padStart(6, '0')
    return `${mins}:${secs}`
  }

  // Keyboard handling
  const handleKeyDown = useCallback((e) => {
    if (showXI || showMenu || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key.toLowerCase()
    setActiveKey(key)

    if (key === 's' && !activeEvent) {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 600)
      return
    }
    if (key === 'escape') { setShowXI(false); setShowKeyboard(false); setShowMenu(false); cancelActiveEvent(); return }

    // Find shortcut in current sidebar
    const allEvents = [...(SIDEBAR_GROUPS[getGroupKey('home')] || []), ...STANDARD_EVENTS]
    const matched = allEvents.find(ev => ev.shortcut === key)
    if (matched) fireEvent(matched.id, 'home')
  }, [showXI, showMenu, activeEvent, lastEvent])

  const handleKeyUp = useCallback(() => setActiveKey(null), [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [handleKeyDown, handleKeyUp])

  if (!match) { navigate('/matches', { replace: true }); return null }

  function getGroupKey(side) {
    const seq = EVENT_SEQUENCES[lastEvent] || EVENT_SEQUENCES.default
    return side === 'home' ? seq.offenseGroup : seq.defenseGroup
  }

  function fireEvent(eventId, team) {
    const ts = getTimestamp()
    setCurrentTimestamp(ts)
    setActiveEvent(team === 'home' ? eventId : eventId + '_away')
    setQualifiers({})
    setLastEvent(eventId)
    if (eventId === 'half_start') setShowXI(true)
  }

  function cancelActiveEvent() {
    setActiveEvent(null)
    setQualifiers({})
  }

  async function confirmEvent() {
    if (!activeEvent) return
    const cleanId = activeEvent.replace('_away', '')
    const team = activeEvent.endsWith('_away') ? 'away' : 'home'

    // Save to Firestore
    const eventDoc = {
      matchId: match.productionId,
      half,
      collectionType,
      eventType: cleanId,
      team,
      timestamp: currentTimestamp,
      videoTime: videoRef.current?.currentTime || 0,
      qualifiers,
      attackingDirection,
      collectorId: user?.uid,
      collectorEmail: user?.email,
      createdAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(collection(db, 'events'), eventDoc)
      // Add to local chain
      const label = cleanId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      setEventChain(prev => [...prev, {
        id: ref.id,
        firestoreId: ref.id,
        eventType: cleanId,
        team,
        label,
        timestamp: currentTimestamp,
        qualifiers,
        completeness: Object.keys(qualifiers).length > 0 ? 2 : 0,
      }])

      // Update score if goal
      if (cleanId === 'shot' && qualifiers.shotOutcome === 'goal') {
        if (team === 'home') setHomeScore(s => s + 1)
        else setAwayScore(s => s + 1)
      }

      // Update last event for sidebar context
      setLastEvent(cleanId)
    } catch (err) {
      console.error('Failed to save event:', err)
    }

    setActiveEvent(null)
    setQualifiers({})
  }

  async function deleteEvent(index) {
    const ev = eventChain[index]
    if (!ev) return
    try {
      await deleteDoc(doc(db, 'events', ev.firestoreId))
      setEventChain(prev => prev.filter((_, i) => i !== index))
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoSrc(URL.createObjectURL(file))
  }

  function handleQualifierChange(key, val) {
    setQualifiers(prev => ({ ...prev, [key]: val }))
  }

  function handleAttackingDirection(val) {
    setAttackingDirection(val)
    setAttackingDirectionSet(true)
  }

  const homeEventChain = eventChain.filter(e => e.team === 'home')
  const awayEventChain = eventChain.filter(e => e.team === 'away')

  return (
    <div className="flex flex-col h-screen bg-[#e8eef4] overflow-hidden select-none">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#e8eef4] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-semibold px-2.5 py-1 rounded">online</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded">Mode: {modeLabel}</span>
        </div>
        <button onClick={() => setShowMenu(true)} className="w-9 h-9 bg-[#1e3a6e] rounded flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/>
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {activeEvent && (
            <button onClick={confirmEvent} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors">
              ✓ Confirm
            </button>
          )}
          {activeEvent && (
            <button onClick={cancelActiveEvent} className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors">
              ✕
            </button>
          )}
          <button className="w-8 h-8 bg-blue-600 rounded-full text-white text-xs font-bold">
            {match.trainer?.[0] || 'A'}
          </button>
        </div>
      </div>

      {/* ── EVENT QUALIFIER PANEL ── */}
      {activeEvent && (
        <EventQualifierPanel
          activeEvent={activeEvent.replace('_away', '')}
          timestamp={currentTimestamp}
          qualifiers={qualifiers}
          onQualifierChange={handleQualifierChange}
          attackingDirection={attackingDirection}
          onAttackingDirectionChange={handleAttackingDirection}
        />
      )}

      {/* ── STATUS bar ── */}
      {!activeEvent && (
        <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 flex-shrink-0">
          There is no active event yet!
        </p>
      )}
      {activeEvent && isNoBase && (
        <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 flex-shrink-0">
          Active event does not have base fields
        </p>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR */}
        <DynamicSidebar
          teamName={match.homeTeam}
          side="home"
          activeEvent={activeEvent}
          lastEvent={lastEvent}
          onEventClick={(id) => fireEvent(id.replace('_away',''), id.endsWith('_away') ? 'away' : 'home')}
          showNoBase={showNoBase}
        />

        {/* CENTER */}
        <div className="flex-1 flex min-w-0">
          {showPitch && (
            <div className="w-56 flex-shrink-0 border-r border-gray-300">
              <PitchView settings={settings} onLocationClick={setPlayerLocation} playerLocation={playerLocation} />
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            {/* Stats toolbar */}
            <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0">
              <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">Manual</button>
              {[
                { label: `${eventChain.length}/0`, bg:'bg-gray-700 text-gray-300' },
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
              <button className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0">×</button>
            </div>

            {/* Video */}
            <div className="flex-1 bg-black relative min-h-0">
              {showKeyboard && <KeyboardOverlay activeKey={activeKey} />}
              {!showKeyboard && videoSrc ? (
                <video ref={videoRef} src={videoSrc} controls className="w-full h-full object-contain" />
              ) : !showKeyboard ? (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer ${isDragging ? 'bg-gray-800' : 'bg-black'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
                >
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                  <p className="text-gray-400 text-xs">Drop video here or <span className="text-blue-400">browse to select</span></p>
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e=>handleFile(e.target.files[0])} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <DynamicSidebar
          teamName={match.awayTeam}
          side="away"
          activeEvent={activeEvent}
          lastEvent={lastEvent}
          onEventClick={(id) => fireEvent(id.replace('_away',''), 'away')}
          showNoBase={showNoBase}
        />
      </div>

      {/* ── SCORE + EVENT CHAIN ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        {/* Home row */}
        <div className="flex items-center border-b border-gray-100 px-3 py-1.5 gap-3">
          <span className="text-sm font-medium text-gray-800 w-28 flex-shrink-0">{match.homeTeam}</span>
          <div className="flex-1 overflow-x-hidden">
            <EventChain events={homeEventChain} activeIndex={homeEventChain.length - 1} onDelete={(i) => deleteEvent(eventChain.indexOf(homeEventChain[i]))} />
          </div>
          <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{homeScore}</span>
        </div>
        {/* Away row */}
        <div className="flex items-center border-b border-gray-100 px-3 py-1.5 gap-3">
          <span className="text-sm font-medium text-gray-800 w-28 flex-shrink-0">{match.awayTeam}</span>
          <div className="flex-1 overflow-x-hidden">
            <EventChain events={awayEventChain} activeIndex={awayEventChain.length - 1} onDelete={(i) => deleteEvent(eventChain.indexOf(awayEventChain[i]))} />
          </div>
          <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{awayScore}</span>
        </div>
        {/* Game row */}
        <div className="flex items-center px-3 py-1.5">
          <span className="text-sm font-medium text-gray-800 w-28">Game</span>
          <div className="flex-1" />
          <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{homeScore + awayScore}</span>
        </div>
      </div>

      {/* ── OVERLAYS ── */}
      {showXI && (
        <StartingXIScreen match={match} xiSubmitted={xiSubmitted} onSubmit={(t) => { setXISubmitted(p => ({...p,[t]:true})); if (xiSubmitted[t==='home'?'away':'home']) setShowXI(false) }} onClose={() => setShowXI(false)} />
      )}

      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} match={match} half={half} settings={settings} onSettingsChange={(patch) => setSettings(prev => ({...prev,...patch}))} />
    </div>
  )
}
