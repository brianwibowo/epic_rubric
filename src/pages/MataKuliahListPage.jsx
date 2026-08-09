import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { BookOpen, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import HelpButton from '@/components/ui/HelpButton';
import { useNavigate } from 'react-router-dom';
import styles from './MataKuliahListPage.module.css';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { useTourStore } from '@/stores/tourStore';
import { ROLES, MK_STATUS_LABELS, MK_STATUS_COLORS } from '@/utils/constants';

const MataKuliahListPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList, joinMKByCode } = useMKStore();
  const { addToast } = useUiStore();
  const { openHelp } = useTourStore();
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const isDosen = profile?.role === ROLES.DOSEN || profile?.role === ROLES.ADMIN;

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const res = joinMKByCode(joinCodeInput, profile);
    if (res.success) {
      addToast(`Berhasil bergabung dengan ${res.mk.name}!`, 'success');
      setJoinCodeInput('');
      navigate(`/mk/${res.mk.id}`);
    } else {
      addToast(res.message, 'error');
    }
  };

  const isMhs = profile?.role === ROLES.MAHASISWA;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Daftar Mata Kuliah</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {isDosen ? 'Mata kuliah yang Anda ampu semester ini' : 'Mata kuliah yang Anda ikuti'}
          </p>
        </div>

        {isDosen && (
          <Button variant="primary" onClick={() => navigate('/mk/create')}>
            <PlusCircle size={18} /> Buat MK Baru
          </Button>
        )}
      </div>

      {mkList.length > 0 ? (
        <div className={styles.grid}>
          {mkList.map((mk) => (
            <div 
              key={mk.id} 
              className={styles.mkCard}
              onClick={() => navigate(isMhs ? `/mk/${mk.id}/analytics` : `/mk/${mk.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(isMhs ? `/mk/${mk.id}/analytics` : `/mk/${mk.id}`)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.mkCardHeader}>
                <div className={styles.mkIcon}>
                  <BookOpen size={22} />
                </div>
                <span 
                  className={styles.statusBadge}
                  style={{ 
                    color: getStatusColor(mk.status),
                    background: getStatusColor(mk.status) + '15'
                  }}
                >
                  {!isDosen && mk.status === 'DRAFT' ? 'Belum Aktif' : (MK_STATUS_LABELS[mk.status] || mk.status)}
                </span>
              </div>
              
              <h3 className={styles.mkName}>{mk.name}</h3>
              <p className={styles.mkCode}>{mk.kode_mk} • {mk.semester}</p>
              
              <div className={styles.mkFooter}>
                <span className={styles.mkStudents}>
                  <UsersIcon /> {mk.students ? mk.students.length : 0} mahasiswa
                </span>
                {isDosen && (
                  <span className={styles.joinCode}>
                    Kode: <strong>{mk.join_code}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '20px' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
            {isDosen ? 'Belum Ada Mata Kuliah' : 'Belum Mengikuti Mata Kuliah'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {isDosen 
              ? 'Buat mata kuliah pertama Anda untuk memulai proses penilaian.' 
              : 'Masukkan kode MK dari dosen untuk bergabung ke mata kuliah.'}
          </p>
          {isDosen && (
            <Button variant="primary" onClick={() => navigate('/mk/create')}>
              <PlusCircle size={18} /> Buat MK Pertama
            </Button>
          )}
        </Card>
      )}

      {/* Join MK section for mahasiswa */}
      {profile?.role === ROLES.MAHASISWA && (
        <Card variant="glass" padding="md" style={{ marginTop: '24px' }}>
          <div className={styles.joinSection}>
            <div className={styles.joinText}>
              <h3>Gabung ke Mata Kuliah Baru</h3>
              <p>Masukkan 6 karakter kode MK dari dosen untuk bergabung</p>
            </div>
            <form onSubmit={handleJoin} className={styles.joinForm}>
              <input 
                type="text" 
                placeholder="KODE MK (CONTOH: AK301F)"
                className={styles.joinInput}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button type="submit" variant="primary" disabled={!joinCodeInput.trim()}>Gabung</Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return '#059669';
    case 'DRAFT': return '#d97706';
    case 'ARCHIVED': return '#94a3b8';
    default: return '#94a3b8';
  }
};

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default MataKuliahListPage;
