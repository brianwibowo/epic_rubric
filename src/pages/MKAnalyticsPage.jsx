import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { ROLES, getDimensionColor } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import HelpButton from '@/components/ui/HelpButton';
import { generateGeminiInsight } from '@/services/geminiService';
import { exportMKToExcel } from '@/utils/exportExcel';
import { exportReportCardToPdf } from '@/utils/exportPdf';
import { getKomponenCode, getKomponenFullName, getKomponenFormatted } from '@/utils/komponenHelper';
import styles from './MKAnalyticsPage.module.css';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  Brain, TrendingUp, Target, Award, AlertTriangle, Sparkles,
  ChevronDown, Download, FileText, BookOpen, Trophy, Info, ChevronRight
} from 'lucide-react';

// ─── EPIC Dimension Educational Descriptions ───
const EPIC_DESCRIPTIONS = {
  E: {
    name: 'Evaluative Understanding',
    short: 'Kemampuan mengevaluasi & memahami konsep secara mendalam',
    detail: 'Mengukur sejauh mana Anda mampu menilai, membandingkan, dan memahami konsep-konsep inti mata kuliah. Termasuk kemampuan menganalisis transaksi, memahami standar, dan mengevaluasi kewajaran laporan.',
    tips: ['Latih mengerjakan soal analisis kasus nyata', 'Baca standar akuntansi (SAK/IFRS) dan bandingkan penerapannya', 'Diskusikan studi kasus bersama kelompok belajar']
  },
  P: {
    name: 'Predictive Reasoning',
    short: 'Kemampuan berpikir prediktif & menalar logis',
    detail: 'Mengukur kemampuan Anda untuk memprediksi dampak keputusan, menganalisis tren data, dan membuat proyeksi berdasarkan informasi yang tersedia.',
    tips: ['Latih soal-soal "what-if scenario"', 'Buat prediksi sebelum mengerjakan perhitungan, lalu verifikasi', 'Pelajari pola-pola dari soal ujian sebelumnya']
  },
  I: {
    name: 'Intelligent Application',
    short: 'Kemampuan menerapkan teori pada praktik nyata',
    detail: 'Mengukur sejauh mana Anda mampu mengaplikasikan teori ke situasi dunia nyata, seperti menyusun laporan keuangan aktual, menyelesaikan kasus perusahaan, atau mengoperasikan software akuntansi.',
    tips: ['Kerjakan simulasi kasus perusahaan riil (PT Tbk)', 'Praktikkan siklus akuntansi lengkap dari awal hingga laporan', 'Gunakan software akuntansi untuk latihan mandiri']
  },
  C: {
    name: 'Critical Reflection',
    short: 'Kemampuan refleksi kritis & evaluasi diri',
    detail: 'Mengukur kemampuan Anda untuk mengevaluasi pekerjaan sendiri secara kritis, mengidentifikasi kelemahan, dan merencanakan perbaikan secara mandiri.',
    tips: ['Setelah mengerjakan tugas, tulis refleksi singkat: apa yang sudah baik & perlu diperbaiki', 'Minta feedback dari teman sebaya sebelum submit', 'Bandingkan jawaban Anda dengan rubrik penilaian dosen']
  }
};

// Mock AI insight (default for Mahasiswa before generation)
const MOCK_AI_INSIGHT = {
  strengths: ['Professional Ethics — konsistensi tinggi dalam etika kerja dan kerapian dokumen.', 'Predictive Reasoning — kemampuan analisis data dan proyeksi cukup kuat.'],
  weaknesses: ['Intelligent Application — penerapan pada kasus nyata masih perlu latihan lebih intensif.'],
  recommendations: ['Perbanyak latihan studi kasus perusahaan riil untuk meningkatkan skor penerapan.', 'Gunakan worksheet akuntansi tambahan untuk melatih siklus lengkap.'],
  careerPotential: 'Berdasarkan pola rubrik, mahasiswa memiliki potensi kuat di bidang Auditing & Compliance. Kemampuan analisis dan etika profesional yang baik cocok untuk karir sebagai Auditor Internal atau Compliance Officer.',
};

const MKAnalyticsPage = () => {
  const { mkId } = useParams();
  const { profile } = useAuthStore();
  const { getMKById } = useMKStore();
  const { addToast } = useUiStore();
  
  const mk = getMKById(mkId);
  const isMhs = profile?.role === ROLES.MAHASISWA;
  const [showAI, setShowAI] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(
    isMhs ? (profile?.id || 's1') : 'ALL'
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customAIInsight, setCustomAIInsight] = useState(null);
  const [aiSource, setAiSource] = useState('HEURISTIC');
  const [aiGeneratedAt, setAiGeneratedAt] = useState(null);
  const [expandedKomponen, setExpandedKomponen] = useState(null);

  const isAllStudents = !isMhs && selectedStudentId === 'ALL';
  const allStudents = mk?.students || [];

  const activeStudentId = isMhs ? (profile?.id || 's1') : selectedStudentId;
  const currentStudentObj = isAllStudents 
    ? { full_name: 'Semua Mahasiswa (Agregat Kelas)', nim: `${allStudents.length} Mahasiswa` }
    : ((allStudents.find(s => s.id === activeStudentId || s.student_id === activeStudentId)) || allStudents[0]);

  // Aggregate student scoring data list
  const studentScoringList = isAllStudents
    ? allStudents.map(s => mk?.scoringData?.[s.id] || mk?.scoringData?.[s.student_id] || {}).filter(Boolean)
    : [mk?.scoringData?.[activeStudentId] || {}];

  // Dynamic komponen scores from store
  const komponenScores = (mk?.komponen || []).map((komp) => {
    const rawScores = studentScoringList
      .map(sd => sd?.[komp.id]?.rawScore)
      .filter(val => val !== undefined && val !== null);
    
    const avgRaw = rawScores.length 
      ? Math.round(rawScores.reduce((a,b)=>a+b, 0) / rawScores.length)
      : 85;
    const weighted = Number((avgRaw * (komp.bobot || 0.20)).toFixed(2));
    
    return {
      id: komp.id,
      name: komp.name,
      rawScore: avgRaw,
      bobot: komp.bobot || 0.20,
      weighted: weighted,
      status: 'PUBLISHED'
    };
  });

  const totalWeighted = komponenScores.reduce((sum, k) => sum + (k.weighted || 0), 0);
  const nilaiAkhir = Math.round(totalWeighted);

  // Calculate dynamic 4 EPIC dimensions from aggregated scoring data
  const dimSums = { E: [], P: [], I: [], C: [] };
  studentScoringList.forEach((stData) => {
    Object.values(stData).forEach((sd) => {
      if (sd?.scores) {
        Object.entries(sd.scores).forEach(([dimCode, scoreVal]) => {
          if (dimSums[dimCode] && scoreVal) {
            dimSums[dimCode].push(scoreVal);
          }
        });
      }
    });
  });

  const radarData = [
    { dimension: 'E', fullName: 'Evaluative Understanding', score: dimSums.E.length ? Number((dimSums.E.reduce((a,b)=>a+b,0)/dimSums.E.length).toFixed(1)) : 3.8, targetScore: 3.0, maxScore: 4 },
    { dimension: 'P', fullName: 'Predictive Reasoning', score: dimSums.P.length ? Number((dimSums.P.reduce((a,b)=>a+b,0)/dimSums.P.length).toFixed(1)) : 3.4, targetScore: 3.0, maxScore: 4 },
    { dimension: 'I', fullName: 'Intelligent Application', score: dimSums.I.length ? Number((dimSums.I.reduce((a,b)=>a+b,0)/dimSums.I.length).toFixed(1)) : 3.5, targetScore: 3.0, maxScore: 4 },
    { dimension: 'C', fullName: 'Critical Reflection', score: dimSums.C.length ? Number((dimSums.C.reduce((a,b)=>a+b,0)/dimSums.C.length).toFixed(1)) : 3.9, targetScore: 3.0, maxScore: 4 },
  ];

  const focusArea = radarData.reduce((min, d) => d.score < min.score ? d : min, radarData[0]);
  const strongestArea = radarData.reduce((max, d) => d.score > max.score ? d : max, radarData[0]);

  // ─── Student Roster Analytics (for Dosen & class ranking) ───
  const studentRosterAnalytics = allStudents.map((st) => {
    const stScoring = mk?.scoringData?.[st.id] || mk?.scoringData?.[st.student_id] || {};
    const stKomponens = (mk?.komponen || []).map((komp) => {
      const raw = stScoring[komp.id]?.rawScore;
      return raw !== undefined && raw !== null ? (raw * (komp.bobot || 0.20)) : 85 * (komp.bobot || 0.20);
    });
    const finalScore = Math.round(stKomponens.reduce((a,b) => a+b, 0));

    const stDims = { E: [], P: [], I: [], C: [] };
    Object.values(stScoring).forEach(sd => {
      if (sd?.scores) {
        Object.entries(sd.scores).forEach(([code, val]) => {
          if (stDims[code] && val) stDims[code].push(val);
        });
      }
    });

    return {
      id: st.id,
      studentId: st.student_id,
      nim: st.nim,
      name: st.full_name || st.name,
      finalScore,
      dimE: stDims.E.length ? Number((stDims.E.reduce((a,b)=>a+b,0)/stDims.E.length).toFixed(1)) : 3.8,
      dimP: stDims.P.length ? Number((stDims.P.reduce((a,b)=>a+b,0)/stDims.P.length).toFixed(1)) : 3.4,
      dimI: stDims.I.length ? Number((stDims.I.reduce((a,b)=>a+b,0)/stDims.I.length).toFixed(1)) : 3.5,
      dimC: stDims.C.length ? Number((stDims.C.reduce((a,b)=>a+b,0)/stDims.C.length).toFixed(1)) : 3.9,
    };
  });

  // ─── Class Statistics (for student reflection card) ───
  const classAvg = studentRosterAnalytics.length 
    ? Math.round(studentRosterAnalytics.reduce((s, st) => s + st.finalScore, 0) / studentRosterAnalytics.length)
    : nilaiAkhir;
  const sortedByScore = [...studentRosterAnalytics].sort((a, b) => b.finalScore - a.finalScore);
  const myRanking = sortedByScore.findIndex(st => st.id === activeStudentId || st.studentId === activeStudentId) + 1;
  const rankMedal = myRanking === 1 ? '🥇' : myRanking === 2 ? '🥈' : myRanking === 3 ? '🥉' : null;

  // ─── Real Trend Data (from komponenScores, not mock) ───
  const trendData = komponenScores
    .filter(k => k.rawScore !== null)
    .map(k => ({ komponen: getKomponenCode(k.name), score: k.rawScore }));

  // ─── Feedback extraction for current student ───
  const getStudentFeedbackForKomponen = (komponenId) => {
    const scoring = mk?.scoringData?.[activeStudentId]?.[komponenId];
    if (!scoring) return null;
    return {
      scores: scoring.scores || {},
      feedbacks: scoring.feedbacks || {},
      rawScore: scoring.rawScore
    };
  };

  // ─── Identify which komponen is most affected by focus dimension ───
  const getKomponenAffectedByDimension = (dimCode) => {
    const affected = [];
    const scoring = isAllStudents ? {} : (mk?.scoringData?.[activeStudentId] || {});
    (mk?.komponen || []).forEach((komp) => {
      const sd = scoring[komp.id];
      if (sd?.scores?.[dimCode] !== undefined) {
        affected.push({ name: komp.name, score: sd.scores[dimCode] });
      }
    });
    return affected.sort((a, b) => a.score - b.score);
  };

  // AI Generator Engine (Gemini Predictive Intelligence)
  const generateGeminiAnalysis = async () => {
    setIsGeneratingAI(true);
    addToast('🤖 Meneruskan prompt rubrik ke Google Gemini AI Engine...', 'info');

    const result = await generateGeminiInsight({
      isMhs,
      studentName: currentStudentObj?.full_name || 'Semua Mahasiswa',
      nilaiAkhir,
      radarData,
      focusArea,
      studentScoring: isAllStudents ? {} : (mk?.scoringData?.[activeStudentId] || {})
    });

    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAiGeneratedAt(timestamp);
    setCustomAIInsight(result);
    setAiSource(result.source || 'HEURISTIC');

    setIsGeneratingAI(false);
    if (result.source === 'LIVE_GEMINI_API') {
      addToast(`✨ Live Google Gemini API berhasil merespons (${timestamp})!`, 'success');
    } else {
      addToast(`🎉 Gemini AI Insight (Predictive Engine) berhasil diperbarui (${timestamp})!`, 'success');
    }
  };

  const currentAIInsight = customAIInsight || (isMhs ? MOCK_AI_INSIGHT : {
    generatedAt: 'Default Auto-Analysis',
    strengths: [
      `Performa Agregat Kelas (${allStudents.length} Mahasiswa): ${Math.round(sortedByScore.filter(s=>s.finalScore>=75).length/Math.max(allStudents.length,1)*100)}% Mahasiswa mencapai batas kelulusan kompetensi.`,
      `Rata-rata Dimensi Evaluative (E) angkatan ${radarData[0].score}/4 — Retensi teori akuntansi dasar sangat tinggi.`,
      'Partisipasi Tugas: 100% Mahasiswa telah mempublikasikan nilai tugas.'
    ],
    weaknesses: [
      `Fokus Pengajaran Angkatan: Dimensi ${focusArea.fullName} (${focusArea.score}/4) memerlukan kelas pengayaan kelompok.`
    ],
    recommendations: [
      `Berikan studi kasus perusahaan terbuka (PT Tbk) khusus untuk mengasah ${focusArea.fullName} bagi seluruh angkatan.`,
      'Jadwalkan asistensi kelompok untuk mahasiswa dengan skor terendah di bawah 75.',
      'Gunakan modul latihan otomatis Gemini AI untuk simulasi ujian akhir.'
    ],
    careerPotential: 'Rekomendasi Dosen & Kurikulum: Kelas ini memiliki kesiapan magang 90% di industri. Rekomendasikan ke program Magang Merdeka di KAP Big 4.'
  });

  const handleExportPdf = () => {
    exportReportCardToPdf('analytics-print-area', currentStudentObj?.full_name || 'Mahasiswa', mk?.name || 'Mata Kuliah');
    addToast('Memproses cetak Rapor PDF...', 'info');
  };

  const handleExportExcel = () => {
    const komps = mk?.komponen || [];
    const roster = (mk?.students || []).map((s) => {
      const stuId = s.id || s.student_id;
      const stuScoring = mk?.scoringData?.[stuId] || {};
      const scores = {};
      let totalWeighted = 0;
      let hasAnyScore = false;

      komps.forEach(komp => {
        const sd = stuScoring[komp.id];
        if (sd?.rawScore != null) {
          scores[komp.name] = sd.rawScore;
          totalWeighted += sd.rawScore * (komp.bobot || 0);
          hasAnyScore = true;
        } else {
          scores[komp.name] = null;
        }
      });

      return {
        nim: s.nim,
        full_name: s.full_name || s.name,
        scores,
        final_score: hasAnyScore ? Math.round(totalWeighted) : null,
        status: hasAnyScore ? 'PUBLISHED' : 'DRAFT'
      };
    });

    exportMKToExcel({
      name: mk?.name || 'Mata Kuliah',
      kode_mk: mk?.kode_mk || 'MK',
      semester: mk?.semester || '',
      kode_semester: mk?.kode_semester || '',
      sks: mk?.sks || 0,
      kelas: mk?.kelas || '',
      dosen_name: mk?.dosen_name || '',
      studentCount: (mk?.students || []).length
    }, komps, roster);
    addToast('Ekspor data nilai MK ke Excel berhasil', 'success');
  };

  // ─── Custom Radar Tooltip ───
  const RadarTooltipContent = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const dim = payload[0]?.payload;
    const desc = EPIC_DESCRIPTIONS[dim?.dimension];
    if (!desc) return null;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '10px', padding: '12px 14px', maxWidth: '260px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '12px'
      }}>
        <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', fontSize: '13px' }}>
          [{dim.dimension}] {desc.name}
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '6px' }}>
          {desc.short}
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <span style={{ color: '#059669', fontWeight: 700 }}>Skor: {dim.score}/4</span>
          <span style={{ color: '#b45309', fontWeight: 700 }}>Target: {dim.targetScore}/4</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page} id="analytics-print-area">
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Analisis & Nilai</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {isMhs 
              ? 'Analisis performa dan refleksi pembelajaran Anda' 
              : `Ringkasan analitik performa untuk ${currentStudentObj?.full_name || 'Seluruh Mahasiswa'}`}
          </p>
        </div>

        <div className={styles.headerRightGroup}>
          {!isMhs && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Mahasiswa:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{
                  padding: '4px 8px', borderRadius: '6px', border: 'none',
                  background: 'transparent', color: 'var(--text-main)',
                  fontWeight: 700, fontSize: '13px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="ALL">🌐 Semua Mahasiswa (Agregat Kelas)</option>
                {(mk?.students || []).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.name} ({s.nim})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isMhs ? (
            <Button variant="outline" onClick={handleExportPdf}>
              <FileText size={16} /> Cetak Rapor PDF
            </Button>
          ) : (
            <Button variant="outline" onClick={handleExportExcel}>
              <Download size={16} /> Ekspor Excel
            </Button>
          )}

          <div 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 14px', borderRadius: '10px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Nilai Akhir MK:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{nilaiAkhir}</span>
            <Badge variant={nilaiAkhir >= 85 ? 'success' : nilaiAkhir >= 75 ? 'info' : 'warning'} size="sm">
              Grade {nilaiAkhir >= 85 ? 'A' : nilaiAkhir >= 75 ? 'B' : 'C'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ═══════ B. KARTU REFLEKSI PEMBELAJARAN (Mahasiswa Only) ═══════ */}
      {isMhs && (
        <Card variant="glass" padding="lg" style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.04), rgba(16, 185, 129, 0.02))',
          border: '1px solid rgba(5, 150, 105, 0.15)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} style={{ color: '#059669' }} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Refleksi Pembelajaran Anda</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Posisi di Kelas */}
            <div style={{
              padding: '14px', borderRadius: '12px',
              background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.12)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Posisi di Kelas
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                {rankMedal && <span style={{ fontSize: '20px' }}>{rankMedal}</span>}
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  #{myRanking || '—'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  dari {allStudents.length} mahasiswa
                </span>
              </div>
              <div style={{ fontSize: '12px', color: nilaiAkhir >= classAvg ? '#059669' : '#d97706', fontWeight: 600, marginTop: '4px' }}>
                {nilaiAkhir >= classAvg 
                  ? `↑ ${nilaiAkhir - classAvg} poin di atas rata-rata kelas (${classAvg})`
                  : `↓ ${classAvg - nilaiAkhir} poin di bawah rata-rata kelas (${classAvg})`
                }
              </div>
            </div>

            {/* Dimensi Terkuat */}
            <div style={{
              padding: '14px', borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                💪 Dimensi Terkuat
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
                [{strongestArea.dimension}] {EPIC_DESCRIPTIONS[strongestArea.dimension]?.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Skor {strongestArea.score}/4 — {EPIC_DESCRIPTIONS[strongestArea.dimension]?.short}
              </div>
            </div>

            {/* Dimensi Perlu Ditingkatkan */}
            <div style={{
              padding: '14px', borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.12)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                🎯 Perlu Ditingkatkan
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>
                [{focusArea.dimension}] {EPIC_DESCRIPTIONS[focusArea.dimension]?.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Skor {focusArea.score}/4 — {EPIC_DESCRIPTIONS[focusArea.dimension]?.short}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          {/* ═══════ RADAR KOMPETENSI EPIC ═══════ */}
          <Card variant="glass" padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <Brain size={18} /> Radar Kompetensi EPIC
              </h3>
              <Badge variant="primary" size="sm">SKOR PER-DIMENSI</Badge>
            </div>
            
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 4]} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <Radar
                    name="Target Standar (3.0)"
                    dataKey="targetScore"
                    stroke="#f59e0b"
                    fill="rgba(245, 158, 11, 0.05)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Radar
                    name="Skor Capaian"
                    dataKey="score"
                    stroke="#059669"
                    fill="rgba(5, 150, 105, 0.18)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#059669' }}
                  />
                  <Tooltip content={<RadarTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                {isAllStudents ? 'Rata-rata Capaian Angkatan' : 'Skor Capaian'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b45309' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                Target Kurikulum (3.0/4.0)
              </span>
            </div>

            {/* ═══════ F. Dimension Breakdown Cards WITH Educational Description ═══════ */}
            <div className={styles.dimLegend}>
              {radarData.map((d, i) => {
                const isAboveTarget = d.score >= d.targetScore;
                const diff = (d.score - d.targetScore).toFixed(1);
                const desc = EPIC_DESCRIPTIONS[d.dimension];
                return (
                  <div key={d.dimension} style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                    <div className={styles.dimItem}>
                      <span className={styles.dimDot} style={{ background: getDimensionColor(i).hex }} />
                      <span className={styles.dimCode}>[{d.dimension}]</span>
                      <span className={styles.dimName}>{d.fullName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: isAboveTarget ? '#059669' : '#d97706' }}>
                          {isAboveTarget ? `▲ +${diff}` : `▼ ${diff}`}
                        </span>
                        <span className={styles.dimScore} style={{ fontSize: '14px', fontWeight: 800 }}>{d.score}</span>
                      </div>
                    </div>
                    {/* Educational description line */}
                    {desc && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '16px', lineHeight: '1.4' }}>
                        {desc.short}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ═══════ C. NILAI PER KOMPONEN WITH EXPANDABLE FEEDBACK ═══════ */}
          <Card variant="glass" padding="lg">
            <h3 className={styles.cardTitle}>
              <Award size={18} /> Nilai per Komponen {isAllStudents ? '(Rata-rata Kelas)' : ''}
            </h3>
            <div className={styles.komponenBreakdown}>
              {komponenScores.map((k, i) => {
                const isExpanded = expandedKomponen === k.id;
                const feedback = isMhs ? getStudentFeedbackForKomponen(k.id) : null;
                return (
                  <div key={k.name}>
                    <div 
                      className={styles.komponenRow} 
                      style={{ cursor: isMhs && feedback ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (isMhs && feedback) {
                          setExpandedKomponen(isExpanded ? null : k.id);
                        }
                      }}
                    >
                      <div className={styles.komponenInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className={styles.komponenName}>{k.name}</span>
                          {isMhs && feedback && (
                            <ChevronRight size={14} style={{ 
                              color: 'var(--text-muted)', 
                              transition: 'transform 0.2s',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }} />
                          )}
                        </div>
                        <span className={styles.komponenBobot}>
                          Bobot {(k.bobot * 100).toFixed(0)}% → Kontribusi: {k.weighted.toFixed(1)} poin
                        </span>
                      </div>
                      <div className={styles.komponenBar}>
                        <div 
                          className={styles.komponenFill} 
                          style={{ 
                            width: k.rawScore ? `${k.rawScore}%` : '0%',
                            background: k.rawScore ? `linear-gradient(90deg, ${getDimensionColor(i).hex}cc, ${getDimensionColor(i).hex}88)` : 'var(--border-color)'
                          }}
                        />
                      </div>
                      <span className={styles.komponenScore}>
                        {k.rawScore !== null ? k.rawScore : '—'}
                      </span>
                    </div>

                    {/* ── Expanded Feedback Detail (Mahasiswa only) ── */}
                    {isExpanded && feedback && (
                      <div style={{
                        margin: '8px 0 4px 0', padding: '12px 14px', borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.12)',
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca', marginBottom: '8px' }}>
                          📝 Feedback Dosen — {k.name} (Skor: {feedback.rawScore})
                        </div>

                        {/* Dimension scores for this komponen */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          {Object.entries(feedback.scores).map(([dimCode, score]) => (
                            <div key={dimCode} style={{
                              padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                              background: score >= 4 ? 'rgba(16, 185, 129, 0.1)' : score >= 3 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: score >= 4 ? '#059669' : score >= 3 ? '#2563eb' : '#d97706',
                              border: `1px solid ${score >= 4 ? 'rgba(16, 185, 129, 0.2)' : score >= 3 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                            }}>
                              [{dimCode}] {score}/4
                            </div>
                          ))}
                        </div>

                        {/* Feedback text */}
                        {Object.entries(feedback.feedbacks).length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {Object.entries(feedback.feedbacks).map(([dimCode, text]) => (
                              <div key={dimCode} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', paddingLeft: '8px', borderLeft: '2px solid rgba(99, 102, 241, 0.2)' }}>
                                <strong style={{ color: 'var(--text-main)' }}>[{dimCode}]</strong> {text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Weighted contribution */}
                        <div style={{
                          marginTop: '10px', padding: '8px 10px', borderRadius: '8px',
                          background: 'rgba(5, 150, 105, 0.06)', fontSize: '12px', color: 'var(--text-secondary)'
                        }}>
                          📊 Kontribusi ke Nilai Akhir: <strong style={{ color: 'var(--text-main)' }}>{feedback.rawScore} × {(k.bobot * 100).toFixed(0)}% = {(feedback.rawScore * k.bobot).toFixed(1)} poin</strong> dari total {nilaiAkhir}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Roster Analytics Table (Dosen/Admin) */}
          {!isMhs && (
            <Card variant="glass" padding="lg" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                  <Award size={18} /> Matriks Performa Mahasiswa ({studentRosterAnalytics.length} Mhs)
                </h3>
                <Badge variant="info" size="sm">EPIC RANKING</Badge>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px' }}>Mahasiswa</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>E</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>P</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>I</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>C</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Nilai Akhir</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRosterAnalytics.map((st) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                          <div>{st.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{st.nim}</div>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: getDimensionColor(0).hex }}>{st.dimE}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: getDimensionColor(1).hex }}>{st.dimP}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: getDimensionColor(2).hex }}>{st.dimI}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: getDimensionColor(3).hex }}>{st.dimC}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{st.finalScore}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStudentId(st.id)}
                            style={{
                              padding: '4px 8px', borderRadius: '6px',
                              border: '1px solid var(--color-primary)',
                              background: 'var(--color-primary-light, rgba(5, 150, 105, 0.1))',
                              color: 'var(--color-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Inspeksi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className={styles.rightCol}>
          {/* ═══════ D. FOKUS PERBAIKAN — REDESIGNED EDUCATIONAL ═══════ */}
          <Card 
            variant="glass" 
            padding="md" 
            className={styles.focusCard}
            style={{ marginTop: '0px', marginBottom: '16px' }}
          >
            <div className={styles.focusHeader}>
              <AlertTriangle size={18} className={styles.focusIcon} />
              <span className={styles.focusLabel}>Fokus Perbaikan</span>
            </div>
            <h3 className={styles.focusDimension}>
              [{focusArea.dimension}] {focusArea.fullName}
            </h3>
            
            {/* Educational definition */}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
              {EPIC_DESCRIPTIONS[focusArea.dimension]?.detail}
            </p>

            {/* Affected komponen */}
            {(() => {
              const affected = getKomponenAffectedByDimension(focusArea.dimension);
              return affected.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Komponen yang terpengaruh:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {affected.map(a => (
                      <span key={a.name} style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: a.score <= 3 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: a.score <= 3 ? '#b45309' : '#059669',
                        border: `1px solid ${a.score <= 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}>
                        {a.name}: {a.score}/4
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actionable improvement tips */}
            {EPIC_DESCRIPTIONS[focusArea.dimension]?.tips && (
              <div style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px dashed rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', marginBottom: '6px' }}>
                  💡 Langkah Perbaikan Konkret:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {EPIC_DESCRIPTIONS[focusArea.dimension].tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* ═══════ AI INSIGHT CARD ═══════ */}
          <Card 
            variant="glass" 
            padding="lg" 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 247, 255, 0.9))',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
              borderRadius: '16px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>AI Insight & Intelligence</span>
                <Badge variant="info" size="sm">Gemini 2.5 Flash</Badge>
              </div>

              <button 
                onClick={() => setShowAI(!showAI)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
              >
                <ChevronDown size={18} className={`${styles.aiChevron} ${showAI ? styles.open : ''}`} />
              </button>
            </div>

            {/* Action Button */}
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={generateGeminiAnalysis}
                disabled={isGeneratingAI}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '10px 16px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #d946ef)',
                  color: '#ffffff', fontWeight: 700, fontSize: '13px',
                  cursor: isGeneratingAI ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: isGeneratingAI ? 0.75 : 1
                }}
              >
                <Sparkles size={16} style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }} />
                <span>{isGeneratingAI ? 'Gemini AI Menganalisis Data...' : 'Generate Gemini AI Analysis'}</span>
              </button>
            </div>

            {showAI && (
              <div className={styles.aiContent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isGeneratingAI && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 0' }}>
                    <Skeleton height="20px" width="60%" />
                    <Skeleton height="14px" width="90%" />
                    <Skeleton height="14px" width="80%" />
                    <Skeleton height="20px" width="50%" style={{ marginTop: '10px' }} />
                    <Skeleton height="14px" width="85%" />
                    <Skeleton height="40px" width="100%" style={{ marginTop: '10px', borderRadius: '8px' }} />
                  </div>
                )}

                {!isGeneratingAI && !customAIInsight && (
                  <div 
                    style={{ 
                      textAlign: 'center', padding: '24px 16px', borderRadius: '12px',
                      background: 'rgba(139, 92, 246, 0.04)', 
                      border: '1px dashed rgba(139, 92, 246, 0.25)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={22} style={{ color: '#8b5cf6' }} />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Analisis AI Belum Diproduksi
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '320px', lineHeight: '1.5' }}>
                      Klik tombol <strong>"Generate Gemini AI Analysis"</strong> di atas untuk memproses data rubrik 4D EPIC dan memproduksi analisis kecerdasan AI secara real-time.
                    </p>
                  </div>
                )}

                {!isGeneratingAI && customAIInsight && (
                  <>
                    {aiGeneratedAt && (
                      <div 
                        style={{ 
                          fontSize: '11px', fontWeight: 700, color: '#7c3aed',
                          background: 'rgba(124, 58, 237, 0.08)', padding: '6px 12px',
                          borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.15)',
                          display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                        Analisis Terkini: {aiGeneratedAt} ({currentStudentObj?.full_name || 'Seluruh Mhs'})
                      </div>
                    )}

                    {/* Strengths */}
                    <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.06)', borderLeft: '4px solid #10b981' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#047857', marginBottom: '8px' }}>
                        💪 Kekuatan {isMhs ? 'Personal' : 'Kelas & Mahasiswa'}
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {customAIInsight.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.06)', borderLeft: '4px solid #f59e0b' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>
                        ⚠️ Area Perbaikan {isMhs ? 'Personal' : 'Rekomendasi Dosen'}
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {customAIInsight.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.06)', borderLeft: '4px solid #6366f1' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#4338ca', marginBottom: '8px' }}>
                        📋 Rekomendasi {isMhs ? 'Studi Mandiri' : 'Strategi Pengajaran Dosen'}
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {customAIInsight.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    {/* Career Potential */}
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.07))', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#6b21a8', marginBottom: '6px' }}>
                        🎯 {isMhs ? 'Potensi Karir Personal' : 'Proyeksi Karir & Industri Mahasiswa'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {customAIInsight.careerPotential}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* ═══════ E. TREN PERFORMA (DATA REAL) ═══════ */}
          <Card variant="glass" padding="lg">
            <h3 className={styles.cardTitle}>
              <TrendingUp size={18} /> Tren Performa per Komponen
            </h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="komponen" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#059669" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Belum ada data komponen yang dipublikasikan.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MKAnalyticsPage;
