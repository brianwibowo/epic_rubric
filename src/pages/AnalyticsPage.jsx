import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import MacroStats from '@/components/analytics/MacroStats';
import ClassDistributionChart from '@/components/analytics/ClassDistributionChart';
import ProgressLineChart from '@/components/analytics/ProgressLineChart';
import StudentReportCard from '@/components/analytics/StudentReportCard';
import { useExport } from '@/hooks/useExport';
import { RefreshCw, TrendingUp, BarChart4, ClipboardCopy } from 'lucide-react';
import styles from './AnalyticsPage.module.css';

// Mock student roster for local simulation
const MOCK_STUDENTS = [
  { id: 'siswa-1', full_name: 'Ahmad Rifai', nisn: '0081234567' },
  { id: 'siswa-2', full_name: 'Citra Lestari', nisn: '0082345678' },
  { id: 'siswa-3', full_name: 'Dewi Sartika', nisn: '0083456789' },
  { id: 'mock-siswa-uuid', full_name: 'Feri Irawan', nisn: '0087654321' }
];

const AnalyticsPage = () => {
  const { profile } = useAuth();
  const { fetchClassStats, fetchStudentTimeline } = useAnalytics();
  const { exportExcel, exportPdf } = useExport();

  // Common UI State
  const [loading, setLoading] = useState(true);
  
  // Teacher/Admin UI State
  const [selectedClass, setSelectedClass] = useState('XII-AKL-1');
  const [selectedProject, setSelectedProject] = useState('Praktikum Siklus Akuntansi AKL-1');
  const [classStats, setClassStats] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [focusedStudent, setFocusedStudent] = useState(null);
  const [focusedTimeline, setFocusedTimeline] = useState([]);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  // Student UI State
  const [studentTimeline, setStudentTimeline] = useState([]);
  const [studentLatestAssessment, setStudentLatestAssessment] = useState(null);

  // Class and Project selector options
  const classesList = [
    { value: 'XII-AKL-1', label: 'XII AKL 1' },
    { value: 'XII-AKL-2', label: 'XII AKL 2' }
  ];

  const projectsList = [
    { value: 'Praktikum Buku Jurnal', label: 'Praktikum Buku Jurnal' },
    { value: 'Praktikum Buku Besar', label: 'Praktikum Buku Besar' },
    { value: 'Praktikum Siklus Akuntansi AKL-1', label: 'Praktikum Siklus Akuntansi AKL-1' }
  ];

  // Load analytics details
  const loadAnalytics = async () => {
    setLoading(true);
    if (profile?.role === 'siswa') {
      // Load personal student progress
      const timeline = await fetchStudentTimeline(profile.id);
      setStudentTimeline(timeline);
      
      // Load student's latest assessment details from local storage mock table
      const localData = localStorage.getItem('epic_mock_assessments');
      const assessments = localData ? JSON.parse(localData) : [];
      const studentAsses = assessments
        .filter(a => a.student_id === profile.id && a.status === 'SENT_TO_ANALYTICS')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // newest first
        
      setStudentLatestAssessment(studentAsses[0] || null);
    } else {
      // Load teacher class statistics
      const stats = await fetchClassStats(selectedClass, selectedProject);
      setClassStats(stats);

      // Join students table with scores
      const localData = localStorage.getItem('epic_mock_assessments');
      const assessments = localData ? JSON.parse(localData) : [];
      
      const studentsList = MOCK_STUDENTS.map((student, idx) => {
        const match = assessments.find(
          (a) => a.student_id === student.id && a.project_name === selectedProject && a.status === 'SENT_TO_ANALYTICS'
        );
        return {
          id: student.id,
          nisn: student.nisn,
          full_name: student.full_name,
          score: match ? match.final_score : null,
          focus_area: match ? match.focus_area : null
        };
      });
      setClassStudents(studentsList);
      
      // Default focus first student
      if (studentsList.length > 0) {
        handleFocusStudent(studentsList[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      loadAnalytics();
    }
  }, [profile, selectedClass, selectedProject]);

  const handleFocusStudent = async (student) => {
    setLoadingStudentDetail(true);
    setFocusedStudent(student);
    const timeline = await fetchStudentTimeline(student.id);
    setFocusedTimeline(timeline);
    setLoadingStudentDetail(false);
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Nama Siswa',
      sortable: true,
      render: (row) => <strong>{row.full_name}</strong>
    },
    {
      key: 'score',
      label: 'Nilai Akhir',
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {row.score !== null ? row.score : '-'}
        </span>
      )
    },
    {
      key: 'focus_area',
      label: 'Fokus Perbaikan',
      render: (row) => row.focus_area ? (
        <Badge variant={row.focus_area.toLowerCase()} size="sm">
          {row.focus_area}
        </Badge>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tuntas KKM</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner size="lg" />
        <p className={styles.loadingText}>Memproses data analitik...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {profile?.role === 'siswa' ? (
        /* ==========================================
           1. SISWA VIEW: PERSONAL PERFORMANCE
           ========================================== */
        <>
          <Header 
            title="Learning Analytics Anda" 
            actions={
              studentLatestAssessment && (
                <Button
                  variant="epic"
                  size="sm"
                  onClick={() => exportPdf('student-report-print', profile.full_name, studentLatestAssessment.project_name)}
                >
                  Unduh Rapor PDF
                </Button>
              )
            }
          />
          <div className={styles.content}>
            {studentTimeline.length === 0 ? (
              <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
                <BarChart4 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto' }} />
                <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Belum Ada Data</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Guru belum mempublikasikan hasil nilai praktikum Anda. Hubungi guru Anda jika ada kekeliruan.
                </p>
              </Card>
            ) : (
              <div className={styles.studentDashboardGrid}>
                {/* Left: Report Card detail */}
                <div className={styles.studentReportCol} id="student-report-print">
                  {studentLatestAssessment && (
                    <StudentReportCard
                      student={profile}
                      projectName={studentLatestAssessment.project_name}
                      classId={studentLatestAssessment.class_id}
                      scores={{
                        E: studentLatestAssessment.score_e,
                        P: studentLatestAssessment.score_p,
                        I: studentLatestAssessment.score_i,
                        C: studentLatestAssessment.score_c,
                        PE: studentLatestAssessment.score_pe
                      }}
                      feedbacks={{
                        E: studentLatestAssessment.feedback_e,
                        P: studentLatestAssessment.feedback_p,
                        I: studentLatestAssessment.feedback_i,
                        C: studentLatestAssessment.feedback_c,
                        PE: studentLatestAssessment.feedback_pe
                      }}
                      weights={{
                        E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 // default or fetched
                      }}
                      finalScore={studentLatestAssessment.final_score}
                      focusAreaCode={studentLatestAssessment.focus_area}
                      dateEvaluated={studentLatestAssessment.finalized_at || studentLatestAssessment.updated_at}
                    />
                  )}
                </div>

                {/* Right: Progress history chart */}
                <div className={styles.studentChartCol}>
                  <ProgressLineChart 
                    data={studentTimeline} 
                    studentName={profile.full_name} 
                  />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ==========================================
           2. TEACHER/ADMIN VIEW: CLASS ANALYTICS
           ========================================== */
        <>
          <Header
            title="Analitik Hasil Kelas"
            actions={
              <div className={styles.filters}>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={styles.select}
                >
                  {classesList.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={styles.select}
                >
                  {projectsList.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                
                <Button variant="secondary" size="sm" onClick={loadAnalytics} iconLeft={<RefreshCw size={14} />}>
                  Refresh
                </Button>

                <Button
                  variant="epic"
                  size="sm"
                  onClick={() => exportExcel(selectedClass, selectedProject, classStudents)}
                  disabled={classStudents.length === 0}
                >
                  Ekspor Excel
                </Button>
              </div>
            }
          />

          <div className={styles.content}>
            {/* Macro Statistics Card Row */}
            {classStats && <MacroStats stats={classStats.summary} />}

            {/* Dashboard Graphs Section */}
            <div className={styles.graphsGrid}>
              <div className={styles.leftGraph}>
                {classStats && <ClassDistributionChart data={classStats.distribution} />}
              </div>
              <div className={styles.rightGraph}>
                {loadingStudentDetail ? (
                  <Card variant="glass" padding="lg" className={styles.chartLoaderCard}>
                    <Spinner size="md" />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
                      Memproses riwayat siswa...
                    </p>
                  </Card>
                ) : (
                  focusedStudent && (
                    <ProgressLineChart
                      data={focusedTimeline}
                      studentName={focusedStudent.full_name}
                    />
                  )
                )}
              </div>
            </div>

            {/* Student Score list Table below */}
            <Card variant="glass" padding="md" className={styles.tableCard}>
              <h4 className={styles.tableTitle}>Daftar Hasil Nilai Proyek</h4>
              <DataTable
                columns={columns}
                data={classStudents}
                pagination={false}
                onRowClick={(row) => handleFocusStudent(row)}
              />
              <p className={styles.tableHint}>
                * Klik baris nama siswa di atas untuk melihat grafik riwayat perkembangan nilai mereka secara individual di panel kanan.
              </p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
