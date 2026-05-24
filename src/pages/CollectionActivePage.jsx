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
  colsCount: 6, colsTransparency: 0.2,
  pitchColor: '#2d8a4e',
  invertRight: false, invertLeft: false, showXY: false,
  teamAColor: '#ffffff', teamBColor: '#ffff00',
}

// Determine sidebar group keys based on last event + who performed it + out location
function getSidebarGroups(lastEvent, lastTeam, outLocation) {
  // After Out — determine restart type from location
  if (lastEvent === 'out') {
    const restartGroup = outLocation === 'sideline' ? 'restart_throw' : 'restart_gk_corner'
    if (lastTeam === 'home') {
      return { home: 'idle', away: restartGroup }
    } else {
      return { home: restartGroup, away: 'idle' }
    }
  }

  const seq = EVENT_SEQUENCES[lastEvent] || EVENT_SEQUENCES['default']

  // The team that performed the last event is "offense"
  if (lastTeam === 'home') {
    return { home: seq.offenseGroup || 'standard', away: seq.defenseGroup || 'standard' }
  } else {
    // Away team performed → swap offense/defense
    return { home: seq.defenseGroup || 'standard', away: seq.offenseGroup || 'standard' }
  }
}

// Determine pass type auto-population based on last event and context
function getPassTypeAuto(lastEvent, outLocation, lastPassWasIncomplete) {
  if (lastEvent === 'half_start') return 'kick_off'
  if (lastEvent === 'foul_committed') return 'free_kick'
  if (lastEvent === 'out') {
    return outLocation === 'sideline' ? 'throw_in' : 'corner'
  }
  // After ball_recovery that completed an incomplete pass → recovery
  if (lastEvent === 'ball_recovery') return 'recovery'
  // After interception → interception
  if (lastEvent === 'interception') return 'interception'
  // After reception (carry context) → open_play (or first_time for consecutive quick passes)
  return 'open_play'
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

  // Event state
  const [activeEvent, setActiveEvent] = useState(null)    // 'pass', 'pass_away', etc
  const [activeTeam, setActiveTeam] = useState(null)       // 'home' | 'away'
  const [lastEvent, setLastEvent] = useState('half_start') // drives sidebar context
  const [lastTeam, setLastTeam] = useState('home')
  const [outLocation, setOutLocation] = useState(null)     // 'sideline' | 'endline'
  const [qualifiers, setQualifiers] = useState({})
  const [currentTimestamp, setCurrentTimestamp] = useState('0:00.000')

  // Teams side selection step
  // 'team_select' = waiting for team, 'qualifiers' = team chosen show qualifiers
  const [teamsideStep, setTeamsideStep] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)

  // Event chain
  const [eventChain, setEventChain] = useState([])

  // Attacking direction
  const [attackingDirection, setAttackingDirection] = useState('left_to_right')

  // Settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [playerLocation, setPlayerLocation] = useState(null)

  // Score
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  // Pass end incomplete — tracks whether the last pass was NOT received by the offense team
  // This is shown as "Pass end: Incomplete" badge in the qualifier strip
  // Triggered when a defense-side event (interception, ball_recovery) is logged after a pass
  const [passEndIncomplete, setPassEndIncomplete] = useState(false)

  const fileInputRef = useRef()
  const videoRef = useRef()

  const halfLabel = HALF_LABELS[half] || half
  const modeLabel = mode === '360' ? '360' : 'OFFLINE'
  const showPitch = settings.colsCount > 0 || settings.rowsCount > 0

  // Compute sidebar group keys
  const sidebarGroups = getSidebarGroups(lastEvent, lastTeam, outLocation)

  // Show "select team" on sidebars while in team_select step
  const showSelectTeam = teamsideStep === 'team_select'
  // Show "watch no need to add base" when event active but no base fields needed
  const isNoBase = activeEvent ? NO_BASE_EVENTS.includes(activeEvent.replace('_away','')) : false
  const showNoBase = activeEvent && teamsideStep === 'qualifiers' && isNoBase

  function getTimestamp() {
    if (!videoRef.current) return '0:00.000'
    const t = videoRef.current.currentTime
    const mins = Math.floor(t / 60)
    const secs = (t % 60).toFixed(3).padStart(6, '0')
    return `${mins}:${secs}`
  }

  // ── FIRE EVENT ──
  function fireEvent(eventId, team) {
    const ts = getTimestamp()
    setCurrentTimestamp(ts)
    setActiveEvent(eventId)
    setActiveTeam(team)
    setQualifiers({})

    // Events that need team selection first
    const needsTeamSelect = ['pass', 'shot', 'dribble', 'miscontrol', 'ball_recovery',
                              'carry', 'reception', 'foul_committed', 'tackle', 'interception',
                              'clearance', 'block', 'goal_keeper']
    if (needsTeamSelect.includes(eventId)) {
      setTeamsideStep('team_select')
      setSelectedTeam(null)
    } else {
      setTeamsideStep('qualifiers')
    }

    // Special: half_start opens XI
    if (eventId === 'half_start') {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 600)
      setTeamsideStep('qualifiers')
    }
  }

  // ── TEAM SELECTED ──
  function handleTeamSelect(team) {
    setSelectedTeam(team)
    setTeamsideStep('qualifiers')

    // Auto-populate pass type based on context
    if (activeEvent === 'pass' || activeEvent === 'pass_away') {
      const autoType = getPassTypeAuto(lastEvent, outLocation, passEndIncomplete)
      setQualifiers(prev => ({ ...prev, passType: autoType }))
    }
  }

  // ── KEYBOARD ──
  const handleKeyDown = useCallback((e) => {
    if (showXI || showMenu || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key.toLowerCase()
    setActiveKey(key)

    if (key === '1' && teamsideStep === 'team_select') { handleTeamSelect('home'); return }
    if (key === '2' && teamsideStep === 'team_select') { handleTeamSelect('away'); return }
    if (key === 'escape') { cancelEvent(); return }
    if (key === 'enter' && activeEvent && teamsideStep === 'qualifiers') { confirmEvent(); return }

    if (!activeEvent) {
      // Match shortcut from current sidebar
      const homeEvents = [...(SIDEBAR_GROUPS[sidebarGroups.home] || []),
                          ...(RESTART_CONTEXT_GROUPS[sidebarGroups.home] || []),
                          ...STANDARD_EVENTS]
      const found = homeEvents.find(ev => ev.shortcut === key)
      if (found) { fireEvent(found.id, 'home'); return }

      const awayEvents = [...(SIDEBAR_GROUPS[sidebarGroups.away] || []),
                          ...(RESTART_CONTEXT_GROUPS[sidebarGroups.away] || []),
                          ...STANDARD_EVENTS]
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
    setActiveEvent(null)
    setActiveTeam(null)
    setQualifiers({})
    setTeamsideStep(null)
    setSelectedTeam(null)
  }

  async function confirmEvent() {
    if (!activeEvent || teamsideStep === 'team_select') return
    const cleanId = activeEvent.replace('_away', '')
    const team = selectedTeam || activeTeam || 'home'

    // Track out location for restart context
    if (cleanId === 'out' && qualifiers.outLocation) {
      setOutLocation(qualifiers.outLocation)
    }

    const eventDoc = {
      matchId: match.productionId,
      half, collectionType,
      eventType: cleanId, team,
      timestamp: currentTimestamp,
      videoTime: videoRef.current?.currentTime || 0,
      qualifiers, attackingDirection,
      collectorId: user?.uid,
      collectorEmail: user?.email,
      createdAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(collection(db, 'events'), eventDoc)
      const label = cleanId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const newEv = {
        id: ref.id, firestoreId: ref.id, eventType: cleanId, team,
        label, timestamp: currentTimestamp, qualifiers,
        completeness: Object.keys(qualifiers).length,
        // Mark as incomplete if this is a defense interception/recovery after a pass
        passEndIncomplete: passEndIncomplete && INCOMPLETE_PASS_TRIGGERS.includes(cleanId),
      }
      setEventChain(prev => [...prev, newEv])

      // Goal check
      if (cleanId === 'shot' && qualifiers.shotOutcome === 'goal') {
        if (team === 'home') setHomeScore(s => s + 1)
        else setAwayScore(s => s + 1)
      }

      // ── INCOMPLETE PASS LOGIC ──
      // If this is an interception or ball_recovery on the DEFENSE side (flight_d),
      // the PREVIOUS pass was incomplete → teams swap for next event
      // The team that intercepted/recovered now becomes the offense
      const wasOnDefenseSide = lastEvent === 'pass'
      const isIncompleteTrigger = INCOMPLETE_PASS_TRIGGERS.includes(cleanId)

      if (wasOnDefenseSide && isIncompleteTrigger) {
        // Mark pass end as incomplete — shown in qualifier strip on NEXT pass
        setPassEndIncomplete(true)
        // The intercepting/recovering team becomes offense
        // team variable here = who did the interception = new offense
        setLastEvent(cleanId)
        setLastTeam(team)
      } else {
        // Normal context update
        setPassEndIncomplete(false)
        setLastEvent(cleanId)
        setLastTeam(team)
        if (cleanId === 'out') setOutLocation(qualifiers.outLocation || null)
        else setOutLocation(null)
      }

    } catch (err) {
      console.error('Failed to save event:', err)
    }

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
          {activeEvent && teamsideStep === 'qualifiers' && (
            <button onClick={confirmEvent} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded">✓ Confirm</button>
          )}
          {activeEvent && (
            <button onClick={cancelEvent} className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded">✕</button>
          )}
          <button className="w-8 h-8 bg-blue-600 rounded-full text-white text-xs font-bold">{match.trainer?.[0] || 'A'}</button>
        </div>
      </div>

      {/* ── EVENT QUALIFIER PANEL ── */}
      {activeEvent && (
        <EventQualifierPanel
          activeEvent={activeEvent}
          timestamp={currentTimestamp}
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
          lastEvent={lastEvent}
        />
      )}

      {/* ── STATUS ── */}
      {!activeEvent && (
        <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 flex-shrink-0">There is no active event yet!</p>
      )}
      {activeEvent && isNoBase && teamsideStep === 'qualifiers' && (
        <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 flex-shrink-0">Active event does not have base fields</p>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT */}
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
            <div className="w-56 flex-shrink-0 border-r border-gray-300">
              <PitchView settings={settings} onLocationClick={setPlayerLocation} playerLocation={playerLocation} />
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Stats toolbar */}
            <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0">
              <button className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">Manual</button>
              {[
                { label:`${eventChain.length}/0`, bg:'bg-gray-700 text-gray-300' },
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

        {/* RIGHT */}
        <DynamicSidebar
          teamName={match.awayTeam} side="away"
          groupKey={activeEvent ? null : sidebarGroups.away}
          activeEvent={activeEvent}
          onEventClick={fireEvent}
          showNoBase={showNoBase}
          showSelectTeam={showSelectTeam}
        />
      </div>

      {/* ── SCORE + EVENT CHAIN ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        {[
          { label: match.homeTeam, score: homeScore, chain: homeChain },
          { label: match.awayTeam, score: awayScore, chain: awayChain },
          { label: 'Game', score: homeScore + awayScore, chain: null },
        ].map((item, i) => (
          <div key={i} className={`flex items-center px-3 py-1.5 gap-2 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
            <span className="text-sm font-medium text-gray-800 w-28 flex-shrink-0">{item.label}</span>
            <div className="flex-1 overflow-x-hidden">
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
            <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">{item.score}</span>
          </div>
        ))}
      </div>

      {showXI && (
        <StartingXIScreen match={match} xiSubmitted={xiSubmitted}
          onSubmit={(t) => { setXISubmitted(p => ({...p,[t]:true})); if (xiSubmitted[t==='home'?'away':'home']) setShowXI(false) }}
          onClose={() => setShowXI(false)} />
      )}
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} match={match} half={half} settings={settings} onSettingsChange={(patch) => setSettings(prev => ({...prev,...patch}))} />
    </div>
  )
}
