import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MATCHES, { findMatchById } from '../data/matches'

const STEP = {
  SELECT: 'select',
  MODE: 'mode',
  HALF: 'half',
}

const HALVES = [
  { value: 'first_half', label: 'First Half' },
  { value: 'second_half', label: 'Second Half' },
  { value: 'et1', label: 'Extra Time 1st Half' },
  { value: 'et2', label: 'Extra Time 2nd Half' },
  { value: 'penalties', label: 'Penalties' },
]

const COLLECTION_TYPES = [
  { value: 'data', label: 'Start Data Collection' },
  { value: 'qa', label: 'Start Quality Assurance' },
  { value: 'pressures', label: 'Start Pressures Collection' },
]

export default function MatchSelectionPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('id') // 'id' | 'select'
  const [matchId, setMatchId] = useState('')
  const [matchIdError, setMatchIdError] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Steps after match confirmed
  const [step, setStep] = useState(STEP.SELECT)
  const [collectionMode, setCollectionMode] = useState('offline')
  const [selectedHalf, setSelectedHalf] = useState('')

  // Browse list filter
  const [searchQuery, setSearchQuery] = useState('')

  // ── Enter Match By ID ──
  function handleEnterById() {
    setMatchIdError('')
    if (!matchId.trim()) { setMatchIdError('Please enter a Match ID.'); return }
    if (!/^\d+$/.test(matchId.trim())) { setMatchIdError('Match ID must contain numbers only.'); return }
    const match = findMatchById(matchId.trim())
    if (!match) { setMatchIdError(`No match found with ID ${matchId.trim()}.`); return }
    setSelectedMatch(match)
    setStep(STEP.MODE)
  }

  // ── Select from list ──
  function handleSelectFromList(match) {
    setSelectedMatch(match)
    setStep(STEP.MODE)
  }

  // ── Back navigation ──
  function handleBack() {
    if (step === STEP.HALF) { setStep(STEP.MODE); return }
    if (step === STEP.MODE) { setSelectedMatch(null); setStep(STEP.SELECT); return }
  }

  // ── Start collection ──
  function handleStart(type) {
    navigate('/collection', {
      state: {
        match: selectedMatch,
        half: selectedHalf,
        mode: collectionMode,
        collectionType: type,
      }
    })
  }

  // ── Filtered match list ──
  const filteredMatches = MATCHES.filter(m => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      m.matchName.toLowerCase().includes(q) ||
      m.productionId.includes(q) ||
      m.competition.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q)
    )
  })

  const isInStep = step !== STEP.SELECT

  return (
    <div className="min-h-screen bg-[#e8eef4] flex flex-col">

      {/* Back button — only shown when in sub-steps */}
      {isInStep && (
        <div className="p-3">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">

        {/* ── STEP: SELECT (tabs) ── */}
        {step === STEP.SELECT && (
          <div className="bg-white rounded-lg shadow w-full max-w-2xl">
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('select')}
                className={`flex-1 py-3 text-sm font-medium rounded-tl-lg transition-colors ${
                  activeTab === 'select'
                    ? 'bg-white text-gray-800 border-b-2 border-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                Select Match
              </button>
              <button
                onClick={() => setActiveTab('id')}
                className={`flex-1 py-3 text-sm font-medium rounded-tr-lg transition-colors ${
                  activeTab === 'id'
                    ? 'bg-[#1e3a6e] text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                Enter Match By Id
              </button>
            </div>

            <div className="p-5">
              {/* Enter by ID tab */}
              {activeTab === 'id' && (
                <>
                  <div className="flex items-center border border-blue-400 rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-300">
                    <input
                      type="text"
                      value={matchId}
                      onChange={e => { setMatchId(e.target.value); setMatchIdError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleEnterById()}
                      placeholder="Enter Match Id"
                      autoFocus
                      className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-400"
                    />
                    <button
                      onClick={handleEnterById}
                      className="px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                    >
                      Enter
                    </button>
                  </div>
                  {matchIdError ? (
                    <p className="mt-2 text-xs text-red-500">{matchIdError}</p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">* Match Id must contain numbers only *</p>
                  )}
                </>
              )}

              {/* Select from list tab */}
              {activeTab === 'select' && (
                <>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by team, competition, or ID..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
                  />
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {filteredMatches.length === 0 && (
                      <p className="py-6 text-center text-sm text-gray-400">No matches found.</p>
                    )}
                    {filteredMatches.map(match => (
                      <button
                        key={match.productionId}
                        onClick={() => handleSelectFromList(match)}
                        className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{match.matchName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {match.competition} · {match.country} · GW{match.gameWeek} · {match.matchDate}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 font-mono flex-shrink-0">{match.productionId}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── STEP: COLLECTION MODE ── */}
        {step === STEP.MODE && (
          <div className="bg-white rounded-lg shadow w-full max-w-md p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Select Collection Mode:</p>
            <div className="flex items-center gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="offline"
                  checked={collectionMode === 'offline'}
                  onChange={() => setCollectionMode('offline')}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Offline Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="360"
                  checked={collectionMode === '360'}
                  onChange={() => setCollectionMode('360')}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">360 Mode</span>
              </label>
            </div>
            <button
              onClick={() => setStep(STEP.HALF)}
              className="w-auto px-8 py-2 bg-[#1e3a6e] hover:bg-[#16305c] text-white text-sm font-medium rounded transition-colors mx-auto block"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP: SELECT HALF ── */}
        {step === STEP.HALF && (
          <div className="bg-white rounded-lg shadow w-full max-w-2xl p-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">Select Half</p>
            <select
              value={selectedHalf}
              onChange={e => setSelectedHalf(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 mb-4 bg-white"
            >
              <option value="">Choose Half</option>
              {HALVES.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>

            {/* Action buttons — only shown after half selected */}
            {selectedHalf && (
              <div className="flex gap-3 flex-wrap">
                {COLLECTION_TYPES.map(ct => (
                  <button
                    key={ct.value}
                    onClick={() => handleStart(ct.value)}
                    className="px-4 py-2 border border-[#1e3a6e] text-[#1e3a6e] text-sm rounded hover:bg-[#1e3a6e] hover:text-white transition-colors"
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
