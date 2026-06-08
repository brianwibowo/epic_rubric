import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Upload, FileCheck, AlertTriangle, FileSpreadsheet, X, Check } from 'lucide-react';
import styles from './BulkImport.module.css';

const BulkImport = ({ onImport, isLoading = false, classId }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const isExcel = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    selectedFile.name.endsWith('.xlsx');
    
    if (!isExcel) {
      alert('Hanya diperbolehkan berkas Excel (.xlsx)');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate rows
        const validRows = [];
        const errorRows = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // 1-indexed + header row
          const nisn = row.NISN || row.nisn;
          const nama = row.Nama || row['Nama Siswa'] || row.nama || row.nama_siswa;
          
          const errorMsg = [];
          if (!nisn) {
            errorMsg.push('NISN kosong');
          } else if (isNaN(Number(nisn))) {
            errorMsg.push('NISN harus berupa angka');
          }

          if (!nama || !nama.toString().trim()) {
            errorMsg.push('Nama kosong');
          }

          if (errorMsg.length > 0) {
            errorRows.push(`Baris ${rowNum}: ${errorMsg.join(', ')}`);
          } else {
            validRows.push({
              nisn: Number(nisn),
              nama: nama.toString().trim()
            });
          }
        });

        setParsedData(validRows);
        setErrors(errorRows);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        alert('Gagal membaca file Excel. Pastikan file tidak rusak.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (parsedData.length === 0) return;
    onImport(parsedData);
  };

  return (
    <Card variant="glass" padding="md" className={styles.container}>
      <h4 className={styles.title}>Impor Roster Siswa Massal (.xlsx)</h4>
      
      {!file ? (
        /* Drag and Drop Zone */
        <div
          className={`
            ${styles.dropzone}
            ${dragging ? styles.dragging : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx"
            className={styles.fileInput}
          />
          <Upload size={36} className={styles.uploadIcon} />
          <p className={styles.dropText}>
            Tarik & Lepaskan file Excel Anda di sini, atau <strong>pilih berkas</strong>
          </p>
          <p className={styles.helpText}>Format berkas wajib memuat header kolom: <strong>NISN</strong> dan <strong>Nama</strong></p>
        </div>
      ) : (
        /* File Parsed Preview */
        <div className={styles.previewContainer}>
          <div className={styles.fileHeader}>
            <div className={styles.fileMeta}>
              <FileSpreadsheet size={24} className={styles.excelIcon} />
              <div>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>({Math.round(file.size / 1024)} KB)</span>
              </div>
            </div>
            <button className={styles.clearBtn} onClick={clearSelection} disabled={isLoading}>
              <X size={18} />
            </button>
          </div>

          {/* Validation summary banner */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryItem}>
              <Check size={16} className={styles.iconCheck} />
              <span>{parsedData.length} siswa siap diimpor</span>
            </div>
            {errors.length > 0 && (
              <div className={styles.summaryItem}>
                <AlertTriangle size={16} className={styles.iconWarning} />
                <span>{errors.length} baris bermasalah</span>
              </div>
            )}
          </div>

          {/* Preview grid */}
          {parsedData.length > 0 && (
            <div className={styles.previewTableWrapper}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th>NISN</th>
                    <th>Nama Siswa</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td className={styles.monoCell}>{row.nisn}</td>
                      <td>{row.nama}</td>
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr>
                      <td colSpan={2} className={styles.moreRows}>
                        + {parsedData.length - 5} baris lainnya...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Error warnings */}
          {errors.length > 0 && (
            <div className={styles.errorsList}>
              <h5 className={styles.errorsTitle}>Daftar Kesalahan Baris (Dilewati):</h5>
              <ul>
                {errors.slice(0, 4).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {errors.length > 4 && <li>...dan {errors.length - 4} baris error lainnya.</li>}
              </ul>
            </div>
          )}

          <div className={styles.actionRow}>
            <Button variant="secondary" onClick={clearSelection} disabled={isLoading}>
              Batal
            </Button>
            <Button
              variant="epic"
              disabled={parsedData.length === 0 || isLoading}
              isLoading={isLoading}
              onClick={handleConfirm}
              iconLeft={<FileCheck size={18} />}
            >
              Konfirmasi Impor
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BulkImport;
