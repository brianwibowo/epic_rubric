import React, { useState } from 'react';
import styles from './Input.module.css';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text', // text, password, email, number, select, textarea
  className = '',
  id,
  options = [],  // for select type: [{value, label}]
  rows = 4,      // for textarea
  iconLeft,
  iconRight,
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`
              ${styles.input}
              ${styles.textarea}
              ${hasError ? styles.inputError : ''}
              ${iconLeft ? styles.hasIconLeft : ''}
              ${iconRight ? styles.hasIconRight : ''}
            `}
            rows={rows}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`
              ${styles.input}
              ${styles.select}
              ${hasError ? styles.inputError : ''}
              ${iconLeft ? styles.hasIconLeft : ''}
              ${iconRight ? styles.hasIconRight : ''}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className={styles.option}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            disabled={disabled}
            className={`
              ${styles.input}
              ${hasError ? styles.inputError : ''}
              ${iconLeft ? styles.hasIconLeft : ''}
              ${(iconRight || isPassword) ? styles.hasIconRight : ''}
            `}
            {...props}
          />
        )}
        
        {isPassword && !iconRight && (
          <button
            type="button"
            className={styles.passwordToggleBtn}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      
      {hasError && (
        <span className={`${styles.errorMessage} animate-fade-in`}>
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
