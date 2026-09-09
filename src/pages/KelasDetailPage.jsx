import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKelasStore } from '@/stores/kelasStore';
import { useMKStore } from '@/stores/mkStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import { STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import HelpButton from '@/components/ui/HelpButton';
import styles from './KelasDetailPage.module.css';
import {
  ArrowLeft, School, BookOpen, Users, Calendar, UserCheck,
  PlusCircle, ArrowRight, Layers, Award, ClipboardList, Trash2,
  ExternalLink, CheckCircle2, Sparkles
} from 'lucide-react';

const KelasDetailPage = () => {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { getKelasById, addMapelToKelas, removeMapelFromKelas } = useKelasStore();
  const { mkList, addRombel } = useMKStore();
  const { addToast } = useUiStore();
  const { learnerLabel, learnerIdLabel, courseLabel, isSchool } = useTerminology();

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);

  const [activeTab, setActiveTab] = useState('mapel'); // 'mapel' | 'siswa'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExistingMkId, setSelectedExistingMkId] = useState('');

  // Background refresh to catch mapels created simultaneously by others
  useEffect(() => {
    useKelasStore.getState().syncFromSupabase();
    useMKStore.getState().syncFromSupabase();
  }, [kelasId]);

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

  const displayMapels = linkedMapels.length > 0 ? linkedMapels : fallbackMapels;

  // Unlinked mapels available to be attached to this class
  const unlinkedMapels = mkList.filter(m => !(kelas.mapel_ids || []).includes(m.id));

  const handleOpenMapel = (mapelId) => {
    if (isLearner) {
      navigate(`/mk/${mapelId}/analytics?kelasId=${kelas.id}`);
    } else {
      navigate(`/mk/${mapelId}?kelasId=${kelas.id}`);
    }
  };

  const handleLinkExistingMapel = () => {
    if (!selectedExistingMkId) {
      addToast('Pilih mata pelajaran terlebih dahulu!', 'warning');
      return;
    }

    addMapelToKelas(kelas.id, selectedExistingMkId);

    // If target MK doesn't have a rombel for this class, add it so students are enrolled
    const targetMK = mkList.find(m => m.id === selectedExistingMkId);
    const hasRombel = (targetMK?.rombel || []).some(r => r.name.toLowerCase() === kelas.name.toLowerCase());
    if (!hasRombel) {
      addRombel(selectedExistingMkId, {
        name: kelas.name,
        is_school: true,
        tahun_ajaran: kelas.tahun_ajaran,
        guru_pengampu: kelas.wali_kelas || profile?.full_name,
        students: kelas.students || []
      });
    }

    addToast(`Mata pelajaran "${targetMK?.name || 'Pilihan'}" berhasil dihubungkan ke kelas ${kelas.name}!`, 'success', 3500);
    setIsAddModalOpen(false);
    setSelectedExistingMkId('');
  };

  const handleUnlinkMapel = (e, mapelId, mapelName) => {
    e.stopPropagation();
    if (window.confirm(`Lepaskan mata pelajaran "${mapelName}" dari kelas ${kelas.name}?`)) {
      removeMapelFromKelas(kelas.id, mapelId);
      addToast(`Mata pelajaran "${mapelName}" dilepaskan dari kelas ${kelas.name}.`, 'info');
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

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isStaff && (
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle size={15} /> Tambah Mapel
            </Button>
          )}
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
            <>
              {isStaff && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Total <strong>{displayMapels.length}</strong> mata pelajaran terhubung dengan kelas ini
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle size={15} /> Tambah Mapel Lain
                  </Button>
                </div>
              )}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Badge variant="success" size="sm">Aktif</Badge>
                            {isStaff && (
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'color 0.15s ease'
                                }}
                                title="Lepaskan mata pelajaran dari kelas ini"
                                onClick={(e) => handleUnlinkMapel(e, mapel.id, mapel.name)}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
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
            </>
          ) : (
            <div className={styles.emptyBlock}>
              <BookOpen size={40} className={styles.emptyBlockIcon} />
              <h3 className={styles.emptyBlockTitle}>Belum Ada Mata Pelajaran</h3>
              <p className={styles.emptyBlockDesc}>
                Belum ada mata pelajaran yang dihubungkan ke kelas <strong>{kelas.name}</strong>.
              </p>
              {isStaff && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle size={16} /> Tambah / Buat Mata Pelajaran
                  </Button>
                </div>
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

      {/* MODAL TAMBAH / HUBUNGKAN MATA PELAJARAN */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedExistingMkId('');
        }}
        title={`Tambah Mata Pelajaran ke ${kelas.name}`}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Card 1: Buat Mapel Baru */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
              <strong style={{ fontSize: '15px' }}>Opsi 1: Buat Mata Pelajaran Baru</strong>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Rancang mata pelajaran baru lengkap dengan konfigurasi rubrik & komponen penilaian. Peserta didik kelas <strong>{kelas.name}</strong> akan otomatis terdaftar di rombel mapel tersebut.
            </p>
            <div style={{ marginTop: '4px' }}>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  navigate(`/mk/create?kelasId=${kelas.id}`);
                }}
              >
                <PlusCircle size={15} /> Buka Form Buat Mapel Baru
              </Button>
            </div>
          </div>

          {/* Card 2: Hubungkan Mapel Yang Sudah Ada */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#059669' }} />
              <strong style={{ fontSize: '15px' }}>Opsi 2: Hubungkan dari Mapel yang Tersedia</strong>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Pilih dari katalog mata pelajaran yang sudah terdaftar di sistem untuk diajarkan di rombel kelas ini:
            </p>

            {unlinkedMapels.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input, var(--bg-app))',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  value={selectedExistingMkId}
                  onChange={(e) => setSelectedExistingMkId(e.target.value)}
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {unlinkedMapels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.kode_mk}) • {m.komponen?.length || 0} Komponen
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedExistingMkId}
                    onClick={handleLinkExistingMapel}
                  >
                    <CheckCircle2 size={15} /> Hubungkan ke Kelas Ini
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                Semua mata pelajaran di sistem sudah terhubung ke kelas ini.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KelasDetailPage;
