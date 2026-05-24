import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const HALF_LABELS = {
  first_half: 'Part 1',
  second_half: 'Part 2',
  et1: 'ET Part 1',
  et2: 'ET Part 2',
  penalties: 'Penalties',
}

export default function CollectionActivePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { match, half, mode, collectionType } = location.state || {}
  const [videoSrc, setVideoSrc] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef()

  if (!match) {
    navigate('/matches', { replace: true })
    return null
  }

  const halfLabel = HALF_LABELS[half] || half
  const modeLabel = mode === '360' ? '360' : 'OFFLINE'

  function handleFile(file) {
    if (!file || !file.type.startsWith('video/')) return
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="min-h-screen bg-[#e8eef4] flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#e8eef4]">
        <div className="flex items-center gap-2">
          <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-medium px-2.5 py-1 rounded">online</span>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded">
            Mode: {modeLabel}
          </span>
        </div>
        {/* Hamburger menu */}
        <button className="w-9 h-9 bg-[#1e3a6e] rounded flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd"/>
          </svg>
        </button>
        {/* Right action icons */}
        <div className="flex items-center gap-1.5">
          {['Main', 'grid', 'info', 'filter', 'user'].map((icon, i) => (
            <button key={i} className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {icon === 'user' ? (match?.trainer?.[0] || 'A') : ''}
              {icon === 'Main' && <span className="text-[10px]">Main</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Match header ── */}
      <div className="text-center py-1">
        <p className="text-sm font-semibold text-gray-700">
          Match {match.productionId} - {halfLabel}
        </p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">{match.matchName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{match.matchDate}</p>
      </div>

      {/* ── Status bar ── */}
      <div className="mx-3 mb-1">
        <p className="text-[#1e3a6e] text-sm text-center font-medium py-1">
          There is no active event yet!
        </p>
      </div>

      {/* ── Stats toolbar ── */}
      <div className="flex items-center bg-gray-900 px-2 py-1.5 gap-2 mx-3 rounded-t">
        <button className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded flex-shrink-0">
          Manual
        </button>
        {[
          { icon: '⊞', label: '0/0', bg: 'bg-gray-700' },
          { icon: '📷', label: '0/0', bg: 'bg-pink-100' },
          { icon: '📸', label: '0/0', bg: 'bg-blue-100' },
          { icon: '👁', label: '0', bg: 'bg-green-100' },
          { icon: '🚫', label: '0', bg: 'bg-gray-100' },
        ].map((item, i) => (
          <div key={i} className={`flex-1 flex items-center justify-center gap-1 ${item.bg} rounded py-1 text-xs`}>
            <span>{item.icon}</span>
            <span className="font-medium text-gray-700">{item.label}</span>
          </div>
        ))}
        <button className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0">×</button>
      </div>

      {/* ── Video area ── */}
      <div className="mx-3 bg-black rounded-b flex-1 min-h-64 flex flex-col">
        {videoSrc ? (
          <div className="flex flex-col flex-1">
            <video
              src={videoSrc}
              controls
              className="w-full flex-1 max-h-96"
              style={{ background: '#000' }}
            />
          </div>
        ) : (
          <div
            className={`flex-1 flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-colors ${
              isDragging ? 'bg-gray-800' : 'bg-black'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <p className="text-[#1e3a6e] text-sm font-medium bg-[#e8eef4] px-4 py-2 rounded">
              No video for this match and part. Ask the video team for more details.
            </p>
            <p className="text-gray-400 text-sm">return to <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Part select</button></p>
            <p className="text-gray-500 text-sm">Or</p>
            <p className="text-gray-400 text-sm">return to <button onClick={() => navigate('/matches')} className="text-blue-400 hover:underline">match select</button></p>
            <p className="text-gray-500 text-sm">Or</p>
            <div className="flex flex-col items-center gap-2 mt-2">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
              <p className="text-gray-300 text-sm">
                Drop video here, paste or{' '}
                <span className="text-blue-400 hover:underline cursor-pointer">browse to select</span>
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        )}
      </div>

      {/* ── Score section ── */}
      <div className="mx-3 mt-2 mb-4 divide-y divide-gray-200">
        {[
          { label: match.homeTeam, score: 0 },
          { label: match.awayTeam, score: 0 },
          { label: 'Game', score: 0 },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <span className="text-sm font-medium text-gray-800">{item.label}</span>
            <span className="bg-gray-200 text-gray-600 text-sm font-medium px-3 py-0.5 rounded-full min-w-[2rem] text-center">
              {item.score}
            </span>
          </div>
        ))}
      </div>

      {/* Online badge bottom */}
      <div className="flex justify-center pb-4">
        <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-medium px-3 py-1.5 rounded">online</span>
      </div>
    </div>
  )
}
