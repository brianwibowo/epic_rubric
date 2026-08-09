import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './MKOverviewPage.module.css';
import { 
  BookOpen, Users, ClipboardList, BarChart3, 
  Download, Copy, Check, Trash2, ArrowRight, FileText
} from 'lucide-react';
import { exportMKToExcel } from '@/utils/exportExcel';
import { exportReportCardToPdf } from '@/utils/exportPdf';

const MKOverviewPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { getMKById, deleteMK } = useMKStore();
  const { addToast } = useUiStore();
  const [copied, setCopied] = useState(false);

  const isDosen = profile?.role === ROLES.DOSEN || profile?.role === ROLES.ADMIN;
  const isMahasiswa = profile?.role === ROLES.MAHASISWA;
  const mk = getMKById(mkId);

  React.useEffect(() => {
    if (isMahasiswa && mkId) {
      navigate(`/mk/${mkId}/analytics`, { replace: true });
    }
  }, [isMahasiswa, mkId, navigate]);

  if (!mk) {
    return (
      <div className={styles.page}>
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>Mata Kuliah Tidak Ditemukan</h2>
          <p style={{ margin: '12px 0 20px', color: 'var(--text-secondary)' }}>
            MK dengan ID "{mkId}" tidak ada atau telah dihapus.
          </p>
          <Button variant="primary" onClick={() => navigate('/mk')}>
            Kembali ke Daftar MK
          </Button>
        </Card>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mk.join_code);
    setCopied(true);
    addToast('Kode join tersalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportExcel = () => {
    const roster = (mk.students || []).map((s) => ({
      nim: s.nim,
      full_name: s.full_name,
      scores: { 'Proyek': 85, 'Partisipasi': 90, 'Quiz': 78 },
      final_score: 84,
      status: 'PUBLISHED'
    }));
    exportMKToExcel(mk.name, mk.kode_mk, mk.komponen || [], roster);
    addToast('Laporan MK berhasil diekspor ke Excel', 'success');
  };

  const handleExportPdf = () => {
    exportReportCardToPdf('mk-overview-print', profile?.full_name || 'Mahasiswa', mk.name);
    addToast('Memproses cetak Rapor PDF...', 'info');
  };

  const handleDelete = () => {
    if (window.confirm(`Hapus Mata Kuliah "${mk.name}"?`)) {
      deleteMK(mk.id);
      addToast('Mata Kuliah berhasil dihapus', 'info');
      navigate('/mk');
    }
  };

  const activeKomponenCount = (mk.komponen || []).length;
  const studentCount = (mk.students || []).length;

  return (
    <div className={styles.page} id="mk-overview-print">
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <div className={styles.mkIconLarge}>
            <BookOpen size={28} />
          </div>
          <div>
            <div className={styles.mkCodeRow}>
              <span className={styles.kodeMK}>{mk.kode_mk}</span>
              <Badge variant={mk.status === 'ACTIVE' ? 'success' : mk.status === 'DRAFT' ? 'warning' : 'default'}>
                {mk.status === 'ACTIVE' ? 'Aktif' : mk.status === 'DRAFT' ? 'Draft' : 'Diarsipkan'}
              </Badge>
            </div>
            <h1 className={styles.mkTitle}>{mk.name}</h1>
            <p className={styles.mkMeta}>{mk.semester} • Dosen: {mk.dosen_name || 'Dra. Sri Wahyuni, M.Ak.'}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" onClick={handleCopyCode}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Tersalin!' : `Kode: ${mk.join_code}`}
          </Button>

          {isDosen && (
            <>
              <Button variant="outline" onClick={handleExportExcel}>
                <Download size={16} />
                Export Excel
              </Button>
              <Button variant="ghost" onClick={handleDelete} style={{ color: 'var(--color-error)' }} title="Hapus MK">
                <Trash2 size={16} />
              </Button>
            </>
          )}

          {isMahasiswa && (
            <Button variant="primary" onClick={() => navigate(`/mk/${mkId}/analytics`)}>
              <BarChart3 size={16} />
              Lihat Nilai Saya
            </Button>
          )}
        </div>
      </div>

      {mk.description && (
        <p className={styles.description}>{mk.description}</p>
      )}

      {/* Quick Action Navigation Bar */}
      <div className={styles.quickNavGrid}>
        {isDosen ? (
          <>
            <div className={styles.quickNavCard} onClick={() => navigate(`/mk/${mkId}/komponen`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/mk/${mkId}/komponen`)} role="button" tabIndex={0}>
              <ClipboardList size={20} className={styles.quickNavIcon} />
              <div>
                <h4 className={styles.quickNavTitle}>Kelola Komponen Penilaian</h4>
                <p className={styles.quickNavDesc}>Atur bobot 100% dan assign rubrik</p>
              </div>
              <ArrowRight size={16} className={styles.quickNavArrow} />
            </div>

            <div className={styles.quickNavCard} onClick={() => navigate(`/mk/${mkId}/students`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/mk/${mkId}/students`)} role="button" tabIndex={0}>
              <Users size={20} className={styles.quickNavIcon} />
              <div>
                <h4 className={styles.quickNavTitle}>Daftar Mahasiswa</h4>
                <p className={styles.quickNavDesc}>{studentCount} mahasiswa terdaftar</p>
              </div>
              <ArrowRight size={16} className={styles.quickNavArrow} />
            </div>
          </>
        ) : (
          <div className={styles.quickNavCard} onClick={() => navigate(`/mk/${mkId}/analytics`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/mk/${mkId}/analytics`)} role="button" tabIndex={0}>
            <BarChart3 size={20} className={styles.quickNavIcon} />
            <div>
              <h4 className={styles.quickNavTitle}>Analisis Kompetensi & Rapor</h4>
              <p className={styles.quickNavDesc}>Lihat grafik radar dan rekomendasi AI</p>
            </div>
            <ArrowRight size={16} className={styles.quickNavArrow} />
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <Users size={22} className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{studentCount}</div>
              <div className={styles.statLabel}>Mahasiswa Terdaftar</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <ClipboardList size={22} className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{activeKomponenCount}</div>
              <div className={styles.statLabel}>Komponen Penilaian</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <BarChart3 size={22} className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{studentCount > 0 ? `${studentCount}/${studentCount}` : '0/0'}</div>
              <div className={styles.statLabel}>Status Penilaian</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MKOverviewPage;
