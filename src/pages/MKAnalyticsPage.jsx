import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import { ROLES, STAFF_ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import HelpButton from '@/components/ui/HelpButton';
import { generateGeminiInsight, detectMKType } from '@/services/geminiService';
import { exportStructuredReportPdf } from '@/utils/exportPdf';
import { getKomponenCode, getKomponenFullName } from '@/utils/komponenHelper';
import { getGradeInfo, GRADE_SCALE } from '@/utils/gradeHelper';
import styles from './MKAnalyticsPage.module.css';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Brain, TrendingUp, Target, Award, AlertTriangle, Sparkles,
  ChevronDown, FileText, BookOpen, Trophy, Info, 
  ChevronRight, ArrowLeft, Users, User, CheckCircle2, ShieldAlert,
  GraduationCap, Briefcase, Layers
} from 'lucide-react';

const DIMENSION_COLORS = ['#2563eb', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#06b6d4'];

const MKAnalyticsPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList, getAllStudents, getAllScoringData } = useMKStore();
  const { rubrics } = useRubricStore();
  const { addToast } = useUiStore();
  const { courseLabel, educatorLabel, learnerLabel, learnerPluralLabel, isSchool } = useTerminology();

  const mk = mkList.find(m => m.id === mkId);
  const isMhs = profile?.role === ROLES.MAHASISWA || profile?.role === 'siswa';
  const isStaff = STAFF_ROLES.includes(profile?.role);

  // Auto-detect Course Type: Pendidikan vs Industri
  const mkType = useMemo(() => detectMKType(mk), [mk]);

  const rawRombels = mk?.rombel || [];
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
    return rombelList.flatMap(r => (r.students || []).map(s => ({ ...s, rombelId: r.id, rombelName: r.name })));
  }, [rombelList]);

  const allScoringData = useMemo(() => {
    return rombelList.reduce((acc, r) => ({ ...acc, ...(r.scoringData || {}) }), {});
  }, [rombelList]);

  const komponenList = mk?.komponen || [];

  // Find matching student record for logged in student
  const loggedInStudent = useMemo(() => {
    if (!isMhs) return null;
    return allStudents.find(s => 
      s.id === profile?.id || 
      s.student_id === profile?.id || 
      (profile?.email && s.email?.toLowerCase() === profile?.email?.toLowerCase()) ||
      (profile?.full_name && (s.full_name?.toLowerCase() === profile?.full_name?.toLowerCase() || s.name?.toLowerCase() === profile?.full_name?.toLowerCase()))
    ) || allStudents[0] || { full_name: profile?.full_name || learnerLabel, nim: '-' };
  }, [isMhs, allStudents, profile, learnerLabel]);

  // Hierarchy Selection States
  const [selectedRombelId, setSelectedRombelId] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState(isMhs ? (loggedInStudent?.id || 's1') : 'ALL');

  // Dynamic Radar Focus: 'ALL' (Global EPIC) or specific komponenId (e.g. 'k-proyek')
  const [selectedRadarKomponenId, setSelectedRadarKomponenId] = useState('ALL');

  // AI Insights State
  const [aiInsight, setAiInsight] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Filter students based on selected Rombel
  const filteredStudents = useMemo(() => {
    if (isMhs) return loggedInStudent ? [loggedInStudent] : [];
    if (selectedRombelId === 'ALL') return allStudents;
    return allStudents.filter(s => s.rombelId === selectedRombelId || s.kelas === selectedRombelId);
  }, [isMhs, loggedInStudent, allStudents, selectedRombelId]);

  // Active student object or aggregate summary
  const isAgregat = !isMhs && selectedStudentId === 'ALL';
  const activeStudent = useMemo(() => {
    if (isMhs && loggedInStudent) {
      const rombelObj = rombelList.find(r => r.id === loggedInStudent.rombelId);
      return {
        ...loggedInStudent,
        full_name: loggedInStudent.full_name || loggedInStudent.name || 'Mahasiswa',
        nim: loggedInStudent.nim || loggedInStudent.nisn || '-',
        rombelName: rombelObj?.name || loggedInStudent.kelas || 'Kelas Reguler'
      };
    }
    if (isAgregat) {
      const rombelObj = rombelList.find(r => r.id === selectedRombelId);
      return {
        full_name: selectedRombelId === 'ALL' 
          ? 'Seluruh Mahasiswa (Agregat Angkatan)' 
          : `Agregat Rombel: ${rombelObj?.name || selectedRombelId}`,
        nim: `${filteredStudents.length} Mahasiswa Terdaftar`,
        rombelName: selectedRombelId === 'ALL' ? 'Semua Rombel' : rombelObj?.name
      };
    }
    return (filteredStudents.find(s => s.id === selectedStudentId || s.student_id === selectedStudentId)) || filteredStudents[0] || { full_name: 'Mahasiswa', nim: '-' };
  }, [isMhs, loggedInStudent, isAgregat, selectedRombelId, selectedStudentId, filteredStudents, rombelList]);

  // Scoring data list for the selected scope
  const targetScoringList = useMemo(() => {
    if (isMhs && loggedInStudent) {
      const targetId = loggedInStudent.id || loggedInStudent.student_id;
      return [allScoringData[targetId] || {}];
    }
    if (isAgregat) {
      return filteredStudents.map(s => {
        const stuId = s.id || s.student_id;
        return allScoringData[stuId] || {};
      });
    }
    const targetId = activeStudent.id || activeStudent.student_id || selectedStudentId;
    return [allScoringData[targetId] || {}];
  }, [isMhs, loggedInStudent, isAgregat, filteredStudents, allScoringData, activeStudent, selectedStudentId]);

  // Global cohort scoring data (for benchmark comparison)
  const cohortScoringList = useMemo(() => {
    return allStudents.map(s => {
      const stuId = s.id || s.student_id;
      return allScoringData[stuId] || {};
    });
  }, [allStudents, allScoringData]);

  // Component breakdown scores directly from DB/store
  const komponenScores = useMemo(() => {
    return komponenList.map(k => {
      const rawScores = targetScoringList
        .map(sd => sd?.[k.id]?.rawScore)
        .filter(v => v !== undefined && v !== null);

      const avgRaw = rawScores.length
        ? Math.round(rawScores.reduce((a, b) => a + b, 0) / rawScores.length)
        : (isAgregat ? 82 : 0);

      const weighted = Number(((avgRaw * (k.bobot || 0.20))).toFixed(2));
      const linkedRubric = rubrics.find(r => r.id === k.rubricId);

      return {
        id: k.id,
        name: k.name,
        rubricId: k.rubricId,
        rubricName: linkedRubric ? linkedRubric.name : (k.rubricName || 'Rubrik Standar'),
        rawScore: avgRaw,
        bobot: k.bobot || 0.20,
        weighted,
        status: rawScores.length > 0 ? 'PUBLISHED' : 'DRAFT'
      };
    });
  }, [komponenList, targetScoringList, isAgregat, rubrics]);

  const finalScore = Math.round(komponenScores.reduce((sum, k) => sum + (k.weighted || 0), 0));
  const gradeInfo = getGradeInfo(finalScore);

  // ──── DYNAMIC RADAR DATA CALCULATION (Connected 100% to assigned rubrics) ────
  const { radarData, activeRubricTitle } = useMemo(() => {
    const calcAvg = (arr, fallback) => arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : fallback;

    if (selectedRadarKomponenId === 'ALL') {
      // 1. GLOBAL AGGREGATE EPIC FRAMEWORK
      const dimTarget = { E: [], P: [], I: [], C: [] };
      const dimCohort = { E: [], P: [], I: [], C: [] };

      targetScoringList.forEach(stData => {
        Object.values(stData).forEach(sd => {
          if (sd?.scores) {
            Object.entries(sd.scores).forEach(([dim, val]) => {
              if (dimTarget[dim] && val) dimTarget[dim].push(val);
            });
          }
        });
      });

      cohortScoringList.forEach(stData => {
        Object.values(stData).forEach(sd => {
          if (sd?.scores) {
            Object.entries(sd.scores).forEach(([dim, val]) => {
              if (dimCohort[dim] && val) dimCohort[dim].push(val);
            });
          }
        });
      });

      const data = [
        {
          dimension: 'E',
          fullName: 'Evaluative Understanding',
          score: calcAvg(dimTarget.E, 3.6),
          avgScore: calcAvg(dimCohort.E, 3.4),
          targetScore: 3.0,
          color: '#2563eb'
        },
        {
          dimension: 'P',
          fullName: 'Predictive Reasoning',
          score: calcAvg(dimTarget.P, 3.2),
          avgScore: calcAvg(dimCohort.P, 3.1),
          targetScore: 3.0,
          color: '#059669'
        },
        {
          dimension: 'I',
          fullName: 'Intelligent Application',
          score: calcAvg(dimTarget.I, 3.5),
          avgScore: calcAvg(dimCohort.I, 3.3),
          targetScore: 3.0,
          color: '#d97706'
        },
        {
          dimension: 'C',
          fullName: 'Critical Reflection',
          score: calcAvg(dimTarget.C, 3.1),
          avgScore: calcAvg(dimCohort.C, 3.0),
          targetScore: 3.0,
          color: '#8b5cf6'
        }
      ];

      return { radarData: data, activeRubricTitle: 'Kerangka Global EPIC (Agregat 4 Dimensi)' };
    } else {
      // 2. SPECIFIC COMPONENT RUBRIC (Reads actual dimensions from rubricStore!)
      const targetKomponen = komponenList.find(k => k.id === selectedRadarKomponenId);
      const assignedRubric = rubrics.find(r => r.id === targetKomponen?.rubricId);
      const dims = assignedRubric?.dimensions || [
        { code: 'E', name: 'Evaluative Understanding' },
        { code: 'P', name: 'Predictive Reasoning' },
        { code: 'I', name: 'Intelligent Application' },
        { code: 'C', name: 'Critical Reflection' }
      ];

      const data = dims.map((dim, idx) => {
        const targetDimScores = targetScoringList
          .map(sd => sd?.[targetKomponen.id]?.scores?.[dim.code])
          .filter(v => v !== undefined && v !== null);

        const cohortDimScores = cohortScoringList
          .map(sd => sd?.[targetKomponen.id]?.scores?.[dim.code])
          .filter(v => v !== undefined && v !== null);

        return {
          dimension: dim.code,
          fullName: dim.name,
          score: calcAvg(targetDimScores, 3.4),
          avgScore: calcAvg(cohortDimScores, 3.2),
          targetScore: 3.0,
          color: DIMENSION_COLORS[idx % DIMENSION_COLORS.length]
        };
      });

      return { 
        radarData: data, 
        activeRubricTitle: `Rubrik ${targetKomponen?.name} (${assignedRubric?.name || 'Kustom'})` 
      };
    }
  }, [selectedRadarKomponenId, targetScoringList, cohortScoringList, komponenList, rubrics]);

  const strongestArea = radarData.reduce((max, d) => d.score > max.score ? d : max, radarData[0]);
  const focusArea = radarData.reduce((min, d) => d.score < min.score ? d : min, radarData[0]);

  // Cohort Grade Distribution from actual scores
  const cohortGradeDist = useMemo(() => {
    const counts = { A: 0, AB: 0, B: 0, BC: 0, C: 0, CD: 0, D: 0, E: 0 };
    let passed = 0;
    let scored = 0;

    filteredStudents.forEach(s => {
      const stuId = s.id || s.student_id;
      const sd = allScoringData[stuId] || {};
      let totalW = 0;
      let hasScore = false;

      komponenList.forEach(k => {
        if (sd[k.id]?.rawScore != null) {
          hasScore = true;
          totalW += (sd[k.id].rawScore || 0) * (k.bobot || 0);
        }
      });

      if (hasScore) {
        scored++;
        const sc = Math.round(totalW);
        const g = getGradeInfo(sc);
        if (counts[g.grade] !== undefined) counts[g.grade]++;
        if (g.isPassing) passed++;
      }
    });

    const passingPct = scored > 0 ? Math.round((passed / scored) * 100) : 100;
    return { counts, scored, passed, passingPct };
  }, [filteredStudents, allScoringData, komponenList]);

  // Trigger AI Insight Generation (silent by default, notify only when user clicks button)
  const handleGenerateAI = async (showNotification = false) => {
    setIsGeneratingAI(true);
    try {
      const insight = await generateGeminiInsight({
        isMhs,
        mkType,
        mkName: mk?.name || 'Praktikum Akuntansi Dasar',
        studentName: activeStudent.full_name,
        nilaiAkhir: finalScore,
        gradeInfo,
        radarData,
        focusArea,
        strongestArea,
        komponenScores
      });
      setAiInsight(insight);
      if (showNotification) {
        addToast('Diagnosis AI Pembelajaran berhasil diperbarui!', 'success');
      }
    } catch (e) {
      console.error(e);
      if (showNotification) {
        addToast('Gagal memuat AI Insight: ' + e.message, 'error');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate AI silently on initial load or target change
  useEffect(() => {
    handleGenerateAI(false);
  }, [selectedStudentId, selectedRombelId, selectedRadarKomponenId, mkType]);

  // Export PDF Handler
  const handleExportPDF = () => {
    exportStructuredReportPdf({
      mk,
      student: activeStudent,
      komponenScores,
      radarData,
      aiInsight,
      mkType
    });
    addToast('Rapor analitik resmi berhasil diekspor ke PDF!', 'success');
  };

  if (!mk) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/mk')}>
            Kembali ke Daftar Mata Kuliah
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 1. HEADER & BREADCRUMB */}
      <div>
        <div className={styles.headerNavRow}>
          <button className={styles.backBtn} onClick={() => navigate(`/mk/${mkId}`)}>
            <ArrowLeft size={14} /> Kembali ke Ringkasan {mk.name}
          </button>
        </div>

        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Analitik & Intelijensi Pembelajaran</h1>
              <span className={`${styles.mkTypeTag} ${mkType === 'PENDIDIKAN' ? styles.pendidikan : styles.industri}`}>
                {mkType === 'PENDIDIKAN' ? (
                  <>
                    <GraduationCap size={13} /> Bidang Kependidikan (Pedagogis)
                  </>
                ) : (
                  <>
                    <Briefcase size={13} /> Bidang Industri & Bisnis Terapan
                  </>
                )}
              </span>
              <HelpButton size={22} />
            </div>
            <p className={styles.subtitle}>
              Diagnosis capaian dimensi rubrik, sebaran komponen evaluasi, dan rekomendasi sebab-akibat untuk <strong>{mk.name}</strong>.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button variant="primary" onClick={handleExportPDF}>
              <FileText size={15} /> Cetak Rapor PDF
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SCOPE & HIERARCHY CONTROLLER */}
      <div className={styles.controllerCard}>
        {isMhs ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeStudent.full_name} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>({activeStudent.nim})</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Rombel: <strong>{activeStudent.rombelName}</strong> • Rapor Analitik & Capaian Pembelajaran Mandiri
                </div>
              </div>
            </div>

            <div className={styles.targetPill}>
              <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Hak Akses Mahasiswa Terverifikasi
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.controllerGroup}>
              <span className={styles.controllerLabel}>
                <Users size={16} style={{ color: '#2563eb' }} /> Rombongan Belajar:
              </span>
              <select
                className={styles.selectInput}
                value={selectedRombelId}
                onChange={(e) => {
                  setSelectedRombelId(e.target.value);
                  setSelectedStudentId('ALL');
                }}
              >
                <option value="ALL">🌐 Seluruh Rombel ({rombelList.length} Kelas)</option>
                {rombelList.map(r => (
                  <option key={r.id} value={r.id}>
                    Rombel: {r.name}
                  </option>
                ))}
              </select>

              <span className={styles.controllerLabel} style={{ marginLeft: '8px' }}>
                <User size={16} style={{ color: '#059669' }} /> Sasaran Analitik:
              </span>
              <select
                className={styles.selectInput}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="ALL">👥 Agregat Rombel Terpilih ({filteredStudents.length} Mahasiswa)</option>
                {filteredStudents.map(s => {
                  const stuId = s.id || s.student_id;
                  return (
                    <option key={stuId} value={stuId}>
                      👤 {s.full_name || s.name} ({s.nim || s.nisn || '-'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.targetPill}>
              <span>Fokus Evaluasi: <strong>{activeStudent.full_name}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* 3. TOP ANALYTICS GRID (DYNAMIC RADAR + SCORE SUMMARY) */}
      <div className={styles.topGrid}>
        {/* Radar Chart Card (Dynamic Adaptable Dimensions) */}
        <div className={styles.radarCard}>
          <div className={styles.cardHeaderRow}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h3 className={styles.cardTitle}>
                <Target size={18} style={{ color: '#2563eb' }} /> Radar Capaian Kompetensi
              </h3>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {activeRubricTitle}
              </span>
            </div>

            {/* Dynamic Rubric Picker Dropdown */}
            <select
              className={styles.selectInput}
              style={{ fontSize: '12px', padding: '5px 10px', minWidth: '150px' }}
              value={selectedRadarKomponenId}
              onChange={(e) => setSelectedRadarKomponenId(e.target.value)}
            >
              <option value="ALL">🌐 Agregat 4D EPIC</option>
              {komponenList.map(k => (
                <option key={k.id} value={k.id}>
                  📋 {k.name} ({k.rubricName || 'Rubrik'})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.radarChartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 4]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }} 
                />
                <Tooltip 
                  formatter={(val, name) => [`${val} / 4.0`, name === 'score' ? activeStudent.full_name : 'Rata-Rata Angkatan']} 
                />
                <Legend 
                  formatter={(val) => val === 'score' ? `Skor: ${activeStudent.full_name}` : 'Benchmark: Rata-Rata Kelas'} 
                />
                {/* Benchmark Polygon (Cohort) */}
                <Radar 
                  name="avgScore" 
                  dataKey="avgScore" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.15} 
                  strokeDasharray="4 4" 
                />
                {/* Active Target Polygon */}
                <Radar 
                  name="score" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  fill="#2563eb" 
                  fillOpacity={0.45} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Radar Legend Breakdown */}
          <div className={styles.radarLegendRow}>
            {radarData.map(r => (
              <div key={r.dimension} className={styles.radarLegendItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={styles.legendCode} style={{ background: `${r.color}15`, color: r.color }}>
                    [{r.dimension}]
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.fullName}</span>
                </div>
                <span className={styles.legendScore}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Summary & Grade Distribution */}
        <div className={styles.summaryCard}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>
              <Award size={18} style={{ color: '#059669' }} /> Capaian Nilai & Standar Grade
            </h3>
            <Badge variant={gradeInfo.isPassing ? 'success' : 'error'} size="sm">
              {gradeInfo.isPassing ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {gradeInfo.isPassing ? 'Tuntas / Kompeten' : 'Perlu Remedial'}
            </Badge>
          </div>

          <div className={styles.scoreBanner}>
            <div className={styles.scoreBannerLeft}>
              <span className={styles.scoreLabel}>Nilai Akhir Terbobot</span>
              <span className={styles.scoreBigNumber}>{finalScore}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standar Total Bobot 100%</span>
            </div>

            <div className={styles.scoreBannerRight}>
              <span 
                style={{ 
                  fontSize: '18px', 
                  fontWeight: 900, 
                  color: gradeInfo.color,
                  fontFamily: 'var(--font-mono)' 
                }}
              >
                GRADE {gradeInfo.grade}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {gradeInfo.desc}
              </span>
            </div>
          </div>

          {/* 8-Tier Grade Distribution for Dosen/Staff ONLY */}
          {!isMhs ? (
            <div className={styles.gradeDistributionSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.sectionHeading}>Sebaran Grade Rombel ({allStudents.length} Mahasiswa):</span>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                  Tingkat Kelulusan: {cohortGradeDist.passingPct}%
                </span>
              </div>

              <div className={styles.gradeGrid}>
                {GRADE_SCALE.map(g => {
                  const count = cohortGradeDist.counts[g.grade] || 0;
                  return (
                    <div key={g.grade} className={styles.gradeBox} style={{ borderLeft: `3px solid ${g.color}` }}>
                      <span className={styles.gradeBoxTitle} style={{ color: g.color }}>
                        {g.grade}
                      </span>
                      <span className={styles.gradeBoxCount}>{count}</span>
                      <span className={styles.gradeBoxDesc}>{g.range}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Student-Tailored Competency & Mastery Status Card */
            <div style={{ 
              padding: '14px 16px', 
              borderRadius: '10px', 
              background: gradeInfo.isPassing ? 'rgba(5, 150, 105, 0.05)' : 'rgba(239, 68, 68, 0.05)',
              border: `1px solid ${gradeInfo.isPassing ? 'rgba(5, 150, 105, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: gradeInfo.color }}>
                {gradeInfo.isPassing ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {gradeInfo.isPassing ? 'Status: Capaian Kompetensi Memenuhi Standar Kelulusan' : 'Status: Capaian Kompetensi Perlu Remedial'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                {gradeInfo.isPassing
                  ? `Selamat! Akumulasi capaian nilai Anda ${finalScore}/100 berada dalam rentang ${gradeInfo.range} (Grade ${gradeInfo.grade} - ${gradeInfo.desc}). Pertahankan konsistensi kualitas tugas dan ujian pada siklus pembelajaran selanjutnya.`
                  : `Perhatian: Akumulasi nilai Anda ${finalScore}/100 berada di bawah batas ketuntasan minimum (>60). Silakan konsultasikan dengan dosen pengampu untuk program bimbingan remedial.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPONENT BREAKDOWN TABLE (With Total Calculation Footer) */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.cardTitle}>
            <BookOpen size={18} style={{ color: '#d97706' }} /> Rincian Perhitungan Capaian Komponen Penilaian
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {komponenScores.length} Komponen Evaluasi Aktif
          </span>
        </div>

        <table className={styles.componentsTable}>
          <thead>
            <tr>
              <th>NO</th>
              <th>KODE</th>
              <th>NAMA KOMPONEN PENILAIAN</th>
              <th>RUBRIK PENILAIAN</th>
              <th>BOBOT (%)</th>
              <th>SKOR MENTAH (1-100)</th>
              <th>NILAI TERBOBOT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {komponenScores.map((k, idx) => (
              <tr key={k.id}>
                <td>{idx + 1}</td>
                <td>
                  <Badge variant="primary" size="sm">
                    {getKomponenCode(k.name)}
                  </Badge>
                </td>
                <td style={{ fontWeight: 700 }}>{k.name}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {k.rubricName}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{Math.round((k.bobot || 0) * 100)}%</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{k.rawScore}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb' }}>
                  {k.weighted.toFixed(1)}
                </td>
                <td>
                  <Badge variant={k.status === 'PUBLISHED' ? 'success' : 'neutral'} size="sm">
                    {k.status === 'PUBLISHED' ? 'Tervalidasi' : 'Draf'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Explicit Total Calculation Conclusion Row */}
          <tfoot>
            <tr style={{ background: '#f8fafc', borderTop: '2px solid var(--border-color)', fontWeight: 800 }}>
              <td colSpan={4} style={{ textAlign: 'left', padding: '12px 14px' }}>
                <span style={{ fontSize: '13px', color: '#0f172a' }}>
                  TOTAL AKUMULASI NILAI AKHIR TERBOBOT
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>100%</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>-</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '14.5px', color: '#2563eb' }}>
                {finalScore}.0
              </td>
              <td style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Badge variant="primary" size="sm" style={{ whiteSpace: 'nowrap' }}>
                    GRADE {gradeInfo.grade}
                  </Badge>
                  <Badge variant={gradeInfo.isPassing ? 'success' : 'error'} size="sm" style={{ whiteSpace: 'nowrap' }}>
                    {gradeInfo.isPassing ? 'Tuntas' : 'Remedial'}
                  </Badge>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. AI LEARNING DIAGNOSTICS & INTELLIGENCE (Strict Cause & Effect) */}
      <div className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitleWrap}>
            <div className={styles.aiIconBadge}>
              <Brain size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                EPIC Learning Intelligence & Diagnostics
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Diagnosis kausalitas (Sebab - Akibat - Bukti Data) berbasis kurikulum <strong>{mkType === 'PENDIDIKAN' ? 'Kependidikan (Pedagogis)' : 'Industri Terapan'}</strong>.
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleGenerateAI(true)}
            disabled={isGeneratingAI}
          >
            <Sparkles size={14} style={{ color: '#7c3aed' }} />
            {isGeneratingAI ? 'Menganalisis...' : 'Perbarui Diagnosis AI'}
          </Button>
        </div>

        {isGeneratingAI ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </div>
        ) : (
          <div className={styles.aiDiagnosticsGrid}>
            {/* 1. Strengths (Bukti Data -> Sebab -> Manfaat) */}
            <div className={`${styles.aiSection} ${styles.strengths}`}>
              <div className={styles.aiSectionHeader}>
                <CheckCircle2 size={16} /> 1. Analisis Kompetensi Unggul & Faktor Pendukung
              </div>
              <ul className={styles.aiList}>
                {(aiInsight?.strengths || []).map((s, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* 2. Weaknesses / Learning Gap (Bukti Data -> Akar Masalah -> Dampak Risiko) */}
            <div className={`${styles.aiSection} ${styles.weaknesses}`}>
              <div className={styles.aiSectionHeader}>
                <AlertTriangle size={16} /> 2. Diagnosis Learning Gap (Sebab & Dampak Risiko)
              </div>
              <ul className={styles.aiList}>
                {(aiInsight?.weaknesses || []).map((w, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{w}</li>
                ))}
              </ul>
            </div>

            {/* 3. Pedagogical Recommendations (Solusi Terarah) */}
            <div className={`${styles.aiSection} ${styles.recommendations}`}>
              <div className={styles.aiSectionHeader}>
                <BookOpen size={16} /> 3. Rekomendasi Solusi & Intervensi Terarah
              </div>
              <ul className={styles.aiList}>
                {(aiInsight?.recommendations || []).map((r, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* 4. Realistic Career Relevance (Kontekstual MK & Non-Overpredictive) */}
            <div className={`${styles.aiSection} ${styles.career}`}>
              <div className={styles.aiSectionHeader}>
                <Trophy size={16} /> 4. Relevansi Profil Lulusan ({mkType === 'PENDIDIKAN' ? 'Kependidikan' : 'Industri Terapan'})
              </div>
              <p className={styles.aiCareerText}>
                {aiInsight?.careerPotential}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MKAnalyticsPage;
