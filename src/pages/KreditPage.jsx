import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './KreditPage.module.css';
import { useLanguageStore } from '@/stores/languageStore';
import { useUiStore } from '@/stores/uiStore';
import { generateUserManualPdf } from '@/utils/generateUserManualPdf';
import {
  Award,
  UserCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Download
} from 'lucide-react';

const KreditPage = () => {
  const { t } = useLanguageStore();
  const { addToast } = useUiStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadManual = () => {
    setIsGenerating(true);
    try {
      const link = document.createElement('a');
      link.href = '/Buku_Panduan_Lengkap_Platform_EPIC_Rubric.pdf';
      link.download = 'Buku_Panduan_Lengkap_Platform_EPIC_Rubric.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Buku Panduan Lengkap (9 Halaman + Screenshot Asli) berhasil diunduh!', 'success');
    } catch (err) {
      generateUserManualPdf();
      addToast('Buku Panduan Pengguna berhasil diunduh!', 'success');
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const lecturers = [
    {
      id: 'kardiyem',
      name: 'Dr. Kardiyem, S.Pd., M.Pd.',
      jabatan: 'Lektor Kepala',
      prodi: 'Pendidikan Akuntansi (S1)',
      fakultas: 'Fakultas Ekonomika dan Bisnis',
      photo: '/dosen-kardiyem.png',
      expertise: [
        'Education of Accounting',
        'Economics',
        'Accounting Education Technology'
      ],
      stats: {
        sinta: '690',
        scopus: '1',
        gScholar: '8'
      }
    },
    {
      id: 'tuti',
      name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
      jabatan: 'Lektor',
      prodi: 'Pendidikan Akuntansi (S1)',
      fakultas: 'Fakultas Ekonomika dan Bisnis',
      photo: '/dosen-tuti.png',
      expertise: [
        'Education of Accounting',
        'Economics'
      ],
      stats: {
        sinta: '528.601',
        scopus: '2',
        gScholar: '6'
      }
    }
  ];

  return (
    <div className={styles.page}>
      <Header
        title={t('navCredits', 'Kredit & Tim Peneliti')}
        subtitle="Tim akademisi pengembang standar rubrik asesmen vokasi akuntansi berbasis 4 Dimensi EPIC"
        showHelp={false}
        showBell={false}
      />

      <div className={styles.content}>
        {/* Narrative / Intro Banner */}
        <div className={styles.narrativeBanner}>
          <div className={styles.narrativeHeader}>
            <div className={styles.iconCircle}>
              <Sparkles size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className={styles.narrativeTitle}>Pengembang & Peneliti Utama Rubrik EPIC</h2>
              <p className={styles.narrativeSubtitle}>
                Inovasi Asesmen Vokasi Akuntansi Berstandar Akademik Institusional
              </p>
            </div>
            <div>
              <Button
                variant="epic"
                size="md"
                onClick={handleDownloadManual}
                isLoading={isGenerating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={16} />
                <span>Unduh Buku Panduan Resmi (.pdf)</span>
              </Button>
            </div>
          </div>

          <p className={styles.narrativeBody}>
            Platform <strong>EPIC e-Rubric</strong> dikembangkan sebagai hasil riset dan formulasi standar penilaian kompetensi digital
            pada pendidikan vokasi akuntansi yang mengintegrasikan 4 dimensi asesmen utama:
            <em> Evaluative, Predictive, Integrative, dan Critical (EPIC)</em>.
            Diprakarsai oleh tim dosen peneliti dari Fakultas Ekonomika dan Bisnis Universitas Negeri Semarang, platform ini dirancang untuk menghadirkan evaluasi
            pembelajaran yang terstruktur, akuntabel, obyektif, serta mampu menghasilkan pelaporan rapor otomatis berbasis standar institusi.
          </p>
        </div>

        {/* 2 Side-by-Side Profile Cards */}
        <div className={styles.lecturerGrid}>
          {lecturers.map((doc) => (
            <div key={doc.id} className={styles.lecturerCard}>
              <div className={styles.cardInner}>
                {/* Left Side: Photo */}
                <div className={styles.photoWrapper}>
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className={styles.lecturerPhoto}
                  />
                </div>

                {/* Right Side: Meta Info & Stats */}
                <div className={styles.infoWrapper}>
                  <h3 className={styles.lecturerName}>{doc.name}</h3>

                  <div className={styles.metaList}>
                    <div className={styles.metaItem}>
                      <UserCheck size={16} className={styles.metaIcon} />
                      <span>{doc.jabatan}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <GraduationCap size={16} className={styles.metaIcon} />
                      <span>{doc.prodi}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <Building2 size={16} className={styles.metaIcon} />
                      <span>{doc.fakultas}</span>
                    </div>
                  </div>

                  {/* Expertise Chips */}
                  <div className={styles.expertiseContainer}>
                    {doc.expertise.map((exp, idx) => (
                      <span key={idx} className={styles.expertiseChip}>
                        {exp}
                      </span>
                    ))}
                  </div>

                  <div className={styles.divider} />

                  {/* Stat Counters */}
                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <span className={`${styles.statValue} ${styles.sinta}`}>
                        {doc.stats.sinta}
                      </span>
                      <span className={styles.statLabel}>Skor Sinta</span>
                    </div>

                    <div className={styles.statItem}>
                      <span className={`${styles.statValue} ${styles.scopus}`}>
                        {doc.stats.scopus}
                      </span>
                      <span className={styles.statLabel}>Scopus H-index</span>
                    </div>

                    <div className={styles.statItem}>
                      <span className={`${styles.statValue} ${styles.scholar}`}>
                        {doc.stats.gScholar}
                      </span>
                      <span className={styles.statLabel}>G Scholar H-index</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Developer Attribution Footer */}
        <div className={styles.developerFooter}>
          <p className={styles.developerText}>
            Turut membantu dalam pengembangan platform 'EPIC e-Rubric' oleh{' '}
            <a
              href="https://instagram.com/brianwibowoo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.developerLink}
            >
              Apriansyah Wibowo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default KreditPage;
