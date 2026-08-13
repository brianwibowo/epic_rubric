import React from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import styles from './Sidebar.module.css';
import { ROLES, ROLE_LABELS } from '@/utils/constants';
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
  Award
} from 'lucide-react';
import Badge from '../ui/Badge';
import LanguageSelector from '../ui/LanguageSelector';
import { useLanguageStore } from '@/stores/languageStore';

const Sidebar = () => {
  const { profile, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapse, notificationCount } = useUiStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Determine if we're inside an MK context
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
      label: t('navDashboard', 'Dashboard'),
      icon: <LayoutDashboard size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
    },
    {
      to: '/mk',
      label: t('navMK', 'Mata Kuliah'),
      icon: <BookOpen size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
    },
    {
      to: '/rubrik',
      label: t('navRubric', 'Bank Rubrik'),
      icon: <Library size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN]
    },
    {
      to: '/notifications',
      label: 'Notifikasi',
      icon: <Bell size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA],
      badge: notificationCount > 0 ? notificationCount : null
    },
    {
      to: '/admin/users',
      label: 'Manajemen User',
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

  // === MK CONTEXT NAVIGATION (inside a specific MK) ===
  const mkNavItems = [
    {
      to: `/mk/${mkId}`,
      label: t('tabOverview', 'Overview MK'),
      icon: <LayoutDashboard size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN],
      end: true
    },
    {
      to: `/mk/${mkId}/students`,
      label: t('tabStudents', 'Daftar Mahasiswa'),
      icon: <UsersRound size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN]
    },
    {
      to: `/mk/${mkId}/komponen`,
      label: 'Komponen & Rubrik',
      icon: <ClipboardList size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN]
    },
    {
      to: `/mk/${mkId}/analytics`,
      label: t('tabAnalytics', 'Analisis & Nilai'),
      icon: <BarChart3 size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
    },
    {
      to: `/mk/${mkId}/comments`,
      label: 'Komentar',
      icon: <MessageSquare size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
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
      case ROLES.MAHASISWA: return 'success';
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
        {/* Floating Border Collapse Button - Positioned exactly straddling the right border line */}
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
          <div className={styles.userProfile} title={sidebarCollapsed ? profile?.full_name : undefined}>
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
              alt={profile?.full_name}
              className={styles.avatar}
            />
            {!sidebarCollapsed && (
              <div className={styles.userInfo}>
                <h4 className={styles.userName}>{profile?.full_name || 'User'}</h4>
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
                  navigate('/mk');
                }}
                title={sidebarCollapsed ? "Kembali ke Daftar MK" : undefined}
              >
                <ArrowLeft size={16} />
                {!sidebarCollapsed && <span>Kembali ke Daftar MK</span>}
              </button>
              {!sidebarCollapsed && <div className={styles.contextLabel}>Konteks Mata Kuliah</div>}
            </div>
          )}

          {/* Navigation */}
          <nav className={styles.nav}>
            {filteredNavItems.map((item) => {
              const isActiveRoute = item.to === '/'
                ? location.pathname === '/'
                : (item.end 
                    ? location.pathname === item.to
                    : (item.to.includes('/komponen') 
                        ? (location.pathname.includes('/komponen') || location.pathname.includes('/scoring'))
                        : location.pathname.startsWith(item.to)));

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

          {/* Footer */}
          <div className={styles.footer}>
            <NavLink
              to="/kredit"
              className={({ isActive }) =>
                `${styles.navLink} ${styles.creditLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? t('navCredits', 'Kredit & Tim Peneliti') : undefined}
            >
              <span className={styles.navIcon}><Award size={20} /></span>
              {!sidebarCollapsed && <span className={styles.navLabel}>{t('navCredits', 'Kredit & Tim Peneliti')}</span>}
            </NavLink>

            <button 
              className={styles.logoutBtn} 
              onClick={handleLogout}
              title={sidebarCollapsed ? t('logout') : undefined}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>{t('logout')}</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
