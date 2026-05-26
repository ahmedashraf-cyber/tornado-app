import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import StartingXIScreen from '../components/StartingXIScreen'
import SubstitutionScreen from '../components/SubstitutionScreen'
import TacticalShiftScreen from '../components/TacticalShiftScreen'
import LocationPitchPanel from '../components/LocationPitchPanel'
import PlayersPanel from '../components/PlayersPanel'
import KeyboardOverlay from '../components/KeyboardOverlay'
import HamburgerMenu from '../components/HamburgerMenu'
import DynamicSidebar from '../components/DynamicSidebar'
import EventQualifierPanel from '../components/EventQualifierPanel'
import { useActivityTracker } from '../hooks/useActivityTracker'
import {
  EVENT_SEQUENCES, NO_BASE_EVENTS, STANDARD_EVENTS, SIDEBAR_GROUPS,
  RESTART_CONTEXT_GROUPS, INCOMPLETE_PASS_TRIGGERS,
} from '../data/eventDefinitions'

// ── Events that have NO player involvement ──
const NO_PLAYER_EVENTS = new Set([
  'half_start', 'half_end', 'stoppage', 'end_stoppage', 'out',
  'referee_ball_drop', 'tactical_shift', 'substitution',
  'camera_on', 'camera_off',
])

// ── Events involving 2 players (need both home + away panels) ──
const TWO_PLAYER_EVENTS = new Set(['tackle', 'fifty_fifty', 'dribble'])

function getSidebarGroups(lastEvent, lastTeam, outLocation, passEndIncomplete) {
  if (passEndIncomplete) {
    if (lastTeam === 'home') return { home: 'loose_d', away: 'loose_o' }
    else return { home: 'loose_o', away: 'loose_d' }
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
  if (lastEvent === 'out') {
    if (outLocation === 'sideline') return 'throw_in'
    return null
  }
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

  // Activity tracking
  const { recordActivity, recordEvent, recordDeletion } = useActivityTracker({
    user,
    matchId: match?.productionId,
    matchName: match ? `${match.homeTeam} vs ${match.awayTeam}` : '',
    half,
    enabled: true,
  })

  // ── Video ──
  const [videoSrc, setVideoSrc] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [videoTime, setVideoTime] = useState(0)
  const fileInputRef = useRef()
  const videoRef = useRef()

  // ── UI state ──
  const [showXI, setShowXI] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeKey, setActiveKey] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pressureWarning, setPressureWarning] = useState(false)
  const [pressureActive, setPressureActive] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // ── XI state ──
  const [xiSubmitted, setXISubmitted] = useState({ home: false, away: false })
  const [xiAssignments, setXIAssignments] = useState({ home: {}, away: {} })
  const [xiFormation, setXIFormation] = useState({ home: 'Custom', away: 'Custom' })
  const [showSubstitution, setShowSubstitution] = useState(false)
  const [showTacticalShift, setShowTacticalShift] = useState(false)

  // ── Event state ──
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeTeam, setActiveTeam] = useState(null)
  const [lastEvent, setLastEvent] = useState('default')
  const [lastTeam, setLastTeam] = useState('home')
  const [outLocation, setOutLocation] = useState(null)
  const [qualifiers, setQualifiers] = useState({})
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [teamsideStep, setTeamsideStep] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [eventChain, setEventChain] = useState([])
  const [attackingDirection, setAttackingDirection] = useState('left_to_right')
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [passEndIncomplete, setPassEndIncomplete] = useState(false)
  const [playerLocation, setPlayerLocation] = useState(null)

  // ── Task booking ──
  const [bookedTasks, setBookedTasks] = useState({})

  // ── Multi-step task workflow ──
  // activeStep: null | 'qualifiers' | 'location' | 'players_home' | 'players_away'
  const [activeStep, setActiveStep] = useState(null)
  const [collectedQualifiers, setCollectedQualifiers] = useState({})
  const [collectedLocation, setCollectedLocation] = useState(null)
  const [selectedPlayerHome, setSelectedPlayerHome] = useState(null)
  const [selectedPlayerAway, setSelectedPlayerAway] = useState(null)

  // ── Location dots ──
  const [locationPlayerDot, setLocationPlayerDot] = useState(null)
  const [locationDesiredDot, setLocationDesiredDot] = useState(null)
  const [activeLocationType, setActiveLocationType] = useState('player')

  // ── Derived task flags ──
  const baseBooked = bookedTasks['base'] === 'me'
  const locationBooked = bookedTasks['location_home'] === 'me' || bookedTasks['location_away'] === 'me'
  const playersHomeBooked = bookedTasks['players_home'] === 'me'
  const playersAwayBooked = bookedTasks['players_away'] === 'me'
  const playersBooked = playersHomeBooked || playersAwayBooked

  const modeLabel = mode === '360' ? '360' : 'OFFLINE'
  const sidebarGroups = getSidebarGroups(lastEvent, lastTeam, outLocation, passEndIncomplete)
  const showSelectTeam = teamsideStep === 'team_select'
  const isNoBase = activeEvent ? NO_BASE_EVENTS.includes(activeEvent.replace('_away', '')) : false
  const showNoBase = activeEvent && teamsideStep === 'qualifiers' && isNoBase

  // ── Which sidebar(s) to show ──
  // Base not booked → no sidebars
  // During location step → only event-team sidebar
  // During players step → no sidebars
  // Normal → both sidebars if base booked
  function getSidebarVisibility() {
    if (!baseBooked) return { left: false, right: false }
    if (activeStep === 'location') {
      const team = selectedTeam || activeTeam || 'home'
      return { left: team === 'home', right: team === 'away' }
    }
    if (activeStep === 'players_home' || activeStep === 'players_away') {
      return { left: false, right: false }
    }
    return { left: true, right: true }
  }
  const sidebarVis = getSidebarVisibility()

  // ── Center panel: what's showing in the task panel slot ──
  // null = nothing (video takes full center), 'location' = pitch, 'players' = players panel
  function getActiveCenterPanel() {
    if (activeStep === 'location') return 'location'
    if (activeStep === 'players_home' || activeStep === 'players_away') return 'players'
    return null
  }
  const centerPanel = getActiveCenterPanel()

  // ── Step sequencer: figure out next step after current ──
  function getStepSequence(eventId, team) {
    const cleanId = (eventId || '').replace('_away', '')
    const steps = []

    // Step 1: qualifiers (if base booked and event has base fields)
    if (baseBooked) steps.push('qualifiers')

    // Step 2: location (if location task booked)
    if (locationBooked) steps.push('location')

    // Step 3: players (if players task booked and event has players)
    if (playersBooked && !NO_PLAYER_EVENTS.has(cleanId)) {
      if (TWO_PLAYER_EVENTS.has(cleanId)) {
        // Both home and away players needed
        if (playersHomeBooked) steps.push('players_home')
        if (playersAwayBooked) steps.push('players_away')
      } else {
        // Single player — which team?
        const resolvedTeam = team || 'home'
        if (resolvedTeam === 'home' && playersHomeBooked) steps.push('players_home')
        if (resolvedTeam === 'away' && playersAwayBooked) steps.push('players_away')
      }
    }

    return steps
  }

  function advanceToNextStep(currentStep, eventId, team, currentQuals) {
    const steps = getStepSequence(eventId, team)
    const currentIdx = steps.indexOf(currentStep)
    const nextStep = steps[currentIdx + 1]

    if (!nextStep) {
      // All steps done — save and finish
      finalizeEvent(eventId, team, currentQuals)
    } else {
      setActiveStep(nextStep)
      // Reset location dots when entering location step
      if (nextStep === 'location') {
        setLocationPlayerDot(null)
        setLocationDesiredDot(null)
        setActiveLocationType('player')
      }
      // Reset player selection when entering players step
      if (nextStep === 'players_home') setSelectedPlayerHome(null)
      if (nextStep === 'players_away') setSelectedPlayerAway(null)
    }
  }

  // ── Fire event ──
  function fireEvent(eventId, team) {
    const ts = videoRef.current?.currentTime || 0
    setCurrentTimestamp(ts)
    setActiveEvent(eventId)
    setActiveTeam(team)
    setQualifiers({})
    setCollectedQualifiers({})
    setCollectedLocation(null)
    setSelectedPlayerHome(null)
    setSelectedPlayerAway(null)
    setLocationPlayerDot(null)
    setLocationDesiredDot(null)

    const cleanId = eventId.replace('_away', '')

    // Team select step
    const noTeamIds = ['card', 'half_start', 'half_end', 'stoppage',
      'own_goal_against', 'substitution', 'player_off',
      'error', 'reception', 'end_shot']
    const needsTeamSelect = ['pass', 'shot', 'dribble', 'miscontrol', 'ball_recovery',
      'carry', 'foul_committed', 'tackle', 'interception',
      'clearance', 'block', 'goal_keeper', 'fifty_fifty', 'shield', 'out']

    if (noTeamIds.includes(cleanId)) {
      setTeamsideStep('qualifiers')
      setSelectedTeam(team)
    } else if (needsTeamSelect.includes(cleanId)) {
      setTeamsideStep('team_select')
      setSelectedTeam(null)
    } else {
      setTeamsideStep('qualifiers')
      setSelectedTeam(team)
    }

    if (cleanId === 'half_start') {
      setShowKeyboard(true)
      setTimeout(() => { setShowKeyboard(false); setShowXI(true) }, 600)
      setTeamsideStep('qualifiers')
    }
    if (cleanId === 'substitution') setShowSubstitution(true)
    if (cleanId === 'tactical_shift') setShowTacticalShift(true)

    // Instant events
    const instantEvents = ['error', 'end_shot', 'referee_ball_drop', 'end_stoppage',
      'pressure_start', 'pressure_end', 'player_off_event', 'player_on_event']
    if (instantEvents.includes(cleanId)) {
      setTimeout(() => autoConfirmEvent(eventId, team, ts, {}), 50)
      return
    }

    if (cleanId === 'pressure_start') {
      setPressureActive(true); setPressureWarning(true)
      setTimeout(() => setPressureWarning(false), 4000)
    }
    if (cleanId === 'pressure_end') setPressureActive(false)

    // Determine first step
    const steps = getStepSequence(cleanId, team)
    const firstStep = steps[0] || null
    setActiveStep(firstStep || 'qualifiers')
  }

  // ── Qualifier confirmed — advance ──
  function handleQualifiersConfirmed(quals) {
    const merged = { ...qualifiers, ...(quals || {}) }
    setCollectedQualifiers(merged)
    const team = selectedTeam || activeTeam || 'home'
    advanceToNextStep('qualifiers', activeEvent, team, merged)
  }

  // ── Location dot placed — auto-advance on first dot ──
  function handleLocationDot(type, coords) {
    if (type === 'player') {
      setLocationPlayerDot(coords)
      // Auto-advance after first dot placed
      const locData = { locationX: coords.x, locationY: coords.y }
      setCollectedLocation(locData)
      const team = selectedTeam || activeTeam || 'home'
      advanceToNextStep('location', activeEvent, team, { ...collectedQualifiers, ...locData })
    } else {
      setLocationDesiredDot(coords)
    }
  }

  // ── Player selected — advance ──
  function handlePlayerSelected(pos, team) {
    const player = xiAssignments[team]?.[pos] || {}
    const playerData = {
      [`player${team === 'home' ? 'Home' : 'Away'}Position`]: pos,
      [`player${team === 'home' ? 'Home' : 'Away'}Number`]: player.number,
      [`player${team === 'home' ? 'Home' : 'Away'}Name`]: player.name,
    }
    const allQuals = { ...collectedQualifiers, ...(collectedLocation || {}), ...playerData }
    setCollectedQualifiers(allQuals)

    if (team === 'home') setSelectedPlayerHome(pos)
    else setSelectedPlayerAway(pos)

    const resolvedTeam = selectedTeam || activeTeam || 'home'
    advanceToNextStep(activeStep, activeEvent, resolvedTeam, allQuals)
  }

  // ── Finalize event — save to Firestore ──
  async function finalizeEvent(eventId, team, quals) {
    const cleanId = (eventId || activeEvent || '').replace('_away', '')
    const resolvedTeam = team || selectedTeam || activeTeam || 'home'

    const eventDoc = {
      matchId: match.productionId, half, collectionType,
      eventType: cleanId, team: resolvedTeam,
      timestamp: formatTimestamp(currentTimestamp),
      videoTime: currentTimestamp,
      qualifiers: quals || collectedQualifiers,
      attackingDirection,
      collectorId: user?.uid, collectorEmail: user?.email,
      createdAt: serverTimestamp(),
    }

    try {
      const ref = await addDoc(collection(db, 'events'), eventDoc)
      const label = cleanId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const newEv = {
        id: ref.id, firestoreId: ref.id, eventType: cleanId, team: resolvedTeam,
        label, timestamp: formatTimestamp(currentTimestamp),
        qualifiers: quals || collectedQualifiers,
        completeness: Object.keys(quals || collectedQualifiers).length,
        videoTime: currentTimestamp,
      }
      setEventChain(prev => [...prev, newEv])

      if (cleanId === 'shot' && (quals || collectedQualifiers).shotOutcome === 'goal') {
        if (resolvedTeam === 'home') setHomeScore(s => s + 1)
        else setAwayScore(s => s + 1)
      }

      const isIncompleteTrigger = INCOMPLETE_PASS_TRIGGERS.includes(cleanId)
      if (lastEvent === 'pass' && isIncompleteTrigger) {
        setPassEndIncomplete(true)
      } else {
        setPassEndIncomplete(false)
        if (cleanId === 'out') setOutLocation((quals || collectedQualifiers).outLocation || null)
        else setOutLocation(null)
      }
      recordEvent()
      setLastEvent(cleanId)
      setLastTeam(resolvedTeam)
    } catch (err) { console.error('Failed to save event:', err) }

    cancelEvent()
  }

  // ── Auto-confirm (instant events) ──
  async function autoConfirmEvent(eventId, team, timestamp, quals) {
    const cleanId = (eventId || '').replace('_away', '')
    const resolvedTeam = team || 'home'
    const eventDoc = {
      matchId: match.productionId, half, collectionType,
      eventType: cleanId, team: resolvedTeam,
      timestamp: formatTimestamp(timestamp),
      videoTime: timestamp,
      qualifiers: quals, attackingDirection,
      collectorId: user?.uid, collectorEmail: user?.email,
      createdAt: serverTimestamp(),
    }
    try {
      const ref = await addDoc(collection(db, 'events'), eventDoc)
      const label = cleanId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      setEventChain(prev => [...prev, {
        id: ref.id, firestoreId: ref.id, eventType: cleanId, team: resolvedTeam,
        label, timestamp: formatTimestamp(timestamp), qualifiers: quals,
        completeness: 0, videoTime: timestamp,
      }])
      setLastEvent(cleanId); setLastTeam(resolvedTeam)
    } catch (err) { console.error('Auto-confirm failed:', err) }
    cancelEvent()
  }

  // ── Cancel event ──
  function cancelEvent() {
    setActiveEvent(null); setActiveTeam(null); setQualifiers({})
    setTeamsideStep(null); setSelectedTeam(null)
    setActiveStep(null); setCollectedQualifiers({})
    setCollectedLocation(null)
    setSelectedPlayerHome(null); setSelectedPlayerAway(null)
    setLocationPlayerDot(null); setLocationDesiredDot(null)
  }

  // ── Legacy confirmEvent (called from qualifier panel) ──
  function confirmEvent(options = {}) {
    const team = selectedTeam || activeTeam || 'home'
    const quals = { ...qualifiers, ...(options.extraQualifiers || {}) }
    handleQualifiersConfirmed(quals)
  }

  function handleTeamSelect(team) {
    setSelectedTeam(team)
    setTeamsideStep('qualifiers')
    const cleanId = (activeEvent || '').replace('_away', '')
    if (cleanId === 'pass' || cleanId === 'pass_away') {
      const autoType = getPassTypeAuto(lastEvent, outLocation)
      setQualifiers(prev => ({ ...prev, passType: autoType }))
    }
    if (cleanId === 'shot') {
      const shotTypeMap = { half_start: 'kick_off', foul_committed: 'free_kick', restart_foul: 'free_kick' }
      setQualifiers(prev => ({ ...prev, shotType: shotTypeMap[lastEvent] || 'open_play' }))
    }
    // Update step sequence now that we know the team
    const steps = getStepSequence(activeEvent, team)
    const firstStep = steps[0] || 'qualifiers'
    setActiveStep(firstStep)
  }

  function handleQualifierChange(key, val) {
    setQualifiers(prev => ({ ...prev, [key]: val }))
  }

  // ── Keyboard ──
  const handleKeyDown = useCallback((e) => {
    recordActivity()
    if (showXI || showMenu || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
    const key = e.key.toLowerCase()
    setActiveKey(key)
    if (key === '1' && teamsideStep === 'team_select') { handleTeamSelect('home'); return }
    if (key === '2' && teamsideStep === 'team_select') { handleTeamSelect('away'); return }
    if (key === 'escape') { cancelEvent(); return }
    if (key === 'enter' && activeEvent && activeStep === 'qualifiers') { confirmEvent(); return }
    if (!activeEvent && baseBooked) {
      const homeEvents = [...(SIDEBAR_GROUPS[sidebarGroups.home] || []),
        ...(RESTART_CONTEXT_GROUPS[sidebarGroups.home] || []), ...STANDARD_EVENTS]
      const found = homeEvents.find(ev => ev.shortcut === key)
      if (found) { fireEvent(found.id, 'home'); return }
      const awayEvents = [...(SIDEBAR_GROUPS[sidebarGroups.away] || []),
        ...(RESTART_CONTEXT_GROUPS[sidebarGroups.away] || []), ...STANDARD_EVENTS]
      const foundAway = awayEvents.find(ev => ev.shortcut === key)
      if (foundAway) { fireEvent(foundAway.id, 'away'); return }
    }
  }, [showXI, showMenu, activeEvent, teamsideStep, activeStep, sidebarGroups, lastEvent, outLocation, baseBooked])

  const handleKeyUp = useCallback(() => setActiveKey(null), [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [handleKeyDown, handleKeyUp])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const update = () => setVideoTime(video.currentTime)
    video.addEventListener('timeupdate', update)
    return () => video.removeEventListener('timeupdate', update)
  }, [videoSrc])

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    setVideoSrc(URL.createObjectURL(file))
  }

  async function deleteEvent(index) {
    const ev = eventChain[index]
    if (!ev) return
    try {
      await deleteDoc(doc(db, 'events', ev.firestoreId))
      setEventChain(prev => prev.filter((_, i) => i !== index))
      recordDeletion()
    } catch (err) { console.error('Failed to delete:', err) }
  }

  if (!match) { navigate('/matches', { replace: true }); return null }

  const homeChain = eventChain.filter(e => e.team === 'home')
  const awayChain = eventChain.filter(e => e.team === 'away')

  return (
    <div className="flex flex-col h-screen bg-[#e8eef4] overflow-hidden select-none" onMouseMove={recordActivity} onClick={recordActivity}>

      {/* Pressure warning */}
      {pressureWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded shadow-lg">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
          </svg>
          You must collect a pressure end event.
          <button onClick={() => setPressureWarning(false)} className="ml-1 opacity-70 hover:opacity-100 font-bold text-base leading-none">×</button>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#e8eef4] flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isOnline ? 'bg-[#c8e6c9] text-[#2e7d32]' : 'bg-gray-300 text-gray-600'}`}>
            {isOnline ? 'online' : 'offline'}
          </span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded">Mode: {modeLabel}</span>
          <button onClick={() => setShowMenu(true)} className="w-8 h-7 bg-[#1e3a6e] rounded flex items-center justify-center text-white ml-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-1">
            {['▶','⏸','⏺'].map((icon, i) => (
              <button key={i} className="w-7 h-7 bg-[#1e3a6e] rounded-sm flex items-center justify-center text-white text-[10px]">{icon}</button>
            ))}
          </div>
          <button className="w-8 h-8 bg-[#1e3a6e] rounded-full text-white text-xs font-bold">
            {(match.trainer?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </button>
        </div>
      </div>

      {/* ── QUALIFIER STRIP ── */}
      <div className="flex-shrink-0 bg-[#e8eef4] border-b border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 flex flex-col items-start">
            <div className="flex items-center gap-1 px-2 pt-1">
              <div className="bg-[#1e3a6e] text-white text-sm font-mono font-bold px-3 py-1 rounded min-w-[5.5rem] text-center">
                {formatTimestamp(videoTime)}
              </div>
              <button className="text-gray-500 hover:text-gray-700 text-xs leading-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
            {activeEvent && (
              <div className="flex items-center gap-1 px-2 pb-1 pt-0.5">
                {activeStep === 'qualifiers' && teamsideStep === 'qualifiers' && (
                  <button onClick={confirmEvent} className="h-6 px-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded">✓</button>
                )}
                {activeStep === 'players_home' && (
                  <button
                    onClick={() => selectedPlayerHome && handlePlayerSelected(selectedPlayerHome, 'home')}
                    disabled={!selectedPlayerHome}
                    className={`h-6 px-2.5 text-xs font-bold rounded ${selectedPlayerHome ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
                  >✓ Home Player</button>
                )}
                {activeStep === 'players_away' && (
                  <button
                    onClick={() => selectedPlayerAway && handlePlayerSelected(selectedPlayerAway, 'away')}
                    disabled={!selectedPlayerAway}
                    className={`h-6 px-2.5 text-xs font-bold rounded ${selectedPlayerAway ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
                  >✓ Away Player</button>
                )}
                <button onClick={cancelEvent} className="h-6 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded">✕</button>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {activeEvent && activeStep === 'qualifiers' ? (
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
                lastEvent={lastEvent}
                outLocation={outLocation}
                onAutoConfirm={confirmEvent}
              />
            ) : activeEvent && activeStep === 'location' ? (
              <div className="px-3 py-1.5 text-xs font-semibold text-[#1e3a6e]">
                📍 Click on the pitch to place player location
              </div>
            ) : activeEvent && (activeStep === 'players_home' || activeStep === 'players_away') ? (
              <div className="px-3 py-1.5 text-xs font-semibold text-[#1e3a6e]">
                👤 Select {activeStep === 'players_home' ? match.homeTeam : match.awayTeam} player from the pitch
              </div>
            ) : (
              <div className="px-3 py-1.5 text-xs text-gray-500 italic">
                There is no active event yet!
              </div>
            )}
          </div>
        </div>
        {activeEvent && isNoBase && activeStep === 'qualifiers' && (
          <p className="text-center text-sm font-medium text-[#1e3a6e] py-0.5 border-t border-gray-200">
            Active event does not have base fields
          </p>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR */}
        {sidebarVis.left && (
          <DynamicSidebar
            teamName={match.homeTeam} side="home"
            groupKey={activeEvent ? null : sidebarGroups.home}
            activeEvent={activeEvent}
            onEventClick={fireEvent}
            showNoBase={showNoBase}
            showSelectTeam={showSelectTeam}
          />
        )}

        {/* CENTER: stats bar + video + task panel */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Stats toolbar */}
          <div className="flex items-center bg-gray-900 px-2 py-1 gap-1.5 flex-shrink-0">
            <button className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">Manual</button>
            {[
              { label: `${eventChain.length}/0`, icon: null, bg: 'bg-gray-700 text-gray-300' },
              { label: '0/0', icon: '📷', bg: 'bg-pink-50 text-gray-700' },
              { label: '0/0', icon: '📸', bg: 'bg-blue-50 text-gray-700' },
              { label: '0',   icon: '✓',  bg: 'bg-green-50 text-gray-700' },
              { label: '0',   icon: '⊘',  bg: 'bg-gray-50 text-gray-600' },
            ].map((item, i) => (
              <div key={i} className={`flex-1 flex items-center justify-center gap-0.5 ${item.bg} rounded py-1 text-xs font-medium min-w-0`}>
                {item.icon && <span className="text-xs">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            ))}
            <button className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0">×</button>
          </div>

          {/* Video + task panel — 50/50 when task panel active. Task panel LEFT, video RIGHT */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Task panel — LEFT, 50% when active */}
            {centerPanel === 'location' && (
              <div className="w-1/2 flex-shrink-0 border-r border-gray-300 bg-[#e8eef4] flex flex-col overflow-hidden">
                <LocationPitchPanel
                  playerLocation={locationPlayerDot}
                  desiredLocation={locationDesiredDot}
                  attackingDirection={attackingDirection}
                  onPlayerLocation={(coords) => handleLocationDot('player', coords)}
                  onDesiredLocation={(coords) => handleLocationDot('desired', coords)}
                  activeLocationType={activeLocationType}
                  onActiveTypeChange={setActiveLocationType}
                />
              </div>
            )}

            {centerPanel === 'players' && (
              <div className="w-1/2 flex-shrink-0 border-r border-gray-300 bg-[#e8eef4] flex flex-col overflow-hidden">
                <PlayersPanel
                  team={activeStep === 'players_home' ? 'home' : 'away'}
                  teamName={activeStep === 'players_home' ? match.homeTeam : match.awayTeam}
                  formation={activeStep === 'players_home' ? xiFormation.home : xiFormation.away}
                  assignments={activeStep === 'players_home' ? xiAssignments.home : xiAssignments.away}
                  selectedPlayerId={activeStep === 'players_home' ? selectedPlayerHome : selectedPlayerAway}
                  onSelectPlayer={(pos) => {
                    if (activeStep === 'players_home') {
                      setSelectedPlayerHome(pos)
                    } else {
                      setSelectedPlayerAway(pos)
                    }
                  }}
                />
              </div>
            )}

            {/* Video panel — always RIGHT */}
            <div className={`flex flex-col overflow-hidden ${centerPanel ? 'w-1/2 flex-shrink-0' : 'flex-1'}`}>
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
                    <p className="text-gray-400 text-xs">Drop video here or <span className="text-blue-400">browse</span></p>
                    <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        {sidebarVis.right && (
          <DynamicSidebar
            teamName={match.awayTeam} side="away"
            groupKey={activeEvent ? null : sidebarGroups.away}
            activeEvent={activeEvent}
            onEventClick={fireEvent}
            showNoBase={showNoBase}
            showSelectTeam={showSelectTeam}
          />
        )}
      </div>

      {/* ── BOTTOM STRIP: score + event chain ── */}
      <BottomStrip
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeScore={homeScore}
        awayScore={awayScore}
        homeChain={homeChain}
        awayChain={awayChain}
        eventChain={eventChain}
        onDeleteEvent={deleteEvent}
        onJumpToEvent={(ev) => {
          if (videoRef.current && ev.videoTime != null) {
            videoRef.current.currentTime = ev.videoTime
          }
        }}
      />

      {showXI && (
        <StartingXIScreen
          match={match} xiSubmitted={xiSubmitted}
          onSubmit={(t, teamAssignments, teamFormation) => {
            setXISubmitted(p => ({ ...p, [t]: true }))
            if (teamAssignments) setXIAssignments(p => ({ ...p, [t]: teamAssignments }))
            if (teamFormation) setXIFormation(p => ({ ...p, [t]: teamFormation }))
            if (xiSubmitted[t === 'home' ? 'away' : 'home']) setShowXI(false)
          }}
          onClose={() => setShowXI(false)}
        />
      )}

      <HamburgerMenu
        isOpen={showMenu} onClose={() => setShowMenu(false)}
        match={match} half={half} settings={settings}
        onSettingsChange={(patch) => setSettings(prev => ({ ...prev, ...patch }))}
        bookedTasks={bookedTasks}
        onBookTask={(key, status) => setBookedTasks(prev => ({ ...prev, [key]: status }))}
      />

      {showSubstitution && (
        <SubstitutionScreen
          match={match}
          homeXI={xiAssignments.home} awayXI={xiAssignments.away}
          homeFormation={xiFormation.home} awayFormation={xiFormation.away}
          subReason={qualifiers.subReason || ''}
          onConfirm={(subData) => {
            finalizeEvent(activeEvent, selectedTeam || activeTeam, { ...collectedQualifiers, ...subData })
            setXIAssignments(prev => ({ ...prev, [subData.team]: subData.assignments }))
            setXIFormation(prev => ({ ...prev, [subData.team]: subData.formation }))
            setShowSubstitution(false)
          }}
          onCancel={() => { setShowSubstitution(false); cancelEvent() }}
        />
      )}

      {showTacticalShift && (
        <TacticalShiftScreen
          match={match}
          homeXI={xiAssignments.home} awayXI={xiAssignments.away}
          homeFormation={xiFormation.home} awayFormation={xiFormation.away}
          onConfirm={(shiftData) => {
            finalizeEvent(activeEvent, selectedTeam || activeTeam, { ...collectedQualifiers, ...shiftData })
            setXIAssignments(prev => ({ ...prev, [shiftData.team]: shiftData.assignments }))
            setXIFormation(prev => ({ ...prev, [shiftData.team]: shiftData.formation }))
            setShowTacticalShift(false)
          }}
          onCancel={() => { setShowTacticalShift(false); cancelEvent() }}
        />
      )}
    </div>
  )
}


// ── BottomStrip — original event chain design with auto-scroll ──
import { useRef as useRef2, useEffect as useEffect2 } from 'react'
import EventChain from '../components/EventChain'

function BottomStrip({ homeTeam, awayTeam, homeScore, awayScore, homeChain, awayChain, eventChain, onDeleteEvent, onJumpToEvent }) {
  const homeScrollRef = useRef2(null)
  const awayScrollRef = useRef2(null)

  // Auto-scroll to latest event when chain updates
  useEffect2(() => {
    if (homeScrollRef.current) {
      homeScrollRef.current.scrollLeft = homeScrollRef.current.scrollWidth
    }
  }, [homeChain.length])

  useEffect2(() => {
    if (awayScrollRef.current) {
      awayScrollRef.current.scrollLeft = awayScrollRef.current.scrollWidth
    }
  }, [awayChain.length])

  const rows = [
    { label: homeTeam, score: homeScore, chain: homeChain, ref: homeScrollRef, side: 'home' },
    { label: awayTeam, score: awayScore, chain: awayChain, ref: awayScrollRef, side: 'away' },
    { label: 'Game', score: homeScore + awayScore, chain: null, ref: null, side: null },
  ]

  return (
    <div className="flex-shrink-0 border-t border-gray-300 bg-[#e8eef4]">
      {rows.map((row, i) => (
        <div key={i} className={`flex items-center px-2 py-1 gap-2 ${i < 2 ? 'border-b border-gray-200' : ''}`}>
          {/* Team name */}
          <span className="text-xs font-semibold text-gray-800 w-24 flex-shrink-0 truncate">{row.label}</span>

          {/* Event chain — scrollable */}
          <div
            ref={row.ref}
            className="flex-1 overflow-x-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            {row.chain && (
              <div className="flex items-center gap-1 py-0.5">
                {row.chain.map((ev, idx) => {
                  const globalIdx = eventChain.indexOf(ev)
                  const isActive = idx === row.chain.length - 1
                  const dots = [0, 1, 2].map(d => (
                    <div
                      key={d}
                      className={`w-1.5 h-1.5 rounded-full ${d <= (ev.completeness || 0) ? 'bg-orange-400' : 'bg-gray-400'}`}
                    />
                  ))
                  return (
                    <div key={ev.id || idx} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <div className="flex gap-0.5">{dots}</div>
                      <div className="relative group">
                        <button
                          onClick={() => onJumpToEvent(ev)}
                          className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                            isActive
                              ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {ev.label}
                        </button>
                        <button
                          onClick={() => onDeleteEvent(globalIdx)}
                          className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center text-[10px] leading-none"
                          title="Delete"
                        >×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="bg-gray-700 text-white text-xs font-bold px-2.5 py-0.5 rounded min-w-[1.75rem] text-center flex-shrink-0">
            {row.score}
          </div>
        </div>
      ))}
    </div>
  )
}
