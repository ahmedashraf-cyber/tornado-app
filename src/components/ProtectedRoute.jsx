import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginGuardPage from '../pages/LoginGuardPage'

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <LoginGuardPage />
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={roleDefaultRoute(userRole)} replace />
  }
  return children
}

export function RoleRouter() {
  const { user, userRole, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={roleDefaultRoute(userRole)} replace />
}

function roleDefaultRoute(role) {
  switch (role) {
    case 'super_admin': return '/admin'
    case 'org_admin': return '/org-admin'
    case 'manager': return '/manager'
    default: return '/matches'
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tornado-red mb-4">Tornado</h1>
        <div className="flex gap-1 justify-center">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-tornado-red rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
