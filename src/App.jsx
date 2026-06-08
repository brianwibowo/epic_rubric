import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Layout Shell
import AppShell from '@/components/layout/AppShell';

// Route Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import RubricConfigPage from '@/pages/RubricConfigPage';
import ClassListPage from '@/pages/ClassListPage';
import StudentListPage from '@/pages/StudentListPage';
import ScoringPage from '@/pages/ScoringPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AuditLogPage from '@/pages/AuditLogPage';
import UserManagementPage from '@/pages/UserManagementPage';

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
            <ProtectedRoute allowedRoles={['admin', 'guru', 'siswa']}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Dashboard (All roles) */}
          <Route index element={<DashboardPage />} />

          {/* Rubric Configuration (Admin, Guru) */}
          <Route 
            path="rubric/config" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <RubricConfigPage />
              </ProtectedRoute>
            } 
          />

          {/* Class List (Admin, Guru) */}
          <Route 
            path="classes" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <ClassListPage />
              </ProtectedRoute>
            } 
          />

          {/* Student List in Class (Admin, Guru) */}
          <Route 
            path="students/:classId" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <StudentListPage />
              </ProtectedRoute>
            } 
          />

          {/* Student Assessment Form (Guru only) */}
          <Route 
            path="scoring/:classId/:studentId" 
            element={
              <ProtectedRoute allowedRoles={['guru']}>
                <ScoringPage />
              </ProtectedRoute>
            } 
          />

          {/* Learning Analytics (All roles) */}
          <Route 
            path="analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru', 'siswa']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />

          {/* Audit Logs (Admin only) */}
          <Route 
            path="admin/audit-log" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogPage />
              </ProtectedRoute>
            } 
          />

          {/* User Management (Admin only) */}
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
