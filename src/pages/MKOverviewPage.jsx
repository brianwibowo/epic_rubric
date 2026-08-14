import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import { ROLES, STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import { exportMKToExcel } from '@/utils/exportExcel';
import { getKomponenCode, getKomponenFullName } from '@/utils/komponenHelper';
import { getGradeInfo, GRADE_SCALE } from '@/utils/gradeHelper';
import styles from './MKOverviewPage.module.css';
import { 
  BookOpen, Users, ClipboardList, BarChart3, 
  Download, Trash2, ArrowRight, FileText,
  CheckCircle2, Clock, AlertCircle, Award, TrendingUp,
  PlusCircle, MessageSquare, Calendar, MapPin, Sparkles,
  ChevronRight, GraduationCap, UserCheck, Play, ArrowLeft
} from 'lucide-react';

const COMPONENT_COLORS = ['#2563eb', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

const MKOverviewPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kelasIdParam = searchParams.get('kelasId');
  const { profile } = useAuthStore();
  const { mkList, deleteMK, getAllStudents, getAllScoringData } = useMKStore();
  const { addToast } = useUiStore();
  const { courseLabel, coursePluralLabel, courseCodeLabel, academicTermLabel, educatorLabel, learnerLabel, learnerPluralLabel, rombelLabel, isSchool } = useTerminology();

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);
  const mk = mkList.find(m => m.id === mkId);

  React.useEffect(() => {
    if (isLearner && mkId) {
      navigate(`/mk/${mkId}/analytics`, { replace: true });
    }
  }, [isLearner, mkId, navigate]);

  if (!mk) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', marginTop: '60px', padding: '32px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <p style={{ margin: '12px 0 20px', color: 'var(--text-secondary)' }}>
            {courseLabel} dengan ID "{mkId}" tidak ada atau telah dihapus.
          </p>
          <Button variant="primary" onClick={() => navigate(isSchool ? '/kelas' : '/mk')}>
            Kembali ke {coursePluralLabel}
          </Button>
        </div>
      </div>
    );
  }

  const rawRombels = mk.rombel || [];
  const rombelList = useMemo(() => {
    if (isSchool) {
      const schoolRombels = rawRombels.filter(r => r.is_school || r.name.includes('AKL'));
      return schoolRombels.length > 0 ? schoolRombels : rawRombels;
    } else if (profile?.role === ROLES.DOSEN || profile?.role === ROLES.MAHASISWA) {
      const univRombels = rawRombels.filter(r => !r.is_school && !r.name.includes('AKL'));
      return univRombels.length > 0 ? univRombels : rawRombels;
    }
    return rawRombels;
  }, [rawRombels, isSchool, profile]);

  const allStudents = useMemo(() => {
    return rombelList.flatMap(r => r.students || []);
  }, [rombelList]);

  const allScoringData = useMemo(() => {
    return rombelList.reduce((acc, r) => ({ ...acc, ...(r.scoringData || {}) }), {});
  }, [rombelList]);

  const komponenList = mk.komponen || [];

  const getStudentRombelName = (studentId) => {
    const found = rombelList.find(r => (r.students || []).some(s => s.id === studentId || s.student_id === studentId));
    return found ? found.name : '-';
  };

  const handleExportExcel = () => {
    if (allStudents.length === 0) {
      addToast(`Belum ada ${learnerLabel.toLowerCase()} yang terdaftar pada ${courseLabel.toLowerCase()} ini.`, 'warning');
      return;
    }

    try {
      const mapStudentToRosterRow = (s) => {
        const stuId = s.id || s.student_id;
        const stuScoring = allScoringData[stuId] || {};
        const scores = {};
        let totalWeighted = 0;
        let hasAnyScore = false;

        komponenList.forEach(komp => {
          const sd = stuScoring[komp.id];
          if (sd?.rawScore != null) {
            scores[komp.name] = sd.rawScore;
            scores[getKomponenCode(komp.name)] = sd.rawScore;
            totalWeighted += (Number(sd.rawScore) || 0) * (Number(komp.bobot) || 0);
            hasAnyScore = true;
          } else {
            scores[komp.name] = null;
            scores[getKomponenCode(komp.name)] = null;
          }
        });

        return {
          nim: s.nim || s.nisn,
          full_name: s.full_name || s.name,
          rombelName: getStudentRombelName(stuId),
          scores,
          final_score: hasAnyScore ? Math.round(totalWeighted) : null,
          status: hasAnyScore ? 'PUBLISHED' : 'DRAFT'
        };
      };

      const roster = allStudents.map(mapStudentToRosterRow);

      // Multi-sheet rombel groups (Sheet 1: SEMUA, Sheet 2+: per Rombel)
      const rombelGroups = rombelList.map(r => ({
        name: r.name,
        roster: (r.students || []).map(mapStudentToRosterRow)
      }));

      exportMKToExcel({
        name: mk.name,
        kode_mk: mk.kode_mk,
        semester: mk.semester || '',
        kode_semester: mk.kode_semester || '',
        sks: mk.sks || 0,
        kelas: rombelList.map(r => r.name).join(', ') || '',
        dosen_name: mk.dosen_name || mk.guru_name || '',
        studentCount: allStudents.length
      }, komponenList, roster, rombelGroups);

      addToast(`Laporan ${courseLabel} berhasil diunduh (Multi-Sheet: Semua Rombel & Per Rombel)`, 'success');
    } catch (err) {
      console.error('Export Excel failed:', err);
      addToast(err.message || 'Gagal mengekspor data ke Excel', 'error');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Hapus ${courseLabel} "${mk.name}"?`)) {
      deleteMK(mk.id);
      addToast(`${courseLabel} berhasil dihapus`, 'info');
      navigate(isSchool ? '/kelas' : '/mk');
    }
  };

  // --- Real-time Student & Evaluation Metrics ---
  const studentMetrics = useMemo(() => {
    const totalKomponen = komponenList.length || 6;
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let totalScoreSum = 0;
    let scoredCount = 0;
    let passingCount = 0;
    const gradeDist = { A: 0, AB: 0, B: 0, BC: 0, C: 0, CD: 0, D: 0, E: 0 };
    const needingAttention = [];

    allStudents.forEach(s => {
      const stuId = s.id || s.student_id;
      const stuScoring = allScoringData[stuId] || {};
      let gradedComponents = 0;
      let totalWeighted = 0;

      komponenList.forEach(k => {
        const sd = stuScoring[k.id];
        if (sd?.rawScore != null) {
          gradedComponents++;
          totalWeighted += (sd.rawScore || 0) * (k.bobot || 0);
        }
      });

      if (gradedComponents === totalKomponen && totalKomponen > 0) {
        completedCount++;
      } else if (gradedComponents > 0) {
        inProgressCount++;
        needingAttention.push({
          ...s,
          stuId,
          gradedCount: gradedComponents,
          totalKomponen,
          percent: Math.round((gradedComponents / totalKomponen) * 100),
          status: 'IN_PROGRESS'
        });
      } else {
        notStartedCount++;
        needingAttention.push({
          ...s,
          stuId,
          gradedCount: 0,
          totalKomponen,
          percent: 0,
          status: 'NOT_STARTED'
        });
      }

      if (gradedComponents > 0) {
        const finalScore = Math.round(totalWeighted);
        totalScoreSum += finalScore;
        scoredCount++;

        const gradeData = getGradeInfo(finalScore);
        if (gradeDist[gradeData.grade] !== undefined) {
          gradeDist[gradeData.grade]++;
        }
        if (gradeData.isPassing) {
          passingCount++;
        }
      }
    });

    const averageScore = scoredCount > 0 ? (totalScoreSum / scoredCount).toFixed(1) : '-';
    const overallProgressPct = allStudents.length > 0
      ? Math.round((completedCount / allStudents.length) * 100)
      : 0;

    return {
      totalStudents: allStudents.length,
      completedCount,
      inProgressCount,
      notStartedCount,
      overallProgressPct,
      averageScore,
      gradeDist,
      scoredCount,
      passingCount,
      needingAttention: needingAttention.slice(0, 5)
    };
  }, [allStudents, allScoringData, komponenList]);

  // --- Real-time Rombel Metrics ---
  const rombelSummaries = useMemo(() => {
    const totalKomps = komponenList.length || 6;

    return rombelList.map(r => {
      const rStudents = r.students || [];
      let completedInRombel = 0;
      let totalGradedSlots = 0;

      rStudents.forEach(s => {
        const stuId = s.id || s.student_id;
        const sd = r.scoringData?.[s.id] || r.scoringData?.[s.student_id] || r.scoringData?.[stuId] || allScoringData[stuId] || {};
        const gradedCount = komponenList.filter(k => sd[k.id]?.rawScore != null).length;
        if (gradedCount === totalKomps && totalKomps > 0) {
          completedInRombel++;
        }
        totalGradedSlots += gradedCount;
      });

      const totalSlots = rStudents.length * totalKomps;
      const progressPct = totalSlots > 0 ? Math.round((totalGradedSlots / totalSlots) * 100) : 0;

      return {
        ...r,
        studentCount: rStudents.length,
        completedCount: completedInRombel,
        progressPct
      };
    });
  }, [rombelList, komponenList, allScoringData]);

  // --- Real-time Komponen Summary ---
  const komponenSummaries = useMemo(() => {
    return komponenList.map((k, idx) => {
      let totalRaw = 0;
      let count = 0;
      allStudents.forEach(s => {
        const stuId = s.id || s.student_id;
        const sd = allScoringData[stuId]?.[k.id];
        if (sd?.rawScore != null) {
          totalRaw += sd.rawScore;
          count++;
        }
      });
      const avgRaw = count > 0 ? (totalRaw / count).toFixed(1) : '-';
      return {
        ...k,
        code: getKomponenCode(k.name),
        fullName: getKomponenFullName(k.name),
        weightPct: Math.round((k.bobot || 0) * 100),
        avgRaw,
        scoredStudentsCount: count,
        color: COMPONENT_COLORS[idx % COMPONENT_COLORS.length]
      };
    });
  }, [komponenList, allStudents, allScoringData]);

  const trackQuery = isSchool ? (kelasIdParam ? `?kelasId=${kelasIdParam}&track=smk` : '?track=smk') : '';

  return (
    <div className={styles.page} id="mk-overview-print">
      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (kelasIdParam) {
              navigate(`/kelas/${kelasIdParam}`);
            } else if (isSchool) {
              navigate('/kelas');
            } else {
              navigate('/mk');
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>
            {kelasIdParam
              ? 'Kembali ke Detail Kelas'
              : isSchool
              ? 'Kembali ke Daftar Kelas'
              : `Kembali ke ${coursePluralLabel}`
            }
          </span>
        </Button>
      </div>

      {/* 1. HERO COURSE EXECUTIVE BANNER */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroMain}>
            <div className={styles.heroIconWrap}>
              <BookOpen size={30} />
            </div>

            <div className={styles.heroDetails}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.codeChip}>{courseCodeLabel}: {mk.kode_mk || '-'}</span>
                <span className={styles.semesterChip}>{isSchool ? (mk.tahun_ajaran || 'Tahun Ajaran 2025/2026') : (mk.semester || 'Semester Aktif')}</span>
                {mk.sks && <span className={styles.semesterChip}>{mk.sks} {isSchool ? 'Jam/Minggu' : 'SKS'}</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className={styles.heroTitle}>{mk.name}</h1>
                <HelpButton size={22} />
              </div>

              <div className={styles.heroMetaRow}>
                <span className={styles.heroMetaItem}>
                  <Users size={15} />
                  <strong>{allStudents.length}</strong> {learnerLabel}
                </span>
                {rombelList.length > 0 && (
                  <span className={styles.heroMetaItem}>
                    <GraduationCap size={15} />
                    <strong>{rombelList.length}</strong> {rombelLabel}
                  </span>
                )}
                <span className={styles.heroMetaItem}>
                  <UserCheck size={15} />
                  {educatorLabel}: <strong>{mk.dosen_name || mk.guru_name || '-'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <Button 
              variant="primary" 
              className={styles.primaryGradBtn}
              onClick={() => navigate(`/mk/${mk.id}/students${trackQuery}`)}
            >
              <Play size={16} fill="currentColor" /> Buka Penilaian
            </Button>

            <Button variant="outline" onClick={handleExportExcel} title="Unduh laporan Excel komprehensif (Multi-Sheet per Rombel)">
              <Download size={15} /> Ekspor Excel
            </Button>

            {isStaff && (
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                title={`Hapus ${courseLabel}`}
                style={{ color: 'var(--color-error)' }}
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        </div>

        {mk.description && (
          <div className={styles.heroDesc}>
            {mk.description}
          </div>
        )}
      </div>

      {/* 2. EXECUTIVE KEY METRICS GRID */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Total Learners */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total {learnerLabel}</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div className={styles.metricValueRow}>
            <span className={styles.metricValue}>{allStudents.length}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Orang</span>
          </div>
          <p className={styles.metricSubtext}>
            Tersebar di <strong>{rombelList.length} Rombel</strong> aktif
          </p>
        </div>

        {/* Metric 2: Scoring Progress */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Progress Penilaian</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className={styles.metricValueRow}>
            <span className={styles.metricValue} style={{ color: '#059669' }}>
              {studentMetrics.overallProgressPct}%
            </span>
          </div>
          <div className={styles.miniProgressBar}>
            <div 
              className={styles.miniProgressFill}
              style={{
                width: `${studentMetrics.overallProgressPct}%`,
                background: studentMetrics.overallProgressPct === 100 ? '#059669' : '#2563eb'
              }}
            />
          </div>
          <p className={styles.metricSubtext}>
            <strong>{studentMetrics.completedCount}</strong> dari {allStudents.length} {learnerLabel.toLowerCase()} selesai (6/6)
          </p>
        </div>

        {/* Metric 3: Class Average */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Rata-Rata Kelas</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
              <Award size={18} />
            </div>
          </div>
          <div className={styles.metricValueRow}>
            <span className={styles.metricValue}>{studentMetrics.averageScore}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <p className={styles.metricSubtext}>
            Standar skala Likert 1-4 <strong>EPIC Framework</strong>
          </p>
        </div>

        {/* Metric 4: Grade Distribution */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Distribusi Nilai</span>
            <div className={styles.metricIconWrap} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div className={styles.gradePillsRow}>
            <span className={styles.gradePill} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }} title="A (> 85 - 100): Baik sekali">
              A: {studentMetrics.gradeDist.A}
            </span>
            <span className={styles.gradePill} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} title="AB (> 80 - 85): Lebih dari baik">
              AB: {studentMetrics.gradeDist.AB}
            </span>
            <span className={styles.gradePill} style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }} title="B (> 70 - 80): Baik">
              B: {studentMetrics.gradeDist.B}
            </span>
            <span className={styles.gradePill} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }} title="BC (> 65 - 70): Lebih dari cukup">
              BC: {studentMetrics.gradeDist.BC}
            </span>
            <span className={styles.gradePill} style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }} title="C (> 60 - 65): Cukup">
              C: {studentMetrics.gradeDist.C}
            </span>
            <span className={styles.gradePill} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} title="CD/D/E (≤ 60): Kurang / Gagal">
              CD/D/E: {studentMetrics.gradeDist.CD + studentMetrics.gradeDist.D + studentMetrics.gradeDist.E}
            </span>
          </div>
          <p className={styles.metricSubtext}>
            Tingkat Kelulusan: <strong>{studentMetrics.scoredCount > 0 ? Math.round((studentMetrics.passingCount / studentMetrics.scoredCount) * 100) : 100}%</strong> (Skor {'>'} 60)
          </p>
        </div>
      </div>

      {/* 3. TWO-COLUMN MAIN DASHBOARD */}
      <div className={styles.mainDashboardGrid}>
        {/* LEFT COLUMN (2/3): Rombel Status & Komponen Penilaian */}
        <div className={styles.dashboardColumn}>
          {/* Section 1: Rombel Overview */}
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <GraduationCap size={18} style={{ color: '#2563eb' }} />
                Daftar Rombongan Belajar ({rombelList.length} Rombel)
              </h2>
              <button 
                className={styles.sectionActionLink}
                onClick={() => navigate(`/mk/${mk.id}/students?rombelId=ALL`)}
              >
                Lihat Semua Rombel <ArrowRight size={13} />
              </button>
            </div>

            <div className={styles.rombelCardsGrid}>
              {rombelSummaries.map(rombel => (
                <div 
                  key={rombel.id}
                  className={styles.rombelOverviewCard}
                  onClick={() => navigate(`/mk/${mk.id}/students?rombelId=${rombel.id}`)}
                >
                  <div className={styles.rombelCardLeft}>
                    <div className={styles.rombelIconWrap}>
                      <Users size={18} />
                    </div>

                    <div className={styles.rombelMetaWrap}>
                      <div className={styles.rombelNameRow}>
                        <span className={styles.rombelName}>{rombel.name}</span>
                        {rombel.kode_rombel && (
                          <span className={styles.rombelCodeBadge}>{rombel.kode_rombel}</span>
                        )}
                      </div>

                      <div className={styles.rombelSubDetails}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> <strong>{rombel.studentCount}</strong> {learnerLabel}
                        </span>
                        {rombel.jadwal && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {rombel.jadwal}
                          </span>
                        )}
                        {rombel.ruangan && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {rombel.ruangan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.rombelCardRight}>
                    <div className={styles.rombelProgressBox}>
                      <span className={styles.rombelProgressText}>
                        {rombel.completedCount}/{rombel.studentCount} Dinilai ({rombel.progressPct}%)
                      </span>
                      <div className={styles.rombelProgressBar}>
                        <div 
                          style={{
                            height: '100%',
                            width: `${rombel.progressPct}%`,
                            background: rombel.progressPct === 100 ? '#059669' : '#2563eb',
                            borderRadius: '9999px',
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                    </div>

                    <span className={styles.rombelOpenBtn}>
                      Buka <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Komponen Evaluasi & Rubrik */}
          <div className={styles.komponenContainer}>
            <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <ClipboardList size={18} style={{ color: '#059669' }} />
                  Struktur Komponen & Bobot Penilaian
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Total bobot terdistribusi 100% pada {komponenList.length} instrumen evaluasi
                </p>
              </div>

              <button 
                className={styles.sectionActionLink}
                onClick={() => navigate(`/mk/${mk.id}/komponen`)}
              >
                Konfigurasi Bobot <ArrowRight size={13} />
              </button>
            </div>

            {/* Segmented Weight Bar */}
            <div className={styles.weightSegmentedBar}>
              {komponenSummaries.map((k, idx) => (
                <div
                  key={k.id || idx}
                  className={styles.weightSegment}
                  style={{
                    width: `${k.weightPct}%`,
                    background: k.color
                  }}
                  title={`${k.code} (${k.fullName}): ${k.weightPct}%`}
                />
              ))}
            </div>

            {/* Komponen Grid Pills */}
            <div className={styles.komponenGrid}>
              {komponenSummaries.map(k => (
                <div key={k.id} className={styles.komponenPillCard}>
                  <div className={styles.komponenPillLeft}>
                    <span 
                      className={styles.komponenCodeChip} 
                      style={{ background: `${k.color}18`, color: k.color }}
                    >
                      {k.code}
                    </span>
                    <span className={styles.komponenName} title={k.fullName}>
                      {k.fullName}
                    </span>
                  </div>
                  <span className={styles.komponenBobot}>{k.weightPct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3): Attention Roster & Quick Nav Actions */}
        <div className={styles.dashboardColumn}>
          {/* Section 1: Students Needing Attention / Grading */}
          <div className={styles.sideCard}>
            <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>
              <h3 className={styles.sectionTitle} style={{ fontSize: '14.5px' }}>
                <Clock size={16} style={{ color: '#d97706' }} />
                Perlu Input Nilai ({studentMetrics.inProgressCount + studentMetrics.notStartedCount})
              </h3>
              <button 
                className={styles.sectionActionLink}
                onClick={() => navigate(`/mk/${mk.id}/students${trackQuery}`)}
              >
                Semua
              </button>
            </div>

            {studentMetrics.needingAttention.length > 0 ? (
              <div className={styles.studentPendingList}>
                {studentMetrics.needingAttention.map((s, idx) => (
                  <div key={s.stuId || idx} className={styles.studentPendingItem}>
                    <div className={styles.studentPendingLeft}>
                      <div className={styles.studentAvatarSmall}>
                        {(s.full_name || s.name || 'M').charAt(0)}
                      </div>
                      <div>
                        <div className={styles.studentPendingName}>{s.full_name || s.name}</div>
                        <div className={styles.studentPendingProgress}>
                          {s.gradedCount}/{s.totalKomponen} Komponen ({s.percent}%)
                        </div>
                      </div>
                    </div>

                    <button 
                      className={styles.gradeDirectBtn}
                      onClick={() => navigate(`/mk/${mk.id}/scoring?studentId=${s.stuId || s.id}${isSchool ? '&track=smk' : ''}`)}
                    >
                      Nilai
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px', color: '#059669', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={24} />
                <span>Seluruh {learnerLabel.toLowerCase()} telah selesai dinilai 100%!</span>
              </div>
            )}
          </div>

          {/* Section 2: Quick Navigation Actions */}
          <div className={styles.quickNavContainer}>
            <div 
              className={styles.quickNavRow} 
              onClick={() => navigate(`/mk/${mk.id}/students${trackQuery}`)}
            >
              <div className={styles.quickNavIconWrap} style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}>
                <Users size={20} />
              </div>
              <div className={styles.quickNavTextWrap}>
                <h4 className={styles.quickNavHeading}>{learnerPluralLabel} & Nilai</h4>
                <p className={styles.quickNavCaption}>Daftar {learnerLabel.toLowerCase()} & input rubrik Likert</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className={styles.quickNavRow} 
              onClick={() => navigate(`/mk/${mk.id}/komponen${trackQuery}`)}
            >
              <div className={styles.quickNavIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                <ClipboardList size={20} />
              </div>
              <div className={styles.quickNavTextWrap}>
                <h4 className={styles.quickNavHeading}>Komponen & Rubrik</h4>
                <p className={styles.quickNavCaption}>Kelola bobot evaluasi & rubrik EPIC</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className={styles.quickNavRow} 
              onClick={() => navigate(`/mk/${mk.id}/analytics${trackQuery}`)}
            >
              <div className={styles.quickNavIconWrap} style={{ background: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
                <BarChart3 size={20} />
              </div>
              <div className={styles.quickNavTextWrap}>
                <h4 className={styles.quickNavHeading}>Analitik Radar & Statistik</h4>
                <p className={styles.quickNavCaption}>Capaian 4 Dimensi EPIC & sebaran grade</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div 
              className={styles.quickNavRow} 
              onClick={() => navigate(`/mk/${mk.id}/comments${trackQuery}`)}
            >
              <div className={styles.quickNavIconWrap} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                <MessageSquare size={20} />
              </div>
              <div className={styles.quickNavTextWrap}>
                <h4 className={styles.quickNavHeading}>Komentar & Diskusi Kelas</h4>
                <p className={styles.quickNavCaption}>Feedback & interaksi langsung guru-siswa</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MKOverviewPage;
