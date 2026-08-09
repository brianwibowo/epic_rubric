import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Reusable Skeleton Loader component with animated shimmer effect.
 * Props:
 * - variant: 'text' | 'title' | 'card' | 'circle' | 'table-row' | 'chart'
 * - width: string/number
 * - height: string/number
 * - count: number (renders N skeleton elements)
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style = {}
}) => {
  const elements = Array.from({ length: count }, (_, i) => i);

  if (variant === 'table-row') {
    return (
      <>
        {elements.map((key) => (
          <tr key={key} className={styles.tableRowSkeleton}>
            <td><div className={`${styles.skeleton} ${styles.text}`} style={{ width: '24px' }} /></td>
            <td><div className={`${styles.skeleton} ${styles.text}`} style={{ width: '80px' }} /></td>
            <td>
              <div className={styles.flexCell}>
                <div className={`${styles.skeleton} ${styles.circle}`} style={{ width: '32px', height: '32px' }} />
                <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '140px' }} />
              </div>
            </td>
            <td><div className={`${styles.skeleton} ${styles.text}`} style={{ width: '90px' }} /></td>
            <td><div className={`${styles.skeleton} ${styles.text}`} style={{ width: '44px' }} /></td>
            <td><div className={`${styles.skeleton} ${styles.text}`} style={{ width: '30px' }} /></td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {elements.map((key) => (
        <div
          key={key}
          className={`${styles.skeleton} ${styles[variant]} ${className}`}
          style={{
            width: width !== undefined ? width : undefined,
            height: height !== undefined ? height : undefined,
            ...style
          }}
        />
      ))}
    </>
  );
};

export default Skeleton;
