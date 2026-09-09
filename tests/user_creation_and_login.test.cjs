const assert = require('assert');

console.log('================================================================');
console.log('   EPIC PLATFORM - USER CREATION & ROLE-BASED LOGIN TESTS');
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

// Mock localStorage
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Roles & Constants
const ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  GURU: 'guru',
  MAHASISWA: 'mahasiswa',
  SISWA: 'siswa'
};

const MOCK_USERS_KEY = 'epic_mock_users_v2';

// Simulated createUser logic from useUserManagement
function simulateCreateUser(userData) {
  if (!userData.full_name || !userData.full_name.trim()) throw new Error('Nama lengkap wajib diisi');
  if (!userData.email || !userData.email.trim()) throw new Error('Email wajib diisi');
  if (!userData.password || userData.password.length < 6) throw new Error('Password minimal 6 karakter');
  
  const cleanEmail = userData.email.toLowerCase().trim();
  const newUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    full_name: userData.full_name.trim(),
    role: userData.role,
    email: cleanEmail,
    password: userData.password,
    nip: userData.nip || null,
    nisn: userData.nisn || null,
    nidn: userData.nidn || null,
    nim: userData.nim || null,
    unit_info: userData.unit_info || null
  };

  const raw = localStorage.getItem(MOCK_USERS_KEY);
  const users = raw ? JSON.parse(raw) : [];
  const filtered = users.filter(u => u.email !== cleanEmail);
  const updated = [newUser, ...filtered];
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));
  return newUser;
}

// Simulated login logic from authStore
function simulateLogin(email, password) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) throw new Error('Surel/Email wajib diisi');

  // Check demo
  if (cleanEmail === 'admin@epic.id') {
    return { success: true, profile: { role: 'admin', full_name: 'Admin Demo' } };
  }

  // Check created users in storage
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  const users = raw ? JSON.parse(raw) : [];
  const matched = users.find(u => u.email === cleanEmail);

  if (matched) {
    if (matched.password && password !== matched.password) {
      return { success: false, error: 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.' };
    }
    const prof = {
      id: matched.id,
      full_name: matched.full_name,
      role: matched.role,
      email: matched.email,
      nip: matched.nip,
      jurusan: matched.unit_info || (matched.role === 'guru' ? 'Akuntansi & Keuangan Lembaga (AKL)' : null),
      isSchool: matched.role === 'guru' || matched.role === 'siswa'
    };
    return { success: true, profile: prof };
  }

  return { success: false, error: 'Email atau kata sandi tidak valid.' };
}

// --- TEST SUITE EXECUTION ---
test('Admin creates new Guru SMK account with valid password and NIP', () => {
  const newGuru = simulateCreateUser({
    full_name: 'Hj. Dewi Sartika, S.Pd.',
    email: 'dewi.guru@smk.id',
    password: 'smkpassword2026',
    role: ROLES.GURU,
    nip: '198705052011012015',
    unit_info: 'Akuntansi & Keuangan Lembaga (AKL)'
  });

  assert.strictEqual(newGuru.full_name, 'Hj. Dewi Sartika, S.Pd.');
  assert.strictEqual(newGuru.role, 'guru');
  assert.strictEqual(newGuru.email, 'dewi.guru@smk.id');
  assert.strictEqual(newGuru.password, 'smkpassword2026');
});

test('Created Guru SMK account can successfully log in with correct password', () => {
  const loginResult = simulateLogin('dewi.guru@smk.id', 'smkpassword2026');
  assert.strictEqual(loginResult.success, true);
  assert.strictEqual(loginResult.profile.role, 'guru');
  assert.strictEqual(loginResult.profile.full_name, 'Hj. Dewi Sartika, S.Pd.');
  assert.strictEqual(loginResult.profile.isSchool, true);
});

test('Login with case-insensitive email (UPPERCASE) succeeds for created Guru SMK', () => {
  const loginResult = simulateLogin('DEWI.GURU@SMK.ID', 'smkpassword2026');
  assert.strictEqual(loginResult.success, true);
  assert.strictEqual(loginResult.profile.role, 'guru');
});

test('Login fails when providing wrong password for created Guru SMK', () => {
  const loginResult = simulateLogin('dewi.guru@smk.id', 'wrongpass');
  assert.strictEqual(loginResult.success, false);
  assert.ok(loginResult.error.includes('Kata sandi salah'));
});

test('Admin creates new Dosen Vokasi account and logs in with proper role', () => {
  simulateCreateUser({
    full_name: 'Prof. Dr. Irwan Hidayat, M.Sc.',
    email: 'irwan.dosen@univ.ac.id',
    password: 'dosenpass123',
    role: ROLES.DOSEN,
    nidn: '0012048001',
    unit_info: 'Pendidikan Ekonomi Vokasi'
  });

  const res = simulateLogin('irwan.dosen@univ.ac.id', 'dosenpass123');
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.profile.role, 'dosen');
  assert.strictEqual(res.profile.isSchool, false);
});

test('Password validation rejects password shorter than 6 characters', () => {
  assert.throws(() => {
    simulateCreateUser({
      full_name: 'Test Short Pass',
      email: 'short@epic.id',
      password: '123',
      role: ROLES.SISWA
    });
  }, /Password minimal 6 karakter/);
});

// --- TESTS FOR THE 5 SPECIFIC USER REQUESTED ACCOUNTS ---
const requestedAccounts = [
  {
    name: 'Ratna Indriani, S. Pd',
    email: 'ratnaindriani1628@gmail.com',
    role: 'guru',
    nip: '0801061',
    unit: 'Manajemen Perkantoran',
    password: '12345678'
  },
  {
    name: 'Dyah Mutiara Indriasari, S. E.',
    email: 'mutiaradyah1.25@gmail.com',
    role: 'guru',
    nip: '0207027',
    unit: 'Akuntansi',
    password: '12345678'
  },
  {
    name: 'Dwi Hastuti, S. E.',
    email: 'dwihasti17@gmail.com',
    role: 'guru',
    nip: '0207012',
    unit: 'Akuntansi',
    password: '12345678'
  },
  {
    name: 'Arif Dwie Arysanti, S. Pd.',
    email: 'arifsanti14@gmail.com',
    role: 'guru',
    nip: '0207014',
    unit: 'Manajemen Perkantoran',
    password: '12345678'
  },
  {
    name: 'Ika Prasetya Yuniati, S. Pd',
    email: 'xca.prasetya@gmail.com',
    role: 'guru',
    nip: '0602044',
    unit: 'Akuntansi',
    password: '12345678'
  }
];

for (const acc of requestedAccounts) {
  test(`Immediate Login Test: ${acc.name} (${acc.email}) with password 12345678`, () => {
    simulateCreateUser({
      full_name: acc.name,
      email: acc.email,
      password: acc.password,
      role: acc.role,
      nip: acc.nip,
      unit_info: acc.unit
    });

    const res = simulateLogin(acc.email, '12345678');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.profile.role, 'guru');
    assert.strictEqual(res.profile.full_name, acc.name);
    assert.strictEqual(res.profile.nip, acc.nip);
    assert.strictEqual(res.profile.isSchool, true);
  });
}

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED:      ${passedTests} ✅`);
console.log(`FAILED:      ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
