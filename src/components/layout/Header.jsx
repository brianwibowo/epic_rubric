import React from 'react';
import { useUiStore } from '@/stores/uiStore';
import styles from './Header.module.css';
import { Menu, Bell } from 'lucide-react';
import HelpButton from '../ui/HelpButton';

const Header = ({ title = 'EPIC Platform', actions }) => {
  const { toggleSidebar } = useUiStore();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className={styles.title}>{title}</h1>
          <HelpButton size={20} />
        </div>
      </div>
      
      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
