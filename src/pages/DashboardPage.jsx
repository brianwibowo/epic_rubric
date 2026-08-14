import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useKelasStore } from '@/stores/kelasStore';
import { useRubricStore } from '@/stores/rubricStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTerminology } from '@/hooks/useTerminology';
import { ROLES, STAFF_ROLES, ROLE_LABELS } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HelpButton from '@/components/ui/HelpButton';
import styles from './DashboardPage.module.css';
import { 
  BookOpen, Users, ClipboardList, TrendingUp, 
  ArrowRight, Award, School, ShieldAlert, UserCheck,
  UserPlus, PlusCircle, CheckCircle2, FileText, ChevronRight,
  Shield, Layers, Activity, Eye
} from 'lucide-react';

const DashboardPage = () => {
  const { profile } = useAuthStore();
  const { mkList } = useMKStore();
  const { kelasList } = useKelasStore();
  const { rubrics } = useRubricStore();
  const { notifications } = useNotificationStore();
  const { courseLabel, coursePluralLabel, learnerLabel, learnerPluralLabel, isSchool } = useTerminology();
  const navigate = useNavigate();
  
  const role = profile?.role;
  const isAdmin = role === ROLES.ADMIN;
  const isStaff = STAFF_ROLES.includes(role);

  // Admin monitoring active tab
  const [adminTab, setAdminTab] = useState('smk'); // 'smk' | 'vokasi' | 'users' | 'audit'

  // Total metrics
  const totalUnivStudents = mkList.reduce((sum, mk) => {
    const univRombels = (mk.rombel || []).filter(r => !r.is_school && !r.name.includes('AKL'));
    return sum + univRombels.reduce((acc, r) => acc + (r.students?.length || 0), 0);
  }, 0) || 11;

  const totalSMKStudents = kelasList.reduce((sum, k) => sum + (k.students?.length || 0), 0) || 28;
  const totalKomponen = mkList.reduce((sum, mk) => sum + (mk.komponen ? mk.komponen.length : 0), 0);

  // User Demographics data
  const userDemographics = [
    { role: 'Administrator', count: 1, label: 'Super Admin', icon: <Shield size={20} style={{ color: '#dc2626' }} />, bg: 'rgba(220, 38, 38, 0.08)', target: '/admin/users' },
    { role: 'Dosen Vokasi', count: 1, label: 'Dosen Pengampu', icon: <BookOpen size={20} style={{ color: '#2563eb' }} />, bg: 'rgba(37, 99, 235, 0.08)', target: '/admin/users' },
    { role: 'Guru SMK', count: 4, label: 'Pendidik SMK', icon: <School size={20} style={{ color: '#059669' }} />, bg: 'rgba(5, 150, 105, 0.08)', target: '/admin/users' },
    { role: 'Mahasiswa', count: totalUnivStudents, label: 'Mahasiswa Vokasi', icon: <Users size={20} style={{ color: '#7c3aed' }} />, bg: 'rgba(124, 58, 237, 0.08)', target: '/admin/users' },
    { role: 'Siswa SMK', count: totalSMKStudents, label: 'Siswa Terdaftar', icon: <UserCheck size={20} style={{ color: '#d97706' }} />, bg: 'rgba(217, 119, 6, 0.08)', target: '/admin/users' }
  ];

  // Recent system audit activities for admin
  const recentAuditLogs = [
    { id: 'log-1', action: 'Finalisasi Nilai Rubrik EPIC', actor: 'Dra. Sri Wahyuni (Guru)', target: 'Ahmad Rifai • XII AKL 1', time: '10 menit lalu', type: 'FINALIZE' },
    { id: 'log-2', action: 'Publikasi Penilaian Proyek', actor: 'Dwi Puji Astuti (Dosen)', target: 'Feri Irawan • PE 2025 A', time: '1 jam lalu', type: 'PUBLISH' },
    { id: 'log-3', action: 'Penetapan Template Rubrik', actor: 'Dr. Budi Santoso (Admin)', target: 'Rubrik 4-Dimensi EPIC v2', time: '3 jam lalu', type: 'RUBRIC' },
    { id: 'log-4', action: 'Pembaruan Roster Kelas', actor: 'Siti Rahmawati (Guru)', target: 'Rombongan Belajar XI AKL 1', time: '5 jam lalu', type: 'UPDATE' },
  ];

  // ================= ADMIN EXECUTIVE VIEW =================
  if (isAdmin) {
    return (
      <div className={styles.page}>
        {/* Admin Header */}
        <div className={styles.welcomeSection}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className={styles.welcomeTitle}>
                Pusat Komando Eksekutif Administrator 🛡️
              </h1>
              <HelpButton size={22} />
            </div>
            <p className={styles.welcomeSubtitle}>
              Monitoring terpadu seluruh jalur institusi: <strong>Sekolah Menengah Kejuruan (SMK)</strong> & <strong>Perguruan Tinggi (Vokasi)</strong>, serta tata kelola pengguna dan audit keamanan.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/audit-log')}>
              <ShieldAlert size={15} /> Audit Logs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
              <UserPlus size={15} /> Kelola Pengguna
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/mk/create')}>
              <PlusCircle size={15} /> Buat MK / Mapel
            </Button>
          </div>
        </div>

        {/* 4 Multi-Institution KPI Stats */}
        <div className={styles.statsRow}>
          <Card variant="glass" padding="md">
            <div className={styles.stat}>
              <div className={styles.statIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)' }}>
                <School size={22} style={{ color: '#059669' }} />
              </div>
              <div>
                <div className={styles.statValue}>{kelasList.length} Kelas</div>
                <div className={styles.statLabel}>Jalur SMK ({totalSMKStudents} Siswa)</div>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <div className={styles.stat}>
              <div className={styles.statIconWrap} style={{ background: 'rgba(37, 99, 235, 0.08)' }}>
                <BookOpen size={22} style={{ color: '#2563eb' }} />
              </div>
              <div>
                <div className={styles.statValue}>{mkList.length} Mata Kuliah</div>
                <div className={styles.statLabel}>Jalur Vokasi ({totalUnivStudents} Mahasiswa)</div>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <div className={styles.stat}>
              <div className={styles.statIconWrap} style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
                <ClipboardList size={22} style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <div className={styles.statValue}>{rubrics.length} Template</div>
                <div className={styles.statLabel}>Bank Rubrik Terverifikasi</div>
              </div>
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <div className={styles.stat}>
              <div className={styles.statIconWrap} style={{ background: 'rgba(217, 119, 6, 0.08)' }}>
                <Activity size={22} style={{ color: '#d97706' }} />
              </div>
              <div>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Status Sistem & Keamanan</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Multi-Role Monitoring Switcher Tabs */}
        <div className={styles.adminTabContainer}>
          <button 
            type="button"
            className={`${styles.adminTabBtn} ${adminTab === 'smk' ? styles.activeAdminTab : ''}`}
            onClick={() => setAdminTab('smk')}
          >
            <School size={16} />
            <span>Pantau Jalur SMK</span>
            <span className={styles.adminTabBadge}>{kelasList.length} Kelas</span>
          </button>

          <button 
            type="button"
            className={`${styles.adminTabBtn} ${adminTab === 'vokasi' ? styles.activeAdminTab : ''}`}
            onClick={() => setAdminTab('vokasi')}
          >
            <BookOpen size={16} />
            <span>Pantau Jalur Perguruan Tinggi</span>
            <span className={styles.adminTabBadge}>{mkList.length} MK</span>
          </button>

          <button 
            type="button"
            className={`${styles.adminTabBtn} ${adminTab === 'users' ? styles.activeAdminTab : ''}`}
            onClick={() => setAdminTab('users')}
          >
            <Users size={16} />
            <span>Distribusi Akun & Peran</span>
            <span className={styles.adminTabBadge}>5 Peran</span>
          </button>

          <button 
            type="button"
            className={`${styles.adminTabBtn} ${adminTab === 'audit' ? styles.activeAdminTab : ''}`}
            onClick={() => setAdminTab('audit')}
          >
            <ShieldAlert size={16} />
            <span>Audit Trail & Aktivitas</span>
            <span className={styles.adminTabBadge}>Real-Time</span>
          </button>
        </div>

        {/* Main Content Area based on Selected Admin Tab */}
        <div className={styles.mainGrid}>
          {/* LEFT PANEL */}
          <div className={styles.mkSection}>
            {/* TAB 1: SMK TRACK */}
            {adminTab === 'smk' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Daftar Rombongan Belajar SMK Aktif</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Total {kelasList.length} kelas terdaftar di SMK Akuntansi & Keuangan Lembaga
                    </p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/kelas')}>
                    Buka Seluruh Kelas <ArrowRight size={14} />
                  </button>
                </div>

                <div className={styles.mkList}>
                  {kelasList.map((k) => (
                    <div 
                      key={k.id} 
                      className={styles.mkItem} 
                      onClick={() => navigate(`/kelas/${k.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.mkItemIcon} style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                        <School size={18} />
                      </div>
                      <div className={styles.mkItemInfo}>
                        <h4 className={styles.mkItemName}>{k.name}</h4>
                        <span className={styles.mkItemMeta}>
                          {k.jurusan} • Wali: <strong>{k.wali_kelas || '-'}</strong>
                        </span>
                      </div>
                      <div className={styles.mkItemRight}>
                        <span className={styles.progressText}>
                          {k.students?.length || 0} Siswa • {k.mapel_ids?.length || 0} Mapel
                        </span>
                        <Badge variant="success" size="sm">Tahun Ajaran {k.tahun_ajaran}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB 2: UNIVERSITY TRACK */}
            {adminTab === 'vokasi' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Katalog Mata Kuliah Perguruan Tinggi</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Mata kuliah vokasi terintegrasi asesmen rubrik Likert 1-4
                    </p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/mk')}>
                    Buka Seluruh MK <ArrowRight size={14} />
                  </button>
                </div>

                <div className={styles.mkList}>
                  {mkList.map((mk) => {
                    const univRombels = (mk.rombel || []).filter(r => !r.is_school && !r.name.includes('AKL'));
                    const studentCount = univRombels.reduce((sum, r) => sum + (r.students?.length || 0), 0);

                    return (
                      <div 
                        key={mk.id} 
                        className={styles.mkItem} 
                        onClick={() => navigate(`/mk/${mk.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.mkItemIcon}>
                          <BookOpen size={18} />
                        </div>
                        <div className={styles.mkItemInfo}>
                          <h4 className={styles.mkItemName}>{mk.name}</h4>
                          <span className={styles.mkItemMeta}>
                            Kode: {mk.kode_mk} • {mk.sks} SKS • Dosen: {mk.dosen_name || '-'}
                          </span>
                        </div>
                        <div className={styles.mkItemRight}>
                          <span className={styles.progressText}>
                            {univRombels.length} Rombel • {studentCount} Mahasiswa
                          </span>
                          <Badge variant="primary" size="sm">{mk.semester}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 3: USER DEMOGRAPHICS */}
            {adminTab === 'users' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Sebaran Pengguna Berdasarkan Peran</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Klasifikasi hak akses pengguna aktif di seluruh sistem
                    </p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/admin/users')}>
                    Kelola Pengguna <ArrowRight size={14} />
                  </button>
                </div>

                <div className={styles.demographicsGrid}>
                  {userDemographics.map((item, idx) => (
                    <div key={idx} className={styles.demoCard} onClick={() => navigate(item.target)} role="button" tabIndex={0}>
                      <div className={styles.demoIconWrap} style={{ background: item.bg }}>
                        {item.icon}
                      </div>
                      <div>
                        <div className={styles.demoCount}>{item.count}</div>
                        <div className={styles.demoRole}>{item.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB 4: AUDIT TRAIL */}
            {adminTab === 'audit' && (
              <>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Audit Trail Aktivitas Penilaian</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Catatan tindakan penilaian dan perubahan data oleh evaluator
                    </p>
                  </div>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/admin/audit-log')}>
                    Buka Seluruh Log <ArrowRight size={14} />
                  </button>
                </div>

                <div className={styles.mkList}>
                  {recentAuditLogs.map((log) => (
                    <div key={log.id} className={styles.mkItem} onClick={() => navigate('/admin/audit-log')}>
                      <div className={styles.mkItemIcon} style={{ background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' }}>
                        <ShieldAlert size={18} />
                      </div>
                      <div className={styles.mkItemInfo}>
                        <h4 className={styles.mkItemName}>{log.action}</h4>
                        <span className={styles.mkItemMeta}>
                          Oleh: <strong>{log.actor}</strong> • Sasaran: {log.target}
                        </span>
                      </div>
                      <div className={styles.mkItemRight}>
                        <span className={styles.progressText}>{log.time}</span>
                        <Badge variant="outline" size="sm">Audit Log</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL: NOTIFICATIONS & QUICK CONTROLS */}
          <div className={styles.notifSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Aktivitas Terkini</h2>
              <button className={styles.viewAllBtn} onClick={() => navigate('/notifications')}>
                Semua <ArrowRight size={14} />
              </button>
            </div>
            <div className={styles.notifList}>
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className={styles.notifItem}>
                  <div className={styles.notifDot} style={{ background: n.is_read ? 'var(--text-muted)' : 'var(--color-primary)' }} />
                  <div>
                    <p className={styles.notifTitle}>{n.title}</p>
                    <p className={styles.notifMeta}>{n.mkName || 'Sistem'} • {formatTimeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className={styles.emptyNotif}>Tidak ada notifikasi baru</p>
              )}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Navigasi Cepat Admin:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/kelas')} style={{ justifyContent: 'flex-start' }}>
                  <School size={15} /> Daftar Kelas SMK
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/mk')} style={{ justifyContent: 'flex-start' }}>
                  <BookOpen size={15} /> Daftar Mata Kuliah
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/rubrik')} style={{ justifyContent: 'flex-start' }}>
                  <ClipboardList size={15} /> Library Template Rubrik
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= GENERAL DOSEN / GURU / MAHASISWA / SISWA VIEW =================
  return (
    <div className={styles.page}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.welcomeTitle}>
              Selamat datang, <span className="gradient-text-accent">{profile?.full_name?.split(',')[0]}</span> 👋
            </h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.welcomeSubtitle}>
            {isStaff 
              ? `Kelola penilaian dan pantau performa ${learnerLabel.toLowerCase()} Anda`
              : `Lihat perkembangan nilai dan analisis performa ${courseLabel.toLowerCase()} Anda`
            }
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsRow}>
        <Card variant="glass" padding="md">
          <div className={styles.stat}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(37, 99, 235, 0.08)' }}>
              <BookOpen size={20} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <div className={styles.statValue}>{mkList.length}</div>
              <div className={styles.statLabel}>{courseLabel}</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.stat}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)' }}>
              <Users size={20} style={{ color: '#059669' }} />
            </div>
            <div>
              <div className={styles.statValue}>{isStaff ? (isSchool ? totalSMKStudents : totalUnivStudents) : '1'}</div>
              <div className={styles.statLabel}>{isStaff ? `Total ${learnerLabel}` : `${courseLabel} Aktif`}</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.stat}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(217, 119, 6, 0.08)' }}>
              <ClipboardList size={20} style={{ color: '#d97706' }} />
            </div>
            <div>
              <div className={styles.statValue}>{totalKomponen}</div>
              <div className={styles.statLabel}>Total Komponen</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.stat}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
              <TrendingUp size={20} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <div className={styles.statValue}>{isStaff ? '85%' : '83'}</div>
              <div className={styles.statLabel}>{isStaff ? 'Ketersediaan Rubrik' : 'Rata-rata Nilai'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        {/* MK / Mapel List Section */}
        <div className={styles.mkSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isStaff ? `${courseLabel} Anda` : `${courseLabel} Saya`}
            </h2>
            <button className={styles.viewAllBtn} onClick={() => navigate(isSchool ? '/kelas' : '/mk')}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>

          <div className={styles.mkList}>
            {mkList.map((mk) => {
              const rombels = (mk.rombel || []).filter(r => isSchool ? (r.is_school || r.name.includes('AKL')) : (!r.is_school && !r.name.includes('AKL')));
              const studentCount = rombels.reduce((acc, r) => acc + (r.students?.length || 0), 0);

              return (
                <div 
                  key={mk.id} 
                  className={styles.mkItem} 
                  onClick={() => navigate(role === ROLES.SISWA || role === ROLES.MAHASISWA ? `/mk/${mk.id}/analytics` : `/mk/${mk.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.mkItemIcon}>
                    <BookOpen size={18} />
                  </div>
                  <div className={styles.mkItemInfo}>
                    <h4 className={styles.mkItemName}>{mk.name}</h4>
                    <span className={styles.mkItemMeta}>
                      {mk.kode_mk}{mk.sks ? ` (${mk.sks} ${isSchool ? 'Jam' : 'SKS'})` : ''} • {isSchool ? (mk.tahun_ajaran || '2025/2026') : mk.semester}
                    </span>
                  </div>
                  <div className={styles.mkItemRight}>
                    {isStaff ? (
                      <span className={styles.progressText}>
                        {studentCount} {learnerLabel}
                      </span>
                    ) : (
                      <div className={styles.nilaiChip}>
                        <Award size={14} />
                        <span>93</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications Section */}
        <div className={styles.notifSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Notifikasi Terbaru</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/notifications')}>
              Semua <ArrowRight size={14} />
            </button>
          </div>
          <div className={styles.notifList}>
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className={styles.notifItem}>
                <div className={styles.notifDot} style={{ background: n.is_read ? 'var(--text-muted)' : 'var(--color-primary)' }} />
                <div>
                  <p className={styles.notifTitle}>{n.title}</p>
                  <p className={styles.notifMeta}>{n.mkName || 'Sistem'} • {formatTimeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className={styles.emptyNotif}>Tidak ada notifikasi baru</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Baru saja';
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return `${Math.floor(diffHours / 24)} hari lalu`;
};

export default DashboardPage;
