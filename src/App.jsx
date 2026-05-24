import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RoleRouter } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MatchSelectionPage from './pages/MatchSelectionPage'
import CollectionLoadingPage from './pages/CollectionLoadingPage'
import CollectionActivePage from './pages/CollectionActivePage'
import {
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

          {/* Role router */}
          <Route path="/" element={<RoleRouter />} />

          {/* Collector flow */}
          <Route path="/matches" element={
            <ProtectedRoute allowedRoles={['collector','super_admin','org_admin','manager']}>
              <MatchSelectionPage />
            </ProtectedRoute>
          } />
          <Route path="/collection" element={
            <ProtectedRoute allowedRoles={['collector','super_admin','org_admin','manager']}>
              <CollectionLoadingPage />
            </ProtectedRoute>
          } />
          <Route path="/collection/active" element={
            <ProtectedRoute allowedRoles={['collector','super_admin','org_admin','manager']}>
              <CollectionActivePage />
            </ProtectedRoute>
          } />

          {/* Manager */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboardPage />
            </ProtectedRoute>
          } />

          {/* Org Admin */}
          <Route path="/org-admin" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <OrgAdminPage />
            </ProtectedRoute>
          } />

          {/* Super Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<RoleRouter />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
