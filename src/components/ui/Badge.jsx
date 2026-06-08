import React from 'react';
import styles from './Badge.module.css';

const Badge = ({
  children,
  variant = 'primary', // primary, success, warning, error, info, epic, and dimension codes
  size = 'md',        // sm, md
  glow = false,
  className = ''
}) => {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[variant]}
        ${styles[size]}
        ${glow ? styles.glow : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
