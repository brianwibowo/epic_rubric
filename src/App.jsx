import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLES, ALL_ROLES, STAFF_ROLES } from '@/utils/constants';

// Layout Shell
import AppShell from '@/components/layout/AppShell';
import MKLayout from '@/components/layout/MKLayout';

// Route Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Pages — Global
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MataKuliahListPage from '@/pages/MataKuliahListPage';
import KelasListPage from '@/pages/KelasListPage';
import KelasDetailPage from '@/pages/KelasDetailPage';
import RubrikLibraryPage from '@/pages/RubrikLibraryPage';
import NotificationsPage from '@/pages/NotificationsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import AuditLogPage from '@/pages/AuditLogPage';
import KreditPage from '@/pages/KreditPage';

// Pages — MK Context
import MKOverviewPage from '@/pages/MKOverviewPage';
import RombelListPage from '@/pages/RombelListPage';
import MKStudentListPage from '@/pages/MKStudentListPage';
import KomponenPenilaianPage from '@/pages/KomponenPenilaianPage';
import MKAnalyticsPage from '@/pages/MKAnalyticsPage';
import CommentsPage from '@/pages/CommentsPage';
import CreateMKPage from '@/pages/CreateMKPage';
import ScoringPage from '@/pages/ScoringPage';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Core App Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <ErrorBoundary>
                <AppShell />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          {/* === GLOBAL CONTEXT === */}
          
          {/* Dashboard (All roles) */}
          <Route index element={<DashboardPage />} />

          {/* Kelas List & Detail (All roles — primarily SMK / Admin) */}
          <Route path="kelas" element={<KelasListPage />} />
          <Route path="kelas/:kelasId" element={<KelasDetailPage />} />

          {/* Mata Kuliah / Mapel List (All roles) */}
          <Route path="mk" element={<MataKuliahListPage />} />

          {/* Create MK / Mapel (Admin, Dosen, Guru) */}
          <Route 
            path="mk/create" 
            element={
              <ProtectedRoute allowedRoles={STAFF_ROLES}>
                <CreateMKPage />
              </ProtectedRoute>
            } 
          />

          {/* Rubrik Template Library (Admin, Dosen, Guru) */}
          <Route 
            path="rubrik" 
            element={
              <ProtectedRoute allowedRoles={STAFF_ROLES}>
                <RubrikLibraryPage />
              </ProtectedRoute>
            } 
          />

          {/* Notifications (All roles) */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Kredit & Tim Peneliti (All roles) */}
          <Route path="kredit" element={<KreditPage />} />

          {/* Admin: User Management */}
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin: Audit Logs */}
          <Route 
            path="admin/audit-log" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AuditLogPage />
              </ProtectedRoute>
            } 
          />

          {/* === MK / MAPEL CONTEXT (inside a specific Mata Kuliah / Mapel) === */}
          <Route path="mk/:mkId" element={<MKLayout />}>
            {/* MK Overview */}
            <Route index element={<MKOverviewPage />} />

            {/* Rombel List (University context) */}
            <Route 
              path="rombel" 
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <RombelListPage />
                </ProtectedRoute>
              } 
            />

            {/* MK Student / Siswa List (All roles) */}
            <Route 
              path="students" 
              element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <MKStudentListPage />
                </ProtectedRoute>
              } 
            />

            {/* Komponen Penilaian (Admin, Dosen, Guru) */}
            <Route 
              path="komponen" 
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <KomponenPenilaianPage />
                </ProtectedRoute>
              } 
            />

            {/* Analytics (All roles — scoped by role internally) */}
            <Route path="analytics" element={<MKAnalyticsPage />} />

            {/* Comments (All roles) */}
            <Route path="comments" element={<CommentsPage />} />

            {/* Scoring (Direct from student list or komponen) */}
            <Route 
              path="scoring" 
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <ScoringPage />
                </ProtectedRoute>
              } 
            />

            {/* Scoring per Komponen (Admin, Dosen, Guru) */}
            <Route 
              path="komponen/:komponenId/scoring" 
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <ScoringPage />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
