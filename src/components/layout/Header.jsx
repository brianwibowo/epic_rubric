import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/utils/constants';
import EditProfileModal from '@/components/auth/EditProfileModal';
import HelpButton from '../ui/HelpButton';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useLanguageStore } from '@/stores/languageStore';
import styles from './Header.module.css';
import { Menu, Bell, User, Lock, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ title = 'EPIC Platform', actions, showHelp = true, showBell = true }) => {
  const { toggleSidebar, addToast, clearToasts } = useUiStore();
  const { profile, logout } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      clearToasts();
      setShowLogoutConfirm(false);
      navigate('/login');
      addToast(t('logoutToast', 'Anda telah berhasil keluar dari sesi.'), 'info', 2500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button 
            className={styles.menuBtn} 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>{title}</h1>
            {showHelp && <HelpButton size={20} />}
          </div>
        </div>
        
        <div className={styles.right}>
          {actions && <div className={styles.actions}>{actions}</div>}
          {showBell && (
            <button className={styles.iconBtn} onClick={() => navigate('/notifications')} aria-label="Notifications">
              <Bell size={18} />
            </button>
          )}

          {/* User Profile Header Dropdown */}
          {profile && (
            <div className={styles.userMenuWrap} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userProfileBtn}
                onClick={() => setShowDropdown(prev => !prev)}
                aria-label="User profile menu"
              >
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                  alt={profile.full_name}
                  className={styles.headerAvatar}
                />
                <div className={styles.headerUserInfo}>
                  <span className={styles.headerUserName}>{profile.full_name}</span>
                  <span className={styles.headerUserRole}>{ROLE_LABELS[profile.role] || profile.role}</span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
              </button>

              {showDropdown && (
                <div className={styles.userDropdown}>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setShowDropdown(false);
                      setShowProfileModal(true);
                    }}
                  >
                    <User size={16} />
                    <span>Edit Profil & Foto</span>
                  </button>

                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setShowDropdown(false);
                      setShowProfileModal(true);
                    }}
                  >
                    <Lock size={16} />
                    <span>Ganti Kata Sandi</span>
                  </button>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogoutClick}
                  >
                    <LogOut size={16} />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        title={t('logoutConfirmTitle', 'Konfirmasi Keluar Sesi')}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}>
              <LogOut size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                {t('logoutConfirmMessage', 'Apakah Anda yakin ingin keluar dari sesi akun ini?')}
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {t('logoutConfirmSub', 'Anda harus memasukkan kredensial login kembali untuk mengakses sistem.')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
              {t('logoutCancel', 'Batal')}
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmLogout}
              isLoading={isLoggingOut}
              iconLeft={<LogOut size={16} />}
            >
              {t('logoutConfirmBtn', 'Ya, Keluar Sesi')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Header;

