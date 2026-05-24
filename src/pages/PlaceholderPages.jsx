import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PlaceholderLayout({ title, subtitle, color }) {
  const { user, userRole, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
  const { user, userRole, logout } = useAuth()
  const navigate = useNavigate()

  const sections = [
    {
      title: 'Data Collection',
      description: 'Access match selection and live data collection screen',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-[#E84C37]',
      border: 'border-[#E84C37]',
      text: 'text-[#E84C37]',
      action: () => navigate('/matches'),
      label: 'Open Match Selection',
      ready: true,
    },
    {
      title: 'Manager Dashboard',
      description: 'View live data, approve submissions, manage team reports',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-blue-700',
      border: 'border-blue-700',
      text: 'text-blue-700',
      action: () => navigate('/manager'),
      label: 'Coming soon',
      ready: false,
    },
    {
      title: 'Organisation Admin',
      description: 'Manage organisations, teams, users and data scope',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-purple-700',
      border: 'border-purple-700',
      text: 'text-purple-700',
      action: () => navigate('/org-admin'),
      label: 'Coming soon',
      ready: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">

      {/* Top bar */}
      <div className="h-14 bg-[#1e3a6e] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#E84C37] font-bold text-xl tracking-tight">Tornado</span>
          <span className="text-white/40 text-sm">|</span>
          <span className="text-white/70 text-sm">Super Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">{user?.email}</span>
          <button
            onClick={logout}
            className="text-white text-sm border border-white/30 px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}</h1>
          <p className="text-gray-500 text-sm mt-1">Full system control — select a section to get started</p>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((s) => (
            <div
              key={s.title}
              className={`bg-white rounded-xl border-2 ${s.border} overflow-hidden shadow-sm flex flex-col`}
            >
              {/* Card header */}
              <div className={`${s.color} px-5 py-4 flex items-center gap-3`}>
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <h2 className="text-white font-semibold text-base">{s.title}</h2>
              </div>

              {/* Card body */}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{s.description}</p>
                <button
                  onClick={s.action}
                  disabled={!s.ready}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    s.ready
                      ? `${s.color} text-white hover:opacity-90`
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {s.label}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dev note */}
        <div className="mt-6 px-4 py-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
          <p className="text-xs text-gray-500 font-mono">role: super_admin · uid: {user?.uid?.slice(0,16)}…</p>
        </div>
      </div>
    </div>
  )
}
