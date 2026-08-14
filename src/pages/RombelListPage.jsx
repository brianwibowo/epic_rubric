import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import { STAFF_ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import HelpButton from '@/components/ui/HelpButton';
import { capitalizeWords } from '@/utils/formatters';
import styles from './RombelListPage.module.css';
import {
  UsersRound, PlusCircle, Users, ArrowRight, BookOpen,
  CheckCircle2, Clock
} from 'lucide-react';

const RombelListPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList, addRombel } = useMKStore();
  const { addToast } = useUiStore();
  const { courseLabel, learnerLabel, learnerPluralLabel } = useTerminology();

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const mk = mkList.find(m => m.id === mkId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRombelName, setNewRombelName] = useState('');

  if (!mk) {
    return (
      <div className={styles.page}>
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/mk')} style={{ marginTop: '16px' }}>
            Kembali ke Daftar {courseLabel}
          </Button>
        </Card>
      </div>
    );
  }

  const rombelList = mk.rombel || [];

  const handleCreateRombel = (e) => {
    if (e) e.preventDefault();
    if (!newRombelName.trim()) return;

    addRombel(mkId, { name: newRombelName.trim() });
    addToast(`Rombel "${newRombelName.trim()}" berhasil dibuat!`, 'success');
    setNewRombelName('');
    setShowAddModal(false);
  };

  const handleOpenRombel = (rombelId) => {
    navigate(`/mk/${mkId}/students?rombelId=${rombelId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Daftar Rombel</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {mk.name} ({mk.kode_mk}) • Pilih rombel untuk mengelola nilai & {learnerPluralLabel.toLowerCase()}
          </p>
        </div>

        {isStaff && (
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={18} /> Tambah Rombel
          </Button>
        )}
      </div>

      {rombelList.length > 0 ? (
        <div className={styles.grid}>
          {rombelList.map((rombel) => {
            const studentCount = (rombel.students || []).length;
            const gradedCount = (rombel.students || []).filter(s => {
              const stuId = s.id || s.student_id;
              const sd = rombel.scoringData?.[stuId] || rombel.scoringData?.[s.student_id] || rombel.scoringData?.[s.id];
              return sd && Object.keys(sd).length > 0;
            }).length;

            return (
              <div
                key={rombel.id}
                className={styles.rombelCard}
                onClick={() => handleOpenRombel(rombel.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenRombel(rombel.id)}
              >
                <div className={styles.cardAccentBar} />
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div className={styles.iconCircle}>
                      <UsersRound size={22} />
                    </div>
                    <Badge variant="primary" size="sm">
                      {mk.semester || 'Ganjil 2025/2026'}
                    </Badge>
                  </div>

                  <h3 className={styles.rombelName}>{rombel.name}</h3>
                  <p className={styles.rombelMeta}>
                    {mk.name} • {mk.sks || 2} SKS
                  </p>

                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <span className={styles.statVal}>{studentCount}</span>
                      <span className={styles.statLbl}>{learnerLabel} Terdaftar</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statVal} style={{ color: gradedCount > 0 ? '#059669' : 'var(--text-secondary)' }}>
                        {gradedCount}/{studentCount}
                      </span>
                      <span className={styles.statLbl}>Telah Dinilai</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.actionLink}>Buka Mahasiswa & Nilai</span>
                  <ArrowRight size={16} className={styles.arrow} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <UsersRound size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Belum Ada Rombel</h3>
          <p className={styles.emptyDesc}>
            Tambahkan rombongan belajar (misal: "Kelas A", "PE 2025 A") untuk memulai input mahasiswa.
          </p>
          {isStaff && (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <PlusCircle size={18} /> Tambah Rombel Pertama
            </Button>
          )}
        </div>
      )}

      {/* Add Rombel Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Rombel Baru"
      >
        <form onSubmit={handleCreateRombel} className={styles.modalForm}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Buat rombongan belajar baru untuk mata kuliah <strong>{mk.name}</strong>.
          </p>

          <Input
            label="Nama Rombel"
            placeholder="Contoh: PE 2025 A, Kelas B, Reguler Pagi"
            value={newRombelName}
            onChange={(e) => setNewRombelName(capitalizeWords(e.target.value))}
            required
            autoFocus
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={!newRombelName.trim()}>
              Simpan Rombel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RombelListPage;
