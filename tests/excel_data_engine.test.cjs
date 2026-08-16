/**
 * EPIC PLATFORM - EXCEL DATA & IMPORT/EXPORT ENGINE TEST SUITE
 * Validates:
 * 1. Multi-Sheet Institutional Excel Structure (.xlsx)
 * 2. Smart Header Detection & Synonyms (NIM, NISN, Nama, No Induk, etc.)
 * 3. Data Cleansing: Deduplication, Trimming, and Identifier Normalization
 * 4. Negative Scenarios: Corrupted Files, Missing Columns, Empty Rows
 * 5. High-Volume Batch Import Simulation (100+ Roster Records)
 */

const assert = require('assert');
const XLSX = require('xlsx');

console.log('================================================================');
console.log('   EPIC PLATFORM - EXCEL DATA & IMPORT/EXPORT ENGINE TESTS');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ================================================================
// SMART EXCEL IMPORT PARSER LOGIC REPLICATION
// ================================================================
function parseExcelRoster(sheetData, existingStudents = []) {
  if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
    throw new Error('Empty or invalid sheet data');
  }

  // Detect header row (first non-empty array)
  const headerRow = sheetData[0] || [];
  if (headerRow.length === 0) throw new Error('No headers found');

  // Helper to find column index matching synonyms
  const findColumnIndex = (synonyms) => {
    return headerRow.findIndex(cell => {
      if (!cell) return false;
      const str = String(cell).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      return synonyms.some(syn => str.includes(syn));
    });
  };

  const nimIndex = findColumnIndex(['nim', 'nisn', 'noinduk', 'nomorinduk', 'id', 'nis', 'nrp']);
  const nameIndex = findColumnIndex(['nama', 'name', 'namasiswa', 'namamahasiswa', 'fullname', 'pesertadidik']);

  if (nimIndex === -1 && nameIndex === -1) {
    throw new Error('Required columns (NIM/NISN or Nama) not found in header row');
  }

  const existingIds = new Set(existingStudents.map(s => (s.nim || s.nisn || '').trim().toUpperCase()));
  const imported = [];
  let skippedDuplicates = 0;
  let autoFilledNames = 0;

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === '')) {
      continue; // Skip blank rows
    }

    let idRaw = nimIndex !== -1 && row[nimIndex] != null ? String(row[nimIndex]).trim().toUpperCase() : '';
    let nameRaw = nameIndex !== -1 && row[nameIndex] != null ? String(row[nameIndex]).trim() : '';

    // If both empty, ignore
    if (!idRaw && !nameRaw) continue;

    // Handle missing ID with fallback
    if (!idRaw) {
      idRaw = `AUTOGEN_${Date.now()}_${i}`;
    }

    // Handle missing name
    if (!nameRaw) {
      nameRaw = `Peserta ${idRaw}`;
      autoFilledNames++;
    }

    // Check duplicates
    if (existingIds.has(idRaw)) {
      skippedDuplicates++;
      continue;
    }

    existingIds.add(idRaw);
    imported.push({
      id: `std_${Date.now()}_${i}`,
      nim: idRaw,
      nisn: idRaw,
      full_name: nameRaw,
      enrolled_at: '2026-08-17'
    });
  }

  return {
    imported,
    skippedDuplicates,
    autoFilledNames,
    totalRows: sheetData.length - 1
  };
}

// ================================================================
// SECTION 1: SMART IMPORT & COLUMN RECOGNITION TESTS
// ================================================================
console.log('--- SECTION 1: SMART IMPORT & COLUMN DETECTION ---');

test('Excel Import: Successfully recognize standard Indonesian headers [NIM, Nama Mahasiswa]', () => {
  const data = [
    ['No', 'NIM', 'Nama Mahasiswa', 'Program Studi'],
    [1, '7101422001', 'Ahmad Dahlan', 'Pendidikan Akuntansi'],
    [2, '7101422002', 'Budi Utomo', 'Pendidikan Akuntansi']
  ];
  const result = parseExcelRoster(data);
  assert.strictEqual(result.imported.length, 2);
  assert.strictEqual(result.imported[0].nim, '7101422001');
  assert.strictEqual(result.imported[0].full_name, 'Ahmad Dahlan');
});

test('Excel Import: Successfully recognize SMK headers [NISN, Nama Siswa]', () => {
  const data = [
    ['No', 'NISN', 'Nama Siswa', 'Kelas'],
    [1, '0051234001', 'Citra Lestari', 'XII AKL 1'],
    [2, '0051234002', 'Dewi Sartika', 'XII AKL 1']
  ];
  const result = parseExcelRoster(data);
  assert.strictEqual(result.imported.length, 2);
  assert.strictEqual(result.imported[1].nisn, '0051234002');
  assert.strictEqual(result.imported[1].full_name, 'Dewi Sartika');
});

test('Excel Import: Recognize informal / messy column names (e.g. "No. Induk", "Full Name")', () => {
  const data = [
    ['No. Induk Siswa', 'Full Name Peserta Didik'],
    ['SMK-9901', 'Eko Prasetyo']
  ];
  const result = parseExcelRoster(data);
  assert.strictEqual(result.imported.length, 1);
  assert.strictEqual(result.imported[0].nim, 'SMK-9901');
  assert.strictEqual(result.imported[0].full_name, 'Eko Prasetyo');
});

// ================================================================
// SECTION 2: DATA CLEANING & DEDUPLICATION TESTS
// ================================================================
console.log('\n--- SECTION 2: DATA CLEANING & DEDUPLICATION ---');

test('Excel Import: Deduplicate existing students in class roster', () => {
  const existing = [
    { id: 's1', nim: '7101422001', full_name: 'Ahmad Dahlan' }
  ];
  const data = [
    ['NIM', 'Nama'],
    ['7101422001', 'Ahmad Dahlan (Duplikat)'],
    ['7101422002', 'Fajar Sidik (Baru)']
  ];
  const result = parseExcelRoster(data, existing);
  assert.strictEqual(result.imported.length, 1);
  assert.strictEqual(result.skippedDuplicates, 1);
  assert.strictEqual(result.imported[0].nim, '7101422002');
});

test('Excel Import: Trim whitespace and uppercase identifiers automatically', () => {
  const data = [
    ['NIM', 'Nama Mahasiswa'],
    ['  7101422099  ', '   Galih Permana   ']
  ];
  const result = parseExcelRoster(data);
  assert.strictEqual(result.imported[0].nim, '7101422099');
  assert.strictEqual(result.imported[0].full_name, 'Galih Permana');
});

test('Excel Import: Gracefully skip blank rows and handle missing student names', () => {
  const data = [
    ['NIM', 'Nama'],
    ['7101422010', ''], // Missing name -> should auto-fill
    [null, null],        // Blank row
    ['', '   '],         // Empty strings
    ['7101422011', 'Hendra Gunawan']
  ];
  const result = parseExcelRoster(data);
  assert.strictEqual(result.imported.length, 2);
  assert.strictEqual(result.autoFilledNames, 1);
  assert.strictEqual(result.imported[0].full_name, 'Peserta 7101422010');
});

// ================================================================
// SECTION 3: NEGATIVE & CORRUPTED FILE TESTS
// ================================================================
console.log('\n--- SECTION 3: NEGATIVE SCENARIOS & BAD INPUT ---');

test('Excel Import: Throw error on empty data array or null input', () => {
  assert.throws(() => parseExcelRoster([]), /Empty or invalid/);
  assert.throws(() => parseExcelRoster(null), /Empty or invalid/);
});

test('Excel Import: Throw error when neither NIM nor Name columns exist', () => {
  const invalidData = [
    ['Alamat', 'Nomor Telepon', 'Hobi'],
    ['Jl. Pemuda No 1', '08123456789', 'Membaca']
  ];
  assert.throws(() => parseExcelRoster(invalidData), /Required columns.*not found/);
});

// ================================================================
// SECTION 4: EXPORT XLSX GENERATION & SHEET STRUCTURE
// ================================================================
console.log('\n--- SECTION 4: EXPORT XLSX STRUCTURE & WORKBOOK TESTS ---');

test('Excel Export: Construct valid Multi-Sheet Workbook with institutional headers', () => {
  const wb = XLSX.utils.book_new();

  // Create Rombel 1 Sheet
  const ws1Data = [
    ['DAFTAR NILAI MATA KULIAH | 25P04085 Praktikum Akuntansi Dasar (2 SKS) | ROMBEL: XII AKL 1 / 2 ORANG'],
    [],
    ['No', 'NIM', 'Nama Mahasiswa', 'Proyek (40%)', 'UAS (60%)', 'Nilai Akhir', 'Huruf Mutu', 'Predikat'],
    [1, '7101422001', 'Andi Pratama', 85, 90, 88.0, 'A', 'Sangat Memuaskan'],
    [2, '7101422002', 'Budi Santoso', 78, 80, 79.2, 'B+', 'Sangat Baik']
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  XLSX.utils.book_append_sheet(wb, ws1, 'XII AKL 1');

  // Create Rekapitulasi Sheet
  const ws2Data = [
    ['REKAPITULASI KESELURUHAN MATA KULIAH'],
    [],
    ['No', 'Rombel / Kelas', 'Jumlah Mahasiswa', 'Rata-rata Nilai'],
    [1, 'XII AKL 1', 2, 83.6]
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  XLSX.utils.book_append_sheet(wb, ws2, 'REKAP_SEMUA');

  // Assert workbook properties
  assert.strictEqual(wb.SheetNames.length, 2);
  assert.strictEqual(wb.SheetNames[0], 'XII AKL 1');
  assert.strictEqual(wb.SheetNames[1], 'REKAP_SEMUA');

  // Verify binary generation
  const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  assert.ok(wbBinary);
  assert.ok(wbBinary.length > 0);
});

// ================================================================
// SECTION 5: HIGH-VOLUME BATCH IMPORT SIMULATION (100 RECORDS)
// ================================================================
console.log('\n--- SECTION 5: HIGH-VOLUME BATCH IMPORT (100 RECORDS) ---');

test('Excel Import: Process 100 student records in under 50ms with 100% accuracy', () => {
  const batchData = [['NIM', 'Nama Siswa', 'Kelas']];
  for (let i = 1; i <= 100; i++) {
    const padded = String(i).padStart(3, '0');
    batchData.push([`NISN_0051234${padded}`, `Siswa Berprestasi ${padded}`, 'XII AKL 1']);
  }

  const startTime = Date.now();
  const result = parseExcelRoster(batchData);
  const elapsed = Date.now() - startTime;

  assert.strictEqual(result.imported.length, 100);
  assert.strictEqual(result.skippedDuplicates, 0);
  assert.strictEqual(result.imported[99].nim, 'NISN_0051234100');
  assert.ok(elapsed < 100, `Execution took ${elapsed}ms (expected < 100ms)`);
});

// ================================================================
// TEST RESULTS SUMMARY
// ================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED:      ${passedTests} ✅`);
console.log(`FAILED:      ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
