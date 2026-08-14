import * as XLSX from 'xlsx';
import { getKomponenExcelHeader, getKomponenFullName, getKomponenCode } from './komponenHelper';
import { getGradeInfo, GRADE_SCALE } from './gradeHelper';

/**
 * Helper to build a styled worksheet for a given student roster.
 */
function createWorksheetForRoster(mkMeta, komponenList, roster, sheetTitle = '', includeRombelCol = false) {
  const mkName = mkMeta.name || 'Mata Kuliah';
  const kodeMK = mkMeta.kode_mk || 'MK';
  const semester = mkMeta.semester || '';
  const kodeSemester = mkMeta.kode_semester || '';
  const sks = mkMeta.sks || 0;
  const dosenName = mkMeta.dosen_name || '';
  const studentCount = roster.length;
  const isSchoolRoster = roster.some(s => s.nisn) || sheetTitle.includes('AKL') || mkMeta.is_school;
  const educatorName = mkMeta.guru_name || mkMeta.dosen_name || '';
  const learnerCol = isSchoolRoster ? 'Nama Siswa' : 'Nama Mahasiswa';
  const idCol = isSchoolRoster ? 'NISN' : 'NIM';
  const classCol = isSchoolRoster ? 'Kelas' : 'Rombel';

  // ──── Build Institutional Header (Row 1-2) ────
  const headerParts = [isSchoolRoster ? 'DAFTAR NILAI MATA PELAJARAN' : 'DAFTAR NILAI MATA KULIAH'];

  // Semester / Tahun ajaran part
  const semesterLabel = isSchoolRoster 
    ? (mkMeta.tahun_ajaran ? `TAHUN AJARAN ${mkMeta.tahun_ajaran}` : (semester ? `SEMESTER ${semester}` : ''))
    : (kodeSemester ? `SEMESTER ${kodeSemester}` : (semester ? `SEMESTER ${semester}` : ''));
  if (semesterLabel) headerParts[0] += ` ${semesterLabel}`;

  // MK info part
  const sksLabel = sks > 0 ? (isSchoolRoster ? ` (${sks} Jam/Mg)` : ` (${sks} SKS)`) : '';
  headerParts.push(`${kodeMK} ${mkName}${sksLabel}`);

  // Kelas / Rombel part
  if (sheetTitle) {
    headerParts.push(`${isSchoolRoster ? 'KELAS' : 'ROMBEL'}: ${sheetTitle} / ${studentCount} ORANG`);
  } else if (mkMeta.kelas) {
    headerParts.push(`${isSchoolRoster ? 'KELAS' : 'ROMBEL'}: ${mkMeta.kelas} / ${studentCount} ORANG`);
  } else {
    headerParts.push(`${studentCount} ${isSchoolRoster ? 'SISWA' : 'MAHASISWA'}`);
  }

  // Dosen / Guru part
  if (educatorName) {
    headerParts.push(`${isSchoolRoster ? 'GURU' : 'DOSEN'}: ${educatorName}`);
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
      [idCol]: student.nisn || student.nim || '-',
      [learnerCol]: student.full_name || student.name || '-',
    };

    if (includeRombelCol) {
      rowObj[classCol] = student.rombelName || student.kelas || '-';
    }

    // Add component scores with Academic Code headers
    komponenList.forEach(k => {
      const score = student.scores 
        ? (student.scores[k.name] ?? student.scores[getKomponenCode(k.name)] ?? student.scores[k.id]) 
        : undefined;
      const headerTitle = getKomponenExcelHeader(k.name, k.bobot);
      rowObj[headerTitle] = score !== undefined && score !== null ? score : '-';
    });

    const finalScore = student.final_score !== undefined && student.final_score !== null ? student.final_score : '-';
    const gradeData = typeof finalScore === 'number' ? getGradeInfo(finalScore) : { grade: '-', desc: '-' };

    rowObj['Nilai Akhir'] = finalScore;
    rowObj['Grade'] = gradeData.grade;
    rowObj['Keterangan Nilai'] = gradeData.desc;
    rowObj['Status'] = student.status === 'PUBLISHED' ? 'DIPUBLIKASIKAN' : student.status === 'FINALIZED' ? 'FINAL' : 'DRAFT';

    return rowObj;
  });

  // ──── Create Worksheet: Header first, then data table ────
  const worksheet = XLSX.utils.aoa_to_sheet(headerAOA);
  XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: 'A3' });

  // ──── Merge header cell across all columns ────
  const totalCols = (includeRombelCol ? 4 : 3) + komponenList.length + 4;
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }
  ];

  // ──── Append Legend/Keterangan at the bottom ────
  const legendDataRows = komponenList.map(k => [
    getKomponenCode(k.name),
    getKomponenFullName(k.name),
    `${(k.bobot * 100).toFixed(0)}%`
  ]);

  const gradeLegendRows = GRADE_SCALE.map(g => [
    `  ${g.grade}`,
    `: ${g.range}`,
    `(${g.desc})`
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['Keterangan Kode Komponen Penilaian:'],
    ...legendDataRows.map(([code, name, bobot]) => [`  ${code}`, `: ${name}`, `(${bobot})`]),
    [],
    ['Standar Konversi Grade Nilai:'],
    ...gradeLegendRows
  ], { origin: -1 });

  // ──── Set dynamic column widths ────
  const colWidths = [
    { wch: 6 },   // No
    { wch: 16 },  // NIM
    { wch: 32 },  // Nama Mahasiswa
    ...(includeRombelCol ? [{ wch: 18 }] : []),
    ...komponenList.map(() => ({ wch: 14 })),
    { wch: 14 },  // Nilai Akhir
    { wch: 10 },  // Grade
    { wch: 22 },  // Keterangan Nilai
    { wch: 18 }   // Status
  ];
  worksheet['!cols'] = colWidths;

  return worksheet;
}

/**
 * Ekspor seluruh data nilai satu Mata Kuliah ke dalam format berkas .xlsx (Excel)
 * Sesuai Standar Format Akademik Institusi Dosen.
 *
 * @param {Object} mkMeta - Metadata MK { name, kode_mk, semester, kode_semester, sks, kelas, dosen_name, studentCount }
 * @param {Array} komponenList - Daftar komponen [{ name, bobot }, ...]
 * @param {Array} roster - Data mahasiswa & nilai [{ nim, full_name, scores, final_score, status, rombelName }]
 * @param {Array} rombelGroups - Optional array of rombels [{ name, roster: [...] }] for multi-sheet workbook!
 */
export function exportMKToExcel(mkMeta, komponenList = [], roster = [], rombelGroups = []) {
  if (!roster || roster.length === 0) {
    throw new Error('Tidak ada data nilai atau mahasiswa untuk diekspor.');
  }

  const workbook = XLSX.utils.book_new();

  // If multiple rombel groups are provided, create a multi-sheet workbook!
  if (rombelGroups && rombelGroups.length > 1) {
    // Sheet 1: Combined All Students across all Rombel
    const allSheet = createWorksheetForRoster(mkMeta, komponenList, roster, 'Semua Rombel', true);
    XLSX.utils.book_append_sheet(workbook, allSheet, 'SEMUA MAHASISWA');

    // Subsequent Sheets: 1 Sheet per Rombel
    rombelGroups.forEach(rg => {
      const sanitizedSheetName = (rg.name || 'Rombel')
        .replace(/[:\\\/\?\*\[\]]/g, '_')
        .substring(0, 31);
      const rSheet = createWorksheetForRoster(mkMeta, komponenList, rg.roster || [], rg.name, false);
      XLSX.utils.book_append_sheet(workbook, rSheet, sanitizedSheetName);
    });
  } else {
    // Single sheet workbook
    const sheetName = (mkMeta.kelas || 'Rapor Nilai MK')
      .replace(/[:\\\/\?\*\[\]]/g, '_')
      .substring(0, 31);
    const sheet = createWorksheetForRoster(mkMeta, komponenList, roster, mkMeta.kelas || '', false);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  const mkName = mkMeta.name || 'Mata Kuliah';
  const kodeMK = mkMeta.kode_mk || 'MK';
  const cleanMKName = mkName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanKode = kodeMK.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Rapor_Nilai_${cleanKode}_${cleanMKName}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
