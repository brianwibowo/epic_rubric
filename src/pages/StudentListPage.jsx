import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import BulkImport from '@/components/data/BulkImport';
import { useStudents } from '@/hooks/useStudents';
import { User, ClipboardList, PenTool, ArrowLeft, RefreshCw, GraduationCap, Plus } from 'lucide-react';
import styles from './StudentListPage.module.css';

const MOCK_ASSESSMENTS_KEY = 'epic_mock_assessments';
const PROJECT_NAME = 'Praktikum Siklus Akuntansi AKL-1';

const StudentListPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const { fetchClassRoster, bulkImportStudents, isLoading: isImporting } = useStudents();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load students and join with their assessment status from localStorage
  const loadRoster = async () => {
    setIsLoading(true);
    const roster = await fetchClassRoster(classId);
    
    const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
    const assessments = localData ? JSON.parse(localData) : [];
    
    const joinedData = roster.map((student) => {
      const match = assessments.find(
        (a) => a.student_id === student.id && a.project_name === PROJECT_NAME
      );
      return {
        ...student,
        score: match ? match.final_score : null,
        status: match ? match.status : 'BELUM_DINILAI'
      };
    });
    
    setStudents(joinedData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (classId) {
      loadRoster();
    }
  }, [classId]);

  const handleScoreStudent = (studentId) => {
    navigate(`/scoring/${classId}/${studentId}`);
  };

  const handleImportSuccess = async (parsedData) => {
    try {
      await bulkImportStudents(classId, parsedData);
      setImportModalOpen(false);
      loadRoster();
    } catch (e) {
      // hook throws toast alert
    }
  };

  const columns = [
    {
      key: 'nisn',
      label: 'NISN',
      sortable: true,
      render: (row) => <span className={styles.nisnText}>{row.nisn}</span>
    },
    {
      key: 'full_name',
      label: 'Nama Siswa',
      sortable: true,
      render: (row) => (
        <div className={styles.nameCell}>
          <User size={14} className={styles.userIcon} />
          <span className={styles.nameText}>{row.full_name}</span>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Nilai Akhir',
      sortable: true,
      render: (row) => (
        <span className={row.score ? styles.scoreText : styles.mutedText}>
          {row.score !== null ? row.score : '-'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status Evaluasi',
      sortable: true,
      render: (row) => (
        <Badge
          variant={
            row.status === 'SENT_TO_ANALYTICS'
              ? 'success'
              : row.status === 'FINALIZED'
                ? 'info'
                : row.status === 'DRAFT'
                  ? 'warning'
                  : 'primary' // BELUM_DINILAI
          }
          size="sm"
          glow={row.status !== 'BELUM_DINILAI'}
        >
          {row.status === 'SENT_TO_ANALYTICS' ? 'SENT' : row.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Lembar Nilai',
      render: (row) => {
        let btnText = 'Beri Nilai';
        let btnVariant = 'primary';
        if (row.status === 'DRAFT') {
          btnText = 'Revisi Draf';
          btnVariant = 'outline';
        } else if (row.status === 'FINALIZED' || row.status === 'SENT_TO_ANALYTICS') {
          btnText = 'Lihat Kokpit';
          btnVariant = 'secondary';
        }

        return (
          <Button
            variant={btnVariant}
            size="sm"
            onClick={() => handleScoreStudent(row.id)}
            iconLeft={<PenTool size={14} />}
          >
            {btnText}
          </Button>
        );
      }
    }
  ];

  return (
    <div className={styles.container}>
      <Header
        title={`Roster Siswa Kelas ${classId.replace('-', ' ')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/classes')}
              iconLeft={<ArrowLeft size={16} />}
            >
              Kembali
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadRoster}
              disabled={isLoading}
              iconLeft={<RefreshCw size={14} />}
            >
              Segarkan
            </Button>
            <Button
              variant="epic"
              size="sm"
              onClick={() => setImportModalOpen(true)}
              disabled={isLoading}
              iconLeft={<Plus size={16} />}
            >
              Impor Siswa (.xlsx)
            </Button>
          </div>
        }
      />

      <div className={styles.content}>
        <div className={styles.projectCard}>
          <div className={styles.projectIcon}>
            <GraduationCap size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className={styles.projectInfo}>
            <span className={styles.projectLabel}>Praktikum Berjalan</span>
            <h3 className={styles.projectName}>{PROJECT_NAME}</h3>
            <p className={styles.projectDesc}>
              Evaluasi dilakukan menggunakan bobot kompetensi aktif yang dikonfigurasikan di halaman pengaturan rubrik.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          pagination={false}
        />
      </div>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Impor Roster Siswa Massal"
        size="md"
      >
        <BulkImport
          classId={classId}
          onImport={handleImportSuccess}
          isLoading={isImporting}
        />
      </Modal>
    </div>
  );
};

export default StudentListPage;
