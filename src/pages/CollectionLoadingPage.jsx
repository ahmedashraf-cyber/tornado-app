import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CollectionLoadingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { match, half, mode, collectionType } = location.state || {}

  useEffect(() => {
    // Simulate loading then navigate to actual collection screen
    const timer = setTimeout(() => {
      navigate('/collection/active', { state: location.state, replace: true })
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#e8eef4] flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
      {/* Online badge */}
      <span className="bg-[#c8e6c9] text-[#2e7d32] text-xs font-medium px-3 py-1.5 rounded">
        online
      </span>
    </div>
  )
}
