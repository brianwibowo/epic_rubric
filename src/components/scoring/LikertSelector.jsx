import React from 'react';
import { LIKERT_LABELS } from '@/utils/constants';
import styles from './LikertSelector.module.css';

const LikertSelector = ({
  dimensionCode, // 'E', 'P', 'I', 'C', 'PE'
  selectedValue, // integer 1-4 or null
  onChange,      // triggers with selected integer 1-4
  disabled = false,
  color = 'var(--color-primary)'
}) => {
  return (
    <div className={styles.wrapper} style={{ '--dim-color': color }}>
      <div className={styles.chipsContainer}>
        {[1, 2, 3, 4].map((score) => {
          const isSelected = selectedValue === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(score)}
              className={`
                ${styles.chip}
                ${styles[`score-${score}`]}
                ${isSelected ? styles.selected : ''}
              `}
            >
              <span className={styles.scoreNumber}>{score}</span>
              <span className={styles.scoreTitle}>{LIKERT_LABELS[score].title}</span>
            </button>
          );
        })}
      </div>
      
      {selectedValue && (
        <div className={`${styles.descriptionBox} animate-fade-in`}>
          <p className={styles.descriptionText}>
            <strong>Kriteria:</strong> {LIKERT_LABELS[selectedValue].desc}
          </p>
        </div>
      )}
    </div>
  );
};

export default LikertSelector;
