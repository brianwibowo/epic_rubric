import React, { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card';
import { 
  BookOpen, PlusCircle, Users, ArrowRight, Layers, 
  Search, LayoutGrid, List, ChevronRight, X
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import HelpButton from '@/components/ui/HelpButton';
import { useNavigate } from 'react-router-dom';
import styles from './MataKuliahListPage.module.css';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useTerminology } from '@/hooks/useTerminology';
import { ROLES, STAFF_ROLES, LEARNER_ROLES } from '@/utils/constants';

const MataKuliahListPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList } = useMKStore();
  const { coursePluralLabel, courseLabel, courseCodeLabel, learnerLabel, rombelLabel, isSchool } = useTerminology();

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const isLearner = LEARNER_ROLES.includes(profile?.role);

  // Search & View Mode States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Pagination States (Minimum 6 items)
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

  // Filter MKs by name, code, semester, dosen, or rombel names
  const filteredMKs = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return mkList;

    return mkList.filter(mk => {
      const nameMatch = (mk.name || '').toLowerCase().includes(query);
      const codeMatch = (mk.kode_mk || '').toLowerCase().includes(query);
      const semesterMatch = (mk.semester || '').toLowerCase().includes(query);
      const kodeSemesterMatch = (mk.kode_semester || '').toLowerCase().includes(query);
      const dosenMatch = (mk.dosen_name || '').toLowerCase().includes(query);
      const rombelMatch = (mk.rombel || []).some(r => (r.name || '').toLowerCase().includes(query));

      return nameMatch || codeMatch || semesterMatch || kodeSemesterMatch || dosenMatch || rombelMatch;
    });
  }, [mkList, debouncedSearchQuery]);

  // Paginated MKs
  const totalPages = Math.ceil(filteredMKs.length / itemsPerPage) || 1;
  const paginatedMKs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMKs.slice(start, start + itemsPerPage);
  }, [filteredMKs, currentPage, itemsPerPage]);

  const handleOpenMK = (mkId) => {
    navigate(isLearner ? `/mk/${mkId}/analytics` : `/mk/${mkId}`);
  };

  return (
    <div className={styles.page}>
      {/* 1. HEADER */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className={styles.title}>{coursePluralLabel}</h1>
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            {isStaff 
              ? `${courseLabel} yang Anda ampu ${isSchool ? 'tahun ajaran ini' : 'semester ini'}` 
              : `${courseLabel} yang Anda ikuti`
            }
          </p>
        </div>

        {isStaff && (
          <Button variant="primary" onClick={() => navigate('/mk/create')}>
            <PlusCircle size={18} /> Buat {courseLabel} Baru
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
            placeholder={`Cari nama ${courseLabel.toLowerCase()}, ${courseCodeLabel.toLowerCase()}...`}
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

      {/* 3. CONTENT AREA (GRID VS LIST) */}
      {filteredMKs.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className={styles.grid}>
              {paginatedMKs.map((mk) => {
                const totalMhs = mk.rombel 
                  ? mk.rombel.reduce((sum, r) => sum + (r.students?.length || 0), 0) 
                  : (mk.students?.length || 0);

                return (
                  <div 
                    key={mk.id} 
                    className={styles.mkCard}
                    onClick={() => handleOpenMK(mk.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenMK(mk.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Top Colored Accent Strip */}
                    <div className={styles.cardAccentBar} />

                    <div className={styles.mkCardBody}>
                      <div className={styles.mkCardHeader}>
                        <div className={styles.mkIconBox}>
                          <BookOpen size={20} />
                        </div>
                      </div>
                      
                      <h3 className={styles.mkName}>
                        {mk.name}
                      </h3>

                      {/* Metadata Chips Layout */}
                      <div className={styles.metaChipsGroup}>
                        <span className={styles.metaChip}>
                          <Layers size={13} />
                          {mk.kode_mk}{mk.sks ? ` • ${mk.sks} SKS` : ''}
                        </span>
                        <span className={styles.metaChipSubtle}>
                          {mk.semester}{mk.kode_semester ? ` (${mk.kode_semester})` : ''}
                        </span>
                        {mk.rombel?.length > 0 && (
                          <span className={styles.metaChipSubtle}>
                            {mk.rombel.length} Rombel ({mk.rombel.map(r => r.name).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.mkFooter}>
                      <div className={styles.footerLeft}>
                        <Users size={14} className={styles.studentIcon} />
                        <span className={styles.studentCount}>
                          {totalMhs} {learnerLabel}
                        </span>
                      </div>

                      <div className={styles.footerRight}>
                        <div className={styles.arrowCircle}>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Mode (List View) */
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{courseCodeLabel.toUpperCase()}</th>
                    <th>NAMA {courseLabel.toUpperCase()}</th>
                    <th>{isSchool ? 'TAHUN AJARAN' : 'SEMESTER'}</th>
                    <th>{isSchool ? 'BEBAN' : 'SKS'}</th>
                    <th>{rombelLabel.toUpperCase()}</th>
                    <th>PESERTA ({learnerLabel.toUpperCase()})</th>
                    <th style={{ textAlign: 'right' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMKs.map((mk) => {
                    const totalMhs = mk.rombel 
                      ? mk.rombel.reduce((sum, r) => sum + (r.students?.length || 0), 0) 
                      : (mk.students?.length || 0);

                    return (
                      <tr key={mk.id} onClick={() => handleOpenMK(mk.id)}>
                        <td>
                          <Badge variant="primary" size="sm">
                            {mk.kode_mk}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 800 }}>{mk.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{mk.semester}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{mk.sks || 2} SKS</td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {mk.rombel?.length ? `${mk.rombel.length} Kelas` : '1 Kelas'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {totalMhs} {learnerLabel}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenMK(mk.id); }}>
                            Buka <ChevronRight size={14} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMKs.length}
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
          <BookOpen size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            {debouncedSearchQuery 
              ? `Tidak ditemukan mata kuliah dengan kata kunci "${debouncedSearchQuery}"` 
              : `Belum Ada ${courseLabel}`
            }
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
            {debouncedSearchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : isStaff 
              ? `Buat ${courseLabel.toLowerCase()} pertama Anda untuk memulai proses penilaian.` 
              : `Anda belum terdaftar di ${courseLabel.toLowerCase()} manapun.`
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

export default MataKuliahListPage;
