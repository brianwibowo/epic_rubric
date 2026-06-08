import React from 'react';
import { getFeedbackTemplate } from '@/utils/feedbackTemplates';
import styles from './FeedbackTextBox.module.css';
import Badge from '../ui/Badge';
import { PenTool, CheckCircle } from 'lucide-react';

const FeedbackTextBox = ({
  dimensionCode,  // 'E', 'P', 'I', 'C', 'PE'
  score,          // active score
  value,          // current text
  onChange,       // triggers on input change
  disabled = false
}) => {
  const charCount = value ? value.length : 0;
  
  // Calculate if the feedback is custom or matches template
  const defaultTemplate = score ? getFeedbackTemplate(dimensionCode, score) : '';
  const isCustomized = value !== '' && value !== defaultTemplate;

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.label}>Catatan Evaluasi / Saran Guru</span>
        {score && value && (
          <Badge 
            variant={isCustomized ? 'warning' : 'primary'} 
            size="sm" 
            className={styles.badge}
            glow
          >
            <span className={styles.badgeContent}>
              {isCustomized ? (
                <>
                  <PenTool size={10} />
                  <span>Kustom</span>
                </>
              ) : (
                <>
                  <CheckCircle size={10} />
                  <span>Template Otomatis</span>
                </>
              )}
            </span>
          </Badge>
        )}
      </div>

      <div className={styles.textareaWrapper}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !score}
          placeholder={score ? "Catatan guru untuk dimensi ini..." : "Pilih skor Likert di atas terlebih dahulu..."}
          className={`
            ${styles.textarea}
            ${!score ? styles.disabledTextarea : ''}
          `}
          rows={3}
        />
        {score && (
          <div className={styles.charCounter}>
            {charCount} karakter
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTextBox;
