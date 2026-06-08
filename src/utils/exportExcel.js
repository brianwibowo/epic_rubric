import * as XLSX from 'xlsx';

/**
 * Ekspor seluruh data nilai satu kelas ke dalam format berkas .xlsx (Excel)
 * Sesuai spesifikasi PRD FR-LA-005.
 * 
 * Kolom: No, NISN, Nama Siswa, Kelas, Skor_E, Skor_P, Skor_I, Skor_C, Skor_PE, Nilai_Akhir, Status
 * 
 * @param {string} className - Nama kelas (e.g. "XII AKL 1")
 * @param {string} projectName - Nama proyek praktikum
 * @param {Array} roster - Rincian data penilaian bergabung dengan info profil
 */
export function exportClassToExcel(className, projectName, roster) {
  if (!roster || roster.length === 0) {
    alert('Tidak ada data nilai untuk diekspor.');
    return;
  }

  // Format rows matching PRD spec
  const rows = roster.map((student, idx) => ({
    'No': idx + 1,
    'NISN': student.nisn || '-',
    'Nama Siswa': student.full_name,
    'Kelas': className,
    'Skor_E': student.score_e !== undefined ? student.score_e : '-',
    'Skor_P': student.score_p !== undefined ? student.score_p : '-',
    'Skor_I': student.score_i !== undefined ? student.score_i : '-',
    'Skor_C': student.score_c !== undefined ? student.score_c : '-',
    'Skor_PE': student.score_pe !== undefined ? student.score_pe : '-',
    'Nilai_Akhir': student.final_score !== undefined ? student.final_score : '-',
    'Status': student.status === 'SENT_TO_ANALYTICS' ? 'TERKIRIM' : student.status || 'BELUM DINILAI'
  }));

  // Create sheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths for professional spreadsheet layout
  const colWidths = [
    { wch: 6 },   // No
    { wch: 15 },  // NISN
    { wch: 28 },  // Nama
    { wch: 12 },  // Kelas
    { wch: 10 },  // Skor E
    { wch: 10 },  // Skor P
    { wch: 10 },  // Skor I
    { wch: 10 },  // Skor C
    { wch: 10 },  // Skor PE
    { wch: 12 },  // Nilai Akhir
    { wch: 16 }   // Status
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor Nilai Kelas');

  // Trigger write file download
  const cleanProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanClassName = className.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rapor_Nilai_${cleanClassName}_${cleanProjectName}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
}
