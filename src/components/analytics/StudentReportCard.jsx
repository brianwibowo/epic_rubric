import React from 'react';
import { EPIC_DIMENSIONS } from '@/utils/constants';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import styles from './StudentReportCard.module.css';
import { AlertCircle, User, FileText, Calendar, Award } from 'lucide-react';

const StudentReportCard = ({
  student,
  projectName,
  classId,
  scores = {},
  feedbacks = {},
  weights = {},
  finalScore,
  focusAreaCode,
  dateEvaluated
}) => {
  const getGradeInfo = (val) => {
    if (val === null || val === undefined) return { letter: '-', desc: 'N/A', color: 'var(--text-muted)' };
    if (val >= 85) return { letter: 'A', desc: 'Sangat Baik (Professional)', color: 'var(--color-success)' };
    if (val >= 75) return { letter: 'B', desc: 'Baik (Kompeten)', color: 'var(--color-primary)' };
    if (val >= 60) return { letter: 'C', desc: 'Cukup', color: 'var(--color-warning)' };
    return { letter: 'D', desc: 'Kurang (Perlu Remedial)', color: 'var(--color-error)' };
  };

  const gradeInfo = getGradeInfo(finalScore);
  const formattedDate = dateEvaluated 
    ? new Date(dateEvaluated).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';

  return (
    <Card variant="glass" padding="lg" className={styles.reportCard}>
      {/* Rapor Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>Rapor Hasil Evaluasi Praktikum</h2>
          <p className={styles.subTitle}>EPIC e-Rubric Assessment Platform</p>
        </div>
        <div className={styles.badgeWrapper}>
          <Badge variant="epic" size="md" glow>
            Sertifikat Kompetensi
          </Badge>
        </div>
      </div>

      {/* Meta Student Info */}
      <div className={styles.studentMeta}>
        <div className={styles.metaCol}>
          <div className={styles.metaItem}>
            <User size={16} className={styles.icon} />
            <span className={styles.metaLabel}>Nama Siswa:</span>
            <span className={styles.metaVal}>{student?.full_name}</span>
          </div>
          <div className={styles.metaItem}>
            <Award size={16} className={styles.icon} />
            <span className={styles.metaLabel}>NISN:</span>
            <span className={styles.metaVal}>{student?.nisn || '-'}</span>
          </div>
        </div>
        <div className={styles.metaCol}>
          <div className={styles.metaItem}>
            <Calendar size={16} className={styles.icon} />
            <span className={styles.metaLabel}>Kelas / TA:</span>
            <span className={styles.metaVal}>{classId} / 2025/2026</span>
          </div>
          <div className={styles.metaItem}>
            <FileText size={16} className={styles.icon} />
            <span className={styles.metaLabel}>Proyek Praktikum:</span>
            <span className={styles.metaVal}>{projectName}</span>
          </div>
        </div>
      </div>

      {/* Score Grid summary */}
      <div className={styles.outcomeRow}>
        <div className={styles.finalScoreCircle} style={{ borderColor: gradeInfo.color }}>
          <span className={styles.scoreNum}>{finalScore}</span>
          <span className={styles.scoreMax}>/ 100</span>
        </div>
        <div className={styles.outcomeMeta}>
          <div className={styles.gradeDisplay}>
            <span>Predikat Kelulusan:</span>
            <span className={styles.gradeLetter} style={{ color: gradeInfo.color }}>{gradeInfo.letter}</span>
          </div>
          <p className={styles.gradeLabelDesc}>{gradeInfo.desc}</p>
          <div className={styles.dateLabel}>Tanggal Penilaian: {formattedDate}</div>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Rincian Dimensi EPIC */}
      <div className={styles.dimensionsSection}>
        <h3 className={styles.sectionTitle}>Rincian Capaian Aspek EPIC</h3>
        
        <div className={styles.dimensionsList}>
          {Object.keys(EPIC_DIMENSIONS).map((key) => {
            const dim = EPIC_DIMENSIONS[key];
            const score = scores[key];
            const feedbackText = feedbacks[key];
            const weightPercent = Math.round((weights[key] || 0) * 100);

            return (
              <div key={key} className={styles.dimRow} style={{ '--dim-color': dim.color }}>
                <div className={styles.dimHeader}>
                  <div className={styles.dimBadgeTitle}>
                    <span className={styles.dimBadge} style={{ backgroundColor: dim.bgColor, color: dim.textColor }}>
                      {dim.code}
                    </span>
                    <span className={styles.dimName}>{dim.label}</span>
                    <span className={styles.dimWeight}>(Bobot {weightPercent}%)</span>
                  </div>
                  
                  <Badge variant={key.toLowerCase()} size="sm">
                    Skor: {score ? `${score} / 4` : 'N/A'}
                  </Badge>
                </div>
                
                {feedbackText ? (
                  <p className={styles.dimFeedback}>{feedbackText}</p>
                ) : (
                  <p className={styles.noFeedback}>Tidak ada catatan untuk aspek ini.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fokus Perbaikan Card */}
      {focusAreaCode && EPIC_DIMENSIONS[focusAreaCode] && (
        <div className={styles.focusContainer} style={{ '--dim-color': EPIC_DIMENSIONS[focusAreaCode].color }}>
          <div className={styles.focusHeader}>
            <AlertCircle size={18} className={styles.focusIcon} />
            <h4>Rekomendasi Area Pengembangan</h4>
          </div>
          <p className={styles.focusDesc}>
            Berdasarkan matriks skor terendah, Anda disarankan memberikan fokus pengulangan materi pada dimensi **{EPIC_DIMENSIONS[focusAreaCode].label} ({focusAreaCode})**: <em>{EPIC_DIMENSIONS[focusAreaCode].desc}</em>
          </p>
        </div>
      )}
    </Card>
  );
};

export default StudentReportCard;
