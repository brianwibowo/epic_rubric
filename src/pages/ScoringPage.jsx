import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import { getDimensionColor, LIKERT_SCALE } from '@/utils/constants';
import { calculateRawScore } from '@/utils/scoringEngine';
import styles from './ScoringPage.module.css';
import { 
  ArrowLeft, Save, Send, ChevronLeft, ChevronRight, 
  User, CheckCircle2, Star, MessageSquare
} from 'lucide-react';

const DEFAULT_DIMENSIONS = [
  { code: 'E', name: 'Evaluative Understanding', weight: 0.30, feedback_1: 'Belum mampu mengevaluasi data akuntansi.', feedback_2: 'Dapat mengevaluasi data dasar namun analisis masih dangkal.', feedback_3: 'Mampu mengevaluasi dengan baik sesuai SAK.', feedback_4: 'Evaluasi sangat mendalam dan kritis.' },
  { code: 'P', name: 'Predictive Reasoning', weight: 0.30, feedback_1: 'Tidak dapat memprediksi dampak transaksi.', feedback_2: 'Prediksi dasar namun belum konsisten.', feedback_3: 'Prediksi tepat dan logis.', feedback_4: 'Mampu memprediksi skenario kompleks.' },
  { code: 'I', name: 'Intelligent Application', weight: 0.20, feedback_1: 'Penerapan belum sesuai konteks.', feedback_2: 'Penerapan dasar dengan beberapa error.', feedback_3: 'Penerapan baik dan terstruktur.', feedback_4: 'Penerapan kreatif dan efisien.' },
  { code: 'C', name: 'Critical Reflection', weight: 0.20, feedback_1: 'Belum menunjukkan refleksi kritis.', feedback_2: 'Refleksi ada namun kurang mendalam.', feedback_3: 'Refleksi kritis dan relevan.', feedback_4: 'Refleksi sangat tajam dan membangun.' },
];

const ScoringPage = () => {
  const { mkId, komponenId: paramKomponenId } = useParams();
  const [searchParams] = useSearchParams();
  const targetStudentId = searchParams.get('studentId');
  const navigate = useNavigate();
  const { getMKById, updateMK } = useMKStore();
  const { rubrics } = useRubricStore();
  const { addToast } = useUiStore();
  const { addNotification } = useNotificationStore();

  const mk = getMKById(mkId);
  const students = mk?.students || [];
  const komponenList = mk?.komponen?.length > 0 
    ? mk.komponen 
    : [
        { id: 'k1', name: 'Proyek', bobot: 0.25, rubricId: 'r1' },
        { id: 'k2', name: 'Partisipasi Kelas', bobot: 0.10, rubricId: 'r2' },
        { id: 'k3', name: 'Quiz', bobot: 0.15, rubricId: 'r2' },
        { id: 'k4', name: 'Tugas', bobot: 0.15, rubricId: 'r1' },
        { id: 'k5', name: 'UTS', bobot: 0.15, rubricId: 'r3' },
        { id: 'k6', name: 'UAS', bobot: 0.20, rubricId: 'r3' },
      ];

  const initialKompId = paramKomponenId || komponenList.find(k => k.rubricId)?.id || komponenList[0]?.id;
  const [activeKomponenId, setActiveKomponenId] = useState(initialKompId);

  const activeKomponen = komponenList.find(k => k.id === activeKomponenId) || komponenList[0];
  
  // Find rubric dimensions from rubricStore, fallback to defaults
  const assignedRubric = rubrics.find(r => r.id === activeKomponen.rubricId);
  const dimensions = assignedRubric?.dimensions?.length > 0 ? assignedRubric.dimensions : DEFAULT_DIMENSIONS;

  // Build student nav list
  const studentNav = students.length > 0 
    ? students.map(s => ({
        id: s.id || s.student_id,
        name: s.full_name || s.name || 'Mahasiswa',
        scored: !!(mk?.scoringData?.[s.id || s.student_id]?.[activeKomponen.id])
      }))
    : [
        { id: 's1', name: 'Feri Irawan', scored: false },
        { id: 's2', name: 'Rina Permata Sari', scored: false },
        { id: 's3', name: 'Andi Prasetyo', scored: false },
      ];

  const initialIdx = targetStudentId 
    ? Math.max(0, studentNav.findIndex(s => s.id === targetStudentId))
    : 0;

  const [currentStudentIdx, setCurrentStudentIdx] = useState(initialIdx);
  const currentStudent = studentNav[currentStudentIdx];

  // Load saved scores for current student + active komponen
  const savedScores = mk?.scoringData?.[currentStudent?.id]?.[activeKomponen.id] || {};
  const [scores, setScores] = useState(savedScores.scores || {});
  const [feedback, setFeedback] = useState(savedScores.feedbacks || {});
  const [status, setStatus] = useState(savedScores.status || 'DRAFT');
  const [isSaving, setIsSaving] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  // Synchronize state when student or active komponen changes
  React.useEffect(() => {
    const saved = mk?.scoringData?.[currentStudent?.id]?.[activeKomponen?.id] || {};
    setScores(saved.scores || {});
    setFeedback(saved.feedbacks || {});
    setStatus(saved.status || 'DRAFT');
    setIsDirty(false);
  }, [currentStudentIdx, activeKomponenId, mk?.scoringData]);

  const autoSaveIfDirty = () => {
    if (isDirty && currentStudent?.id && activeKomponen?.id) {
      const existingScoringData = mk?.scoringData || {};
      const studentScoringData = existingScoringData[currentStudent.id] || {};
      const updatedScoringData = {
        ...existingScoringData,
        [currentStudent.id]: {
          ...studentScoringData,
          [activeKomponen.id]: {
            scores: { ...scores },
            feedbacks: { ...feedback },
            rawScore: calculateRawScore(scores, dimensions),
            status: status || 'DRAFT',
            updatedAt: new Date().toISOString()
          }
        }
      };
      updateMK(mkId, { scoringData: updatedScoringData });
      setIsDirty(false);
      addToast(`Draft nilai ${currentStudent.name} tersimpan otomatis.`, 'info');
    }
  };

  const switchToStudent = (idx) => {
    autoSaveIfDirty();
    setCurrentStudentIdx(idx);
  };

  const switchToKomponen = (kompId) => {
    autoSaveIfDirty();
    setActiveKomponenId(kompId);
  };

  const setScore = (dimCode, value) => {
    setScores(prev => ({ ...prev, [dimCode]: value }));
    setIsDirty(true);
    const dim = dimensions.find(d => d.code === dimCode);
    if (dim) {
      const templateKey = `feedback_${value}`;
      const currentFb = feedback[dimCode] || '';
      const allTemplates = [dim.feedback_1, dim.feedback_2, dim.feedback_3, dim.feedback_4].filter(Boolean);
      if (!currentFb || allTemplates.includes(currentFb)) {
        setFeedback(prev => ({ ...prev, [dimCode]: dim[templateKey] || '' }));
      }
    }
  };

  const setFeedbackText = (dimCode, text) => {
    setFeedback(prev => ({ ...prev, [dimCode]: text }));
    setIsDirty(true);
  };

  const rawScore = useMemo(() => 
    calculateRawScore(scores, dimensions), 
    [scores, dimensions]
  );

  const allScored = dimensions.every(d => scores[d.code] !== undefined);

  const handleSave = async (newStatus = 'DRAFT') => {
    if (newStatus === 'PUBLISHED' && !allScored) {
      addToast('Harap lengkapi nilai seluruh 4 dimensi EPIC sebelum mempublikasikan!', 'warning');
      return;
    }

    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));

    // Persist scoring data into mkStore
    const existingScoringData = mk?.scoringData || {};
    const studentScoringData = existingScoringData[currentStudent.id] || {};
    
    const updatedScoringData = {
      ...existingScoringData,
      [currentStudent.id]: {
        ...studentScoringData,
        [activeKomponen.id]: {
          scores: { ...scores },
          feedbacks: { ...feedback },
          rawScore: rawScore,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      }
    };

    updateMK(mkId, { scoringData: updatedScoringData });
    setStatus(newStatus);
    setIsDirty(false);
    setIsSaving(false);
    
    if (newStatus === 'PUBLISHED') {
      addNotification({
        type: 'SCORE_PUBLISHED',
        title: `Nilai ${activeKomponen.name} Dipublikasikan`,
        message: `Dosen telah mempublikasikan nilai ${activeKomponen.name} untuk ${currentStudent.name}.`,
        mkId: mkId,
        mkName: mk?.name || 'Mata Kuliah'
      });
      addToast(`Nilai ${currentStudent.name} berhasil dipublikasikan!`, 'success');
    } else {
      addToast(`Draft nilai ${currentStudent.name} tersimpan.`, 'info');
    }
  };

  const goToPrevStudent = () => {
    if (currentStudentIdx > 0) switchToStudent(currentStudentIdx - 1);
  };

  const goToNextStudent = () => {
    if (currentStudentIdx < studentNav.length - 1) switchToStudent(currentStudentIdx + 1);
  };

  if (!currentStudent) {
    return (
      <div className={styles.page}>
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>Mahasiswa Tidak Ditemukan</h2>
          <p style={{ margin: '12px 0 20px', color: 'var(--text-secondary)' }}>
            Mahasiswa tidak ditemukan atau telah keluar dari mata kuliah ini.
          </p>
          <Button variant="primary" onClick={() => navigate(`/mk/${mkId}/students`)}>
            Kembali ke Daftar Mahasiswa
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(`/mk/${mkId}/komponen`)}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className={styles.topBarCenter}>
          <Badge variant="primary" size="sm">{activeKomponen.name}</Badge>
          <span className={styles.topBarBobot}>Bobot: {((activeKomponen.bobot || 0) * 100).toFixed(0)}%</span>
        </div>
        <div className={styles.topBarActions}>
          <HelpButton size={20} />
          <Button variant="outline" size="sm" onClick={() => handleSave('DRAFT')} isLoading={isSaving && status === 'DRAFT'}>
            <Save size={14} /> Simpan Draft
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleSave('PUBLISHED')} disabled={!allScored} isLoading={isSaving && status === 'PUBLISHED'}>
            <Send size={14} /> Publikasikan
          </Button>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Student Navigation Sidebar */}
        <div className={styles.studentNav}>
          <h4 className={styles.studentNavTitle}>Mahasiswa</h4>
          <div className={styles.studentList}>
            {studentNav.map((s, i) => (
              <button
                key={s.id}
                className={`${styles.studentItem} ${i === currentStudentIdx ? styles.activeStu : ''}`}
                onClick={() => switchToStudent(i)}
              >
                <div className={styles.studentItemAvatar}>{s.name.charAt(0)}</div>
                <span className={styles.studentItemName}>{s.name}</span>
                {s.scored && <CheckCircle2 size={14} className={styles.scoredIcon} />}
              </button>
            ))}
          </div>
        </div>

        {/* Scoring Area */}
        <div className={styles.scoringArea}>
          {/* Komponen Switcher Tabs */}
          <div className={styles.komponenTabsBar} style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
            {komponenList.map((k) => {
              const isActive = k.id === activeKomponen.id;
              const hasRubric = !!k.rubricId;
              const kompScoring = mk?.scoringData?.[currentStudent?.id]?.[k.id];
              const isScored = !!(kompScoring?.scores && Object.keys(kompScoring.scores).length > 0);

              let bg = 'var(--bg-card)';
              let border = '1px solid var(--border-color)';
              let color = 'var(--text-secondary)';
              let fontWeight = 500;
              let iconColor = '#059669';

              if (isActive && isScored) {
                bg = 'linear-gradient(135deg, #059669, #047857)';
                border = '2px solid #065f46';
                color = '#ffffff';
                fontWeight = 700;
                iconColor = '#ffffff';
              } else if (isScored) {
                bg = 'linear-gradient(135deg, #10b981, #059669)';
                border = '1px solid #047857';
                color = '#ffffff';
                fontWeight = 600;
                iconColor = '#ffffff';
              } else if (isActive) {
                bg = 'rgba(5, 150, 105, 0.12)';
                border = '2.5px solid #059669';
                color = '#047857';
                fontWeight = 700;
              }

              return (
                <button
                  key={k.id}
                  onClick={() => switchToKomponen(k.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border,
                    background: bg,
                    color,
                    fontWeight,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isScored ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isScored && <CheckCircle2 size={14} style={{ color: iconColor }} />}
                  <span>{k.name}</span>
                  <span style={{ fontSize: '11px', opacity: isScored ? 0.95 : 0.8 }}>({((k.bobot || 0) * 100).toFixed(0)}%)</span>
                </button>
              );
            })}
          </div>

          {/* Student Header */}
          <div className={styles.studentHeader}>
            <div className={styles.studentHeaderLeft}>
              <div className={styles.studentAvatar}>
                <User size={22} />
              </div>
              <div>
                <h2 className={styles.studentName}>{currentStudent.name}</h2>
                <div className={styles.studentNavBtns}>
                  <button className={styles.navBtn} disabled={currentStudentIdx === 0} onClick={goToPrevStudent}>
                    <ChevronLeft size={14} /> Sebelumnya
                  </button>
                  <span className={styles.navCounter}>{currentStudentIdx + 1} / {studentNav.length}</span>
                  <button className={styles.navBtn} disabled={currentStudentIdx === studentNav.length - 1} onClick={goToNextStudent}>
                    Selanjutnya <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
            {rawScore !== null && (
              <div className={styles.scorePreview}>
                <span className={styles.scorePreviewLabel}>Skor Mentah ({activeKomponen.name})</span>
                <span className={styles.scorePreviewValue}>{rawScore}</span>
              </div>
            )}
          </div>

          {/* Dimension Cards */}
          <div className={styles.dimensionList}>
            {dimensions.map((dim, di) => {
              const color = getDimensionColor(di);
              const currentScore = scores[dim.code];
              return (
                <div 
                  key={dim.code} 
                  className={styles.dimCard}
                  style={{ borderLeftColor: color.hex }}
                >
                  <div className={styles.dimHeader}>
                    <div className={styles.dimHeaderLeft}>
                      <span className={styles.dimCode} style={{ color: color.hex, background: color.bg }}>
                        {dim.code}
                      </span>
                      <div>
                        <h4 className={styles.dimName}>{dim.name}</h4>
                        <span className={styles.dimWeight}>Bobot: {(dim.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {currentScore && (
                      <div className={styles.dimScoreChip} style={{ color: color.hex, background: color.bg }}>
                        <Star size={12} /> {currentScore}/4
                      </div>
                    )}
                  </div>

                  {/* Likert Scale Buttons */}
                  <div className={styles.likertRow}>
                    {[1, 2, 3, 4].map(score => (
                      <button
                        key={score}
                        className={`${styles.likertBtn} ${currentScore === score ? styles.likertActive : ''}`}
                        style={currentScore === score ? { 
                          borderColor: color.hex, 
                          background: color.bg,
                          color: color.hex 
                        } : {}}
                        onClick={() => setScore(dim.code, score)}
                      >
                        <span className={styles.likertScore}>{score}</span>
                        <span className={styles.likertLabel}>{LIKERT_SCALE[score].title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className={styles.feedbackWrap}>
                    <div className={styles.feedbackHeader}>
                      <MessageSquare size={13} />
                      <span>Feedback</span>
                    </div>
                    <textarea
                      className={styles.feedbackInput}
                      placeholder="Tulis feedback untuk dimensi ini..."
                      value={feedback[dim.code] || ''}
                      onChange={(e) => setFeedbackText(dim.code, e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Auto-Advance Bar */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Button variant="outline" size="sm" onClick={goToPrevStudent} disabled={currentStudentIdx === 0}>
              <ChevronLeft size={14} /> Mahasiswa Sebelumnya
            </Button>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                variant="primary" 
                size="md" 
                onClick={async () => {
                  await handleSave('PUBLISHED');
                  if (currentStudentIdx < studentNav.length - 1) {
                    goToNextStudent();
                  }
                }}
                disabled={!allScored}
              >
                <Send size={15} /> Simpan & Lanjut ke Mahasiswa Berikutnya <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPage;
