import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './AppShell.module.css';
import { useUiStore } from '@/stores/uiStore';
import Toast from '../ui/Toast';

const AppShell = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className={styles.appShell}>
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Layout */}
      <div className={styles.contentWrapper}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

export default AppShell;
