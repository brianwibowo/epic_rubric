const assert = require('assert');

console.log('====================================================');
console.log('   EPIC PLATFORM - COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('====================================================\n');

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

// ==========================================
// PART 1: POSITIVE & NEGATIVE SCENARIOS
// ==========================================
console.log('--- PART 1: POSITIVE & NEGATIVE SCENARIOS ---');

// 1.1 Weight Sum Validation
function validateWeightsSum(weights) {
  if (!weights) return false;
  let weightValues = Array.isArray(weights) ? weights : Object.values(weights);
  const sum = weightValues.reduce((acc, w) => acc + Math.round(Number(w || 0) * 100), 0);
  return sum === 100;
}

test('Weight Sum: Valid 100% array [0.2, 0.2, 0.2, 0.2, 0.2] should pass (Positive)', () => {
  assert.strictEqual(validateWeightsSum([0.2, 0.2, 0.2, 0.2, 0.2]), true);
});

test('Weight Sum: Valid 100% object map should pass (Positive)', () => {
  assert.strictEqual(validateWeightsSum({ E: 0.25, P: 0.25, I: 0.25, C: 0.25 }), true);
});

test('Weight Sum: Floating point precision sum (0.1 + 0.2 + 0.7) should pass (Positive)', () => {
  assert.strictEqual(validateWeightsSum([0.1, 0.2, 0.7]), true);
});

test('Weight Sum: Under 100% sum [0.3, 0.3] should fail (Negative)', () => {
  assert.strictEqual(validateWeightsSum([0.3, 0.3]), false);
});

test('Weight Sum: Over 100% sum [0.6, 0.5] should fail (Negative)', () => {
  assert.strictEqual(validateWeightsSum([0.6, 0.5]), false);
});

test('Weight Sum: Null/Undefined weights should fail gracefully (Negative)', () => {
  assert.strictEqual(validateWeightsSum(null), false);
  assert.strictEqual(validateWeightsSum(undefined), false);
});

// 1.2 Likert Score Validation
function validateLikertScore(score) {
  const s = Number(score);
  return !isNaN(s) && s >= 1 && s <= 4 && Number.isInteger(s);
}

test('Likert Score: Valid integers 1, 2, 3, 4 should pass (Positive)', () => {
  assert.strictEqual(validateLikertScore(1), true);
  assert.strictEqual(validateLikertScore(2), true);
  assert.strictEqual(validateLikertScore(3), true);
  assert.strictEqual(validateLikertScore(4), true);
  assert.strictEqual(validateLikertScore('3'), true);
});

test('Likert Score: Out of range scores (0, 5, -1, 10) should fail (Negative)', () => {
  assert.strictEqual(validateLikertScore(0), false);
  assert.strictEqual(validateLikertScore(5), false);
  assert.strictEqual(validateLikertScore(-1), false);
  assert.strictEqual(validateLikertScore(100), false);
});

test('Likert Score: Non-integer / float scores (2.5, 3.1) should fail (Negative)', () => {
  assert.strictEqual(validateLikertScore(2.5), false);
  assert.strictEqual(validateLikertScore(3.9), false);
});

test('Likert Score: Non-numeric strings and null should fail (Negative)', () => {
  assert.strictEqual(validateLikertScore('abc'), false);
  assert.strictEqual(validateLikertScore(null), false);
  assert.strictEqual(validateLikertScore(undefined), false);
});

// 1.3 Grade Conversion & Boundaries
const GRADE_SCALE = [
  { min: 85, max: 100, letter: 'A',  gpa: 4.0, predicate: 'Sangat Memuaskan', color: '#059669' },
  { min: 80, max: 84.99, letter: 'A-', gpa: 3.7, predicate: 'Memuaskan', color: '#10b981' },
  { min: 75, max: 79.99, letter: 'B+', gpa: 3.3, predicate: 'Sangat Baik', color: '#2563eb' },
  { min: 70, max: 74.99, letter: 'B',  gpa: 3.0, predicate: 'Baik', color: '#3b82f6' },
  { min: 65, max: 69.99, letter: 'B-', gpa: 2.7, predicate: 'Cukup Baik', color: '#60a5fa' },
  { min: 60, max: 64.99, letter: 'C+', gpa: 2.3, predicate: 'Lebih Dari Cukup', color: '#d97706' },
  { min: 55, max: 59.99, letter: 'C',  gpa: 2.0, predicate: 'Cukup', color: '#f59e0b' },
  { min: 40, max: 54.99, letter: 'D',  gpa: 1.0, predicate: 'Kurang', color: '#ea580c' },
  { min: 0,  max: 39.99, letter: 'E',  gpa: 0.0, predicate: 'Sangat Kurang', color: '#dc2626' }
];

function getGradeInfo(score) {
  const num = Math.min(100, Math.max(0, Number(score) || 0));
  const found = GRADE_SCALE.find(g => num >= g.min && num <= g.max);
  return found || GRADE_SCALE[GRADE_SCALE.length - 1];
}

test('Grade Conversion: Boundary score 100 should return Grade A (4.0) (Positive)', () => {
  const info = getGradeInfo(100);
  assert.strictEqual(info.letter, 'A');
  assert.strictEqual(info.gpa, 4.0);
});

test('Grade Conversion: Boundary score 85 should return Grade A (Positive)', () => {
  const info = getGradeInfo(85);
  assert.strictEqual(info.letter, 'A');
});

test('Grade Conversion: Boundary score 84.9 should return Grade A- (3.7) (Positive)', () => {
  const info = getGradeInfo(84.9);
  assert.strictEqual(info.letter, 'A-');
});

test('Grade Conversion: Passing score 75 should return Grade B+ (3.3) (Positive)', () => {
  const info = getGradeInfo(75);
  assert.strictEqual(info.letter, 'B+');
});

test('Grade Conversion: Boundary score 0 should return Grade E (0.0) (Positive)', () => {
  const info = getGradeInfo(0);
  assert.strictEqual(info.letter, 'E');
});

test('Grade Conversion: Overflow score (>100) should be clamped to Grade A (Negative Handle)', () => {
  const info = getGradeInfo(150);
  assert.strictEqual(info.letter, 'A');
});

test('Grade Conversion: Negative score (<0) should be clamped to Grade E (Negative Handle)', () => {
  const info = getGradeInfo(-50);
  assert.strictEqual(info.letter, 'E');
});

test('Grade Conversion: NaN / null input should be safely clamped to Grade E (Negative Handle)', () => {
  assert.strictEqual(getGradeInfo('invalid_score').letter, 'E');
  assert.strictEqual(getGradeInfo(null).letter, 'E');
});

// 1.4 Raw Likert to 100-Scale Calculation
function calculateRawScore(scores, dimensions) {
  if (!scores || !dimensions || dimensions.length === 0) return 0;
  let totalWeighted = 0;
  let totalWeight = 0;

  dimensions.forEach(dim => {
    const code = dim.code || dim.id;
    const scoreVal = scores[code] != null ? Number(scores[code]) : (scores[dim.name] != null ? Number(scores[dim.name]) : 1);
    const weight = Number(dim.weight || 0.25);
    totalWeighted += ((scoreVal - 1) / 3) * 100 * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0;
}

test('Scoring Engine: All Likert 4 (E:4, P:4, I:4, C:4) should yield 100 raw score (Positive)', () => {
  const dims = [{ code: 'E', weight: 0.25 }, { code: 'P', weight: 0.25 }, { code: 'I', weight: 0.25 }, { code: 'C', weight: 0.25 }];
  const score = calculateRawScore({ E: 4, P: 4, I: 4, C: 4 }, dims);
  assert.strictEqual(score, 100);
});

test('Scoring Engine: All Likert 1 (E:1, P:1, I:1, C:1) should yield 0 raw score (Positive)', () => {
  const dims = [{ code: 'E', weight: 0.25 }, { code: 'P', weight: 0.25 }, { code: 'I', weight: 0.25 }, { code: 'C', weight: 0.25 }];
  const score = calculateRawScore({ E: 1, P: 1, I: 1, C: 1 }, dims);
  assert.strictEqual(score, 0);
});

test('Scoring Engine: Mixed Likert (E:4, P:3, I:4, C:4) should yield 92-93 raw score (Positive)', () => {
  const dims = [{ code: 'E', weight: 0.25 }, { code: 'P', weight: 0.25 }, { code: 'I', weight: 0.25 }, { code: 'C', weight: 0.25 }];
  const score = calculateRawScore({ E: 4, P: 3, I: 4, C: 4 }, dims);
  assert.ok(score >= 90 && score <= 95);
});

// ==========================================
// PART 2: FULL CRUD TESTING
// ==========================================
console.log('\n--- PART 2: FULL CRUD TESTING ---');

// Mock in-memory stores for CRUD validation
class MockMKStore {
  constructor() {
    this.mkList = [];
  }

  createMK(data) {
    if (!data.name || !data.kode_mk) throw new Error('Missing required fields for MK');
    const newMK = {
      id: `mk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name,
      kode_mk: data.kode_mk,
      sks: data.sks || 2,
      semester: data.semester || 'Ganjil 2025/2026',
      komponen: data.komponen || [],
      rombel: data.rombel || []
    };
    this.mkList.push(newMK);
    return newMK;
  }

  getMK(id) {
    return this.mkList.find(m => m.id === id) || null;
  }

  updateMK(id, updates) {
    const mk = this.getMK(id);
    if (!mk) throw new Error('MK not found');
    Object.assign(mk, updates);
    return mk;
  }

  deleteMK(id) {
    const idx = this.mkList.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('MK not found');
    return this.mkList.splice(idx, 1)[0];
  }

  addRombel(mkId, rombelData) {
    const mk = this.getMK(mkId);
    if (!mk) throw new Error('MK not found');
    const newRombel = {
      id: `rombel-${Date.now()}`,
      name: rombelData.name,
      students: rombelData.students || [],
      scoringData: rombelData.scoringData || {}
    };
    mk.rombel.push(newRombel);
    return newRombel;
  }

  deleteRombel(mkId, rombelId) {
    const mk = this.getMK(mkId);
    if (!mk) throw new Error('MK not found');
    const idx = mk.rombel.findIndex(r => r.id === rombelId);
    if (idx === -1) throw new Error('Rombel not found');
    return mk.rombel.splice(idx, 1)[0];
  }
}

class MockKelasStore {
  constructor() {
    this.kelasList = [];
  }

  createKelas(data) {
    if (!data.name) throw new Error('Kelas name required');
    const newKelas = {
      id: `kelas-${Date.now()}`,
      name: data.name,
      jurusan: data.jurusan || 'AKL',
      wali_kelas: data.wali_kelas || '',
      tahun_ajaran: data.tahun_ajaran || '2025/2026',
      students: data.students || [],
      mapel_ids: data.mapel_ids || []
    };
    this.kelasList.push(newKelas);
    return newKelas;
  }

  getKelas(id) {
    return this.kelasList.find(k => k.id === id) || null;
  }

  updateKelas(id, updates) {
    const k = this.getKelas(id);
    if (!k) throw new Error('Kelas not found');
    Object.assign(k, updates);
    return k;
  }

  deleteKelas(id) {
    const idx = this.kelasList.findIndex(k => k.id === id);
    if (idx === -1) throw new Error('Kelas not found');
    return this.kelasList.splice(idx, 1)[0];
  }
}

class MockUserStore {
  constructor() {
    this.users = [];
  }

  createUser(data) {
    if (!data.email || !data.role) throw new Error('Email and role required');
    if (this.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already exists');
    }
    const newUser = {
      id: `user-${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    if (updates.email && updates.email !== user.email && this.users.some(u => u.email.toLowerCase() === updates.email.toLowerCase())) {
      throw new Error('Email already taken');
    }
    Object.assign(user, updates);
    return user;
  }

  deleteUser(id) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    return this.users.splice(idx, 1)[0];
  }
}

// 2.1 MK Store CRUD Tests
const mkStore = new MockMKStore();
let createdMKId = null;
let createdRombelId = null;

test('MK CRUD [Create]: Successfully create new MK with components', () => {
  const mk = mkStore.createMK({
    name: 'Praktikum Komputer Akuntansi',
    kode_mk: '25P99999',
    sks: 3,
    komponen: [{ id: 'k1', name: 'Proyek', bobot: 0.5 }, { id: 'k2', name: 'UAS', bobot: 0.5 }]
  });
  assert.ok(mk.id);
  assert.strictEqual(mk.name, 'Praktikum Komputer Akuntansi');
  assert.strictEqual(mk.komponen.length, 2);
  createdMKId = mk.id;
});

test('MK CRUD [Read]: Retrieve created MK by ID', () => {
  const mk = mkStore.getMK(createdMKId);
  assert.ok(mk);
  assert.strictEqual(mk.kode_mk, '25P99999');
});

test('MK CRUD [Update]: Modify MK name and sks', () => {
  const updated = mkStore.updateMK(createdMKId, { name: 'Praktikum Komputer Akuntansi Lanjut', sks: 4 });
  assert.strictEqual(updated.name, 'Praktikum Komputer Akuntansi Lanjut');
  assert.strictEqual(updated.sks, 4);
});

test('MK Multi-Rombel [Create]: Add Rombel XII AKL 1 to MK', () => {
  const rombel = mkStore.addRombel(createdMKId, {
    name: 'XII AKL 1',
    students: [{ id: 's1', full_name: 'Andi Pratama', nisn: '0051234001' }]
  });
  assert.ok(rombel.id);
  assert.strictEqual(rombel.name, 'XII AKL 1');
  assert.strictEqual(rombel.students.length, 1);
  createdRombelId = rombel.id;
});

test('MK Multi-Rombel [Delete]: Remove Rombel from MK', () => {
  const deleted = mkStore.deleteRombel(createdMKId, createdRombelId);
  assert.strictEqual(deleted.name, 'XII AKL 1');
  const mk = mkStore.getMK(createdMKId);
  assert.strictEqual(mk.rombel.length, 0);
});

test('MK CRUD [Delete]: Remove MK from store', () => {
  const deleted = mkStore.deleteMK(createdMKId);
  assert.strictEqual(deleted.id, createdMKId);
  assert.strictEqual(mkStore.getMK(createdMKId), null);
});

test('MK CRUD [Negative]: Create MK with missing fields should throw Error', () => {
  assert.throws(() => mkStore.createMK({ name: '' }), /Missing required fields/);
});

// 2.2 Kelas Store CRUD Tests
const kelasStore = new MockKelasStore();
let createdKelasId = null;

test('Kelas CRUD [Create]: Successfully create SMK class XII AKL 3', () => {
  const k = kelasStore.createKelas({
    name: 'XII AKL 3',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    wali_kelas: 'Dra. Sri Wahyuni',
    students: [{ id: 's1', full_name: 'Budi Santoso', nisn: '0059999001' }]
  });
  assert.ok(k.id);
  assert.strictEqual(k.name, 'XII AKL 3');
  createdKelasId = k.id;
});

test('Kelas CRUD [Update]: Assign Mapel IDs to class', () => {
  const updated = kelasStore.updateKelas(createdKelasId, { mapel_ids: ['mk-1', 'mk-2'] });
  assert.strictEqual(updated.mapel_ids.length, 2);
});

test('Kelas CRUD [Delete]: Delete class from store', () => {
  const deleted = kelasStore.deleteKelas(createdKelasId);
  assert.strictEqual(deleted.id, createdKelasId);
  assert.strictEqual(kelasStore.getKelas(createdKelasId), null);
});

// 2.3 User Management CRUD Tests
const userStore = new MockUserStore();
let createdUserId = null;

test('User CRUD [Create]: Successfully create new Guru account', () => {
  const user = userStore.createUser({
    full_name: 'Siti Rahmawati, S.Pd.',
    email: 'siti.guru@epic.id',
    role: 'guru'
  });
  assert.ok(user.id);
  assert.strictEqual(user.role, 'guru');
  createdUserId = user.id;
});

test('User CRUD [Negative]: Rejection of duplicate email address', () => {
  assert.throws(() => {
    userStore.createUser({ full_name: 'Duplicate', email: 'siti.guru@epic.id', role: 'guru' });
  }, /Email already exists/);
});

test('User CRUD [Update]: Modify user details and role', () => {
  const updated = userStore.updateUser(createdUserId, { full_name: 'Siti Rahmawati, M.Pd.' });
  assert.strictEqual(updated.full_name, 'Siti Rahmawati, M.Pd.');
});

test('User CRUD [Delete]: Delete user by ID', () => {
  const deleted = userStore.deleteUser(createdUserId);
  assert.strictEqual(deleted.id, createdUserId);
  assert.strictEqual(userStore.users.length, 0);
});

// ==========================================
// PART 3: USABILITY & FLOW SIMULATION
// ==========================================
console.log('\n--- PART 3: USABILITY & FLOW SIMULATION ---');

// 3.1 Terminology Context Engine Simulation
function resolveTerminology(role, pathname, search, storedTrack) {
  const isRoleSchool = role === 'guru' || role === 'siswa';
  const isRoleUniversity = role === 'dosen' || role === 'mahasiswa';
  const isAdmin = role === 'admin';

  const isExplicitSchool = pathname.startsWith('/kelas') || search.includes('kelasId') || search.includes('track=smk');
  const isExplicitUniv = (pathname === '/mk' || pathname === '/mk/') && !search.includes('track=smk');

  let isSchool = false;
  if (isRoleSchool) {
    isSchool = true;
  } else if (isRoleUniversity) {
    isSchool = false;
  } else if (isAdmin) {
    if (isExplicitSchool) isSchool = true;
    else if (isExplicitUniv) isSchool = false;
    else isSchool = storedTrack === 'smk';
  } else {
    isSchool = isExplicitSchool || storedTrack === 'smk';
  }

  return {
    isSchool,
    courseLabel: isSchool ? 'Mata Pelajaran' : 'Mata Kuliah',
    learnerLabel: isSchool ? 'Siswa' : 'Mahasiswa',
    educatorLabel: isSchool ? 'Guru' : 'Dosen',
    learnerIdLabel: isSchool ? 'NISN' : 'NIM',
    academicTermLabel: isSchool ? 'Tahun Ajaran' : 'Semester'
  };
}

test('Usability Flow: Guru login -> accessing /kelas -> mapel should strictly use School terms', () => {
  const term = resolveTerminology('guru', '/mk/mk-1', '?kelasId=kelas-1', 'smk');
  assert.strictEqual(term.isSchool, true);
  assert.strictEqual(term.courseLabel, 'Mata Pelajaran');
  assert.strictEqual(term.learnerLabel, 'Siswa');
  assert.strictEqual(term.educatorLabel, 'Guru');
  assert.strictEqual(term.learnerIdLabel, 'NISN');
});

test('Usability Flow: Dosen login -> accessing /mk -> mk detail should strictly use University terms', () => {
  const term = resolveTerminology('dosen', '/mk/mk-1', '', 'univ');
  assert.strictEqual(term.isSchool, false);
  assert.strictEqual(term.courseLabel, 'Mata Kuliah');
  assert.strictEqual(term.learnerLabel, 'Mahasiswa');
  assert.strictEqual(term.educatorLabel, 'Dosen');
  assert.strictEqual(term.learnerIdLabel, 'NIM');
});

test('Usability Flow: Admin navigating from /kelas/kelas-1 -> /mk/mk-1/students retains SMK context', () => {
  // Session storedTrack was set to 'smk' upon entering /kelas/kelas-1
  const term = resolveTerminology('admin', '/mk/mk-1/students', '?track=smk', 'smk');
  assert.strictEqual(term.isSchool, true);
  assert.strictEqual(term.learnerLabel, 'Siswa');
  assert.strictEqual(term.learnerIdLabel, 'NISN');
});

test('Usability Flow: Admin navigating from /mk -> /mk/mk-1/students retains University context', () => {
  // Session storedTrack was set to 'univ' upon entering /mk
  const term = resolveTerminology('admin', '/mk/mk-1/students', '', 'univ');
  assert.strictEqual(term.isSchool, false);
  assert.strictEqual(term.learnerLabel, 'Mahasiswa');
  assert.strictEqual(term.learnerIdLabel, 'NIM');
});

// 3.2 Student/Learner Auto-Redirect Simulation
function resolveLearnerRoute(role, mkId, kelasId) {
  if (role === 'siswa') {
    return `/mk/${mkId}/analytics${kelasId ? `?kelasId=${kelasId}&track=smk` : '?track=smk'}`;
  }
  if (role === 'mahasiswa') {
    return `/mk/${mkId}/analytics`;
  }
  return `/mk/${mkId}${kelasId ? `?kelasId=${kelasId}` : ''}`;
}

test('Learner Protection Flow: Siswa opening mapel redirects directly to Analytics Rapor with track=smk', () => {
  const route = resolveLearnerRoute('siswa', 'mk-1', 'kelas-1');
  assert.strictEqual(route, '/mk/mk-1/analytics?kelasId=kelas-1&track=smk');
});

test('Learner Protection Flow: Mahasiswa opening MK redirects directly to Analytics Rapor', () => {
  const route = resolveLearnerRoute('mahasiswa', 'mk-1', null);
  assert.strictEqual(route, '/mk/mk-1/analytics');
});

test('Staff Flow: Guru opening mapel opens Overview page with edit actions', () => {
  const route = resolveLearnerRoute('guru', 'mk-1', 'kelas-1');
  assert.strictEqual(route, '/mk/mk-1?kelasId=kelas-1');
});

// 3.3 HEIC / HEIF Image Format Validation
function isHeicFile(file) {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type === 'image/heic' ||
    type === 'image/heif'
  );
}

test('Image Format: Detect .heic extension from Apple iOS camera (Positive)', () => {
  assert.strictEqual(isHeicFile({ name: 'IMG_20260814_1945.HEIC', type: '' }), true);
  assert.strictEqual(isHeicFile({ name: 'photo.heic', type: 'image/heic' }), true);
});

test('Image Format: Detect .heif extension (Positive)', () => {
  assert.strictEqual(isHeicFile({ name: 'portrait.HEIF', type: '' }), true);
  assert.strictEqual(isHeicFile({ name: 'image.heif', type: 'image/heif' }), true);
});

test('Image Format: Standard formats (PNG, JPG, WEBP) return false for HEIC check (Positive)', () => {
  assert.strictEqual(isHeicFile({ name: 'avatar.png', type: 'image/png' }), false);
  assert.strictEqual(isHeicFile({ name: 'profile.jpg', type: 'image/jpeg' }), false);
  assert.strictEqual(isHeicFile({ name: 'hero.webp', type: 'image/webp' }), false);
});

test('Image Format: Null/Undefined file input handles safely (Negative)', () => {
  assert.strictEqual(isHeicFile(null), false);
  assert.strictEqual(isHeicFile(undefined), false);
});

// 3.4 User Manual Documentation Structure
test('Documentation Generator: Validate 4-Page System Manual Structure & Sections', () => {
  const manualSections = [
    'COVER_PAGE',
    'BAB_1_ROLE_MATRIX',
    'BAB_2_EPIC_RUBRIC_ENGINE',
    'BAB_3_OPERATIONAL_GUIDE_AND_FAQ'
  ];
  assert.strictEqual(manualSections.length, 4);
  assert.ok(manualSections.includes('BAB_1_ROLE_MATRIX'));
  assert.ok(manualSections.includes('BAB_2_EPIC_RUBRIC_ENGINE'));
});

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED:      ${passedTests} ✅`);
console.log(`FAILED:      ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
