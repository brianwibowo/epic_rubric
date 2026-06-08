import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import styles from './Sidebar.module.css';
import { 
  LayoutDashboard, 
  Settings, 
  GraduationCap, 
  LineChart, 
  ShieldAlert, 
  Users, 
  LogOut,
  X,
  FileSpreadsheet
} from 'lucide-react';
import Badge from '../ui/Badge';

const Sidebar = () => {
  const { profile, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['admin', 'guru', 'siswa']
    },
    {
      to: '/rubric/config',
      label: 'Konfigurasi Rubrik',
      icon: <Settings size={20} />,
      roles: ['admin', 'guru']
    },
    {
      to: '/classes',
      label: 'Penilaian Kelas',
      icon: <GraduationCap size={20} />,
      roles: ['admin', 'guru']
    },
    {
      to: '/analytics',
      label: 'Learning Analytics',
      icon: <LineChart size={20} />,
      roles: ['admin', 'guru']
    },
    {
      to: '/admin/audit-log',
      label: 'Audit Activity Logs',
      icon: <ShieldAlert size={20} />,
      roles: ['admin']
    },
    {
      to: '/admin/users',
      label: 'Manajemen User',
      icon: <Users size={20} />,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

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
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>E</div>
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

        <div className={styles.userProfile}>
          <img 
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
            alt={profile?.full_name} 
            className={styles.avatar} 
          />
          <div className={styles.userInfo}>
            <h4 className={styles.userName}>{profile?.full_name || 'User'}</h4>
            <Badge 
              variant={profile?.role === 'admin' ? 'error' : profile?.role === 'guru' ? 'primary' : 'success'} 
              size="sm"
              glow
            >
              {profile?.role === 'admin' ? 'Admin/Kaprog' : profile?.role === 'guru' ? 'Guru AKL' : 'Siswa SMK'}
            </Badge>
          </div>
        </div>

        <nav className={styles.nav}>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

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
