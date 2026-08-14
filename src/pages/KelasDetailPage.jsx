import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKelasStore } from '@/stores/kelasStore';
import { useMKStore } from '@/stores/mkStore';
import { useAuthStore } from '@/stores/authStore';
import { useTerminology } from '@/hooks/useTerminology';
import { STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HelpButton from '@/components/ui/HelpButton';
import styles from './KelasDetailPage.module.css';
import {
  ArrowLeft, School, BookOpen, Users, Calendar, UserCheck,
  PlusCircle, ArrowRight, Layers, Award, ClipboardList
} from 'lucide-react';

const KelasDetailPage = () => {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { getKelasById } = useKelasStore();
  const { mkList } = useMKStore();
  const { learnerLabel, learnerIdLabel, courseLabel, isSchool } = useTerminology();

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);

  const [activeTab, setActiveTab] = useState('mapel'); // 'mapel' | 'siswa'

  const kelas = getKelasById(kelasId);

  if (!kelas) {
    return (
      <div className={styles.page}>
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>Kelas Tidak Ditemukan</h2>
          <p style={{ margin: '12px 0 20px', color: 'var(--text-secondary)' }}>
            Kelas dengan ID "{kelasId}" tidak ada atau telah dihapus.
          </p>
          <Button variant="primary" onClick={() => navigate('/kelas')}>
            Kembali ke Daftar Kelas
          </Button>
        </Card>
      </div>
    );
  }

  // Get linked mapels from mkStore
  const linkedMapels = (kelas.mapel_ids || [])
    .map(id => mkList.find(m => m.id === id))
    .filter(Boolean);

  // If no explicitly linked mapels, check if any MK matches this class name
  const fallbackMapels = linkedMapels.length > 0 
    ? linkedMapels 
    : mkList.filter(m => (m.rombel || []).some(r => r.name.toLowerCase().includes(kelas.name.toLowerCase())));

  const displayMapels = linkedMapels.length > 0 ? linkedMapels : (fallbackMapels.length > 0 ? fallbackMapels : mkList.slice(0, 2));

  const handleOpenMapel = (mapelId) => {
    if (isLearner) {
      navigate(`/mk/${mapelId}/analytics?kelasId=${kelas.id}`);
    } else {
      navigate(`/mk/${mapelId}?kelasId=${kelas.id}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/kelas')}>
        <ArrowLeft size={16} />
        <span>Kembali ke Daftar Kelas</span>
      </button>

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <div className={styles.iconLarge}>
            <School size={28} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{kelas.name}</h1>
              <Badge variant="primary" size="sm" glow>{kelas.tahun_ajaran}</Badge>
            </div>
            <p className={styles.subtitle}>
              {kelas.jurusan} • Wali Kelas: <strong>{kelas.wali_kelas || '-'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <HelpButton size={22} />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={styles.statsGrid}>
        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(37, 99, 235, 0.08)' }}>
              <Users size={22} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <div className={styles.statNumber}>{kelas.students?.length || 0}</div>
              <div className={styles.statLabel}>Siswa Terdaftar</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)' }}>
              <BookOpen size={22} style={{ color: '#059669' }} />
            </div>
            <div>
              <div className={styles.statNumber}>{displayMapels.length}</div>
              <div className={styles.statLabel}>Mata Pelajaran Aktif</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="md">
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
              <UserCheck size={22} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <div className={styles.statNumber} style={{ fontSize: '15px', fontWeight: 700 }}>
                {kelas.wali_kelas ? kelas.wali_kelas.split(',')[0] : '-'}
              </div>
              <div className={styles.statLabel}>Wali Kelas</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'mapel' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('mapel')}
        >
          <BookOpen size={16} />
          <span>Daftar Mata Pelajaran</span>
          <span className={styles.tabBadge}>{displayMapels.length}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'siswa' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('siswa')}
        >
          <Users size={16} />
          <span>Daftar Siswa</span>
          <span className={styles.tabBadge}>{kelas.students?.length || 0}</span>
        </button>
      </div>

      {/* Tab 1: Mata Pelajaran */}
      {activeTab === 'mapel' && (
        <>
          {displayMapels.length > 0 ? (
            <div className={styles.mapelGrid}>
              {displayMapels.map((mapel) => {
                const kompCount = (mapel.komponen || []).length;
                return (
                  <div
                    key={mapel.id}
                    className={styles.mapelCard}
                    onClick={() => handleOpenMapel(mapel.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenMapel(mapel.id)}
                  >
                    <div className={styles.mapelCardAccent} />
                    <div>
                      <div className={styles.mapelTop}>
                        <div className={styles.mapelIconCircle}>
                          <BookOpen size={20} />
                        </div>
                        <Badge variant="success" size="sm">Aktif</Badge>
                      </div>

                      <h3 className={styles.mapelName}>{mapel.name}</h3>
                      <div className={styles.mapelCode}>
                        <Layers size={13} />
                        <span>{mapel.kode_mk || 'MAPEL-01'}</span>
                        {mapel.sks ? <span>• {mapel.sks} Jam/SKS</span> : null}
                      </div>

                      <div className={styles.mapelMeta}>
                        <span className={styles.mapelMetaChip}>
                          <ClipboardList size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {kompCount} Komponen Penilaian
                        </span>
                        <span className={styles.mapelMetaChip}>
                          Guru: {mapel.dosen_name || mapel.guru_name || 'Dwi Puji Astuti, M.Pd.'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.mapelFooter}>
                      <span className={styles.mapelAction}>Buka Penilaian Mapel</span>
                      <ArrowRight size={16} className={styles.mapelArrow} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyBlock}>
              <BookOpen size={40} className={styles.emptyBlockIcon} />
              <h3 className={styles.emptyBlockTitle}>Belum Ada Mata Pelajaran</h3>
              <p className={styles.emptyBlockDesc}>
                Belum ada mata pelajaran yang dihubungkan ke kelas ini.
              </p>
              {isStaff && (
                <Button variant="primary" onClick={() => navigate('/mk/create')}>
                  <PlusCircle size={16} /> Buat Mata Pelajaran Baru
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Roster Siswa */}
      {activeTab === 'siswa' && (
        <div className={styles.tableWrapper}>
          {kelas.students && kelas.students.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th>Nama Siswa</th>
                  <th>NISN</th>
                  <th>Status</th>
                  <th>Terdaftar Sejak</th>
                </tr>
              </thead>
              <tbody>
                {kelas.students.map((student, idx) => (
                  <tr key={student.id || student.student_id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.studentAvatar}>
                          {(student.full_name || student.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.studentName}>{student.full_name || student.name}</div>
                          <div className={styles.studentId}>{student.nisn || student.nim || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{student.nisn || student.nim || '-'}</code>
                    </td>
                    <td>
                      <Badge variant="success" size="sm">Aktif</Badge>
                    </td>
                    <td>{student.enrolled_at || '14 Jul 2025'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyBlock}>
              <Users size={40} className={styles.emptyBlockIcon} />
              <h3 className={styles.emptyBlockTitle}>Belum Ada Siswa</h3>
              <p className={styles.emptyBlockDesc}>
                Belum ada siswa yang terdaftar di kelas {kelas.name}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KelasDetailPage;
