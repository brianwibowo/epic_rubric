import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKelasStore } from '@/stores/kelasStore';
import { useAuthStore } from '@/stores/authStore';
import { useTerminology } from '@/hooks/useTerminology';
import { STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import HelpButton from '@/components/ui/HelpButton';
import Pagination from '@/components/ui/Pagination';
import styles from './KelasListPage.module.css';
import { useUiStore } from '@/stores/uiStore';
import {
  School, PlusCircle, Users, Calendar, ArrowRight, Search,
  LayoutGrid, List, BookOpen, UserCheck, ChevronRight, X, Sparkles
} from 'lucide-react';

const KelasListPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { kelasList, createKelas } = useKelasStore();
  const { kelasLabel, learnerLabel } = useTerminology();
  const { addToast } = useUiStore();
  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Create Kelas Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKelasName, setNewKelasName] = useState('');
  const [newJurusan, setNewJurusan] = useState(profile?.jurusan || profile?.unit_info || 'Akuntansi & Keuangan Lembaga');
  const [newTahunAjaran, setNewTahunAjaran] = useState('2025/2026');
  const [newWaliKelas, setNewWaliKelas] = useState(profile?.full_name || '');

  // Keep modal defaults in sync with current user profile
  useEffect(() => {
    if (profile?.full_name) {
      setNewWaliKelas(profile.full_name);
    }
    if (profile?.jurusan || profile?.unit_info) {
      setNewJurusan(profile.jurusan || profile.unit_info);
    }
  }, [profile]);

  const handleOpenCreateModal = () => {
    setNewKelasName('');
    setNewJurusan(profile?.jurusan || profile?.unit_info || 'Akuntansi & Keuangan Lembaga');
    setNewTahunAjaran('2025/2026');
    setNewWaliKelas(profile?.full_name || '');
    setIsCreateModalOpen(true);
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const handleCreateKelas = (e) => {
    if (e) e.preventDefault();
    if (!newKelasName.trim()) {
      addToast('Nama kelas wajib diisi!', 'warning');
      return;
    }

    const created = createKelas({
      name: newKelasName.trim(),
      jurusan: newJurusan.trim() || profile?.jurusan || profile?.unit_info || 'Akuntansi & Keuangan Lembaga',
      tahun_ajaran: newTahunAjaran.trim() || '2025/2026',
      wali_kelas: newWaliKelas.trim() || (profile?.full_name || 'Pendidik SMK')
    });

    addToast(`Kelas "${created.name}" berhasil dibuat! Silakan tambahkan mata pelajaran.`, 'success', 3500);
    setIsCreateModalOpen(false);
    setNewKelasName('');
    navigate(`/kelas/${created.id}`);
  };

  // Background refresh to catch newly created classes by others
  useEffect(() => {
    useKelasStore.getState().syncFromSupabase();
  }, []);

  // Debounce search query by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filter
  const filtered = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return kelasList;

    return kelasList.filter(k =>
      (k.name || '').toLowerCase().includes(query) ||
      (k.jurusan || '').toLowerCase().includes(query) ||
      (k.wali_kelas || '').toLowerCase().includes(query) ||
      (k.tahun_ajaran || '').toLowerCase().includes(query)
    );
  }, [kelasList, debouncedSearchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleOpenKelas = (kelasId) => {
    navigate(`/kelas/${kelasId}`);
  };

  return (
    <div className={styles.page}>
      {/* 1. HEADER */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>Daftar Kelas</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {isStaff
              ? 'Rombongan belajar yang Anda kelola tahun ajaran ini'
              : 'Kelas tempat Anda terdaftar'
            }
          </p>
        </div>

        {isStaff && (
          <Button variant="primary" onClick={handleOpenCreateModal}>
            <PlusCircle size={18} /> Buat Kelas Baru
          </Button>
        )}
      </div>

      {/* 2. TOOLBAR (SEARCH + VIEW SWITCHER) */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari nama kelas, jurusan, wali kelas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className={styles.viewToggleGroup}>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleActive : ''}`}
            onClick={() => setViewMode('grid')}
            title="Tampilan Kartu (Grid)"
          >
            <LayoutGrid size={15} /> Grid
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleActive : ''}`}
            onClick={() => setViewMode('list')}
            title="Tampilan Tabel (List)"
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* 3. CONTENT (GRID VS LIST) */}
      {filtered.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className={styles.grid}>
              {paginated.map((kelas) => (
                <div
                  key={kelas.id}
                  className={styles.kelasCard}
                  onClick={() => handleOpenKelas(kelas.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenKelas(kelas.id)}
                >
                  <div className={styles.cardAccentBar} />
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div className={styles.iconCircle}>
                        <School size={22} />
                      </div>
                      <Badge variant="primary" size="sm" glow>{kelas.tahun_ajaran}</Badge>
                    </div>

                    <h3 className={styles.kelasName}>{kelas.name}</h3>
                    <p className={styles.jurusan}>{kelas.jurusan}</p>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <Users size={13} />
                        <span>{kelas.students?.length || 0} Siswa</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BookOpen size={13} />
                        <span>{kelas.mapel_ids?.length || 0} Mapel</span>
                      </div>
                      <div className={styles.metaItem}>
                        <UserCheck size={13} />
                        <span>{kelas.wali_kelas ? kelas.wali_kelas.split(',')[0] : '-'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Calendar size={13} />
                        <span>{kelas.tahun_ajaran}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.actionLink}>Buka {kelasLabel}</span>
                    <ArrowRight size={16} className={styles.arrow} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table Mode (List View) */
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>NAMA KELAS</th>
                    <th>JURUSAN</th>
                    <th>TAHUN AJARAN</th>
                    <th>WALI KELAS</th>
                    <th>PESERTA (SISWA)</th>
                    <th>MAPEL AKTIF</th>
                    <th style={{ textAlign: 'right' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((kelas) => (
                    <tr key={kelas.id} onClick={() => handleOpenKelas(kelas.id)}>
                      <td style={{ fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <School size={16} style={{ color: '#2563eb' }} />
                          <span>{kelas.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{kelas.jurusan}</td>
                      <td>
                        <Badge variant="primary" size="sm">
                          {kelas.tahun_ajaran}
                        </Badge>
                      </td>
                      <td style={{ fontWeight: 600 }}>{kelas.wali_kelas || '-'}</td>
                      <td style={{ fontWeight: 700 }}>
                        {kelas.students?.length || 0} Siswa
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {kelas.mapel_ids?.length || 0} Mapel
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenKelas(kelas.id); }}>
                          Buka <ChevronRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. PAGINATION (ALWAYS RENDERED WITH SIZE SELECTOR) */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24]}
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <School size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            {debouncedSearchQuery 
              ? `Tidak ditemukan kelas dengan kata kunci "${debouncedSearchQuery}"` 
              : 'Belum Ada Kelas'
            }
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
            {debouncedSearchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : isStaff
              ? 'Buat kelas pertama Anda untuk mulai mengelola rombongan belajar.'
              : 'Anda belum terdaftar di kelas manapun.'
            }
          </p>
          {debouncedSearchQuery && (
            <Button variant="outline" size="sm" onClick={() => setSearchInput('')} style={{ marginTop: '8px' }}>
              <X size={14} /> Reset Pencarian
            </Button>
          )}
        </div>
      )}

      {/* MODAL BUAT KELAS BARU */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Rombongan Belajar (Kelas) Baru"
        size="md"
      >
        <form onSubmit={handleCreateKelas} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Tambahkan kelas baru untuk SMK Anda. Setelah dibuat, Anda dapat langsung menambahkan mata pelajaran dan peserta didik.
          </p>

          <Input
            label="Nama Kelas"
            placeholder="e.g. X AKL 3, XI AKL 3, XII AKL 3"
            value={newKelasName}
            onChange={(e) => setNewKelasName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Kompetensi Keahlian / Jurusan"
            placeholder="e.g. Akuntansi & Keuangan Lembaga"
            value={newJurusan}
            onChange={(e) => setNewJurusan(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Tahun Ajaran"
              placeholder="e.g. 2025/2026"
              value={newTahunAjaran}
              onChange={(e) => setNewTahunAjaran(e.target.value)}
              required
            />
            <Input
              label="Wali Kelas"
              placeholder="e.g. Siti Rahmawati, S.Pd."
              value={newWaliKelas}
              onChange={(e) => setNewWaliKelas(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              <PlusCircle size={16} /> Buat & Buka Kelas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KelasListPage;
