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
  Library
} from 'lucide-react';
import Badge from '../ui/Badge';

const Sidebar = () => {
  const { profile, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, notificationCount } = useUiStore();
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
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
    },
    {
      to: '/mk',
      label: 'Mata Kuliah',
      icon: <BookOpen size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN, ROLES.MAHASISWA]
    },
    {
      to: '/rubrik',
      label: 'Template Rubrik',
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
      label: 'Overview MK',
      icon: <LayoutDashboard size={20} />,
      roles: [ROLES.ADMIN, ROLES.DOSEN],
      end: true
    },
    {
      to: `/mk/${mkId}/students`,
      label: 'Daftar Mahasiswa',
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
      label: 'Analisis & Nilai',
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

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        {/* Header / Logo */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="EPIC e-Rubric Logo" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.epic}>EPIC</span>
              <span className={styles.rubric}>e-Rubric</span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile */}
        <div className={styles.userProfile}>
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
            alt={profile?.full_name}
            className={styles.avatar}
          />
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
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Daftar MK</span>
            </button>
            <div className={styles.contextLabel}>Konteks Mata Kuliah</div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {filteredNavItems.map((item, idx) => (
            <React.Fragment key={item.to}>
              {item.dividerBefore && <div className={styles.navDivider} />}
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && (
                  <span className={styles.navBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
