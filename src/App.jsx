import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RoleRouter } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import {
  MatchListPage,
  ManagerDashboardPage,
  OrgAdminPage,
  SuperAdminPage,
} from './pages/PlaceholderPages'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Auto-redirect based on role */}
          <Route path="/" element={<RoleRouter />} />

          {/* Collector */}
          <Route
            path="/matches"
            element={
              <ProtectedRoute allowedRoles={['collector']}>
                <MatchListPage />
              </ProtectedRoute>
            }
          />

          {/* Manager / Coach */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Org Admin */}
          <Route
            path="/org-admin"
            element={
              <ProtectedRoute allowedRoles={['org_admin']}>
                <OrgAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Super Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<RoleRouter />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
