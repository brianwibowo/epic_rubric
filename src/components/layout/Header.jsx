import React from 'react';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import styles from './Header.module.css';
import { Menu, Bell } from 'lucide-react';
import Badge from '../ui/Badge';

const Header = ({ title = 'EPIC Platform', actions }) => {
  const { toggleSidebar } = useUiStore();
  const { isMock } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.menuBtn} 
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.right}>
        {isMock && (
          <Badge variant="warning" size="sm" className={styles.mockBadge} glow>
            Mode Demo / Simulasi
          </Badge>
        )}
        {actions && <div className={styles.actions}>{actions}</div>}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
