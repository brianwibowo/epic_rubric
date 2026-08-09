import React from 'react';
import { useTourStore } from '@/stores/tourStore';
import { HelpCircle } from 'lucide-react';
import styles from './HelpButton.module.css';

/**
 * Reusable inline ? Icon Button for headers on every page.
 */
const HelpButton = ({ className = '', size = 20 }) => {
  const { openHelp } = useTourStore();

  return (
    <button
      className={`${styles.helpBtn} ${className}`}
      onClick={openHelp}
      aria-label="Panduan & Penjelasan Halaman"
      title="Panduan Halaman (?)"
      type="button"
    >
      <HelpCircle size={size} />
    </button>
  );
};

export default HelpButton;
