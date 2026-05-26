import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore'

function fmt(ms) {
  if (!ms) return '0m'
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

function scoreColor(epm) {
  if (epm >= 8) return 'text-green-600'
  if (epm >= 4) return 'text-yellow-600'
  return 'text-red-500'
}

function scoreBg(epm) {
  if (epm >= 8) return 'bg-green-50 border-green-200'
  if (epm >= 4) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

export default function ActivityDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCollector, setSelectedCollector] = useState('all')
  const [selectedMatch, setSelectedMatch] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => { loadSessions() }, [])

  async function loadSessions() {
    setLoading(true)
    try {
      const q = query(collection(db, 'sessions'), orderBy('startedAt', 'desc'))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setSessions(data)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
    setLoading(false)
  }

  // Derived filter options
  const collectors = [...new Set(sessions.map(s => s.collectorEmail).filter(Boolean))]
  const matches = [...new Set(sessions.map(s => s.matchName).filter(Boolean))]

  // Apply filters
  const filtered = sessions.filter(s => {
    if (selectedCollector !== 'all' && s.collectorEmail !== selectedCollector) return false
    if (selectedMatch !== 'all' && s.matchName !== selectedMatch) return false
    if (dateFrom) {
      const start = s.startedAt?.toDate?.() || new Date(s.startedAt)
      if (start < new Date(dateFrom)) return false
    }
    if (dateTo) {
      const start = s.startedAt?.toDate?.() || new Date(s.startedAt)
      if (start > new Date(dateTo + 'T23:59:59')) return false
    }
    return true
  })

  // Aggregate per collector
  const byCollector = {}
  filtered.forEach(s => {
    const key = s.collectorEmail || s.collectorId
    if (!byCollector[key]) {
      byCollector[key] = {
        email: s.collectorEmail,
        name: s.collectorName || s.collectorEmail?.split('@')[0],
        sessions: 0, totalEvents: 0, totalDeletions: 0,
        totalActiveMs: 0, totalIdleMs: 0, avgEpm: 0, epmList: [],
      }
    }
    const c = byCollector[key]
    c.sessions += 1
    c.totalEvents += s.eventCount || 0
    c.totalDeletions += s.deletionCount || 0
    c.totalActiveMs += s.activeTimeMs || 0
    c.totalIdleMs += s.idleTimeMs || 0
    if (s.eventsPerMinute) c.epmList.push(s.eventsPerMinute)
  })

  // Compute avg epm per collector + rank
  const collectorList = Object.values(byCollector).map(c => {
    c.avgEpm = c.epmList.length > 0
      ? Math.round((c.epmList.reduce((a, b) => a + b, 0) / c.epmList.length) * 10) / 10
      : (c.totalActiveMs > 0 ? Math.round((c.totalEvents / (c.totalActiveMs / 60000)) * 10) / 10 : 0)
    c.correctionRate = c.totalEvents > 0
      ? Math.round((c.totalDeletions / c.totalEvents) * 100) : 0
    return c
  }).sort((a, b) => b.avgEpm - a.avgEpm)

  // Summary stats
  const totalEvents = filtered.reduce((a, s) => a + (s.eventCount || 0), 0)
  const totalSessions = filtered.length
  const avgEpm = collectorList.length > 0
    ? Math.round((collectorList.reduce((a, c) => a + c.avgEpm, 0) / collectorList.length) * 10) / 10
    : 0

  return (
    <div className="flex flex-col gap-6">

      {/* Header + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Collector Activity & Performance</h2>
          <p className="text-sm text-gray-500 mt-0.5">All collector sessions — global ranking</p>
        </div>
        <button
          onClick={loadSessions}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a6e] text-white text-xs font-medium rounded hover:bg-[#162d56] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Collector</label>
          <select value={selectedCollector} onChange={e => setSelectedCollector(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1e3a6e] min-w-[160px]">
            <option value="all">All collectors</option>
            {collectors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Match</label>
          <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1e3a6e] min-w-[180px]">
            <option value="all">All matches</option>
            {matches.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1e3a6e]"/>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1e3a6e]"/>
        </div>
        {(selectedCollector !== 'all' || selectedMatch !== 'all' || dateFrom || dateTo) && (
          <button onClick={() => { setSelectedCollector('all'); setSelectedMatch('all'); setDateFrom(''); setDateTo('') }}
            className="text-xs text-red-500 hover:underline self-end pb-1.5">
            Clear filters
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: '📋', color: 'bg-blue-50 border-blue-200' },
          { label: 'Total Events Tagged', value: totalEvents.toLocaleString(), icon: '⚡', color: 'bg-orange-50 border-orange-200' },
          { label: 'Active Collectors', value: collectorList.length, icon: '👤', color: 'bg-purple-50 border-purple-200' },
          { label: 'Avg Events/Min', value: avgEpm, icon: '📈', color: 'bg-green-50 border-green-200' },
        ].map((card, i) => (
          <div key={i} className={`${card.color} border rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{card.icon}</span>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading sessions...</div>
      ) : collectorList.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No session data yet. Data appears here once collectors start active sessions.
        </div>
      ) : (
        <>
          {/* Collector leaderboard */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Collector Leaderboard</h3>
              <span className="text-xs text-gray-400">{collectorList.length} collectors · ranked by events/min</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 w-8">#</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Collector</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Sessions</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Events</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Deletions</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Active Time</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Idle Time</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Events/Min ↓</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Correction %</th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {collectorList.map((c, i) => (
                  <tr key={c.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{c.name}</p>
                          <p className="text-[10px] text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-700">{c.sessions}</td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-gray-800">{c.totalEvents.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-700">{c.totalDeletions}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-700">{fmt(c.totalActiveMs)}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400">{fmt(c.totalIdleMs)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-sm font-bold ${scoreColor(c.avgEpm)}`}>{c.avgEpm}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.correctionRate > 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {c.correctionRate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedSession(c)}
                        className="text-xs text-[#1e3a6e] hover:underline font-medium"
                      >Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Session log */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Session Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Collector','Match','Half','Started','Duration','Events','Events/Min','Deletions','Status'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map(s => {
                    const started = s.startedAt?.toDate?.()
                    const startStr = started ? started.toLocaleString() : '—'
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-800 whitespace-nowrap">
                          {s.collectorName || s.collectorEmail}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 max-w-[180px] truncate">{s.matchName}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{s.half?.replace('_', ' ')}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{startStr}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-700">{fmt(s.totalTimeMs)}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-gray-800">{s.eventCount || 0}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className={`font-bold ${scoreColor(s.eventsPerMinute || 0)}`}>{s.eventsPerMinute || 0}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{s.deletionCount || 0}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.status || 'ended'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length > 50 && (
                <p className="text-xs text-gray-400 text-center py-3">Showing 50 of {filtered.length} sessions</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Collector detail modal */}
      {selectedSession && (
        <CollectorDetailModal collector={selectedSession} sessions={filtered} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  )
}

function CollectorDetailModal({ collector, sessions, onClose }) {
  const collectorSessions = sessions.filter(s => s.collectorEmail === collector.email)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1e3a6e] flex items-center justify-center text-white font-bold">
              {collector.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{collector.name}</p>
              <p className="text-xs text-gray-400">{collector.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Score card */}
          <div className={`rounded-xl border p-4 flex items-center justify-between ${scoreColor(collector.avgEpm).replace('text-', 'border-').replace('600','200').replace('500','200')} bg-gray-50`}>
            <div>
              <p className="text-xs text-gray-500">Performance Score</p>
              <p className={`text-3xl font-bold ${scoreColor(collector.avgEpm)}`}>{collector.avgEpm} <span className="text-sm font-normal text-gray-500">events/min</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Correction Rate</p>
              <p className="text-xl font-bold text-gray-800">{collector.correctionRate}%</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Sessions', value: collector.sessions },
              { label: 'Total Events', value: collector.totalEvents.toLocaleString() },
              { label: 'Total Deletions', value: collector.totalDeletions },
              { label: 'Active Time', value: `${Math.round(collector.totalActiveMs/60000)}m` },
              { label: 'Idle Time', value: `${Math.round(collector.totalIdleMs/60000)}m` },
              { label: 'Matches Worked', value: new Set(collectorSessions.map(s => s.matchId)).size },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-0.5">{stat.label}</p>
                <p className="text-base font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Sessions table */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Session History</p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {collectorSessions.slice(0, 10).map(s => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 last:border-b-0 text-xs">
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{s.matchName}</p>
                    <p className="text-gray-400">{s.half?.replace('_',' ')} · {s.startedAt?.toDate?.()?.toLocaleDateString() || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${scoreColor(s.eventsPerMinute || 0)}`}>{s.eventsPerMinute || 0} ev/min</p>
                    <p className="text-gray-400">{s.eventCount || 0} events · {fmt(s.totalTimeMs)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
