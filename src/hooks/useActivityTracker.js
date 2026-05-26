import { useEffect, useRef, useCallback } from 'react'
import { db } from '../firebase/config'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const IDLE_THRESHOLD_MS = 300 * 1000 // 5 minutes

export function useActivityTracker({ user, matchId, matchName, half, enabled = true }) {
  const sessionRef = useRef(null)
  const sessionStart = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const idleRef = useRef(false)
  const activeTimeRef = useRef(0)
  const idleTimeRef = useRef(0)
  const lastTickRef = useRef(Date.now())
  const tickIntervalRef = useRef(null)
  const eventCountRef = useRef(0)
  const deletionCountRef = useRef(0)
  const firstEventTimeRef = useRef(null)
  const lastEventTimeRef = useRef(null)

  useEffect(() => {
    if (!enabled || !user?.uid || !matchId) return

    const id = `${user.uid}_${matchId}_${half}_${Date.now()}`
    sessionStart.current = Date.now()
    lastTickRef.current = Date.now()

    const ref = doc(db, 'sessions', id)
    sessionRef.current = ref

    setDoc(ref, {
      sessionId: id,
      collectorId: user.uid,
      collectorEmail: user.email,
      collectorName: user.email?.split('@')[0] || 'Unknown',
      matchId,
      matchName: matchName || matchId,
      half,
      startedAt: serverTimestamp(),
      endedAt: null,
      activeTimeMs: 0,
      idleTimeMs: 0,
      totalTimeMs: 0,
      eventCount: 0,
      deletionCount: 0,
      eventsPerMinute: 0,
      avgSecondsBetweenEvents: 0,
      status: 'active',
    }).catch(() => {})

    tickIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickRef.current
      lastTickRef.current = now

      const isIdle = (now - lastActivityRef.current) > IDLE_THRESHOLD_MS
      if (isIdle) { idleTimeRef.current += elapsed; idleRef.current = true }
      else { activeTimeRef.current += elapsed; idleRef.current = false }

      const totalActiveMin = activeTimeRef.current / 60000
      const eventsPerMinute = totalActiveMin > 0
        ? Math.round((eventCountRef.current / totalActiveMin) * 10) / 10 : 0

      let avgSec = 0
      if (eventCountRef.current > 1 && firstEventTimeRef.current && lastEventTimeRef.current) {
        const span = (lastEventTimeRef.current - firstEventTimeRef.current) / 1000
        avgSec = Math.round(span / (eventCountRef.current - 1))
      }

      if (sessionRef.current) {
        updateDoc(sessionRef.current, {
          activeTimeMs: activeTimeRef.current,
          idleTimeMs: idleTimeRef.current,
          totalTimeMs: now - sessionStart.current,
          eventsPerMinute,
          avgSecondsBetweenEvents: avgSec,
          eventCount: eventCountRef.current,
          deletionCount: deletionCountRef.current,
        }).catch(() => {})
      }
    }, 10000)

    function handleUnload() { finalizeSession() }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      clearInterval(tickIntervalRef.current)
      window.removeEventListener('beforeunload', handleUnload)
      finalizeSession()
    }
  }, [enabled, user?.uid, matchId, half])

  function finalizeSession() {
    if (!sessionRef.current) return
    const now = Date.now()
    updateDoc(sessionRef.current, {
      endedAt: serverTimestamp(),
      totalTimeMs: now - (sessionStart.current || now),
      activeTimeMs: activeTimeRef.current,
      idleTimeMs: idleTimeRef.current,
      eventCount: eventCountRef.current,
      deletionCount: deletionCountRef.current,
      status: 'ended',
    }).catch(() => {})
    sessionRef.current = null
  }

  const recordActivity = useCallback(() => { lastActivityRef.current = Date.now() }, [])
  const recordEvent = useCallback(() => {
    const now = Date.now()
    eventCountRef.current += 1
    if (!firstEventTimeRef.current) firstEventTimeRef.current = now
    lastEventTimeRef.current = now
    lastActivityRef.current = now
  }, [])
  const recordDeletion = useCallback(() => {
    deletionCountRef.current += 1
    lastActivityRef.current = Date.now()
  }, [])

  return { recordActivity, recordEvent, recordDeletion }
}
