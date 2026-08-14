import React, { useState } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import styles from './Sidebar.module.css';
import { ROLES, ROLE_LABELS, ALL_ROLES, STAFF_ROLES, EDUCATOR_ROLES, LEARNER_ROLES } from '@/utils/constants';
import EditProfileModal from '@/components/auth/EditProfileModal';
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  LineChart,
  ShieldAlert,
  Users,
  LogOut,
  X,
  FileSpreadsheet,
  Bell,
  ArrowLeft,
  ClipboardList,
  UsersRound,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Library,
  ChevronLeft,
  ChevronRight,
  Award,
  School,
  Edit2
} from 'lucide-react';
import Badge from '../ui/Badge';
import LanguageSelector from '../ui/LanguageSelector';
import { useLanguageStore } from '@/stores/languageStore';

const Sidebar = () => {
  const { profile, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapse, notificationCount } = useUiStore();
  const { t } = useLanguageStore();
  const { coursePluralLabel, courseLabel, learnerPluralLabel, isSchool, isUniversity, isAdmin } = useTerminology();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Determine if we're inside an MK/Mapel context
  const mkId = params.mkId;
  const isInMKContext = !!mkId && location.pathname.startsWith(`/mk/${mkId}`);

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  // === GLOBAL NAVIGATION (outside MK) ===
  const globalNavItems = [
    {
      to: '/',
      label: t('navDashboard', 'Dasbor'),
      icon: <LayoutDashboard size={20} />,
      roles: ALL_ROLES
    },
    // SMK: Daftar Kelas as primary
    ...(isSchool || isAdmin ? [{
      to: '/kelas',
      label: 'Daftar Kelas',
      icon: <School size={20} />,
      roles: ALL_ROLES
    }] : []),
    // University / Admin: Daftar Mata Kuliah
    ...(!isSchool || isAdmin ? [{
      to: '/mk',
      label: coursePluralLabel,
      icon: <BookOpen size={20} />,
      roles: ALL_ROLES
    }] : []),
    {
      to: '/rubrik',
      label: t('navRubric', 'Bank Rubrik'),
      icon: <Library size={20} />,
      roles: STAFF_ROLES
    },
    {
      to: '/notifications',
      label: 'Notifikasi',
      icon: <Bell size={20} />,
      roles: ALL_ROLES,
      badge: notificationCount > 0 ? notificationCount : null
    },
    {
      to: '/admin/users',
      label: 'Manajemen Pengguna',
      icon: <Users size={20} />,
      roles: [ROLES.ADMIN],
      dividerBefore: true
    },
    {
      to: '/admin/audit-log',
      label: 'Audit Logs',
      icon: <ShieldAlert size={20} />,
      roles: [ROLES.ADMIN]
    }
  ];

  // === MK CONTEXT NAVIGATION (inside a specific MK/Mapel) ===
  const trackParam = isSchool ? '?track=smk' : '';

  const mkNavItems = [
    {
      to: `/mk/${mkId}${trackParam}`,
      label: `Ringkasan ${courseLabel}`,
      icon: <LayoutDashboard size={20} />,
      roles: STAFF_ROLES,
      end: true
    },
    {
      to: `/mk/${mkId}/students${trackParam}`,
      label: learnerPluralLabel,
      icon: <UsersRound size={20} />,
      roles: STAFF_ROLES
    },
    {
      to: `/mk/${mkId}/komponen${trackParam}`,
      label: 'Komponen & Rubrik',
      icon: <ClipboardList size={20} />,
      roles: STAFF_ROLES
    },
    {
      to: `/mk/${mkId}/analytics${trackParam}`,
      label: t('tabAnalytics', 'Analisis & Radar'),
      icon: <BarChart3 size={20} />,
      roles: ALL_ROLES
    },
    {
      to: `/mk/${mkId}/comments${trackParam}`,
      label: 'Komentar & Diskusi',
      icon: <MessageSquare size={20} />,
      roles: ALL_ROLES
    }
  ];

  const currentNavItems = isInMKContext ? mkNavItems : globalNavItems;
  const filteredNavItems = currentNavItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case ROLES.ADMIN: return 'error';
      case ROLES.DOSEN: return 'primary';
      case ROLES.GURU: return 'info';
      case ROLES.MAHASISWA: return 'success';
      case ROLES.SISWA: return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Outer Wrapper for Floating Border Handle */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : ''} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        {/* Floating Border Collapse Button */}
        <button
          type="button"
          className={styles.borderCollapseToggle}
          onClick={toggleSidebarCollapse}
          title={sidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <aside className={styles.sidebar}>
          {/* Header / Logo + Language Dropdown */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <img src="/logo.png" alt="EPIC e-Rubric Logo" className={styles.logoImg} title="EPIC e-Rubric" />
              {!sidebarCollapsed && (
                <div className={styles.logoText}>
                  <span className={styles.epic}>EPIC</span>
                  <span className={styles.rubric}>e-Rubric</span>
                </div>
              )}
            </div>

            <div className={styles.headerRightActions}>
              <LanguageSelector
                variant="dropdown"
                compact={sidebarCollapsed}
                className={styles.sidebarLangSelector}
              />

              <button
                className={styles.closeBtn}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div 
            className={styles.userProfile} 
            onClick={() => setShowProfileModal(true)}
            title={sidebarCollapsed ? `${profile?.full_name} (Klik untuk edit profil)` : "Klik untuk mengedit profil"}
            role="button"
            tabIndex={0}
          >
            <div className={styles.avatarWrap}>
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                alt={profile?.full_name}
                className={styles.avatar}
              />
              <div className={styles.avatarEditBadge} title="Edit Foto">
                <Edit2 size={9} />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className={styles.userInfo}>
                <div className={styles.userNameRow}>
                  <h4 className={styles.userName}>{profile?.full_name || 'User'}</h4>
                  <Edit2 size={13} className={styles.editIcon} />
                </div>
                <Badge
                  variant={getRoleBadgeVariant(profile?.role)}
                  size="sm"
                  glow
                >
                  {ROLE_LABELS[profile?.role] || profile?.role}
                </Badge>
              </div>
            )}
          </div>

          {/* MK Context Header — Back button */}
          {isInMKContext && (
            <div className={styles.contextHeader}>
              <button
                className={styles.backButton}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(isSchool ? '/kelas' : '/mk');
                }}
                title={sidebarCollapsed ? (isSchool ? 'Kembali ke Daftar Kelas' : `Kembali ke ${coursePluralLabel}`) : undefined}
              >
                <ArrowLeft size={16} />
                {!sidebarCollapsed && <span>{isSchool ? 'Kembali ke Daftar Kelas' : `Kembali ke ${coursePluralLabel}`}</span>}
              </button>
              {!sidebarCollapsed && <div className={styles.contextLabel}>Konteks {courseLabel}</div>}
            </div>
          )}

          {/* Navigation Links */}
          <nav className={styles.nav}>
            {filteredNavItems.map((item) => {
              const cleanItemTo = item.to.split('?')[0];
              const isActiveRoute = item.to === '/'
                ? location.pathname === '/'
                : (item.end
                  ? location.pathname === cleanItemTo
                  : (cleanItemTo.includes('/students')
                    ? (location.pathname.includes('/students') || location.pathname.includes('/scoring'))
                    : (cleanItemTo.includes('/komponen')
                      ? location.pathname.includes('/komponen')
                      : location.pathname.startsWith(cleanItemTo))));

              return (
                <React.Fragment key={item.to}>
                  {item.dividerBefore && <div className={styles.navDivider} />}
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={() =>
                      `${styles.navLink} ${isActiveRoute ? styles.active : ''}`
                    }
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                    {item.badge && (
                      <span className={styles.navBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </NavLink>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Footer with Kredit Link & Logout */}
          <div className={styles.footer}>
            <NavLink
              to="/kredit"
              className={({ isActive }) => `${styles.kreditLink} ${isActive ? styles.activeKredit : ''}`}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? "Kredit & Tim Peneliti" : undefined}
            >
              <Award size={18} className={styles.kreditIcon} />
              {!sidebarCollapsed && (
                <div className={styles.kreditTextWrap}>
                  <span className={styles.kreditTitle}>Kredit & Tim Peneliti</span>
                  <span className={styles.kreditSub}>Dr. Kardiyem & Dwi Puji, M. Pd.</span>
                </div>
              )}
            </NavLink>

            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Keluar" : undefined}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Keluar Sesi</span>}
            </button>
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Sidebar;
