import React from 'react';
import styles from './Button.module.css';
import Spinner from './Spinner';

const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary', // primary, secondary, outline, ghost, danger, epic, link
  size = 'md',        // sm, md, lg
  isLoading = false,
  disabled = false,
  iconLeft,
  iconRight,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      className={`
        ${styles.btn}
        ${styles[variant]}
        ${styles[size]}
        ${isLoading ? styles.loading : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinnerWrapper}>
          <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} />
        </span>
      )}
      {!isLoading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
