import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className={styles.iconSuccess} size={18} />,
  warning: <AlertTriangle className={styles.iconWarning} size={18} />,
  error: <AlertCircle className={styles.iconError} size={18} />,
  info: <Info className={styles.iconInfo} size={18} />
};

const Toast = ({
  id,
  message,
  type = 'success', // success, warning, error, info
  duration = 4000,
  onClose
}) => {
  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]} animate-slide-up`}>
      <div className={styles.icon}>{icons[type]}</div>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeBtn} onClick={() => onClose(id)}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
