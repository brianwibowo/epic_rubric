import * as XLSX from 'xlsx';

/**
 * Ekspor seluruh data nilai satu Mata Kuliah ke dalam format berkas .xlsx (Excel)
 * Sesuai spesifikasi PRD v2.0 FR-LA-005.
 * 
 * Support dynamic N komponen per MK.
 * Kolom: No, NIM, Nama Mahasiswa, [Komponen 1...N], Nilai Akhir, Grade, Status
 * 
 * @param {string} mkName - Nama Mata Kuliah (e.g. "Praktikum Akuntansi Dasar")
 * @param {string} kodeMK - Kode MK (e.g. "AKT201")
 * @param {Array} komponenList - Daftar komponen [{ name: 'Proyek', bobot: 0.2 }, ...]
 * @param {Array} roster - Data mahasiswa & nilai [{ nim, full_name, scores: { Proyek: 85, ... }, final_score, status }]
 */
export function exportMKToExcel(mkName, kodeMK, komponenList = [], roster = []) {
  if (!roster || roster.length === 0) {
    alert('Tidak ada data nilai untuk diekspor.');
    return;
  }

  // Build dynamic headers
  const rows = roster.map((student, idx) => {
    const rowObj = {
      'No': idx + 1,
      'NIM': student.nim || '-',
      'Nama Mahasiswa': student.full_name,
    };

    // Add component scores
    komponenList.forEach(k => {
      const score = student.scores ? student.scores[k.name] : undefined;
      rowObj[`${k.name} (${(k.bobot * 100).toFixed(0)}%)`] = score !== undefined && score !== null ? score : '-';
    });

    const finalScore = student.final_score !== undefined && student.final_score !== null ? student.final_score : '-';
    let grade = '-';
    if (typeof finalScore === 'number') {
      if (finalScore >= 85) grade = 'A';
      else if (finalScore >= 70) grade = 'B';
      else if (finalScore >= 55) grade = 'C';
      else grade = 'D';
    }

    rowObj['Nilai Akhir'] = finalScore;
    rowObj['Grade'] = grade;
    rowObj['Status'] = student.status === 'PUBLISHED' ? 'DIPUBLIKASIKAN' : student.status === 'FINALIZED' ? 'FINAL' : 'DRAFT';

    return rowObj;
  });

  // Create sheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set dynamic column widths
  const colWidths = [
    { wch: 6 },   // No
    { wch: 15 },  // NIM
    { wch: 28 },  // Nama
    ...komponenList.map(() => ({ wch: 16 })), // Dynamic komponen columns
    { wch: 12 },  // Nilai Akhir
    { wch: 8 },   // Grade
    { wch: 16 }   // Status
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor Nilai MK');

  // Trigger write file download
  const cleanMKName = mkName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanKode = kodeMK.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rapor_Nilai_${cleanKode}_${cleanMKName}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
}
