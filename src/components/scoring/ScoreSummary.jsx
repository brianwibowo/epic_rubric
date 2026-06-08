import React from 'react';
import { EPIC_DIMENSIONS } from '@/utils/constants';
import styles from './ScoreSummary.module.css';

const ScoreSummary = ({ scores }) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Ringkasan Skor EPIC</h4>
      <div className={styles.barsList}>
        {Object.keys(EPIC_DIMENSIONS).map((key) => {
          const dimension = EPIC_DIMENSIONS[key];
          const score = scores[key];
          
          // Map score 1-4 to percentages: 1=25%, 2=50%, 3=75%, 4=100%
          const percent = score ? score * 25 : 0;

          return (
            <div key={key} className={styles.barRow} style={{ '--dim-color': dimension.color }}>
              <div className={styles.meta}>
                <span className={styles.label}>{dimension.label} ({dimension.code})</span>
                <span className={styles.value}>
                  {score ? `${score} / 4` : 'Belum diisi'}
                </span>
              </div>
              <div className={styles.track}>
                <div 
                  className={styles.fill} 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreSummary;
