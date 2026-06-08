import React from 'react';
import styles from './FinalScoreDisplay.module.css';

const FinalScoreDisplay = ({ score, kkm = 75 }) => {
  // Determine Grade Letter and description
  const getGradeInfo = (val) => {
    if (val === null || val === undefined) return { letter: '-', desc: 'Nilai belum lengkap', color: 'var(--text-muted)' };
    if (val >= 85) return { letter: 'A', desc: 'Sangat Baik (Professional)', color: 'var(--color-success)' };
    if (val >= 75) return { letter: 'B', desc: 'Baik (Kompeten)', color: 'var(--color-primary)' };
    if (val >= 60) return { letter: 'C', desc: 'Cukup', color: 'var(--color-warning)' };
    return { letter: 'D', desc: 'Kurang (Perlu Remedial)', color: 'var(--color-error)' };
  };

  const gradeInfo = getGradeInfo(score);
  const isPassed = score !== null && score >= kkm;

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
