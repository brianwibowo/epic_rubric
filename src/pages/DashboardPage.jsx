import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { ROLES, MK_STATUS_LABELS, MK_STATUS_COLORS } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import styles from './DashboardPage.module.css';
import { useTourStore } from '@/stores/tourStore';
import { 
  BookOpen, Users, ClipboardList, TrendingUp, 
  PlusCircle, ArrowRight, Award, HelpCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';

const DashboardPage = () => {
  const { profile } = useAuthStore();
  const { mkList } = useMKStore();
  const { notifications } = useNotificationStore();
  const { openHelp } = useTourStore();
  const navigate = useNavigate();
  
  const role = profile?.role;
  const isDosen = role === ROLES.DOSEN || role === ROLES.ADMIN;

  const totalStudents = mkList.reduce((sum, mk) => sum + (mk.students ? mk.students.length : 0), 0);
  const totalKomponen = mkList.reduce((sum, mk) => sum + (mk.komponen ? mk.komponen.length : 0), 0);

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
            {isDosen 
              ? 'Kelola penilaian dan pantau performa mahasiswa Anda'
              : 'Lihat perkembangan nilai dan analisis performa Anda'
            }
          </p>
        </div>
        {isDosen && (
          <Button variant="primary" onClick={() => navigate('/mk/create')}>
            <PlusCircle size={18} />
            Buat MK Baru
          </Button>
        )}
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
              <div className={styles.statLabel}>Mata Kuliah</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md">
          <div className={styles.stat}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(5, 150, 105, 0.08)' }}>
              <Users size={20} style={{ color: '#059669' }} />
            </div>
            <div>
              <div className={styles.statValue}>{isDosen ? totalStudents : '1'}</div>
              <div className={styles.statLabel}>{isDosen ? 'Total Mahasiswa' : 'MK Aktif'}</div>
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
              <div className={styles.statValue}>{isDosen ? '85%' : '83'}</div>
              <div className={styles.statLabel}>{isDosen ? 'Ketersediaan Rubrik' : 'Rata-rata Nilai'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        {/* MK List Section */}
        <div className={styles.mkSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isDosen ? 'Mata Kuliah Anda' : 'Mata Kuliah Saya'}
            </h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/mk')}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>

          <div className={styles.mkList}>
            {mkList.map((mk) => (
              <div 
                key={mk.id} 
                className={styles.mkItem} 
                onClick={() => navigate(`/mk/${mk.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/mk/${mk.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.mkItemIcon}>
                  <BookOpen size={18} />
                </div>
                <div className={styles.mkItemInfo}>
                  <h4 className={styles.mkItemName}>{mk.name}</h4>
                  <span className={styles.mkItemMeta}>{mk.kode_mk} • {mk.semester}</span>
                </div>
                <div className={styles.mkItemRight}>
                  {isDosen ? (
                    <>
                      <Badge variant={MK_STATUS_COLORS[mk.status] || 'default'} size="sm">
                        {MK_STATUS_LABELS[mk.status] || mk.status}
                      </Badge>
                      <span className={styles.progressText}>
                        {mk.students ? mk.students.length : 0} Mahasiswa
                      </span>
                    </>
                  ) : (
                    <div className={styles.nilaiChip}>
                      <Award size={14} />
                      <span>83</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                  <p className={styles.notifMeta}>{n.mkName} • {formatTimeAgo(n.created_at)}</p>
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
