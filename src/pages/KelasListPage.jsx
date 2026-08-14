import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKelasStore } from '@/stores/kelasStore';
import { useAuthStore } from '@/stores/authStore';
import { useTerminology } from '@/hooks/useTerminology';
import { STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import Pagination from '@/components/ui/Pagination';
import styles from './KelasListPage.module.css';
import {
  School, PlusCircle, Users, Calendar, ArrowRight, Search,
  LayoutGrid, List, BookOpen, UserCheck, ChevronRight, X
} from 'lucide-react';

const KelasListPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { kelasList } = useKelasStore();
  const { kelasLabel, learnerLabel } = useTerminology();
  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

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
          <Button variant="primary" onClick={() => {/* TODO: create kelas modal */}}>
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
    </div>
  );
};

export default KelasListPage;
