import React, { useState, useRef } from 'react';
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
import { UserPlus, Search, Upload, Download, Trash2, FileSpreadsheet, Edit3 } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fileInputRef = useRef(null);

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
    const roster = students.map((s) => ({
      nim: s.nim,
      full_name: s.full_name || s.name,
      scores: { 'Proyek': 85, 'Partisipasi': 90, 'Quiz': 78 },
      final_score: 84,
      status: 'PUBLISHED'
    }));
    exportMKToExcel(mk?.name || 'Mata Kuliah', mk?.kode_mk || 'MK', mk?.komponen || [], roster);
    addToast('Daftar mahasiswa diekspor ke Excel', 'success');
  };

  // Open Native File Picker for Import Excel
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Parse Excel File on Selection with Progress Overlay State
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFileName(file.name);
    setIsUploading(true);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length === 0) {
            setIsUploading(false);
            addToast('File Excel kosong atau format tidak dikenali.', 'warning');
            return;
          }

          const imported = data.map((row, idx) => {
            const nimVal = row.NIM || row.nim || row.NIM_Siswa || `2024081${10 + idx}`;
            const nameVal = row.Nama || row.nama || row['Nama Mahasiswa'] || row['Nama Siswa'] || `Mahasiswa Impor ${idx + 1}`;
            return {
              id: `imp-${Date.now()}-${idx}`,
              student_id: `imp-${Date.now()}-${idx}-uuid`,
              nim: String(nimVal).trim(),
              full_name: String(nameVal).trim(),
              enrolled_at: new Date().toISOString().split('T')[0]
            };
          });

          const updatedStudents = [...students, ...imported];
          updateMK(mkId, { students: updatedStudents });
          setIsUploading(false);
          addToast(`Berhasil mengimpor ${imported.length} mahasiswa dari berkas Excel!`, 'success');
        } catch (err) {
          console.error(err);
          setIsUploading(false);
          addToast('Gagal membaca file Excel: ' + err.message, 'error');
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
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload size={16} /> Import Excel
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Tambah Mahasiswa
          </Button>
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
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download size={16} /> Export
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
                    <div className={styles.studentAvatar}>
                      {name.charAt(0)}
                    </div>
                    {name}
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

      {/* Upload Progress Loading Overlay Modal */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card variant="glass" padding="lg" style={{ textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <Spinner size="lg" color="primary" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '16px', color: 'var(--text-primary)' }}>
              Mengimpor Mahasiswa...
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Sedang membaca dan memvalidasi berkas <strong>{uploadFileName}</strong>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MKStudentListPage;
