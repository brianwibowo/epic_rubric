import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLES, STAFF_ROLES } from '@/utils/constants';
import { useTerminology } from '@/hooks/useTerminology';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';
import HelpButton from '@/components/ui/HelpButton';
import styles from './MKStudentListPage.module.css';
import { 
  UserPlus, Search, Upload, Download, Trash2, FileSpreadsheet, 
  Edit3, ChevronDown, UsersRound, PlusCircle, ArrowRight, BookOpen, 
  Clock, MapPin, User, LayoutGrid, List, FileText 
} from 'lucide-react';
import { exportMKToExcel } from '@/utils/exportExcel';
import { capitalizeWords, capitalizeFirstLetter, getGradeInfo, getGradeColor, getGradeBg } from '@/utils/formatters';
import * as XLSX from 'xlsx';

const SEMESTER_OPTIONS = [
  'Ganjil 2025/2026',
  'Genap 2025/2026',
  'Ganjil 2026/2027',
  'Genap 2026/2027',
  'Ganjil 2024/2025',
  'Genap 2024/2025',
  'Semester 1 (Ganjil)',
  'Semester 2 (Genap)',
  '__CUSTOM__'
];

const MKStudentListPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuthStore();
  const { courseLabel, coursePluralLabel, learnerLabel, learnerPluralLabel, learnerIdLabel, isSchool } = useTerminology();
  const isStaff = STAFF_ROLES.includes(profile?.role);
  const { mkList, updateMK, updateRombel, addRombel, getAllStudents, getAllScoringData } = useMKStore();
  const { addToast } = useUiStore();

  const mk = mkList.find(m => m.id === mkId);
  const rawRombels = mk?.rombel || [];

  // Filter rombels by role context to avoid collision
  const rombelList = useMemo(() => {
    if (isSchool) {
      const schoolRombels = rawRombels.filter(r => r.is_school || r.name.includes('AKL'));
      return schoolRombels.length > 0 ? schoolRombels : rawRombels;
    } else if (profile?.role === ROLES.DOSEN || profile?.role === ROLES.MAHASISWA) {
      const univRombels = rawRombels.filter(r => !r.is_school && !r.name.includes('AKL'));
      return univRombels.length > 0 ? univRombels : rawRombels;
    }
    return rawRombels;
  }, [rawRombels, isSchool, profile]);

  const rombelIdParam = searchParams.get('rombelId');

  // Determine active rombel
  const selectedRombel = rombelIdParam && rombelIdParam !== 'ALL'
    ? (rombelList.find(r => r.id === rombelIdParam) || rombelList[0] || null)
    : (rombelList.length === 1 && !rombelIdParam ? rombelList[0] : null);

  const students = useMemo(() => {
    if (selectedRombel) {
      return selectedRombel.students || [];
    }
    return rombelList.flatMap(r => r.students || []);
  }, [selectedRombel, rombelList]);

  const scoringData = useMemo(() => {
    if (selectedRombel) {
      return selectedRombel.scoringData || {};
    }
    return rombelList.reduce((acc, r) => ({ ...acc, ...(r.scoringData || {}) }), {});
  }, [selectedRombel, rombelList]);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRombelModal, setShowAddRombelModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');

  // Rombel overview search, view mode (grid/list), and pagination
  const [rombelSearchInput, setRombelSearchInput] = useState('');
  const [debouncedRombelSearch, setDebouncedRombelSearch] = useState('');
  const [rombelViewMode, setRombelViewMode] = useState('grid'); // 'grid' | 'list'
  const [rombelCurrentPage, setRombelCurrentPage] = useState(1);
  const [rombelItemsPerPage, setRombelItemsPerPage] = useState(6);

  // Debounce rombel search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRombelSearch(rombelSearchInput);
      setRombelCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [rombelSearchInput]);

  const filteredRombels = rombelList.filter(r => 
    (r.name || '').toLowerCase().includes(debouncedRombelSearch.toLowerCase()) ||
    (r.kode_rombel || '').toLowerCase().includes(debouncedRombelSearch.toLowerCase()) ||
    (r.dosen_pengampu || '').toLowerCase().includes(debouncedRombelSearch.toLowerCase()) ||
    (r.ruangan || '').toLowerCase().includes(debouncedRombelSearch.toLowerCase()) ||
    (r.semester || '').toLowerCase().includes(debouncedRombelSearch.toLowerCase())
  );

  const totalRombelPages = Math.ceil(filteredRombels.length / rombelItemsPerPage);
  const paginatedRombels = filteredRombels.slice(
    (rombelCurrentPage - 1) * rombelItemsPerPage,
    rombelCurrentPage * rombelItemsPerPage
  );

  // Debounce student search query by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Reset search and page when switching rombel
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
  }, [selectedRombel?.id, rombelIdParam]);

  // Structured Rombel form fields
  const [rombelForm, setRombelForm] = useState({
    name: '',
    kode_rombel: '',
    semester: mk?.semester || SEMESTER_OPTIONS[0],
    customSemester: '',
    dosen_pengampu: mk?.dosen_name || '',
    jadwal: '',
    ruangan: '',
    keterangan: ''
  });
  const [isCustomSemester, setIsCustomSemester] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  if (!mk) {
    return (
      <div className={styles.page}>
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <p style={{ margin: '12px 0 20px', color: 'var(--text-secondary)' }}>
            {courseLabel} dengan ID "{mkId}" tidak ada atau telah dihapus.
          </p>
          <Button variant="primary" onClick={() => navigate(isSchool ? '/kelas' : '/mk')}>
            Kembali ke {coursePluralLabel}
          </Button>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStudentRombelName = (studentId) => {
    const found = rombelList.find(r => (r.students || []).some(s => s.id === studentId || s.student_id === studentId));
    return found ? found.name : null;
  };

  const handleCreateRombel = (e) => {
    if (e) e.preventDefault();
    if (!rombelForm.name.trim()) return;

    const finalSemester = isCustomSemester
      ? (rombelForm.customSemester.trim() || 'Ganjil 2025/2026')
      : rombelForm.semester;

    const newR = addRombel(mkId, {
      name: rombelForm.name.trim(),
      kode_rombel: rombelForm.kode_rombel.trim(),
      semester: finalSemester,
      dosen_pengampu: rombelForm.dosen_pengampu.trim(),
      jadwal: rombelForm.jadwal.trim(),
      ruangan: rombelForm.ruangan.trim(),
      keterangan: rombelForm.keterangan.trim()
    });

    addToast(`Rombel "${newR.name}" berhasil ditambahkan ke ${courseLabel}!`, 'success');
    setRombelForm({
      name: '',
      kode_rombel: '',
      semester: mk?.semester || SEMESTER_OPTIONS[0],
      customSemester: '',
      dosen_pengampu: mk?.dosen_name || '',
      jadwal: '',
      ruangan: '',
      keterangan: ''
    });
    setIsCustomSemester(false);
    setShowAddRombelModal(false);
    setSearchParams({ rombelId: newR.id });
  };

  const filtered = students.filter(s => 
    (s.full_name || s.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (s.nim || s.nisn || '').includes(debouncedSearchQuery)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddStudent = (e) => {
    if (e) e.preventDefault();
    if (!newName.trim() || !newNim.trim()) return;

    const newStudent = {
      id: `s-${Date.now()}`,
      student_id: `s-${Date.now()}-uuid`,
      nim: newNim.trim(),
      full_name: newName.trim(),
      enrolled_at: new Date().toISOString().split('T')[0]
    };

    if (selectedRombel) {
      const updatedStudents = [...(selectedRombel.students || []), newStudent];
      updateRombel(mkId, selectedRombel.id, { students: updatedStudents });
    } else if (rombelList[0]) {
      const updatedStudents = [...(rombelList[0].students || []), newStudent];
      updateRombel(mkId, rombelList[0].id, { students: updatedStudents });
    } else {
      updateMK(mkId, { students: [...students, newStudent] });
    }

    setNewNim('');
    setNewName('');
    setShowAddModal(false);
    addToast(`${learnerLabel} "${newStudent.full_name}" (${learnerIdLabel}: ${newStudent.nim}) berhasil ditambahkan!`, 'success');
  };

  const handleRemoveStudent = (studentId, studentName) => {
    if (window.confirm(`Hapus ${studentName} dari ${courseLabel.toLowerCase()} ini?`)) {
      if (selectedRombel) {
        const updatedStudents = (selectedRombel.students || []).filter(s => s.id !== studentId && s.student_id !== studentId);
        updateRombel(mkId, selectedRombel.id, { students: updatedStudents });
      } else {
        rombelList.forEach(r => {
          if ((r.students || []).some(s => s.id === studentId || s.student_id === studentId)) {
            const updated = (r.students || []).filter(s => s.id !== studentId && s.student_id !== studentId);
            updateRombel(mkId, r.id, { students: updated });
          }
        });
      }
      addToast(`${learnerLabel} ${studentName} dihapus dari MK`, 'info');
    }
  };

  const handleExport = () => {
    const komps = mk?.komponen || [];
    const roster = students.map((s) => {
      const stuId = s.id || s.student_id;
      const stuScoring = scoringData?.[stuId] || {};
      
      const scores = {};
      let totalWeighted = 0;
      let hasAnyScore = false;
      let isAllPublished = komps.length > 0;

      komps.forEach(komp => {
        const sd = stuScoring[komp.id];
        if (sd?.rawScore != null) {
          scores[komp.name] = sd.rawScore;
          totalWeighted += sd.rawScore * (komp.bobot || 0);
          hasAnyScore = true;
        } else {
          scores[komp.name] = null;
          isAllPublished = false;
        }
      });

      const final_score = hasAnyScore ? Math.round(totalWeighted) : null;
      const status = isAllPublished ? 'PUBLISHED' : (hasAnyScore ? 'FINALIZED' : 'DRAFT');

      return {
        nim: s.nim || s.nisn,
        full_name: s.full_name || s.name,
        scores,
        final_score,
        status
      };
    });

    exportMKToExcel({
      name: mk?.name || 'Mata Kuliah',
      kode_mk: mk?.kode_mk || '',
      semester: mk?.semester || '',
      kode_semester: mk?.kode_semester || '',
      sks: mk?.sks || 0,
      kelas: selectedRombel ? selectedRombel.name : rombelList.map(r => r.name).join(', '),
      dosen_name: mk?.dosen_name || mk?.guru_name || '',
      studentCount: students.length
    }, komps, roster);
    addToast(`Laporan ${courseLabel} berhasil diekspor ke Excel`, 'success');
  };

  // Open Native File Picker for Import Excel
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ====================================================================
  // SMART IMPORT ENGINE v2 — Robust Edge-Case Handling & Custom Toasts
  // Handles: Empty files, corrupted files, missing columns, excess columns,
  // incomplete rows (missing NIM/Name), duplicate NIMs, with precise Toast feedback.
  // ====================================================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsUploading(true);

    setTimeout(() => {
      const reader = new FileReader();

      reader.onerror = () => {
        setIsUploading(false);
        addToast(`Gagal membaca berkas "${file.name}". File mungkin rusak atau dikunci.`, 'error');
      };

      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });

          if (!wb.SheetNames || wb.SheetNames.length === 0) {
            setIsUploading(false);
            addToast(`Berkas "${file.name}" tidak memiliki lembar kerja (worksheet) yang valid.`, 'warning');
            return;
          }

          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data = XLSX.utils.sheet_to_json(ws);

          // EDGE CASE 1: Empty Excel File
          if (!data || data.length === 0) {
            setIsUploading(false);
            addToast(`Berkas "${file.name}" kosong atau tidak memiliki baris data (0 baris).`, 'warning');
            return;
          }

          // --- STEP 1: Smart Column Detection ---
          const headers = Object.keys(data[0]);

          // Keyword matchers (case-insensitive & space-agnostic)
          const NIM_KEYWORDS = ['nim', 'nisn', 'nrp', 'npm', 'no_induk', 'nomor_induk', 'student_id', 'id_mahasiswa', 'id_siswa', 'nim_siswa', 'nim_mahasiswa'];
          const NAME_KEYWORDS = ['nama', 'name', 'full_name', 'nama_mahasiswa', 'nama_siswa', 'nama_lengkap', 'student_name', 'mahasiswa', 'siswa', 'peserta'];
          const SKIP_KEYWORDS = ['no', 'nomor', 'no.', '#', 'urut', 'number', 'idx', 'index', 'email', 'alamat', 'prodi', 'jurusan', 'ipk', 'status', 'keterangan'];

          const normalize = (str) => String(str).toLowerCase().replace(/[\s._\-]/g, '');

          const findColumn = (keywords) => {
            for (const h of headers) {
              const norm = normalize(h);
              if (keywords.some(kw => norm === normalize(kw))) return h;
            }
            for (const h of headers) {
              const norm = normalize(h);
              if (keywords.some(kw => norm.includes(normalize(kw)))) return h;
            }
            return null;
          };

          let nimCol = findColumn(NIM_KEYWORDS);
          let nameCol = findColumn(NAME_KEYWORDS);

          // --- STEP 2: Pattern Detection Fallback (When Headers are generic/custom) ---
          if (!nimCol || !nameCol) {
            const candidateCols = headers.filter(h => !SKIP_KEYWORDS.some(sk => normalize(h) === normalize(sk)));

            for (const col of candidateCols) {
              if (col === nimCol || col === nameCol) continue;
              const sampleValues = data.slice(0, Math.min(5, data.length)).map(r => String(r[col] || '').trim());
              const nonEmpty = sampleValues.filter(v => v.length > 0);
              if (nonEmpty.length === 0) continue;

              // NIM pattern: digits 6-15
              const allDigits = nonEmpty.every(v => /^\d{6,15}$/.test(v));
              if (allDigits && !nimCol) {
                nimCol = col;
                continue;
              }

              // Name pattern: letters, length > 3, NOT all digits
              const looksLikeName = nonEmpty.every(v => /[a-zA-Z]/.test(v) && v.length > 3 && !/^\d+$/.test(v));
              if (looksLikeName && !nameCol) {
                nameCol = col;
                continue;
              }
            }
          }

          // --- STEP 3: Heuristic Fallback ---
          if (!nimCol || !nameCol) {
            const usable = headers.filter(h => !SKIP_KEYWORDS.some(sk => normalize(h) === normalize(sk)));
            if (usable.length >= 2) {
              const col1Avg = data.slice(0, 5).reduce((s, r) => s + String(r[usable[0]] || '').length, 0) / Math.min(5, data.length);
              const col2Avg = data.slice(0, 5).reduce((s, r) => s + String(r[usable[1]] || '').length, 0) / Math.min(5, data.length);
              if (col1Avg <= col2Avg) {
                nimCol = nimCol || usable[0];
                nameCol = nameCol || usable[1];
              } else {
                nimCol = nimCol || usable[1];
                nameCol = nameCol || usable[0];
              }
            } else if (usable.length === 1) {
              nameCol = nameCol || usable[0];
            }
          }

          // EDGE CASE 4: Missing Required Columns (No NIM and No Name found)
          if (!nimCol && !nameCol) {
            setIsUploading(false);
            addToast(`Tidak dapat mengidentifikasi kolom NIM atau Nama pada berkas "${file.name}". Pastikan file memiliki kolom Nama/NIM.`, 'warning');
            return;
          }

          // --- STEP 4: Parse & Handle Incomplete Rows + Deduplicate (Chunked for Smooth Progress) ---
          const existingNims = new Set(students.map(s => String(s.nim).trim()));
          let skippedDuplicates = 0;
          let incompleteRowsFixed = 0;
          const imported = [];

          const totalRows = data.length;
          setImportProgress({ current: 0, total: totalRows, percent: 0 });

          const chunkSize = Math.max(1, Math.ceil(totalRows / 15)); // Process in ~15 smooth animation frames
          let currentIdx = 0;

          const processBatch = () => {
            const endIdx = Math.min(currentIdx + chunkSize, totalRows);

            for (let idx = currentIdx; idx < endIdx; idx++) {
              const row = data[idx];
              let nimRaw = nimCol ? String(row[nimCol] || '').trim() : '';
              let nameRaw = nameCol ? String(row[nameCol] || '').trim() : '';

              // Skip completely empty rows
              if (!nameRaw && !nimRaw) continue;
              // Skip repeated header rows inside data body
              if (nimRaw.toLowerCase() === 'nim' || nameRaw.toLowerCase() === 'nama') continue;

              // EDGE CASE 3: Incomplete Rows (Missing NIM or Missing Name)
              if (!nimRaw && nameRaw) {
                nimRaw = `AUTO${new Date().getFullYear()}${(idx + 1).toString().padStart(4, '0')}`;
                incompleteRowsFixed++;
              } else if (nimRaw && !nameRaw) {
                nameRaw = `Mahasiswa ${nimRaw}`;
                incompleteRowsFixed++;
              }

              // Deduplicate NIM
              if (existingNims.has(nimRaw)) {
                skippedDuplicates++;
                continue;
              }
              existingNims.add(nimRaw);

              imported.push({
                id: `imp-${Date.now()}-${idx}`,
                student_id: `imp-${Date.now()}-${idx}-uuid`,
                nim: nimRaw,
                full_name: nameRaw,
                enrolled_at: new Date().toISOString().split('T')[0]
              });
            }

            currentIdx = endIdx;
            const pct = Math.round((currentIdx / totalRows) * 100);
            setImportProgress({ current: currentIdx, total: totalRows, percent: pct });

            if (currentIdx < totalRows) {
              setTimeout(processBatch, 40);
            } else {
              // Batch processing complete!
              setTimeout(() => {
                // EDGE CASE 5: All rows were duplicates
                if (imported.length === 0) {
                  setIsUploading(false);
                  if (skippedDuplicates > 0) {
                    addToast(`Seluruh ${skippedDuplicates} data mahasiswa pada berkas "${file.name}" sudah terdaftar di kelas ini!`, 'info');
                  } else {
                    addToast(`Tidak ditemukan baris data mahasiswa yang valid pada berkas "${file.name}".`, 'warning');
                  }
                  return;
                }

                if (selectedRombel) {
                  const updatedStudents = [...(selectedRombel.students || []), ...imported];
                  updateRombel(mkId, selectedRombel.id, { students: updatedStudents });
                } else if (rombelList[0]) {
                  const updatedStudents = [...(rombelList[0].students || []), ...imported];
                  updateRombel(mkId, rombelList[0].id, { students: updatedStudents });
                } else {
                  const updatedStudents = [...students, ...imported];
                  updateMK(mkId, { students: updatedStudents });
                }
                setIsUploading(false);

                // Rich Contextual Toast Notification
                let toastMessage = `Berhasil mengimpor ${imported.length} mahasiswa dari "${file.name}"!`;
                const details = [];
                if (skippedDuplicates > 0) details.push(`${skippedDuplicates} duplikat dilewati`);
                if (incompleteRowsFixed > 0) details.push(`${incompleteRowsFixed} data tidak lengkap diisi otomatis`);

                if (details.length > 0) {
                  toastMessage += ` (${details.join(', ')})`;
                }

                console.log(`[Smart Import v2] File: "${file.name}", NIM Col: "${nimCol}", Name Col: "${nameCol}", Imported: ${imported.length}, Skipped: ${skippedDuplicates}, Incomplete: ${incompleteRowsFixed}`);
                addToast(toastMessage, 'success');
              }, 150);
            }
          };

          processBatch();
        } catch (err) {
          console.error(err);
          setIsUploading(false);
          // EDGE CASE 2: Corrupted or Unsupported File
          addToast(`Gagal membaca berkas "${file.name}". Pastikan format file berupa Excel (.xlsx/.xls) atau CSV yang valid.`, 'error');
        }
      };
      reader.readAsBinaryString(file);
      e.target.value = '';
    }, 400);
  };

  const isAllRombelView = !selectedRombel || rombelIdParam === 'ALL';

  return (
    <div className={styles.page}>
      {/* Hidden File Input for Native File Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx,.xls,.csv" 
        style={{ display: 'none' }} 
      />

      {/* Rombel Tabs Bar (University MK or when multiple rombel exist) */}
      {rombelList.length > 0 && (
        <div className={styles.rombelTabsContainer}>
          <div className={styles.rombelTabsGroup}>
            <button
              type="button"
              className={`${styles.rombelTabBtn} ${isAllRombelView ? styles.activeTab : ''}`}
              onClick={() => setSearchParams({ rombelId: 'ALL' })}
            >
              <UsersRound size={15} />
              <span>Semua Rombel ({getAllStudents(mkId).length})</span>
            </button>

            {rombelList.map(r => (
              <button
                key={r.id}
                type="button"
                className={`${styles.rombelTabBtn} ${selectedRombel?.id === r.id ? styles.activeTab : ''}`}
                onClick={() => setSearchParams({ rombelId: r.id })}
              >
                <span>{r.name}</span>
                <span style={{ opacity: 0.8, fontSize: '11px' }}>({r.students?.length || 0})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CASE 1: When viewing 'Semua Rombel' & MK has multiple rombels -> Show Rombel Overview only */}
      {isAllRombelView && rombelList.length > 1 ? (
        <div className={styles.rombelOverviewSection}>
          <div className={styles.header} style={{ marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className={styles.title}>
                  Ringkasan Rombongan Belajar
                </h1>
                <HelpButton size={22} />
              </div>
              <p className={styles.subtitle}>
                {courseLabel}: <strong>{mk?.name}</strong> • Total {rombelList.length} rombel ({getAllStudents(mkId).length} {learnerLabel.toLowerCase()} terdaftar)
              </p>
            </div>
            {isStaff && (
              <Button variant="primary" onClick={() => setShowAddRombelModal(true)}>
                <PlusCircle size={16} />
                <span>Tambah Rombel</span>
              </Button>
            )}
          </div>

          {/* Rombel Toolbar: Search & macOS Finder Style Grid/List View Toggle */}
          <div className={styles.rombelToolbar}>
            <div className={styles.rombelSearchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                className={styles.searchInput}
                placeholder="Cari nama rombel, dosen, ruangan, kode..."
                value={rombelSearchInput}
                onChange={(e) => setRombelSearchInput(e.target.value)}
              />
            </div>

            {/* macOS Finder Style View Toggle */}
            <div className={styles.viewToggleGroup}>
              <button
                type="button"
                className={`${styles.viewToggleBtn} ${rombelViewMode === 'grid' ? styles.viewToggleActive : ''}`}
                onClick={() => setRombelViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={15} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={`${styles.viewToggleBtn} ${rombelViewMode === 'list' ? styles.viewToggleActive : ''}`}
                onClick={() => setRombelViewMode('list')}
                title="List View"
              >
                <List size={15} />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Content: Grid or List */}
          {rombelViewMode === 'grid' ? (
            <div className={styles.rombelGrid}>
              {paginatedRombels.map((rombel) => {
                const studentCount = (rombel.students || []).length;
                const gradedCount = (rombel.students || []).filter(s => {
                  const stuId = s.id || s.student_id;
                  const sd = rombel.scoringData?.[s.id] || rombel.scoringData?.[s.student_id] || rombel.scoringData?.[stuId];
                  return sd && Object.keys(sd).length > 0;
                }).length;
                const progressPct = studentCount > 0 ? Math.round((gradedCount / studentCount) * 100) : 0;

                return (
                  <div
                    key={rombel.id}
                    className={styles.rombelCard}
                    onClick={() => setSearchParams({ rombelId: rombel.id })}
                  >
                    <div className={styles.rombelCardAccent} />
                    <div className={styles.rombelCardBody}>
                      <div className={styles.rombelCardTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 className={styles.rombelCardName}>{rombel.name}</h3>
                          {rombel.kode_rombel && (
                            <span className={styles.rombelMetaBadge}>{rombel.kode_rombel}</span>
                          )}
                        </div>
                        <span className={styles.rombelMetaBadge}>{rombel.semester || mk.semester}</span>
                      </div>

                      <div className={styles.rombelCardMeta}>
                        {rombel.dosen_pengampu && (
                          <span className={styles.rombelMetaBadge}>
                            <User size={12} /> {rombel.dosen_pengampu}
                          </span>
                        )}
                        {rombel.jadwal && (
                          <span className={styles.rombelMetaBadge}>
                            <Clock size={12} /> {rombel.jadwal}
                          </span>
                        )}
                        {rombel.ruangan && (
                          <span className={styles.rombelMetaBadge}>
                            <MapPin size={12} /> {rombel.ruangan}
                          </span>
                        )}
                        {rombel.keterangan && (
                          <span className={styles.rombelMetaBadge}>
                            <FileText size={12} /> {rombel.keterangan}
                          </span>
                        )}
                      </div>

                      <div className={styles.rombelStatsRow}>
                        <div className={styles.rombelStatItem}>
                          <span className={styles.rombelStatVal}>
                            {studentCount}
                          </span>
                          <span className={styles.rombelStatLbl}>{learnerLabel} Terdaftar</span>
                        </div>
                        <div className={styles.rombelStatItem}>
                          <span className={styles.rombelStatVal} style={{ color: gradedCount > 0 ? '#059669' : 'var(--text-secondary)' }}>
                            {gradedCount}/{studentCount} ({progressPct}%)
                          </span>
                          <span className={styles.rombelStatLbl}>Telah Dinilai</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.rombelCardFooter}>
                      <span className={styles.rombelActionLink}>Buka {rombel.name} & Nilai</span>
                      <ArrowRight size={15} className={styles.rombelArrow} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* macOS Finder Style List View */
            <div className={styles.rombelListContainer}>
              {paginatedRombels.map((rombel) => {
                const studentCount = (rombel.students || []).length;
                const gradedCount = (rombel.students || []).filter(s => {
                  const stuId = s.id || s.student_id;
                  const sd = rombel.scoringData?.[s.id] || rombel.scoringData?.[s.student_id] || rombel.scoringData?.[stuId];
                  return sd && Object.keys(sd).length > 0;
                }).length;
                const progressPct = studentCount > 0 ? Math.round((gradedCount / studentCount) * 100) : 0;

                return (
                  <div
                    key={rombel.id}
                    className={styles.rombelListRow}
                    onClick={() => setSearchParams({ rombelId: rombel.id })}
                  >
                    <div className={styles.rombelListLeft}>
                      <div className={styles.rombelListIcon}>
                        <UsersRound size={20} />
                      </div>
                      <div className={styles.rombelListInfo}>
                        <div className={styles.rombelListNameRow}>
                          <span className={styles.rombelListName}>{rombel.name}</span>
                          {rombel.kode_rombel && (
                            <span className={styles.rombelMetaBadge}>{rombel.kode_rombel}</span>
                          )}
                          <span className={styles.rombelMetaBadge}>{rombel.semester || mk.semester}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px', alignItems: 'center' }}>
                          {rombel.dosen_pengampu && (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} /> {rombel.dosen_pengampu}
                            </span>
                          )}
                          {rombel.jadwal && (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {rombel.jadwal}
                            </span>
                          )}
                          {rombel.ruangan && (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {rombel.ruangan}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.rombelListRight}>
                      <div className={styles.rombelListStat}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {studentCount} {learnerLabel} Terdaftar
                        </span>
                        <span style={{ fontSize: '11.5px', color: gradedCount > 0 ? '#059669' : 'var(--text-muted)', fontWeight: 600 }}>
                          {gradedCount}/{studentCount} dinilai ({progressPct}%)
                        </span>
                      </div>

                      <div className={styles.rombelListAction}>
                        <span>Buka Nilai</span>
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Search Result */}
          {filteredRombels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Tidak ada rombongan belajar yang sesuai dengan "<strong>{debouncedRombelSearch}</strong>"
              </p>
            </div>
          )}

          {/* Rombel Pagination */}
          {filteredRombels.length > 0 && (
            <Pagination
              currentPage={rombelCurrentPage}
              totalPages={totalRombelPages}
              totalItems={filteredRombels.length}
              itemsPerPage={rombelItemsPerPage}
              onPageChange={(p) => setRombelCurrentPage(p)}
              onItemsPerPageChange={(newSize) => {
                setRombelItemsPerPage(newSize);
                setRombelCurrentPage(1);
              }}
            />
          )}
        </div>
      ) : (
        /* CASE 2: Specific Rombel Selected OR single-rombel MK -> Show Student Table & Grading */
        <div>
          {/* Header Info */}
          <div className={styles.header}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className={styles.title}>
                  {learnerPluralLabel} {selectedRombel ? `— ${selectedRombel.name}` : ''}
                </h1>
                <HelpButton size={22} />
              </div>
              <p className={styles.subtitle}>
                {courseLabel}: <strong>{mk?.name}</strong> • Total {students.length} {learnerLabel.toLowerCase()} terdaftar {selectedRombel ? `di ${selectedRombel.name}` : ''}
              </p>
            </div>

            {isStaff && (
              <div className={styles.headerActions}>
                {/* Split Action: Import Excel / Add Manual Dropdown */}
                <div className={styles.addBtnContainer} ref={dropdownRef}>
                  <Button 
                    variant="primary" 
                    className={styles.mainAddBtn}
                    onClick={() => setShowAddDropdown(prev => !prev)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Spinner size="sm" />
                        <span>Mengimpor...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Tambah {learnerLabel}</span>
                        <ChevronDown size={15} style={{ marginLeft: '4px', opacity: 0.8 }} />
                      </>
                    )}
                  </Button>

                  {showAddDropdown && (
                    <div className={styles.addDropdownMenu}>
                      <button 
                        className={styles.addDropdownOption}
                        onClick={() => {
                          setShowAddDropdown(false);
                          handleImportClick();
                        }}
                      >
                        <div className={styles.dropdownOptionIcon}>
                          <Upload size={18} />
                        </div>
                        <div className={styles.dropdownOptionText}>
                          <strong>Import Berkas Excel / CSV</strong>
                          <span>Unggah file data {learnerLabel.toLowerCase()} (.xlsx, .xls, .csv)</span>
                        </div>
                      </button>

                      <div className={styles.dropdownDivider} />

                      <button 
                        className={styles.addDropdownOption}
                        onClick={() => {
                          setShowAddDropdown(false);
                          setShowAddModal(true);
                        }}
                      >
                        <div className={styles.dropdownOptionIcon}>
                          <UserPlus size={18} />
                        </div>
                        <div className={styles.dropdownOptionText}>
                          <strong>Tambah Manual</strong>
                          <span>Masukan {learnerIdLabel} & Nama {learnerLabel} secara manual</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                className={styles.searchInput}
                placeholder={`Cari nama atau ${learnerIdLabel}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className={styles.exportBtn} onClick={handleExport}>
              <Download size={16} /> Export {learnerLabel} & Nilai (.xlsx)
            </Button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>{learnerIdLabel}</th>
                  <th>Nama {learnerLabel}</th>
                  <th>Progress Penilaian</th>
                  <th>Nilai Akhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s, i) => {
                  const name = s.full_name || s.name || learnerLabel;
                  const stuId = s.id || s.student_id;
                  const stuScoring = scoringData?.[s.id] || scoringData?.[s.student_id] || scoringData?.[stuId] || {};
                  const totalKomponen = (mk?.komponen || []).length || 6;
                  const gradedKomponen = (mk?.komponen || []).filter(k => stuScoring[k.id]?.rawScore != null).length;
                  const progressPct = totalKomponen > 0 ? (gradedKomponen / totalKomponen) * 100 : 0;
                  const itemNumber = (currentPage - 1) * itemsPerPage + i + 1;

                  // Calculate weighted final score from all graded komponen
                  let nilaiAkhir = null;
                  if (gradedKomponen > 0) {
                    let total = 0;
                    const komps = mk?.komponen || [];
                    for (const komp of komps) {
                      const sd = stuScoring[komp.id];
                      if (sd?.rawScore != null) {
                        total += sd.rawScore * (komp.bobot || 0);
                      }
                    }
                    nilaiAkhir = Math.round(total);
                  }

                  return (
                    <tr key={stuId} className={styles.row}>
                      <td className={styles.cellNum}>{itemNumber}</td>
                      <td className={styles.cellNim}>{s.nim || s.nisn || '-'}</td>
                      <td className={styles.cellName}>
                        <div className={styles.nameWrapper}>
                          <div className={styles.studentAvatar}>
                            {name.charAt(0)}
                          </div>
                          {name}
                        </div>
                      </td>
                      <td>
                        <div className={styles.progressCell}>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill} 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {gradedKomponen}/{totalKomponen}
                          </span>
                        </div>
                      </td>
                      <td>
                        {nilaiAkhir !== null ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              className={styles.nilaiChip}
                              style={{ color: getGradeColor(nilaiAkhir), background: getGradeBg(nilaiAkhir) }}
                              title={getGradeInfo(nilaiAkhir).desc}
                            >
                              {nilaiAkhir}
                            </span>
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: 800, 
                                fontFamily: 'var(--font-mono)',
                                color: getGradeColor(nilaiAkhir),
                                padding: '2px 5px',
                                borderRadius: '4px',
                                background: getGradeBg(nilaiAkhir)
                              }}
                              title={`Grade ${getGradeInfo(nilaiAkhir).grade}: ${getGradeInfo(nilaiAkhir).desc}`}
                            >
                              {getGradeInfo(nilaiAkhir).grade}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isStaff && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => navigate(`/mk/${mkId}/scoring?studentId=${stuId}${selectedRombel ? `&rombelId=${selectedRombel.id}` : ''}`)}
                            >
                              <Edit3 size={14} /> Nilai
                            </Button>
                          )}
                          {isStaff && (
                            <button 
                              className={styles.moreBtn} 
                              onClick={() => handleRemoveStudent(stuId, name)}
                              title={`Hapus ${learnerLabel}`}
                            >
                              <Trash2 size={16} stroke="#ef4444" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      {debouncedSearchQuery 
                        ? `Tidak ada ${learnerLabel.toLowerCase()} yang sesuai dengan "${debouncedSearchQuery}"`
                        : `Belum ada ${learnerLabel.toLowerCase()} di rombel ini`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Bar */}
            {filtered.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                onItemsPerPageChange={(newSize) => {
                  setItemsPerPage(newSize);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Structured Add Rombel Modal */}
      <Modal
        isOpen={showAddRombelModal}
        onClose={() => setShowAddRombelModal(false)}
        title="Tambah Rombongan Belajar (Rombel)"
      >
        <form onSubmit={handleCreateRombel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Lengkapi data kelas/rombongan belajar untuk mata kuliah <strong>{mk.name}</strong>.
          </p>

          <div className={styles.modalFormGrid}>
            <Input 
              label="Nama Rombel" 
              placeholder="Contoh: PE 2025 C"
              value={rombelForm.name}
              onChange={(e) => setRombelForm(prev => ({ ...prev, name: capitalizeWords(e.target.value) }))}
              required
              autoFocus
            />
            <Input 
              label="Kode Rombel" 
              placeholder="Contoh: 25P04085-C"
              value={rombelForm.kode_rombel}
              onChange={(e) => setRombelForm(prev => ({ ...prev, kode_rombel: e.target.value.toUpperCase() }))}
            />

            <div className={styles.selectWrap}>
              <label className={styles.selectLabel}>Semester / Tahun Ajaran</label>
              <select
                className={styles.selectInput}
                value={isCustomSemester ? '__CUSTOM__' : rombelForm.semester}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomSemester(true);
                  } else {
                    setIsCustomSemester(false);
                    setRombelForm(prev => ({ ...prev, semester: e.target.value }));
                  }
                }}
              >
                {SEMESTER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt === '__CUSTOM__' ? 'Lainnya (Ketik Manual...)' : opt}
                  </option>
                ))}
              </select>
            </div>

            <Input 
              label="Dosen Pengampu" 
              placeholder="Nama dosen pengampu"
              value={rombelForm.dosen_pengampu}
              onChange={(e) => setRombelForm(prev => ({ ...prev, dosen_pengampu: capitalizeWords(e.target.value) }))}
            />

            {isCustomSemester && (
              <div className={styles.modalFormFull}>
                <Input 
                  label="Ketik Semester / Tahun Ajaran Manual" 
                  placeholder="Contoh: Semester Pendek 2025/2026"
                  value={rombelForm.customSemester}
                  onChange={(e) => setRombelForm(prev => ({ ...prev, customSemester: capitalizeWords(e.target.value) }))}
                  required
                />
              </div>
            )}

            <div className={styles.modalFormFull}>
              <Input 
                label="Hari & Jam Kuliah" 
                placeholder="Contoh: Senin, 08:00 - 10:30 WIB"
                value={rombelForm.jadwal}
                onChange={(e) => setRombelForm(prev => ({ ...prev, jadwal: capitalizeWords(e.target.value) }))}
              />
            </div>

            <div className={styles.modalFormFull}>
              <Input 
                label="Ruangan / Lab" 
                placeholder="Contoh: Lab Akuntansi 1 / Gedung D302"
                value={rombelForm.ruangan}
                onChange={(e) => setRombelForm(prev => ({ ...prev, ruangan: capitalizeWords(e.target.value) }))}
              />
            </div>

            <div className={styles.modalFormFull}>
              <Input 
                label="Catatan / Keterangan (Opsional)" 
                placeholder="Keterangan tambahan untuk rombel ini"
                value={rombelForm.keterangan}
                onChange={(e) => setRombelForm(prev => ({ ...prev, keterangan: capitalizeFirstLetter(e.target.value) }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button variant="outline" type="button" onClick={() => setShowAddRombelModal(false)}>Batal</Button>
            <Button variant="primary" type="submit" disabled={!rombelForm.name.trim()}>Simpan Rombel</Button>
          </div>
        </form>
      </Modal>

      {/* Manual Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Tambah ${learnerLabel} Manual ${selectedRombel ? `ke ${selectedRombel.name}` : ''}`}
      >
        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label={`${learnerIdLabel} ${learnerLabel}`} 
            placeholder={`Contoh: ${learnerIdLabel === 'NISN' ? '0081234567' : '2024081005'}`}
            value={newNim}
            onChange={(e) => setNewNim(e.target.value.trim().toUpperCase())}
            required
          />
          <Input 
            label={`Nama Lengkap ${learnerLabel}`} 
            placeholder="Contoh: Muhammad Farhan"
            value={newName}
            onChange={(e) => setNewName(capitalizeWords(e.target.value))}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">Tambah {learnerLabel}</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Progress Loading Overlay Modal with Real-time Percentage & Counter */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card variant="glass" padding="lg" style={{ textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Spinner size="lg" color="emerald" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '12px', color: 'var(--text-primary)' }}>
              Mengimpor Mahasiswa...
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', wordBreak: 'break-all' }}>
              Sedang membaca dan memvalidasi berkas <strong>{uploadFileName}</strong>
            </p>

            {/* Progress Bar & Percentage Counter */}
            <div style={{ marginTop: '20px', padding: '0 4px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-surface-hover, #f1f5f9)',
                borderRadius: '9999px',
                overflow: 'hidden',
                border: '1px solid var(--border-color, #e2e8f0)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${importProgress.percent}%`,
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  borderRadius: '9999px',
                  transition: 'width 0.15s ease-out'
                }} />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginTop: '10px'
              }}>
                <span>
                  {importProgress.total > 0
                    ? `Memproses ${importProgress.current} dari ${importProgress.total} mahasiswa`
                    : 'Membaca berkas...'}
                </span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                  {importProgress.percent}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MKStudentListPage;
