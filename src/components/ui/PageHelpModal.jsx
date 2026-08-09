import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTourStore } from '@/stores/tourStore';
import { useAuthStore } from '@/stores/authStore';
import { getGuideByPath } from '@/utils/pageGuides';
import Modal from './Modal';
import Button from './Button';
import styles from './PageHelpModal.module.css';
import { 
  HelpCircle, Compass, CheckCircle2, Sparkles, 
  Lightbulb, ArrowRight, UserCheck, Shield
} from 'lucide-react';

const PageHelpModal = () => {
  const location = useLocation();
  const { profile } = useAuthStore();
  const { isHelpOpen, closeHelp, startTour } = useTourStore();

  const guide = getGuideByPath(location.pathname);
  const isDosen = profile?.role === 'dosen' || profile?.role === 'admin';

  if (!guide) return null;

  const handleStartTour = () => {
    if (guide.tourSteps && guide.tourSteps.length > 0) {
      startTour(guide.tourSteps);
    } else {
      closeHelp();
    }
  };

  return (
    <Modal
      isOpen={isHelpOpen}
      onClose={closeHelp}
      title={
        <div className={styles.titleWrap}>
          <div className={styles.titleIcon}>
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className={styles.modalTitle}>Panduan & Penjelasan Halaman</h3>
            <span className={styles.modalSubtitle}>{guide.title}</span>
          </div>
        </div>
      }
      size="lg"
    >
      <div className={styles.content}>
        {/* Overview Box */}
        <div className={styles.overviewBox}>
          <p className={styles.summary}>{guide.summary}</p>
        </div>

        {/* Key Features */}
        {guide.keyFeatures && guide.keyFeatures.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <CheckCircle2 size={16} className={styles.sectionIcon} />
              Fitur & Aksi Utama
            </h4>
            <ul className={styles.featureList}>
              {guide.keyFeatures.map((feat, idx) => (
                <li key={idx} className={styles.featureItem}>
                  <div className={styles.bulletDot} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Role Tip */}
        <div className={styles.tipBox}>
          <div className={styles.tipHeader}>
            <Lightbulb size={16} className={styles.tipIcon} />
            <span className={styles.tipTitle}>
              {isDosen ? 'Tips untuk Dosen / Pengampu' : 'Tips untuk Mahasiswa'}
            </span>
          </div>
          <p className={styles.tipText}>
            {isDosen ? guide.dosenTips : guide.mahasiswaTips}
          </p>
        </div>

        {/* Tour CTA */}
        {guide.tourSteps && guide.tourSteps.length > 0 && (
          <div className={styles.tourCtaCard}>
            <div>
              <h5 className={styles.tourCtaTitle}>Guided Feature Tour</h5>
              <p className={styles.tourCtaDesc}>
                Jelajahi langkah-langkah penggunaan fitur halaman ini secara interaktif.
              </p>
            </div>
            <Button variant="epic" size="sm" onClick={handleStartTour}>
              <Compass size={16} /> Mulai Tour ({guide.tourSteps.length} Langkah)
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PageHelpModal;
