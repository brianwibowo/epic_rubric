import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/utils/constants';
import EditProfileModal from '@/components/auth/EditProfileModal';
import HelpButton from '../ui/HelpButton';
import styles from './Header.module.css';
import { Menu, Bell, User, Lock, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ title = 'EPIC Platform', actions, showHelp = true, showBell = true }) => {
  const { toggleSidebar } = useUiStore();
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/login');
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
                    onClick={handleLogout}
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Header;

