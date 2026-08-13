import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMKStore } from '@/stores/mkStore';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/utils/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';
import styles from './MKStudentListPage.module.css';
import { UserPlus, Search, Upload, Download, Trash2, FileSpreadsheet, Edit3, ChevronDown } from 'lucide-react';
import { exportMKToExcel } from '@/utils/exportExcel';
import * as XLSX from 'xlsx';

const MKStudentListPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const isDosen = profile?.role === ROLES.DOSEN || profile?.role === ROLES.ADMIN;
  const { getMKById, updateMK } = useMKStore();
  const { addToast } = useUiStore();

  const mk = getMKById(mkId);
  const students = mk?.students || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = students.filter(s => 
    (s.full_name || s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nim || '').includes(searchQuery)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getGradeColor = (nilai) => {
    if (nilai >= 85) return '#059669';
    if (nilai >= 70) return '#2563eb';
    if (nilai >= 55) return '#d97706';
    return '#dc2626';
  };

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

    const updatedStudents = [...students, newStudent];
    updateMK(mkId, { students: updatedStudents });

    setNewNim('');
    setNewName('');
    setShowAddModal(false);
    addToast(`Mahasiswa "${newStudent.full_name}" (NIM: ${newStudent.nim}) berhasil ditambahkan!`, 'success');
  };

  const handleRemoveStudent = (studentId, studentName) => {
    if (window.confirm(`Hapus ${studentName} dari mata kuliah ini?`)) {
      const updatedStudents = students.filter(s => s.id !== studentId && s.student_id !== studentId);
      updateMK(mkId, { students: updatedStudents });
      addToast(`Mahasiswa ${studentName} dihapus dari MK`, 'info');
    }
  };

  const handleExport = () => {
    const komps = mk?.komponen || [];
    const roster = students.map((s) => {
      const stuId = s.id || s.student_id;
      const stuScoring = mk?.scoringData?.[stuId] || {};
      
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
        nim: s.nim,
        full_name: s.full_name || s.name,
        scores,
        final_score,
        status
      };
    });

    exportMKToExcel({
      name: mk?.name || 'Mata Kuliah',
      kode_mk: mk?.kode_mk || 'MK',
      semester: mk?.semester || '',
      kode_semester: mk?.kode_semester || '',
      sks: mk?.sks || 0,
      kelas: mk?.kelas || '',
      dosen_name: mk?.dosen_name || '',
      studentCount: students.length
    }, komps, roster);
    addToast(`Berhasil mengekspor data ${students.length} mahasiswa dan nilai ke Excel!`, 'success');
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

                const updatedStudents = [...students, ...imported];
                updateMK(mkId, { students: updatedStudents });
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

  return (
    <div className={styles.page}>
      {/* Hidden File Input for Native File Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls, .csv" 
        style={{ display: 'none' }} 
      />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daftar Mahasiswa</h1>
          <p className={styles.subtitle}>{students.length} mahasiswa terdaftar di {mk?.name}</p>
        </div>
        <div className={styles.headerActions} ref={dropdownRef}>
          <div style={{ position: 'relative' }}>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowAddDropdown(prev => !prev)}
            >
              <UserPlus size={16} /> Tambah Mahasiswa <ChevronDown size={14} style={{ marginLeft: '4px', transform: showAddDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                    <span>Unggah file data mahasiswa (.xlsx, .xls, .csv)</span>
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
                    <span>Masukan NIM & Nama Mahasiswa secara manual</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            className={styles.searchInput}
            placeholder="Cari nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className={styles.exportBtn} onClick={handleExport}>
          <Download size={16} /> Export Mahasiswa & Nilai (.xlsx)
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>NIM</th>
              <th>Nama Mahasiswa</th>
              <th>Progress Penilaian</th>
              <th>Nilai Akhir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((s, i) => {
              const name = s.full_name || s.name || 'Mahasiswa';
              const stuId = s.id || s.student_id;
              const stuScoring = mk?.scoringData?.[stuId] || {};
              const totalKomponen = (mk?.komponen || []).length || 6;
              const gradedKomponen = Object.keys(stuScoring).length;
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
                  <td className={styles.cellNim}>{s.nim || '-'}</td>
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
                      <span 
                        className={styles.nilaiChip}
                        style={{ color: getGradeColor(nilaiAkhir), background: getGradeColor(nilaiAkhir) + '15' }}
                      >
                        {nilaiAkhir}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDosen && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => navigate(`/mk/${mkId}/scoring?studentId=${stuId}`)}
                        >
                          <Edit3 size={14} /> Nilai
                        </Button>
                      )}
                      {isDosen && (
                        <button 
                          className={styles.moreBtn} 
                          onClick={() => handleRemoveStudent(stuId, name)}
                          title="Hapus Mahasiswa"
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
                  Tidak ada mahasiswa yang sesuai dengan pencarian
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
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
      </div>

      {/* Manual Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Mahasiswa Manual"
      >
        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="NIM Mahasiswa" 
            placeholder="Contoh: 2024081005"
            value={newNim}
            onChange={(e) => setNewNim(e.target.value)}
            required
          />
          <Input 
            label="Nama Lengkap" 
            placeholder="Contoh: Muhammad Farhan"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">Tambah Mahasiswa</Button>
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
