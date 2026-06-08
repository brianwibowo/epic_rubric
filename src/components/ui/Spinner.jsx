import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({
  size = 'md',      // sm, md, lg
  color = 'primary', // primary, white, muted
  className = ''
}) => {
  return (
    <div
      className={`
        ${styles.spinner}
        ${styles[size]}
        ${styles[color]}
        ${className}
      `}
    />
  );
};

export default Spinner;
