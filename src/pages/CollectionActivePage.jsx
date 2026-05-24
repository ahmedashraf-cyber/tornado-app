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
import {
  EVENT_SEQUENCES, NO_BASE_EVENTS, STANDARD_EVENTS, SIDEBAR_GROUPS,
  PASS_TYPE_AUTO, RESTART_CONTEXT_GROUPS, INCOMPLETE_PASS_TRIGGERS,
} from '../data/eventDefinitions'

const HALF_LABELS = {
  first_half: 'Part 1', second_half: 'Part 2',
  et1: 'ET Part 1', et2: 'ET Part 2', penalties: 'Penalties',
}

const DEFAULT_SETTINGS = {
  rowsCount: 0, rowsTransparency: 0.2,
  colsCount: 0, colsTransparency: 0.2,
  pitchColor: '#2d8a4e',
  invertRight: false, invertLeft: false, showXY: false,
  teamAColor: '#ffffff', teamBColor: '#ffff00',
}

function getSidebarGroups(lastEvent, lastTeam, outLocation) {
  if (lastEvent === 'out') {
    const restartGroup = outLocation === 'sideline' ? 'restart_throw' : 'restart_gk_corner'
    if (lastTeam === 'home') return { home: 'idle', away: restartGroup }
    else return { home: restartGroup, away: 'idle' }
  }
  const seq = EVENT_SEQUENCES[lastEvent] || EVENT_SEQUENCES['default']
  if (lastTeam === 'home') {
    return { home: seq.offenseGroup || 'standard', away: seq.defenseGroup || 'standard' }
  } else {
    return { home: seq.defenseGroup || 'standard', away: seq.offenseGroup || 'standard' }
  }
}

function getPassTypeAuto(lastEvent, outLocation) {
  if (lastEvent === 'half_start') return 'kick_off'
  if (lastEvent === 'foul_committed') return 'free_kick'
  if (lastEvent === 'out') return outLocation === 'sideline' ? 'throw_in' : 'corner'
  if (lastEvent === 'ball_recovery') return 'recovery'
  if (lastEvent === 'interception') return 'interception'
  return 'open_play'
}

function formatTimestamp(seconds) {
  if (!seconds && seconds !== 0) return '0:00.000'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${mins}:${secs}`
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
  const [videoTime, setVideoTime] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Event state
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeTeam, setActiveTeam] = useState(null)
  const [lastEvent, setLastEvent] = useState('half_start')
  const [lastTeam, setLastTeam] = useState('home')
  const [outLocation, setOutLocation] = useState(null)
  const [qualifiers, setQualifiers] = useState({})
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [teamsideStep, setTeamsideStep] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [eventChain, setEventChain] = useState([])
  const [attackingDirection, setAttackingDirection] = useState('left_to_right')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [playerLocation, setPlayerLocation] = useState(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [passEndIncomplete, setPassEndIncomplete] = useState(false)

  const fileInputRef = useRef()
  const videoRef = useRef()

  const modeLabel = mode === '360' ? '360' : 'OFFLINE'
  const showPitch = settings.colsCount > 0 || settings.rowsCount > 0
  const sidebarGroups = getSidebarGroups(lastEvent, lastTeam, outLocation)
  const showSelectTeam = teamsideStep === 'team_select'
  const isNoBase = activeEvent ? NO_BASE_EVENTS.includes(activeEvent.replace('_away', '')) : false
  const showNoBase = activeEvent && teamsideStep === 'qualifiers' && isNoBase

  // Track online/offline
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  // Update video time display
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const update = () => setVideoTime(video.currentTime)
    video.addEventListener('timeupdate', update)
    return () => video.removeEventListener('timeupdate', update)
  }, [videoSrc])

  function getCurrentVideoTime() {
    return videoRef.current?.currentTime || 0
  }

  function fireEvent(eventId, team) {
    const ts = getCurrentVideoTime()
    setCurrentTimestamp(ts)
    setActiveEvent(eventId)
    setActiveTeam(team)
    setQualifiers({})

    const needsTeamSelect = ['pass', 'shot', 'dribble', 'miscontrol', 'ball_recovery',
      'carry', 'reception', 'foul_committed', 'tackle', 'interception',
      'clearance', 'block', 'goal_keeper']
    if (needsTeamSelect.includes(eventId)) {
      setTeamsideStep('team_select')
      setSelectedTeam(null)
    } else {
      setTeamsideStep('qualifiers')
    }

    if (eventId === 'half_start') {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 600)
      setTeamsideStep('qualifiers')
    }
  }

  function handleTeamSelect(team) {
    setSelectedTeam(team)
    setTeamsideStep('qualifiers')
    if (activeEvent === 'pass' || activeEvent === 'pass_away') {
      const autoType = getPassTypeAuto(lastEvent, outLocation)
      setQualifiers(prev => ({ ...prev, passType: autoType }))
    }
  }

  const handleKeyDown = useCallback((e) => {
    if (showXI || showMenu || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key.toLowerCase()
    setActiveKey(key)

    if (key === '1' && teamsideStep === 'team_select') { handleTeamSelect('home'); return }
    if (key === '2' && teamsideStep === 'team_select') { handleTeamSelect('away'); return }
    if (key === 'escape') { cancelEvent(); return }
    if (key === 'enter' && activeEvent && teamsideStep === 'qualifiers') { confirmEvent(); return }

    if (!activeEvent) {
      const homeEvents = [...(SIDEBAR_GROUPS[sidebarGroups.home] || []),
        ...(RESTART_CONTEXT_GROUPS[sidebarGroups.home] || []), ...STANDARD_EVENTS]
      const found = homeEvents.find(ev => ev.shortcut === key)
      if (found) { fireEvent(found.id, 'home'); return }

      const awayEvents = [...(SIDEBAR_GROUPS[sidebarGroups.away] || []),
        ...(RESTART_CONTEXT_GROUPS[sidebarGroups.away] || []), ...STANDARD_EVENTS]
      const foundAway = awayEvents.find(ev => ev.shortcut === key)
      if (foundAway) { fireEvent(foundAway.id, 'away'); return }
    }
  }, [showXI, showMenu, activeEvent, teamsideStep, sidebarGroups, lastEvent, outLocation])

  const handleKeyUp = useCallback(() => setActiveKey(null), [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [handleKeyDown, handleKeyUp])

  if (!match) { navigate('/matches', { replace: true }); return null }

  function cancelEvent() {
    setActiveEvent(null); setActiveTeam(null); setQualifiers({})
    setTeamsideStep(null); setSelectedTeam(null)
  }

  async function confirmEvent() {
    if (!activeEvent || teamsideStep === 'team_select') return
    const cleanId = activeEvent.replace('_away', '')
    const team = selectedTeam || activeTeam || 'home'

    if (cleanId === 'out' && qualifiers.outLocation) setOutLocation(qualifiers.outLocation)

    const eventDoc = {
      matchId: match.productionId, half, collectionType,
      eventType: cleanId, team,
      timestamp: formatTimestamp(currentTimestamp),
      videoTime: currentTimestamp,
      qualifiers, attackingDirection,
      collectorId: user?.uid, collectorEmail: user?.email,
      createdAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(collection(db, 'events'), eventDoc)
      const label = cleanId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const newEv = {
        id: ref.id, firestoreId: ref.id, eventType: cleanId, team,
        label, timestamp: formatTimestamp(currentTimestamp), qualifiers,
        completeness: Object.keys(qualifiers).length,
      }
      setEventChain(prev => [...prev, newEv])

      if (cleanId === 'shot' && qualifiers.shotOutcome === 'goal') {
        if (team === 'home') setHomeScore(s => s + 1)
        else setAwayScore(s => s + 1)
      }

      const wasOnDefenseSide = lastEvent === 'pass'
      const isIncompleteTrigger = INCOMPLETE_PASS_TRIGGERS.includes(cleanId)

      if (wasOnDefenseSide && isIncompleteTrigger) {
        setPassEndIncomplete(true)
        setLastEvent(cleanId); setLastTeam(team)
      } else {
        setPassEndIncomplete(false)
        setLastEvent(cleanId); setLastTeam(team)
        if (cleanId === 'out') setOutLocation(qualifiers.outLocation || null)
        else setOutLocation(null)
      }
    } catch (err) { console.error('Failed to save event:', err) }

    cancelEvent()
  }

  async function deleteEvent(index) {
    const ev = eventChain[index]
    if (!ev) return
    try {
      await deleteDoc(doc(db, 'events', ev.firestoreId))
      setEventChain(prev => prev.filter((_, i) => i !== index))
    } catch (err) { console.error('Failed to delete:', err) }
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoSrc(URL.createObjectURL(file))
  }

  function handleQualifierChange(key, val) {
    setQualifiers(prev => ({ ...prev, [key]: val }))
  }

  const homeChain = eventChain.filter(e => e.team === 'home')
  const awayChain = eventChain.filter(e => e.team === 'away')

  return (
    <div className="flex flex-col h-screen bg-[#e8eef4] overflow-hidden select-none">

      {/* ── TOP BAR — matches video exactly ── */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#e8eef4] flex-shrink-0 border-b border-gray-200">

        {/* LEFT: online badge + Mode + hamburger */}
        <div className="flex items-center gap-1.5">
          {/* Online/Offline badge — matches video top-left */}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            isOnline ? 'bg-[#c8e6c9] text-[#2e7d32]' : 'bg-gray-300 text-gray-600'
          }`}>
            {isOnline ? 'online' : 'offline'}
          </span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded">
            Mode: {modeLabel}
          </span>
          {/* Hamburger — matches video center-top */}
          <button
            onClick={() => setShowMenu(true)}
            className="w-8 h-7 bg-[#1e3a6e] rounded flex items-center justify-center text-white ml-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* RIGHT: action buttons + avatar — matches video top-right */}
        <div className="flex items-center gap-1">
          {/* Play/Pause/Record buttons — 3 navy circles as in video */}
          <div className="flex items-center gap-1 mr-1">
            {['▶', '⏸', '⏺'].map((icon, i) => (
              <button key={i} className="w-7 h-7 bg-[#1e3a6e] rounded-sm flex items-center justify-center text-white text-[10px]">
                {icon}
              </button>
            ))}
          </div>
          {/* Avatar */}
          <button className="w-8 h-8 bg-[#1e3a6e] rounded-full text-white text-xs font-bold">
            {(match.trainer?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </button>
        </div>
      </div>

      {/* ── TIMESTAMP + QUALIFIER STRIP — matches video layout ── */}
      {/* Timestamp is standalone top-left, qualifier is separate line below */}
      <div className="flex-shrink-0 bg-[#e8eef4]">
        <div className="flex items-start">
          {/* Timestamp block — blue box top-left exactly as video */}
          <div className="flex-shrink-0 flex flex-col items-start">
            <div className="flex items-center gap-1 px-2 pt-1">
              <div className="bg-[#1e3a6e] text-white text-sm font-mono font-bold px-3 py-1 rounded min-w-[5.5rem] text-center">
                {formatTimestamp(videoTime)}
              </div>
              {/* Small settings icon next to timestamp */}
              <button className="text-gray-500 hover:text-gray-700 text-xs leading-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
            {/* Confirm / Cancel buttons below timestamp when event active */}
            {activeEvent && (
              <div className="flex items-center gap-1 px-2 pb-1 pt-0.5">
                {teamsideStep === 'qualifiers' && (
                  <button
                    onClick={confirmEvent}
                    className="h-6 px-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={cancelEvent}
                  className="h-6 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Qualifier strip — right of timestamp, same light gray bg */}
          <div className="flex-1 min-w-0">
            {activeEvent ? (
              <EventQualifierPanel
                activeEvent={activeEvent}
                qualifiers={qualifiers}
                onQualifierChange={handleQualifierChange}
                attackingDirection={attackingDirection}
                onAttackingDirectionChange={setAttackingDirection}
                teamsideStep={teamsideStep}
                homeTeamName={match.homeTeam}
                awayTeamName={match.awayTeam}
                onTeamSelect={handleTeamSelect}
                selectedTeam={selectedTeam}
                passEndIncomplete={passEndIncomplete}
              />
            ) : (
              // No active event — show status message inline
              <div className="px-3 py-1.5 text-xs text-gray-500 italic">
                There is no active event yet!
              </div>
            )}
          </div>
        </div>

        {/* "Active event does not have base fields" status — full width below */}
        {activeEvent && isNoBase && teamsideStep === 'qualifiers' && (
          <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 border-t border-gray-200">
            Active event does not have base fields
          </p>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR */}
        <DynamicSidebar
          teamName={match.homeTeam} side="home"
          groupKey={activeEvent ? null : sidebarGroups.home}
          activeEvent={activeEvent}
          onEventClick={fireEvent}
          showNoBase={showNoBase}
          showSelectTeam={showSelectTeam}
        />

        {/* CENTER */}
        <div className="flex-1 flex min-w-0">
          {showPitch && (
            <div className="w-52 flex-shrink-0 border-r border-gray-300" style={{minWidth:'13rem',maxWidth:'13rem'}}>
              <PitchView settings={settings} onLocationClick={setPlayerLocation} playerLocation={playerLocation} />
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Stats toolbar — matches video */}
            <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0">
              <button className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">Manual</button>
              {[
                { label: `${eventChain.length}/0`, icon: null, bg: 'bg-gray-700 text-gray-300' },
                { label: '0/0', icon: '📷', bg: 'bg-pink-50 text-gray-700' },
                { label: '0/0', icon: '📸', bg: 'bg-blue-50 text-gray-700' },
                { label: '0',   icon: '✓', bg: 'bg-green-50 text-gray-700' },
                { label: '0',   icon: '⊘', bg: 'bg-gray-50 text-gray-600' },
              ].map((item, i) => (
                <div key={i} className={`flex-1 flex items-center justify-center gap-0.5 ${item.bg} rounded py-1 text-xs font-medium min-w-0`}>
                  {item.icon && <span className="text-xs">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              ))}
              <button className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0">×</button>
            </div>

            {/* Video area */}
            <div className="flex-1 bg-black relative min-h-0">
              {showKeyboard && <KeyboardOverlay activeKey={activeKey} />}
              {!showKeyboard && videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  className="w-full h-full object-contain"
                />
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
                  <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <DynamicSidebar
          teamName={match.awayTeam} side="away"
          groupKey={activeEvent ? null : sidebarGroups.away}
          activeEvent={activeEvent}
          onEventClick={fireEvent}
          showNoBase={showNoBase}
          showSelectTeam={showSelectTeam}
        />
      </div>

      {/* ── SCORE + EVENT CHAIN — matches video bottom strip ── */}
      <div className="flex-shrink-0 border-t border-gray-300 bg-[#e8eef4]">
        {[
          { label: match.homeTeam, score: homeScore, chain: homeChain },
          { label: match.awayTeam, score: awayScore, chain: awayChain },
          { label: 'Game', score: homeScore + awayScore, chain: null },
        ].map((item, i) => (
          <div key={i} className={`flex items-center px-2 py-1 gap-2 ${i < 2 ? 'border-b border-gray-200' : ''}`}>
            {/* Team name */}
            <span className="text-xs font-semibold text-gray-800 w-24 flex-shrink-0 truncate">{item.label}</span>
            {/* Event chain pills */}
            <div className="flex-1 overflow-x-auto">
              {item.chain && (
                <EventChain
                  events={item.chain}
                  activeIndex={item.chain.length - 1}
                  onDelete={(idx) => {
                    const globalIdx = eventChain.indexOf(item.chain[idx])
                    deleteEvent(globalIdx)
                  }}
                />
              )}
            </div>
            {/* Score box — small dark rounded box matching video */}
            <div className="bg-gray-700 text-white text-xs font-bold px-2.5 py-0.5 rounded min-w-[1.75rem] text-center flex-shrink-0">
              {item.score}
            </div>
          </div>
        ))}
      </div>

      {showXI && (
        <StartingXIScreen
          match={match} xiSubmitted={xiSubmitted}
          onSubmit={(t) => { setXISubmitted(p => ({ ...p, [t]: true })); if (xiSubmitted[t === 'home' ? 'away' : 'home']) setShowXI(false) }}
          onClose={() => setShowXI(false)}
        />
      )}
      <HamburgerMenu
        isOpen={showMenu} onClose={() => setShowMenu(false)}
        match={match} half={half} settings={settings}
        onSettingsChange={(patch) => setSettings(prev => ({ ...prev, ...patch }))}
      />
    </div>
  )
}
