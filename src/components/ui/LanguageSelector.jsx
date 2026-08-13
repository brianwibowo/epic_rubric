import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { ChevronDown } from 'lucide-react';
import styles from './LanguageSelector.module.css';

const LanguageSelector = ({ variant = 'default', compact = false, className = '' }) => {
  const { lang, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        className={`${styles.compactBtn} ${className}`}
        onClick={() => setLanguage(lang === 'id' ? 'en' : 'id')}
        title={lang === 'id' ? "Switch to English (US)" : "Ganti ke Bahasa Indonesia"}
      >
        <span className={styles.flag}>{lang === 'id' ? '🇮🇩' : '🇺🇸'}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`${styles.dropdownContainer} ${className}`} ref={dropdownRef}>
        <button
          type="button"
          className={styles.dropdownTrigger}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={styles.flag}>{lang === 'id' ? '🇮🇩' : '🇺🇸'}</span>
          <span className={styles.dropdownLangText}>{lang === 'id' ? 'ID' : 'EN'}</span>
          <ChevronDown size={12} className={`${styles.dropdownArrow} ${isOpen ? styles.open : ''}`} />
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            <button
              type="button"
              className={`${styles.dropdownItem} ${lang === 'id' ? styles.activeItem : ''}`}
              onClick={() => {
                setLanguage('id');
                setIsOpen(false);
              }}
            >
              <span className={styles.flag}>🇮🇩</span>
              <span>Bahasa Indonesia</span>
            </button>
            <button
              type="button"
              className={`${styles.dropdownItem} ${lang === 'en' ? styles.activeItem : ''}`}
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
            >
              <span className={styles.flag}>🇺🇸</span>
              <span>English (US)</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.selectorWrap} ${styles[variant]} ${className}`}>
      <button
        type="button"
        className={`${styles.langBtn} ${lang === 'id' ? styles.active : ''}`}
        onClick={() => setLanguage('id')}
        title="Bahasa Indonesia"
      >
        <span className={styles.flag}>🇮🇩</span>
        <span className={styles.label}>ID</span>
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        className={`${styles.langBtn} ${lang === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        title="English (US)"
      >
        <span className={styles.flag}>🇺🇸</span>
        <span className={styles.label}>EN</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
