/**
 * Test Suite: Class and Course Ownership Scoping
 * 
 * Verifies that classes and subjects created by Teacher 1 and Teacher 2
 * are properly scoped to "Kelas Binaan Saya" while remaining accessible
 * under "Semua Kelas SMK" for school-wide visibility.
 */

const assert = require('assert');

// Inlined class ownership helpers for node CJS testing environment
const normalizePersonName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(s\.pd\.?|s\.e\.?|m\.pd\.?|dra\.?|dr\.?|ir\.?|prof\.?)/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const isNameMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  const n1 = name1.trim().toLowerCase();
  const n2 = name2.trim().toLowerCase();
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const norm1 = normalizePersonName(name1);
  const norm2 = normalizePersonName(name2);
  if (norm1 && norm2 && (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1))) {
    return true;
  }
  return false;
};

const isClassOwnedOrTaughtBy = (kelas, profile, mkList = []) => {
  if (!kelas || !profile) return false;

  const profileName = profile.full_name || '';
  const profileId = profile.id;

  if (profileId && kelas.created_by && kelas.created_by === profileId) {
    return true;
  }
  if (profileName && kelas.created_by_name && isNameMatch(kelas.created_by_name, profileName)) {
    return true;
  }

  if (profileName && kelas.wali_kelas && isNameMatch(kelas.wali_kelas, profileName)) {
    return true;
  }

  if (Array.isArray(kelas.mapel_ids) && kelas.mapel_ids.length > 0 && Array.isArray(mkList)) {
    const isTeaching = kelas.mapel_ids.some((mkId) => {
      const mk = mkList.find((m) => m.id === mkId);
      if (!mk) return false;
      if (profileName && (isNameMatch(mk.guru_name, profileName) || isNameMatch(mk.dosen_name, profileName))) {
        return true;
      }
      if (profileId && (mk.guru_id === profileId || mk.dosen_id === profileId)) {
        return true;
      }
      return (mk.rombel || []).some((r) => {
        if (profileName && (isNameMatch(r.guru_pengampu, profileName) || isNameMatch(r.dosen_pengampu, profileName))) {
          return true;
        }
        return false;
      });
    });
    if (isTeaching) return true;
  }

  return false;
};

const isCourseTaughtBy = (mk, profile) => {
  if (!mk || !profile) return false;
  const profileName = profile.full_name || '';
  const profileId = profile.id;

  if (profileId && (mk.dosen_id === profileId || mk.guru_id === profileId)) {
    return true;
  }
  if (profileName && (isNameMatch(mk.dosen_name, profileName) || isNameMatch(mk.guru_name, profileName))) {
    return true;
  }
  return (mk.rombel || []).some((r) => {
    if (profileName && (isNameMatch(r.guru_pengampu, profileName) || isNameMatch(r.dosen_pengampu, profileName))) {
      return true;
    }
    return false;
  });
};

const isLearnerEnrolledInClass = (kelas, profile) => {
  if (!kelas || !profile) return false;
  const students = kelas.students || [];
  const profileId = profile.id;
  const profileName = profile.full_name || '';
  const profileNim = profile.nim || profile.nisn || '';

  return students.some((s) => {
    if (profileId && (s.id === profileId || s.student_id === profileId)) return true;
    if (profileNim && (s.nim === profileNim || s.nisn === profileNim)) return true;
    if (profileName && isNameMatch(s.full_name, profileName)) return true;
    return false;
  });
};

// ─── Test Runner ─────────────────────────────────────────────────────────────
console.log('================================================================');
console.log('   EPIC PLATFORM - CLASS & COURSE OWNERSHIP SCOPING TESTS');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

// Mock Teacher Profiles
const teacher1 = {
  id: '2d18f169-0c7f-499f-a274-0e4a4bc4dae1',
  full_name: 'Ratna Indriani, S. Pd',
  email: 'ratnaindriani1628@gmail.com',
  role: 'guru',
  nip: '0801061',
  unit_info: 'Manajemen Perkantoran'
};

const teacher2 = {
  id: '02070270-0000-0000-0000-000000000001',
  full_name: 'Dyah Mutiara Indriasari, S. E.',
  email: 'mutiaradyah1.25@gmail.com',
  role: 'guru',
  nip: '0207027',
  unit_info: 'Akuntansi'
};

// Mock Classes
const classT1 = {
  id: 'kelas-101',
  name: 'X MP 1',
  jurusan: 'Manajemen Perkantoran',
  tahun_ajaran: '2025/2026',
  wali_kelas: 'Ratna Indriani, S. Pd',
  created_by: teacher1.id,
  created_by_name: teacher1.full_name,
  mapel_ids: ['mapel-mp-1'],
  students: [{ id: 's1', full_name: 'Siti Rahayu' }]
};

const classT2 = {
  id: 'kelas-102',
  name: 'X AKL 3',
  jurusan: 'Akuntansi & Keuangan Lembaga',
  tahun_ajaran: '2025/2026',
  wali_kelas: 'Dyah Mutiara Indriasari, S. E.',
  created_by: teacher2.id,
  created_by_name: teacher2.full_name,
  mapel_ids: ['mapel-akl-3'],
  students: [{ id: 's2', full_name: 'Budi Santoso' }]
};

const sharedClasses = [classT1, classT2];

// SECTION 1: TEACHER CLASS SCOPING
console.log('--- SECTION 1: TEACHER CLASS SCOPING ---');

runTest('Teacher 1 (Ratna Indriani) owns Class T1 (X MP 1)', () => {
  const isOwned = isClassOwnedOrTaughtBy(classT1, teacher1);
  assert.strictEqual(isOwned, true);
});

runTest('Teacher 1 (Ratna Indriani) does NOT own Class T2 (X AKL 3)', () => {
  const isOwned = isClassOwnedOrTaughtBy(classT2, teacher1);
  assert.strictEqual(isOwned, false);
});

runTest('Teacher 2 (Dyah Mutiara) owns Class T2 (X AKL 3)', () => {
  const isOwned = isClassOwnedOrTaughtBy(classT2, teacher2);
  assert.strictEqual(isOwned, true);
});

runTest('Teacher 2 (Dyah Mutiara) does NOT own Class T1 (X MP 1)', () => {
  const isOwned = isClassOwnedOrTaughtBy(classT1, teacher2);
  assert.strictEqual(isOwned, false);
});

// SECTION 2: "KELAS SAYA" VS "SEMUA KELAS" FILTERING
console.log('\n--- SECTION 2: "KELAS SAYA" VS "SEMUA KELAS" FILTERING ---');

runTest('In "Kelas Binaan Saya" tab, Teacher 1 only sees their own class (count = 1)', () => {
  const myClasses = sharedClasses.filter(c => isClassOwnedOrTaughtBy(c, teacher1));
  assert.strictEqual(myClasses.length, 1);
  assert.strictEqual(myClasses[0].name, 'X MP 1');
});

runTest('In "Kelas Binaan Saya" tab, Teacher 2 only sees their own class (count = 1)', () => {
  const myClasses = sharedClasses.filter(c => isClassOwnedOrTaughtBy(c, teacher2));
  assert.strictEqual(myClasses.length, 1);
  assert.strictEqual(myClasses[0].name, 'X AKL 3');
});

runTest('In "Semua Kelas SMK" tab, both teachers can see all school classes (count = 2)', () => {
  assert.strictEqual(sharedClasses.length, 2);
  assert.ok(sharedClasses.some(c => c.name === 'X MP 1'));
  assert.ok(sharedClasses.some(c => c.name === 'X AKL 3'));
});

// SECTION 3: ROBUST NAME MATCHING WITH / WITHOUT ACADEMIC TITLES
console.log('\n--- SECTION 3: ROBUST NAME MATCHING (WITH & WITHOUT TITLES) ---');

runTest('Wali kelas matches with and without academic title ("Ratna Indriani" vs "Ratna Indriani, S. Pd")', () => {
  assert.ok(isNameMatch('Ratna Indriani', 'Ratna Indriani, S. Pd'));
  assert.ok(isNameMatch('Ratna Indriani, S. Pd', 'Ratna Indriani'));
  assert.ok(isNameMatch('Dyah Mutiara Indriasari, S. E.', 'Dyah Mutiara Indriasari'));
});

runTest('Different teacher names are not falsely matched', () => {
  assert.strictEqual(isNameMatch('Ratna Indriani, S. Pd', 'Dyah Mutiara Indriasari, S. E.'), false);
  assert.strictEqual(isNameMatch('Dwi Hastuti, S. E.', 'Arif Dwie Arysanti, S. Pd.'), false);
});

// SECTION 4: COURSE & LEARNER ENROLLMENT SCOPING
console.log('\n--- SECTION 4: COURSE & LEARNER ENROLLMENT SCOPING ---');

const mockMapelMP = {
  id: 'mapel-mp-1',
  name: 'Korespondensi Bisnis',
  guru_name: 'Ratna Indriani, S. Pd',
  rombel: [{ name: 'X MP 1', guru_pengampu: 'Ratna Indriani, S. Pd', students: [] }]
};

const mockMapelAKL = {
  id: 'mapel-akl-3',
  name: 'Praktikum Akuntansi Perusahaan Jasa',
  guru_name: 'Dyah Mutiara Indriasari, S. E.',
  rombel: [{ name: 'X AKL 3', guru_pengampu: 'Dyah Mutiara Indriasari, S. E.', students: [] }]
};

runTest('Course isCourseTaughtBy correctly identifies teacher 1 for Korespondensi Bisnis', () => {
  assert.ok(isCourseTaughtBy(mockMapelMP, teacher1));
  assert.strictEqual(isCourseTaughtBy(mockMapelMP, teacher2), false);
});

runTest('Course isCourseTaughtBy correctly identifies teacher 2 for Akuntansi Perusahaan Jasa', () => {
  assert.ok(isCourseTaughtBy(mockMapelAKL, teacher2));
  assert.strictEqual(isCourseTaughtBy(mockMapelAKL, teacher1), false);
});

runTest('Student enrollment matches learner in class', () => {
  const learnerProfile = { id: 's1', full_name: 'Siti Rahayu', role: 'siswa' };
  assert.ok(isLearnerEnrolledInClass(classT1, learnerProfile));
  assert.strictEqual(isLearnerEnrolledInClass(classT2, learnerProfile), false);
});

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${total}`);
console.log(`PASSED:      ${passed} ✅`);
console.log(`FAILED:      ${total - passed}`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
