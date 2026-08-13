import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/utils/constants';

// Layout Shell
import AppShell from '@/components/layout/AppShell';
import MKLayout from '@/components/layout/MKLayout';

// Route Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages — Global
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MataKuliahListPage from '@/pages/MataKuliahListPage';
import RubrikLibraryPage from '@/pages/RubrikLibraryPage';
import NotificationsPage from '@/pages/NotificationsPage';
import UserManagementPage from '@/pages/UserManagementPage';
import AuditLogPage from '@/pages/AuditLogPage';
import KreditPage from '@/pages/KreditPage';

// Pages — MK Context
import MKOverviewPage from '@/pages/MKOverviewPage';
import MKStudentListPage from '@/pages/MKStudentListPage';
import KomponenPenilaianPage from '@/pages/KomponenPenilaianPage';
import MKAnalyticsPage from '@/pages/MKAnalyticsPage';
import CommentsPage from '@/pages/CommentsPage';
import CreateMKPage from '@/pages/CreateMKPage';
import ScoringPage from '@/pages/ScoringPage';

const ALL_ROLES = [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA];
const DOSEN_ADMIN = [ROLES.ADMIN, ROLES.DOSEN];

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
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* === GLOBAL CONTEXT === */}
          
          {/* Dashboard (All roles) */}
          <Route index element={<DashboardPage />} />

          {/* Mata Kuliah List (All roles) */}
          <Route path="mk" element={<MataKuliahListPage />} />

          {/* Create MK (Dosen, Admin) */}
          <Route 
            path="mk/create" 
            element={
              <ProtectedRoute allowedRoles={DOSEN_ADMIN}>
                <CreateMKPage />
              </ProtectedRoute>
            } 
          />

          {/* Rubrik Template Library (Dosen, Admin) */}
          <Route 
            path="rubrik" 
            element={
              <ProtectedRoute allowedRoles={DOSEN_ADMIN}>
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

          {/* === MK CONTEXT (inside a specific Mata Kuliah) === */}
          <Route path="mk/:mkId" element={<MKLayout />}>
            {/* MK Overview */}
            <Route index element={<MKOverviewPage />} />

            {/* MK Student List (All roles — Read-only for Mahasiswa) */}
            <Route 
              path="students" 
              element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <MKStudentListPage />
                </ProtectedRoute>
              } 
            />

            {/* Komponen Penilaian (Dosen, Admin) */}
            <Route 
              path="komponen" 
              element={
                <ProtectedRoute allowedRoles={DOSEN_ADMIN}>
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
                <ProtectedRoute allowedRoles={DOSEN_ADMIN}>
                  <ScoringPage />
                </ProtectedRoute>
              } 
            />

            {/* Scoring per Komponen (Dosen, Admin) */}
            <Route 
              path="komponen/:komponenId/scoring" 
              element={
                <ProtectedRoute allowedRoles={DOSEN_ADMIN}>
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
