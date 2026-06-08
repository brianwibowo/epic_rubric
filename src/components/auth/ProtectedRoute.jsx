import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-app)'
      }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the original requested location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    // Role not authorized, redirect to dashboard or display access denied
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '24px',
        backgroundColor: 'var(--bg-app)'
      }}>
        <Card variant="glass" padding="lg" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-error)', marginBottom: '12px', fontWeight: 800 }}>Akses Ditolak</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Peran Anda ({profile?.role}) tidak memiliki otorisasi untuk mengakses halaman ini.
          </p>
          <Navigate to="/" replace />
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
