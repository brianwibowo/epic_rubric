import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Users, 
  Settings, 
  GraduationCap, 
  LineChart, 
  FileCheck, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  // Teacher/Admin Mock Data Summary
  const mockTeacherStats = [
    {
      title: 'Total Kelas Diajar',
      value: '4 Kelas',
      desc: 'XII AKL 1, XII AKL 2, XI AKL 1, XI AKL 2',
      icon: <GraduationCap size={24} style={{ color: 'var(--color-primary)' }} />
    },
    {
      title: 'Total Roster Siswa',
      value: '144 Siswa',
      desc: 'Rata-rata 36 siswa per kelas',
      icon: <Users size={24} style={{ color: 'var(--color-epic-pe)' }} />
    },
    {
      title: 'Penilaian Selesai',
      value: '86 Rapor',
      desc: '60% selesai di evaluasi',
      icon: <FileCheck size={24} style={{ color: 'var(--color-epic-c)' }} />
    }
  ];

  // Student Mock Data Summary
  const studentLatestAssessment = {
    projectName: 'Praktikum Buku Besar & Neraca Saldo',
    date: '8 Juni 2026',
    finalScore: 88,
    status: 'SENT_TO_ANALYTICS',
    focusArea: 'Critical Reflection',
    scores: { E: 4, P: 3, I: 4, C: 2, PE: 4 }
  };

  const handleStartScoring = () => {
    navigate('/classes');
  };

  const handleConfigRubric = () => {
    navigate('/rubric/config');
  };

  return (
    <div className={styles.container}>
      <Header 
        title="Dashboard Utama" 
        actions={
          profile?.role !== 'siswa' && (
            <Button variant="epic" size="sm" onClick={handleStartScoring} iconRight={<ArrowRight size={16} />}>
              Mulai Penilaian
            </Button>
          )
        }
      />

      <div className={styles.content}>
        {/* Welcome Section */}
        <Card variant="glass" padding="lg" className={`${styles.welcomeCard} animate-fade-in`}>
          <div className={styles.welcomeLeft}>
            <span className={styles.greeting}>Selamat datang kembali,</span>
            <h2 className={styles.userName}>{profile?.full_name}</h2>
            <p className={styles.userMeta}>
              {profile?.role === 'admin' && `Nomor Induk Pegawai: ${profile?.nip} | Peran: Administrator/Kaprog`}
              {profile?.role === 'guru' && `Nomor Induk Pegawai: ${profile?.nip} | Peran: Guru Evaluator`}
              {profile?.role === 'siswa' && `Nomor Induk Siswa Nasional: ${profile?.nisn} | Kelas: XII AKL 1`}
            </p>
          </div>
          <div className={styles.welcomeRight}>
            <Badge variant="epic" size="md" glow>
              Tahun Ajaran 2025/2026
            </Badge>
          </div>
        </Card>

        {/* Role-Based UI Display */}
        {profile?.role !== 'siswa' ? (
          /* Guru / Admin View */
          <div className={styles.gridSection}>
            <div className={styles.statsGrid}>
              {mockTeacherStats.map((stat, idx) => (
                <Card key={idx} variant="glass" hoverable padding="md" className={styles.statCard}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statContent}>
                    <span className={styles.statTitle}>{stat.title}</span>
                    <h3 className={styles.statValue}>{stat.value}</h3>
                    <p className={styles.statDesc}>{stat.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className={styles.actionsGrid}>
              <Card variant="solid" padding="md" className={styles.actionCard}>
                <h3 className={styles.actionTitle}>Pintasan Cepat Evaluator</h3>
                <p className={styles.actionText}>
                  Konfigurasikan pembobotan dimensi EPIC (Evaluative, Predictive, Intelligent, Critical, Professional Ethics) atau langsung input skor praktikum.
                </p>
                <div className={styles.actionBtns}>
                  <Button variant="primary" size="md" onClick={handleConfigRubric} iconLeft={<Settings size={18} />}>
                    Atur Bobot Rubrik
                  </Button>
                  <Button variant="secondary" size="md" onClick={handleStartScoring} iconLeft={<GraduationCap size={18} />}>
                    Pilih Kelas
                  </Button>
                </div>
              </Card>

              <Card variant="glass" padding="md" className={styles.announcementCard}>
                <h3 className={styles.actionTitle}>Status Sistem & Netlify</h3>
                <div className={styles.statusRow}>
                  <div className={styles.statusIndicator} />
                  <span>Situs terhubung dengan repositori GitHub: **main** branch</span>
                </div>
                <div className={styles.statusRow}>
                  <div className={styles.statusIndicator} />
                  <span>Auto Deploy: Aktif (Setiap push origin main)</span>
                </div>
                <div className={styles.statusRow}>
                  <div className={styles.statusIndicator} />
                  <span>Infrastruktur Backend: Supabase (Local Simulated Mode)</span>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Siswa View */
          <div className={styles.studentSection}>
            <div className={styles.studentGrid}>
              <Card variant="glass" hoverable padding="md" className={styles.scoreOverviewCard}>
                <div className={styles.scoreHeader}>
                  <div>
                    <span className={styles.scoreSub}>Penilaian Terbaru</span>
                    <h3 className={styles.scoreProject}>{studentLatestAssessment.projectName}</h3>
                  </div>
                  <Badge variant="success" size="sm" glow>
                    Telah Dikirim
                  </Badge>
                </div>
                
                <div className={styles.scoreDisplay}>
                  <div className={styles.scoreCircle}>
                    <span className={styles.scoreVal}>{studentLatestAssessment.finalScore}</span>
                    <span className={styles.scoreLabel}>Nilai Akhir</span>
                  </div>
                  
                  <div className={styles.scoreMetrics}>
                    <div className={styles.metricRow}>
                      <span>Evaluative Understanding (E)</span>
                      <Badge variant="e" size="sm">{studentLatestAssessment.scores.E}/4</Badge>
                    </div>
                    <div className={styles.metricRow}>
                      <span>Predictive Reasoning (P)</span>
                      <Badge variant="p" size="sm">{studentLatestAssessment.scores.P}/4</Badge>
                    </div>
                    <div className={styles.metricRow}>
                      <span>Intelligent Application (I)</span>
                      <Badge variant="i" size="sm">{studentLatestAssessment.scores.I}/4</Badge>
                    </div>
                    <div className={styles.metricRow}>
                      <span>Critical Reflection (C)</span>
                      <Badge variant="c" size="sm">{studentLatestAssessment.scores.C}/4</Badge>
                    </div>
                    <div className={styles.metricRow}>
                      <span>Professional Ethics (PE)</span>
                      <Badge variant="pe" size="sm">{studentLatestAssessment.scores.PE}/4</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <div className={styles.studentSideCol}>
                <Card variant="glass" padding="md" className={styles.focusCard}>
                  <div className={styles.focusIconWrapper}>
                    <AlertCircle size={24} style={{ color: 'var(--color-warning)' }} />
                  </div>
                  <h4 className={styles.focusTitle}>Fokus Perbaikan</h4>
                  <Badge variant="warning" size="md" className={styles.focusDimension} glow>
                    {studentLatestAssessment.focusArea}
                  </Badge>
                  <p className={styles.focusText}>
                    Berdasarkan evaluasi otomatis, dimensi ini memiliki skor terendah. Silakan tingkatkan pemahaman analitis Anda pada bagian refleksi jurnal sebelum praktikum berikutnya.
                  </p>
                </Card>

                <Card variant="solid" padding="md" className={styles.quickActionCard}>
                  <h4 className={styles.actionTitle}>Laporan Lengkap Anda</h4>
                  <p className={styles.actionText}>
                    Lihat perkembangan nilai Anda dari waktu ke waktu atau unduh rapor praktikum resmi (.PDF).
                  </p>
                  <Button variant="epic" size="md" onClick={() => navigate('/analytics')} iconRight={<TrendingUp size={18} />}>
                    Buka Rapor & Grafik
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
