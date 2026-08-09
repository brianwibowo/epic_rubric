import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './AppShell.module.css';
import { useUiStore } from '@/stores/uiStore';
import { useTourStore } from '@/stores/tourStore';
import Toast from '../ui/Toast';
import PageHelpModal from '../ui/PageHelpModal';
import FeatureTourModal from '../ui/FeatureTourModal';
import { Menu, Bell, HelpCircle } from 'lucide-react';

const AppShell = () => {
  const { toasts, removeToast, setSidebarOpen, notificationCount } = useUiStore();
  const { openHelp } = useTourStore();
  const location = useLocation();
  
  // Check if we're on a scoring page (which has its own layout)
  const isScoringPage = location.pathname.includes('/scoring');

  return (
    <div className={styles.appShell}>
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Layout */}
      <div className={`${styles.contentWrapper} ${isScoringPage ? styles.fullWidth : ''}`}>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <button className={styles.hamburger} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className={styles.mobileLogoRow}>
            <img src="/logo.png" alt="EPIC e-Rubric" className={styles.mobileLogoImg} />
            <span className={styles.mobileLogoText}>EPIC e-Rubric</span>
          </div>
          <button className={styles.mobileNotifBtn} aria-label="Notifications">
            <Bell size={20} />
            {notificationCount > 0 && <span className={styles.mobileNotifDot} />}
          </button>
        </div>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {/* Page Help & Guided Feature Tour Modals */}
      <PageHelpModal />
      <FeatureTourModal />

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
