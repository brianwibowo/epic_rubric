import * as XLSX from 'xlsx';
import { getKomponenExcelHeader, getKomponenFullName, getKomponenCode } from './komponenHelper';

/**
 * Ekspor seluruh data nilai satu Mata Kuliah ke dalam format berkas .xlsx (Excel)
 * Sesuai Standar Format Akademik Institusi Dosen (Header + NAPF/NHPY/NTGS/NKUS/NUTS/NUAS).
 *
 * @param {Object} mkMeta - Metadata MK { name, kode_mk, semester, kode_semester, sks, kelas, dosen_name, studentCount }
 * @param {Array} komponenList - Daftar komponen [{ name, bobot }, ...]
 * @param {Array} roster - Data mahasiswa & nilai [{ nim, full_name, scores, final_score, status }]
 */
export function exportMKToExcel(mkMeta, komponenList = [], roster = []) {
  if (!roster || roster.length === 0) {
    alert('Tidak ada data nilai untuk diekspor.');
    return;
  }

  const mkName = mkMeta.name || 'Mata Kuliah';
  const kodeMK = mkMeta.kode_mk || 'MK';
  const semester = mkMeta.semester || '';
  const kodeSemester = mkMeta.kode_semester || '';
  const sks = mkMeta.sks || 0;
  const kelas = mkMeta.kelas || '';
  const dosenName = mkMeta.dosen_name || '';
  const studentCount = mkMeta.studentCount || roster.length;

  // ──── Build Institutional Header (Row 1-2) ────
  // Format: "DAFTAR NILAI MATA KULIAH SEMESTER R225 | 25P04085 Perpajakan (2SKS) | KELAS: PE 2025 A / 32 ORANG | DOSEN: Dwi Puji Astuti, S.Pd., M.Pd."
  const headerParts = ['DAFTAR NILAI MATA KULIAH'];

  // Semester part
  const semesterLabel = kodeSemester ? `SEMESTER ${kodeSemester}` : (semester ? `SEMESTER ${semester}` : '');
  if (semesterLabel) headerParts[0] += ` ${semesterLabel}`;

  // MK info part
  const sksLabel = sks > 0 ? ` (${sks}SKS)` : '';
  headerParts.push(`${kodeMK} ${mkName}${sksLabel}`);

  // Kelas part
  if (kelas) {
    headerParts.push(`KELAS: ${kelas} / ${studentCount} ORANG`);
  } else {
    headerParts.push(`${studentCount} MAHASISWA`);
  }

  // Dosen part
  if (dosenName) {
    headerParts.push(`DOSEN: ${dosenName}`);
  }

  const headerLine = headerParts.join(' | ');

  // ──── Build the header rows as AOA (Array of Arrays) ────
  const headerAOA = [
    [headerLine],
    [] // blank row separator
  ];

  // ──── Build student data rows ────
  const dataRows = roster.map((student, idx) => {
    const rowObj = {
      'No': idx + 1,
      'NIM': student.nim || '-',
      'Nama Mahasiswa': student.full_name,
    };

    // Add component scores with Academic Code headers
    komponenList.forEach(k => {
      const score = student.scores ? (student.scores[k.name] ?? student.scores[getKomponenCode(k.name)]) : undefined;
      const headerTitle = getKomponenExcelHeader(k.name, k.bobot);
      rowObj[headerTitle] = score !== undefined && score !== null ? score : '-';
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

  // ──── Create Worksheet: Header first, then data table ────
  // Start with header AOA
  const worksheet = XLSX.utils.aoa_to_sheet(headerAOA);

  // Append data table starting at row 3 (0-indexed row 2)
  XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: 'A3' });

  // ──── Merge header cell across all columns ────
  const totalCols = 3 + komponenList.length + 3; // No + NIM + Nama + komponen + NA + Grade + Status
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }
  ];

  // ──── Append Legend/Keterangan at the bottom ────
  const legendDataRows = komponenList.map(k => [
    getKomponenCode(k.name),
    getKomponenFullName(k.name),
    `${(k.bobot * 100).toFixed(0)}%`
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['Keterangan Kode Komponen Penilaian:'],
    ...legendDataRows.map(([code, name, bobot]) => [`  ${code}`, `: ${name}`, `(${bobot})`])
  ], { origin: -1 });

  // ──── Set dynamic column widths ────
  const colWidths = [
    { wch: 6 },   // No
    { wch: 16 },  // NIM
    { wch: 32 },  // Nama Mahasiswa
    ...komponenList.map(() => ({ wch: 14 })),
    { wch: 14 },  // Nilai Akhir
    { wch: 10 },  // Grade
    { wch: 18 }   // Status
  ];
  worksheet['!cols'] = colWidths;

  // ──── Create workbook & trigger download ────
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor Nilai MK');

  const cleanMKName = mkName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanKode = kodeMK.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rapor_Nilai_${cleanKode}_${cleanMKName}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
