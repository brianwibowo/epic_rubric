import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import Modal from '@/components/ui/Modal';
import { getDimensionColor, LIKERT_SCALE } from '@/utils/constants';
import { calculateRawScore } from '@/utils/scoringEngine';
import { getKomponenCode, getKomponenFullName, getKomponenFormatted } from '@/utils/komponenHelper';
import styles from './ScoringPage.module.css';
import {
  ArrowLeft, Save, Send, ChevronLeft, ChevronRight,
  User, CheckCircle2, Star, MessageSquare, Check, RotateCw,
  Calculator, FileSpreadsheet, ShieldCheck, Sparkles, Info
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

  const isRekapTab = activeKomponenId === 'REKAP';
  const activeKomponen = komponenList.find(k => k.id === activeKomponenId) || komponenList[0];

  // Find rubric dimensions from rubricStore, fallback to defaults
  const assignedRubric = rubrics.find(r => r.id === activeKomponen?.rubricId);
  const dimensions = assignedRubric?.dimensions?.length > 0 ? assignedRubric.dimensions : DEFAULT_DIMENSIONS;

  // Build student nav list with progress calculation (Total Steps = Komponen + 1 Rekap/Publikasi)
  const studentNav = useMemo(() => {
    const totalSteps = komponenList.length + 1; // 6 Komponen + 1 Publikasi = 7 Steps Total
    const baseList = students.length > 0
      ? students.map(s => {
        const stuId = s.id || s.student_id;
        const stuScoring = mk?.scoringData?.[stuId] || {};
        let scoredKomponenCount = 0;
        let isPublished = false;

        komponenList.forEach(k => {
          if (stuScoring[k.id]?.scores && Object.keys(stuScoring[k.id].scores).length > 0) {
            scoredKomponenCount++;
          }
          if (stuScoring[k.id]?.status === 'PUBLISHED') {
            isPublished = true;
          }
        });

        // Total completed = scored components + (1 if published)
        const completedCount = scoredKomponenCount + (isPublished ? 1 : 0);
        const percent = Math.round((completedCount / totalSteps) * 100);

        return {
          id: stuId,
          name: s.full_name || s.name || 'Mahasiswa',
          nim: s.nim || '',
          completedCount,
          totalKomp: totalSteps,
          percent,
          isPublished
        };
      })
      : [
        { id: 's1', name: 'Feri Irawan', nim: '2024081001', completedCount: 7, totalKomp: totalSteps, percent: 100, isPublished: true },
        { id: 's2', name: 'Rina Permata Sari', nim: '2024081002', completedCount: 7, totalKomp: totalSteps, percent: 100, isPublished: true },
        { id: 's3', name: 'Andi Prasetyo', nim: '2024081003', completedCount: 4, totalKomp: totalSteps, percent: 57, isPublished: false },
      ];
    return baseList;
  }, [students, mk?.scoringData, komponenList]);

  const initialIdx = targetStudentId
    ? Math.max(0, studentNav.findIndex(s => s.id === targetStudentId))
    : 0;

  const [currentStudentIdx, setCurrentStudentIdx] = useState(initialIdx);
  const currentStudent = studentNav[currentStudentIdx];

  // Load saved scores for current student + active komponen
  const savedScores = mk?.scoringData?.[currentStudent?.id]?.[activeKomponen?.id] || {};
  const [scores, setScores] = useState(savedScores.scores || {});
  const [feedback, setFeedback] = useState(savedScores.feedbacks || {});
  const [status, setStatus] = useState(savedScores.status || 'DRAFT');
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save state: 'idle' | 'saving' | 'saved'
  const [autoSaveState, setAutoSaveState] = useState('idle');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const debounceTimerRef = useRef(null);

  // Synchronize state when student or active komponen changes
  useEffect(() => {
    if (!isRekapTab) {
      const saved = mk?.scoringData?.[currentStudent?.id]?.[activeKomponen?.id] || {};
      setScores(saved.scores || {});
      setFeedback(saved.feedbacks || {});
      setStatus(saved.status || 'DRAFT');
      setIsDirty(false);
      setAutoSaveState('idle');
    }
  }, [currentStudentIdx, activeKomponenId, mk?.scoringData, isRekapTab]);

  // Handle Auto-Save with 1.5s Debounce
  const executeAutoSave = (scoresToSave, feedbackToSave) => {
    if (!currentStudent?.id || !activeKomponen?.id || isRekapTab) return;

    setAutoSaveState('saving');

    setTimeout(() => {
      const raw = calculateRawScore(scoresToSave, dimensions);
      const existingScoringData = mk?.scoringData || {};
      const studentScoringData = existingScoringData[currentStudent.id] || {};

      const updatedScoringData = {
        ...existingScoringData,
        [currentStudent.id]: {
          ...studentScoringData,
          [activeKomponen.id]: {
            scores: { ...scoresToSave },
            feedbacks: { ...feedbackToSave },
            rawScore: raw,
            status: status || 'DRAFT',
            updatedAt: new Date().toISOString()
          }
        }
      };

      updateMK(mkId, { scoringData: updatedScoringData });
      setIsDirty(false);
      setAutoSaveState('saved');

      setTimeout(() => {
        setAutoSaveState('idle');
      }, 2500);
    }, 400);
  };

  const triggerDebouncedAutoSave = (newScores, newFeedback) => {
    setIsDirty(true);
    setAutoSaveState('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeAutoSave(newScores, newFeedback);
    }, 1500);
  };

  const autoSaveIfDirty = () => {
    if (isDirty && currentStudent?.id && activeKomponen?.id && !isRekapTab) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      executeAutoSave(scores, feedback);
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
    const newScores = { ...scores, [dimCode]: value };
    setScores(newScores);

    const dim = dimensions.find(d => d.code === dimCode);
    let newFeedback = { ...feedback };
    if (dim) {
      const templateKey = `feedback_${value}`;
      const currentFb = feedback[dimCode] || '';
      const allTemplates = [dim.feedback_1, dim.feedback_2, dim.feedback_3, dim.feedback_4].filter(Boolean);
      if (!currentFb || allTemplates.includes(currentFb)) {
        newFeedback[dimCode] = dim[templateKey] || '';
        setFeedback(newFeedback);
      }
    }

    triggerDebouncedAutoSave(newScores, newFeedback);
  };

  const setFeedbackText = (dimCode, text) => {
    const newFeedback = { ...feedback, [dimCode]: text };
    setFeedback(newFeedback);
    triggerDebouncedAutoSave(scores, newFeedback);
  };

  const rawScore = useMemo(() =>
    calculateRawScore(scores, dimensions),
    [scores, dimensions]
  );

  const allScored = dimensions.every(d => scores[d.code] !== undefined);

  // Rekap Data Calculation for currentStudent
  const studentRekap = useMemo(() => {
    if (!currentStudent?.id) return { items: [], finalScore: 0, grade: 'E', allCompleted: false };

    const stuScoring = mk?.scoringData?.[currentStudent.id] || {};
    let totalWeighted = 0;
    let totalBobot = 0;
    let completedCount = 0;

    const items = komponenList.map(k => {
      const sd = stuScoring[k.id];
      const raw = sd?.rawScore ?? null;
      const bobot = k.bobot || 0;
      totalBobot += bobot;

      let weighted = null;
      if (raw !== null) {
        weighted = Number((raw * bobot).toFixed(2));
        totalWeighted += raw * bobot;
        completedCount++;
      }

      return {
        id: k.id,
        name: k.name,
        bobot: bobot,
        rawScore: raw,
        weightedScore: weighted,
        isScored: raw !== null,
        status: sd?.status || 'DRAFT'
      };
    });

    const finalScore = Math.round(totalWeighted);
    let grade = 'E';
    if (finalScore >= 85) grade = 'A';
    else if (finalScore >= 75) grade = 'B';
    else if (finalScore >= 65) grade = 'C';
    else if (finalScore >= 50) grade = 'D';

    return {
      items,
      finalScore,
      grade,
      allCompleted: completedCount === komponenList.length,
      completedCount,
      totalKomponen: komponenList.length
    };
  }, [currentStudent?.id, komponenList, mk?.scoringData]);

  // Handle Publish Final Score in Rekap Tab
  const handlePublishFinalScore = () => {
    if (!studentRekap.allCompleted) {
      addToast('Harap selesaikan nilai seluruh komponen terlebih dahulu!', 'warning');
      return;
    }

    const existingScoringData = mk?.scoringData || {};
    const stuScoring = existingScoringData[currentStudent.id] || {};

    const updatedStuScoring = {};
    komponenList.forEach(k => {
      const prev = stuScoring[k.id] || {};
      updatedStuScoring[k.id] = {
        ...prev,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString()
      };
    });

    const updatedScoringData = {
      ...existingScoringData,
      [currentStudent.id]: updatedStuScoring
    };

    updateMK(mkId, { scoringData: updatedScoringData });

    addNotification({
      type: 'SCORE_PUBLISHED',
      title: `Nilai Akhir Dipublikasikan`,
      message: `Dosen telah mempublikasikan Nilai Akhir (${studentRekap.finalScore} - Grade ${studentRekap.grade}) untuk ${currentStudent.name}.`,
      mkId: mkId,
      mkName: mk?.name || 'Mata Kuliah'
    });

    addToast(`Nilai Akhir ${currentStudent.name} (${studentRekap.finalScore} - Grade ${studentRekap.grade}) berhasil dipublikasikan!`, 'success');
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
      {/* Top Bar Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(`/mk/${mkId}/students`)}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className={styles.topBarCenter}>
          {isRekapTab ? (
            <Badge variant="warning" size="sm">📊 REKAPITULASI NILAI AKHIR</Badge>
          ) : (
            <>
              <Badge variant="primary" size="sm">{getKomponenFormatted(activeKomponen.name)}</Badge>
              <span className={styles.topBarBobot}>Bobot: {((activeKomponen.bobot || 0) * 100).toFixed(0)}%</span>
            </>
          )}

          {/* Integrated Header Progress Badge */}
          <div className={styles.inlineHeaderProgress}>
            <span className={styles.progressTextInline}>
              Progress <strong>{currentStudent.name}</strong>: {currentStudent.completedCount}/{currentStudent.totalKomp} ({currentStudent.percent}%)
            </span>
          </div>
        </div>

        <div className={styles.topBarActions}>
          <HelpButton size={20} />

          {/* Auto-Save Indicator (Debounced) */}
          {!isRekapTab && (
            <div className={styles.autoSaveBadge}>
              {autoSaveState === 'saving' && (
                <span className={styles.autoSavingText}>
                  <RotateCw size={13} className={styles.spinIcon} /> Auto saving...
                </span>
              )}
              {autoSaveState === 'saved' && (
                <span className={styles.autoSavedText}>
                  <Check size={13} /> Tersimpan
                </span>
              )}
              {autoSaveState === 'idle' && (
                <button
                  className={styles.manualSaveBtn}
                  onClick={() => executeAutoSave(scores, feedback)}
                  title="Klik untuk simpan draft manual"
                >
                  <Save size={13} /> Simpan Draft
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Student Navigation Sidebar */}
        <div className={styles.studentNav}>
          <h4 className={styles.studentNavTitle}>Mahasiswa</h4>
          <div className={styles.studentList}>
            {studentNav.map((s, i) => {
              const isActive = i === currentStudentIdx;
              return (
                <button
                  key={s.id}
                  className={`${styles.studentItem} ${isActive ? styles.activeStu : ''}`}
                  onClick={() => switchToStudent(i)}
                >
                  <div className={styles.studentItemAvatar}>{s.name.charAt(0)}</div>
                  <div className={styles.studentItemContent}>
                    <span className={styles.studentItemName}>{s.name}</span>

                    {/* Mini Progress Bar replacing checkmark */}
                    <div className={styles.sidebarProgressRow}>
                      <div className={styles.sidebarTrack}>
                        <div
                          className={styles.sidebarFill}
                          style={{
                            width: `${s.percent}%`,
                            background: s.percent === 100
                              ? '#059669'
                              : s.percent > 0
                                ? '#2563eb'
                                : '#cbd5e1'
                          }}
                        />
                      </div>
                      <span className={styles.sidebarProgressText}>{s.completedCount}/{s.totalKomp}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scoring Area */}
        <div className={styles.scoringArea}>
          {/* Komponen Switcher Tabs + Rekap Tab */}
          <div className={styles.komponenTabsBar}>
            {komponenList.map((k) => {
              const isActive = k.id === activeKomponenId && !isRekapTab;
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
                  title={getKomponenFullName(k.name)}
                  className={styles.komponenTabBtn}
                  style={{
                    border,
                    background: bg,
                    color,
                    fontWeight
                  }}
                >
                  {isScored && <CheckCircle2 size={14} style={{ color: iconColor }} />}
                  <span style={{ fontWeight: 700 }}>{getKomponenCode(k.name)}</span>
                  <span style={{ fontSize: '11px', opacity: isScored ? 0.95 : 0.8 }}>({((k.bobot || 0) * 100).toFixed(0)}%)</span>
                </button>
              );
            })}

            {/* TAB REKAP BARU */}
            <button
              onClick={() => switchToKomponen('REKAP')}
              title="Lihat rekapitulasi nilai akhir dan publikasikan"
              className={`${styles.komponenTabBtn} ${styles.rekapTabBtn}`}
              style={{
                background: isRekapTab ? '#4f46e5' : 'rgba(79, 70, 229, 0.08)',
                color: isRekapTab ? '#ffffff' : '#4f46e5',
                border: isRekapTab ? '2px solid #4338ca' : '1px solid rgba(79, 70, 229, 0.3)',
                fontWeight: isRekapTab ? 700 : 600
              }}
            >
              <Calculator size={14} />
              <span>Rekap</span>
            </button>
          </div>

          {/* IS REKAP TAB VIEW (COMPACT ZERO-SCROLL VIEW) */}
          {isRekapTab ? (
            <div className={styles.rekapContainerCompact}>
              {/* Header Compact Card */}
              <div className={styles.rekapHeaderCardCompact}>
                <div className={styles.rekapHeaderLeft}>
                  <div className={styles.rekapAvatar}>
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className={styles.rekapStudentTitle}>{currentStudent.name}</h2>
                    <p className={styles.rekapStudentSubtitle}>
                      NIM: {currentStudent.nim || '-'} • Rekapitulasi Perhitungan Nilai Akhir
                    </p>
                  </div>
                </div>

                <div className={styles.finalScoreBadgeCardCompact}>
                  <span className={styles.finalScoreLabel}>NILAI AKHIR MK</span>
                  <div className={styles.finalScoreValueRow}>
                    <span className={styles.finalScoreNumber}>{studentRekap.finalScore}</span>
                    <Badge variant={studentRekap.finalScore >= 75 ? 'success' : 'warning'} size="sm">
                      GRADE {studentRekap.grade}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rekap Components Calculation Table with Formula Tooltip */}
              <div className={styles.rekapTableCardCompact}>
                <div className={styles.rekapTableTitleRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileSpreadsheet size={16} className={styles.rekapTableIcon} />
                    <h3>Rincian Perhitungan Per Komponen</h3>
                  </div>

                  {/* FORMULA MODAL TRIGGER IN TABLE HEADER TOP RIGHT */}
                  <button
                    className={styles.formulaTooltipWrap}
                    onClick={() => setShowFormulaModal(true)}
                    title="Klik untuk lihat detail rumus perhitungan"
                  >
                    <Info size={14} className={styles.formulaInfoIcon} />
                    <span>Rumus: Σ (Skor Mentah × Bobot)</span>
                  </button>
                </div>

                <table className={styles.rekapTableCompact}>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>KOMPONEN PENILAIAN</th>
                      <th>BOBOT (%)</th>
                      <th>SKOR MENTAH (1-100)</th>
                      <th>NILAI TERBOBOT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRekap.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{getKomponenFullName(item.name)}</strong>
                        </td>
                        <td>{(item.bobot * 100).toFixed(0)}%</td>
                        <td>
                          {item.isScored ? (
                            <span className={styles.rawScoreText}>{item.rawScore}</span>
                          ) : (
                            <span className={styles.unscoredText}>Belum dinilai</span>
                          )}
                        </td>
                        <td>
                          {item.isScored ? (
                            <strong className={styles.weightedText}>{item.weightedScore}</strong>
                          ) : (
                            <span className={styles.unscoredText}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}><strong>TOTAL NILAI AKHIR</strong></td>
                      <td><strong>100%</strong></td>
                      <td>-</td>
                      <td><strong className={styles.totalFinalScoreText}>{studentRekap.finalScore}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DIRECT ACTION PUBLISH ROW BELOW TABLE */}
              <div className={styles.rekapPublishBarCompact}>
                <div className={styles.publishInfoCompact}>
                  <ShieldCheck size={18} className={styles.shieldIcon} />
                  <span>Publikasikan Nilai <strong>{mk?.name || 'Mata Kuliah'}</strong> untuk <strong>{currentStudent.name}</strong></span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowPublishConfirmModal(true)}
                  disabled={!studentRekap.allCompleted}
                  className={styles.publishBtnBtnCompact}
                >
                  <Send size={15} /> Publikasikan Nilai
                </Button>
              </div>
            </div>
          ) : (
            /* IS REGULAR SCORING TAB VIEW */
            <>
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

              {/* Bottom Navigation Bar */}
              <div className={styles.bottomNavRow}>
                <Button variant="outline" size="sm" onClick={goToPrevStudent} disabled={currentStudentIdx === 0}>
                  <ChevronLeft size={14} /> Mahasiswa Sebelumnya
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={goToNextStudent}
                  disabled={currentStudentIdx === studentNav.length - 1}
                >
                  Lanjut ke Mahasiswa Berikutnya <ChevronRight size={15} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RUMUS PERHITUNGAN MODAL */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Rumus Perhitungan Nilai Akhir Institusi"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: '#4f46e5' }} /> Formula Standar Institusi:
            </h4>
            <code style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
              Nilai Akhir = Σ (Skor Mentah Komponen × Bobot Komponen)
            </code>
          </div>

          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            Setiap komponen dinilai berbasis <strong>4 Dimensi EPIC</strong> (Evaluative, Predictive, Integrative, Critical) dengan skala Likert 1-4. Skor mentah (1-100) dihitung secara proporsional dari ketercapaian 4 dimensi tersebut.
          </p>

          <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', color: '#4338ca' }}>
            <strong>Contoh Perhitungan:</strong> Jika Hasil Proyek (Bobot 20%) mendapat Skor Mentah 85, maka Nilai Terbobot = 85 × 20% = <strong>17.0</strong>.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="primary" size="sm" onClick={() => setShowFormulaModal(false)}>
              Mengerti
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION PUBLISH MODAL */}
      <Modal
        isOpen={showPublishConfirmModal}
        onClose={() => setShowPublishConfirmModal(false)}
        title="Konfirmasi Publikasi Nilai Akhir"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                Publikasikan Nilai Akhir {currentStudent?.name}?
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin mempublikasikan Nilai Akhir <strong>{studentRekap.finalScore} (Grade {studentRekap.grade})</strong> untuk mata kuliah <strong>{mk?.name}</strong>?
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.2)', fontSize: '12px', color: '#1e40af' }}>
            💡 Setelah dipublikasikan, nilai akhir dan rapor penilaian akan langsung dapat diakses oleh mahasiswa pada portal akademik.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="outline" size="sm" onClick={() => setShowPublishConfirmModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handlePublishFinalScore();
                setShowPublishConfirmModal(false);
              }}
            >
              Ya, Publikasikan Nilai
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScoringPage;
