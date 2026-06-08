import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({
  icon,
  title,
  description,
  action, // Reusable Button element
  className = ''
}) => {
  return (
    <div className={`${styles.emptyState} ${className} animate-fade-in`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
