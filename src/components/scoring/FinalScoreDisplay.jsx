import React from 'react';
import { getGradeInfo } from '@/utils/gradeHelper';
import styles from './FinalScoreDisplay.module.css';

const FinalScoreDisplay = ({ score, kkm = 60 }) => {
  const gradeInfo = getGradeInfo(score);
  const isPassed = score !== null && score > 50;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Hasil Nilai Akhir</h4>
      
      <div className={styles.displayRow}>
        <div className={styles.scoreCircle} style={{ borderColor: gradeInfo.color }}>
          <span className={styles.scoreVal}>{score !== null ? score : '-'}</span>
          <span className={styles.maxScore}>/ 100</span>
        </div>

        <div className={styles.meta}>
          <div className={styles.gradeRow}>
            <span className={styles.gradeLabel}>Predikat:</span>
            <span className={styles.gradeLetter} style={{ color: gradeInfo.color }}>
              {gradeInfo.letter}
            </span>
          </div>
          <p className={styles.gradeDesc}>{gradeInfo.desc}</p>
          
          {score !== null && (
            <div className={`${styles.statusBadge} ${isPassed ? styles.passed : styles.remedial}`}>
              {isPassed ? 'LULUS KKM' : 'REMEDIAL'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalScoreDisplay;
