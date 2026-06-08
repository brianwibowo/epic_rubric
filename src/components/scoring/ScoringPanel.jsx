import React from 'react';
import { EPIC_DIMENSIONS } from '@/utils/constants';
import LikertSelector from './LikertSelector';
import FeedbackTextBox from './FeedbackTextBox';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import styles from './ScoringPanel.module.css';

const ScoringPanel = ({
  dimensionCode, // 'E', 'P', 'I', 'C', 'PE'
  score,         // active integer score 1-4
  feedback,      // active feedback string
  weight,        // active weight decimal (0.2)
  onScoreChange, // callback
  onFeedbackChange, // callback
  disabled = false
}) => {
  const dimension = EPIC_DIMENSIONS[dimensionCode];
  const weightPercent = Math.round(weight * 100);

  return (
    <Card 
      variant="glass" 
      padding="md" 
      className={styles.panelCard} 
      style={{ '--dim-color': dimension.color }}
    >
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <span 
            className={styles.codeBadge} 
            style={{ backgroundColor: dimension.bgColor, color: dimension.textColor }}
          >
            {dimension.code}
          </span>
          <div className={styles.titleTexts}>
            <h3 className={styles.name}>{dimension.label}</h3>
            <p className={styles.desc}>{dimension.desc}</p>
          </div>
        </div>
        
        <div className={styles.weightBadgeWrapper}>
          <span className={styles.weightLabel}>Bobot</span>
          <Badge variant={dimensionCode.toLowerCase()} size="sm" glow>
            {weightPercent}%
          </Badge>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.selectorSection}>
          <span className={styles.sectionLabel}>Skor Penilaian</span>
          <LikertSelector
            dimensionCode={dimensionCode}
            selectedValue={score}
            onChange={onScoreChange}
            disabled={disabled}
            color={dimension.color}
          />
        </div>

        <div className={styles.feedbackSection}>
          <FeedbackTextBox
            dimensionCode={dimensionCode}
            score={score}
            value={feedback}
            onChange={onFeedbackChange}
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
};

export default ScoringPanel;
