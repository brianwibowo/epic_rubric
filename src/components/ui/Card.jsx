import React from 'react';
import styles from './Card.module.css';

const Card = React.forwardRef(({
  children,
  className = '',
  variant = 'glass', // glass, solid, transparent
  hoverable = false,
  padding = 'md',    // none, sm, md, lg
  onClick,
  ...props
}, ref) => {
  const isClickable = !!onClick;

  return (
    <div
      ref={ref}
      className={`
        ${styles.card}
        ${styles[variant]}
        ${styles[`p-${padding}`]}
        ${hoverable ? styles.hoverable : ''}
        ${isClickable ? styles.clickable : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
