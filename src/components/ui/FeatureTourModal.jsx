import React from 'react';
import { useTourStore } from '@/stores/tourStore';
import Button from './Button';
import styles from './FeatureTourModal.module.css';
import { 
  Sparkles, ChevronLeft, ChevronRight, X, 
  Compass, CheckCircle2 
} from 'lucide-react';

const FeatureTourModal = () => {
  const { isTourActive, currentStepIndex, tourSteps, nextStep, prevStep, endTour } = useTourStore();

  if (!isTourActive || !tourSteps || tourSteps.length === 0) return null;

  const currentStep = tourSteps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === tourSteps.length - 1;
  const progressPct = ((currentStepIndex + 1) / tourSteps.length) * 100;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.tourCard} animate-scale-in`}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTitleRow}>
            <div className={styles.iconWrap}>
              <Sparkles size={18} />
            </div>
            <div className={styles.stepBadge}>
              Langkah {currentStepIndex + 1} dari {tourSteps.length}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={endTour} aria-label="Tutup Tour">
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <h3 className={styles.stepTitle}>{currentStep.title}</h3>
          <p className={styles.stepDesc}>{currentStep.description}</p>
        </div>

        {/* Footer Actions */}
        <div className={styles.cardFooter}>
          <button className={styles.skipBtn} onClick={endTour}>
            Lewati Tour
          </button>

          <div className={styles.navBtns}>
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ChevronLeft size={14} /> Sebelumnya
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={nextStep}>
              {isLast ? (
                <>
                  <CheckCircle2 size={14} /> Selesai
                </>
              ) : (
                <>
                  Lanjut <ChevronRight size={14} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTourModal;
