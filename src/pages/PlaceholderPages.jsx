import { useAuth } from '../context/AuthContext'

function PlaceholderLayout({ title, subtitle, color }) {
  const { user, userRole, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className={`h-14 ${color} flex items-center justify-between px-6`}>
        <span className="text-white font-semibold text-lg">Tornado</span>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm opacity-80">{user?.email}</span>
          <button
            onClick={logout}
            className="text-white text-sm border border-white/40 px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center`}>
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
        <div className="mt-2 px-4 py-2 bg-gray-100 rounded text-xs text-gray-400 font-mono">
          role: {userRole}
        </div>
      </div>
    </div>
  )
}

export function MatchListPage() {
  return (
    <PlaceholderLayout
      title="Match List"
      subtitle="Data Collector view — coming from next video"
      color="bg-tornado-red"
    />
  )
}

export function ManagerDashboardPage() {
  return (
    <PlaceholderLayout
      title="Manager Dashboard"
      subtitle="Manager / Coach view — coming from next video"
      color="bg-blue-700"
    />
  )
}

export function OrgAdminPage() {
  return (
    <PlaceholderLayout
      title="Organisation Admin"
      subtitle="Org Admin panel — coming from next video"
      color="bg-purple-700"
    />
  )
}

export function SuperAdminPage() {
  return (
    <PlaceholderLayout
      title="Super Admin"
      subtitle="Full system control — coming from next video"
      color="bg-gray-900"
    />
  )
}
