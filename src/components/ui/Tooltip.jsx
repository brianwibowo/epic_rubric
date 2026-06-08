import React, { useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({
  children,
  content,
  position = 'top', // top, bottom, left, right
  disabled = false,
  className = ''
}) => {
  const [active, setActive] = useState(false);

  const showTip = () => {
    if (!disabled && content) {
      setActive(true);
    }
  };

  const hideTip = () => {
    setActive(false);
  };

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && (
        <div className={`${styles.tooltipTip} ${styles[position]} animate-fade-in`}>
          <div className={styles.tooltipText}>{content}</div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
