/**
 * EPIC PLATFORM - MULTI-ROLE WORKFLOW & FORWARD/BACKWARD NAVIGATION TEST SUITE
 * Validates:
 * 1. 5-Role RBAC Route Access Matrix (Admin, Dosen, Guru, Mahasiswa, Siswa)
 * 2. Learner Protection & Guard Gate Auto-Redirects
 * 3. Browser History (Maju-Mundur / Back-Forward) Simulation & Idempotency
 * 4. Cross-Role State Isolation & Session Switching
 * 5. Track Context (SMK vs University) Breadcrumb Retention
 */

const assert = require('assert');

console.log('================================================================');
console.log('   EPIC PLATFORM - MULTI-ROLE & NAVIGATION FLOW TEST SUITE');
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
// MOCK DEFINITIONS & CONSTANTS
// ================================================================
const ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  GURU: 'guru',
  MAHASISWA: 'mahasiswa',
  SISWA: 'siswa'
};

const ALL_ROLES = [ROLES.ADMIN, ROLES.DOSEN, ROLES.GURU, ROLES.MAHASISWA, ROLES.SISWA];
const STAFF_ROLES = [ROLES.ADMIN, ROLES.DOSEN, ROLES.GURU];
const EDUCATOR_ROLES = [ROLES.DOSEN, ROLES.GURU];
const LEARNER_ROLES = [ROLES.MAHASISWA, ROLES.SISWA];

const PERMISSIONS = {
  [ROLES.ADMIN]: {
    manageMK: 'write',
    manageUsers: 'write',
    manageKomponen: 'write',
    configRubric: 'write',
    inputScore: 'write',
    analytics: 'read_all',
    comments: 'write',
    exportReport: true,
    auditLogs: true,
    notifications: true
  },
  [ROLES.DOSEN]: {
    manageMK: 'write_own',
    manageUsers: false,
    manageKomponen: 'write_own',
    configRubric: 'write',
    inputScore: 'write_own',
    analytics: 'read_own',
    comments: 'write',
    exportReport: true,
    auditLogs: false,
    notifications: true
  },
  [ROLES.GURU]: {
    manageMK: 'write_own',
    manageUsers: false,
    manageKomponen: 'write_own',
    configRubric: 'write',
    inputScore: 'write_own',
    analytics: 'read_own',
    comments: 'write',
    exportReport: true,
    auditLogs: false,
    notifications: true
  },
  [ROLES.MAHASISWA]: {
    manageMK: false,
    manageUsers: false,
    manageKomponen: false,
    configRubric: false,
    inputScore: false,
    analytics: 'read_personal',
    comments: 'write_own',
    exportReport: 'personal_pdf',
    auditLogs: false,
    notifications: true
  },
  [ROLES.SISWA]: {
    manageMK: false,
    manageUsers: false,
    manageKomponen: false,
    configRubric: false,
    inputScore: false,
    analytics: 'read_personal',
    comments: 'write_own',
    exportReport: 'personal_pdf',
    auditLogs: false,
    notifications: true
  }
};

function hasPermission(role, permission, level = 'read') {
  if (!role || !PERMISSIONS[role]) return false;
  const perm = PERMISSIONS[role][permission];
  if (!perm) return false;
  if (perm === true) return true;
  if (typeof perm === 'string') {
    if (perm.startsWith('write') && (level === 'read' || level === 'write')) return true;
    if (perm === level) return true;
    if (perm.startsWith('read') && level === 'read') return true;
  }
  return false;
}

// Router Route Resolver Simulation
function simulateRouteAccess(role, pathname, options = {}) {
  // Unauthenticated
  if (!role) {
    if (pathname === '/login') return { status: 200, component: 'LoginPage' };
    return { status: 302, redirect: '/login', state: { from: pathname } };
  }

  // Already logged in trying to access /login
  if (pathname === '/login') {
    return { status: 302, redirect: '/' };
  }

  // Protected Admin Routes
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/audit-log')) {
    if (role === ROLES.ADMIN) {
      return { status: 200, component: pathname.includes('users') ? 'UserManagementPage' : 'AuditLogPage' };
    }
    return { status: 302, redirect: '/' }; // Denied
  }

  // Staff Only Routes
  if (pathname === '/mk/create' || pathname === '/rubrik') {
    if (STAFF_ROLES.includes(role)) {
      return { status: 200, component: pathname.includes('create') ? 'CreateMKPage' : 'RubrikLibraryPage' };
    }
    return { status: 302, redirect: '/' };
  }

  // MK Context Routes
  if (pathname.startsWith('/mk/')) {
    const parts = pathname.split('/').filter(Boolean);
    const subRoute = parts[2] || 'overview';

    // Learner protection: Siswa/Mahasiswa accessing overview -> auto-redirect to analytics
    if (LEARNER_ROLES.includes(role) && (subRoute === 'overview' || subRoute === 'komponen' || subRoute === 'scoring')) {
      const trackParam = role === ROLES.SISWA ? '?track=smk' : '';
      return { status: 302, redirect: `/mk/${parts[1]}/analytics${trackParam}` };
    }

    if (subRoute === 'komponen' || subRoute === 'scoring' || subRoute === 'rombel') {
      if (!STAFF_ROLES.includes(role)) {
        return { status: 302, redirect: `/mk/${parts[1]}/analytics` };
      }
    }

    return { status: 200, component: `MK_${subRoute.toUpperCase()}` };
  }

  // Kelas Detail Routes
  if (pathname.startsWith('/kelas/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (role === ROLES.SISWA) {
      return { status: 302, redirect: `/mk/mapel-1/analytics?track=smk` };
    }
    return { status: 200, component: 'KelasDetailPage' };
  }

  // Global All-Roles Routes
  return { status: 200, component: 'GlobalPage' };
}

// Browser History Stack Simulation
class MockBrowserHistory {
  constructor() {
    this.stack = [];
    this.currentIndex = -1;
  }

  push(url) {
    // Truncate any forward history when pushing a new route
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(url);
    this.currentIndex = this.stack.length - 1;
  }

  back() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.stack[this.currentIndex];
    }
    return this.stack[this.currentIndex];
  }

  forward() {
    if (this.currentIndex < this.stack.length - 1) {
      this.currentIndex++;
      return this.stack[this.currentIndex];
    }
    return this.stack[this.currentIndex];
  }

  current() {
    return this.stack[this.currentIndex] || null;
  }
}

// Mock Scoring Store with Idempotency
class MockScoringStore {
  constructor() {
    this.scores = new Map(); // key: mkId_compId_stdId
  }

  submitScore(mkId, compId, stdId, scoreData, authorRole) {
    if (!STAFF_ROLES.includes(authorRole)) {
      throw new Error(`Unauthorized: Role '${authorRole}' cannot submit scores.`);
    }
    const key = `${mkId}_${compId}_${stdId}`;
    const entry = {
      mk_id: mkId,
      komponen_id: compId,
      student_id: stdId,
      ...scoreData,
      updated_at: new Date().toISOString()
    };
    this.scores.set(key, entry);
    return entry;
  }

  getScore(mkId, compId, stdId) {
    const key = `${mkId}_${compId}_${stdId}`;
    return this.scores.get(key) || null;
  }
}

// ================================================================
// SECTION 1: 5-ROLE RBAC ACCESS MATRIX TESTS
// ================================================================
console.log('--- SECTION 1: 5-ROLE RBAC ACCESS MATRIX ---');

test('RBAC: Admin has complete write permissions across all modules', () => {
  assert.strictEqual(hasPermission(ROLES.ADMIN, 'manageMK', 'write'), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN, 'manageUsers', 'write'), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN, 'auditLogs', 'read'), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN, 'inputScore', 'write'), true);
  assert.strictEqual(hasPermission(ROLES.ADMIN, 'configRubric', 'write'), true);
});

test('RBAC: Dosen Vokasi has own-course scoring permissions, but NO user management or audit logs', () => {
  assert.strictEqual(hasPermission(ROLES.DOSEN, 'manageMK', 'read'), true);
  assert.strictEqual(hasPermission(ROLES.DOSEN, 'inputScore', 'write'), true);
  assert.strictEqual(hasPermission(ROLES.DOSEN, 'manageUsers', 'read'), false);
  assert.strictEqual(hasPermission(ROLES.DOSEN, 'auditLogs', 'read'), false);
});

test('RBAC: Guru SMK has vocational course scoring permissions, but NO user management', () => {
  assert.strictEqual(hasPermission(ROLES.GURU, 'manageMK', 'read'), true);
  assert.strictEqual(hasPermission(ROLES.GURU, 'inputScore', 'write'), true);
  assert.strictEqual(hasPermission(ROLES.GURU, 'manageUsers', 'read'), false);
});

test('RBAC: Mahasiswa has read-only personal analytics, strictly NO scoring or config rubric', () => {
  assert.strictEqual(hasPermission(ROLES.MAHASISWA, 'analytics', 'read'), true);
  assert.strictEqual(hasPermission(ROLES.MAHASISWA, 'inputScore', 'write'), false);
  assert.strictEqual(hasPermission(ROLES.MAHASISWA, 'manageMK', 'write'), false);
  assert.strictEqual(hasPermission(ROLES.MAHASISWA, 'configRubric', 'write'), false);
});

test('RBAC: Siswa SMK has read-only personal analytics, strictly NO scoring or config rubric', () => {
  assert.strictEqual(hasPermission(ROLES.SISWA, 'analytics', 'read'), true);
  assert.strictEqual(hasPermission(ROLES.SISWA, 'inputScore', 'write'), false);
  assert.strictEqual(hasPermission(ROLES.SISWA, 'manageKomponen', 'write'), false);
  assert.strictEqual(hasPermission(ROLES.SISWA, 'manageUsers', 'write'), false);
});

// ================================================================
// SECTION 2: ROUTE ACCESS & REDIRECTION GUARD TESTS
// ================================================================
console.log('\n--- SECTION 2: ROUTE ACCESS & REDIRECTION GUARDS ---');

test('Route Guard: Admin can access /admin/users and /admin/audit-log', () => {
  const usersRes = simulateRouteAccess(ROLES.ADMIN, '/admin/users');
  const auditRes = simulateRouteAccess(ROLES.ADMIN, '/admin/audit-log');
  assert.strictEqual(usersRes.status, 200);
  assert.strictEqual(auditRes.status, 200);
});

test('Route Guard: Non-Admin (Dosen & Guru) blocked from /admin/users and redirected to /', () => {
  const dosenRes = simulateRouteAccess(ROLES.DOSEN, '/admin/users');
  const guruRes = simulateRouteAccess(ROLES.GURU, '/admin/audit-log');
  assert.strictEqual(dosenRes.status, 302);
  assert.strictEqual(dosenRes.redirect, '/');
  assert.strictEqual(guruRes.status, 302);
  assert.strictEqual(guruRes.redirect, '/');
});

test('Route Guard: Siswa accessing MK Overview or Scoring is auto-redirected to Analytics with SMK track', () => {
  const overRes = simulateRouteAccess(ROLES.SISWA, '/mk/mk-1');
  const scoreRes = simulateRouteAccess(ROLES.SISWA, '/mk/mk-1/scoring');
  assert.strictEqual(overRes.status, 302);
  assert.strictEqual(overRes.redirect, '/mk/mk-1/analytics?track=smk');
  assert.strictEqual(scoreRes.status, 302);
  assert.strictEqual(scoreRes.redirect, '/mk/mk-1/analytics?track=smk');
});

test('Route Guard: Mahasiswa accessing MK Overview or Scoring is auto-redirected to Analytics', () => {
  const overRes = simulateRouteAccess(ROLES.MAHASISWA, '/mk/mk-1');
  const scoreRes = simulateRouteAccess(ROLES.MAHASISWA, '/mk/mk-1/scoring');
  assert.strictEqual(overRes.status, 302);
  assert.strictEqual(overRes.redirect, '/mk/mk-1/analytics');
  assert.strictEqual(scoreRes.status, 302);
  assert.strictEqual(scoreRes.redirect, '/mk/mk-1/analytics');
});

test('Route Guard: Unauthenticated user accessing /mk/mk-1/students redirected to /login with state.from', () => {
  const anonRes = simulateRouteAccess(null, '/mk/mk-1/students');
  assert.strictEqual(anonRes.status, 302);
  assert.strictEqual(anonRes.redirect, '/login');
  assert.strictEqual(anonRes.state.from, '/mk/mk-1/students');
});

// ================================================================
// SECTION 3: BROWSER HISTORY (MAJU - MUNDUR / BACK - FORWARD)
// ================================================================
console.log('\n--- SECTION 3: BROWSER HISTORY (MAJU-MUNDUR) FLOW ---');

test('Maju-Mundur 1: Logged-in user pressing Back does not return to empty login form', () => {
  const history = new MockBrowserHistory();
  let currentUser = null;

  // Step 1: User visits /login
  history.push('/login');
  let nav = simulateRouteAccess(currentUser, history.current());
  assert.strictEqual(nav.status, 200);
  assert.strictEqual(nav.component, 'LoginPage');

  // Step 2: User logs in as Dosen
  currentUser = ROLES.DOSEN;
  history.push('/dashboard');
  nav = simulateRouteAccess(currentUser, history.current());
  assert.strictEqual(nav.status, 200);

  // Step 3: User hits Back button to /login
  const backUrl = history.back();
  assert.strictEqual(backUrl, '/login');
  
  // Guard intercepts: already logged in -> auto-redirect to /
  nav = simulateRouteAccess(currentUser, backUrl);
  assert.strictEqual(nav.status, 302);
  assert.strictEqual(nav.redirect, '/');

  // Step 4: User hits Forward button to /dashboard
  const forwardUrl = history.forward();
  assert.strictEqual(forwardUrl, '/dashboard');
  nav = simulateRouteAccess(currentUser, forwardUrl);
  assert.strictEqual(nav.status, 200);
});

test('Maju-Mundur 2: Scoring Submission Idempotency on Back/Forward', () => {
  const scoringStore = new MockScoringStore();
  const history = new MockBrowserHistory();
  const currentUser = ROLES.DOSEN;

  // Step 1: Open scoring page
  history.push('/mk/mk-1/scoring');
  
  // Step 2: Submit scores for Student 1
  const initialScore = scoringStore.submitScore('mk-1', 'comp-1', 'std-1', {
    e_score: 4, p_score: 4, i_score: 3, c_score: 4, raw_score: 92.5
  }, currentUser);
  assert.strictEqual(initialScore.raw_score, 92.5);

  // Step 3: Navigates to students list after save
  history.push('/mk/mk-1/students');
  assert.strictEqual(history.current(), '/mk/mk-1/students');

  // Step 4: Hits browser Back to /mk/mk-1/scoring
  const backUrl = history.back();
  assert.strictEqual(backUrl, '/mk/mk-1/scoring');
  
  // Existing score must be retrieved cleanly without creating duplicate rows
  const existingScore = scoringStore.getScore('mk-1', 'comp-1', 'std-1');
  assert.ok(existingScore);
  assert.strictEqual(existingScore.raw_score, 92.5);
  assert.strictEqual(scoringStore.scores.size, 1);

  // Step 5: Modifies score on Back and saves again
  const updatedScore = scoringStore.submitScore('mk-1', 'comp-1', 'std-1', {
    e_score: 4, p_score: 4, i_score: 4, c_score: 4, raw_score: 100
  }, currentUser);
  assert.strictEqual(updatedScore.raw_score, 100);
  assert.strictEqual(scoringStore.scores.size, 1); // Size stays 1 (idempotent update)

  // Step 6: Hits browser Forward to /mk/mk-1/students
  const forwardUrl = history.forward();
  assert.strictEqual(forwardUrl, '/mk/mk-1/students');
});

test('Maju-Mundur 3: Role-Switch History Traversal (Privilege Escalation Protection)', () => {
  const history = new MockBrowserHistory();

  // Step 1: Admin logs in and visits Admin Audit Log
  let currentUser = ROLES.ADMIN;
  history.push('/admin/audit-log');
  let nav = simulateRouteAccess(currentUser, history.current());
  assert.strictEqual(nav.status, 200);
  assert.strictEqual(nav.component, 'AuditLogPage');

  // Step 2: Admin visits scoring page
  history.push('/mk/mk-1/scoring');
  nav = simulateRouteAccess(currentUser, history.current());
  assert.strictEqual(nav.status, 200);

  // Step 3: Admin logs out
  currentUser = null;
  history.push('/login');

  // Step 4: Siswa logs in
  currentUser = ROLES.SISWA;
  history.push('/dashboard');

  // Step 5: Siswa hits browser Back button to Admin\'s previous /mk/mk-1/scoring URL
  const backScoringUrl = '/mk/mk-1/scoring';
  nav = simulateRouteAccess(currentUser, backScoringUrl);
  // Siswa must NOT access scoring -> intercepted and redirected to analytics!
  assert.strictEqual(nav.status, 302);
  assert.strictEqual(nav.redirect, '/mk/mk-1/analytics?track=smk');

  // Step 6: Siswa hits browser Back button to Admin\'s previous /admin/audit-log URL
  const backAuditUrl = '/admin/audit-log';
  nav = simulateRouteAccess(currentUser, backAuditUrl);
  // Siswa must NOT access audit log -> intercepted and redirected to /!
  assert.strictEqual(nav.status, 302);
  assert.strictEqual(nav.redirect, '/');
});

// ================================================================
// SECTION 4: TRACK CONTEXT & TERMINOLOGY ISOLATION
// ================================================================
console.log('\n--- SECTION 4: TRACK CONTEXT & TERMINOLOGY ISOLATION ---');

function resolveTerminology(trackOrRole) {
  const isSchool = trackOrRole === 'smk' || trackOrRole === ROLES.GURU || trackOrRole === ROLES.SISWA;
  return {
    courseLabel: isSchool ? 'Mata Pelajaran' : 'Mata Kuliah',
    coursePluralLabel: isSchool ? 'Mata Pelajaran' : 'Mata Kuliah',
    learnerLabel: isSchool ? 'Siswa' : 'Mahasiswa',
    learnerPluralLabel: isSchool ? 'Siswa' : 'Mahasiswa',
    educatorLabel: isSchool ? 'Guru' : 'Dosen',
    creditLabel: isSchool ? 'Jam Pelajaran' : 'SKS',
    groupLabel: isSchool ? 'Kelas' : 'Rombel'
  };
}

test('Terminology: SMK context strictly yields School terms', () => {
  const terms = resolveTerminology(ROLES.GURU);
  assert.strictEqual(terms.courseLabel, 'Mata Pelajaran');
  assert.strictEqual(terms.learnerLabel, 'Siswa');
  assert.strictEqual(terms.educatorLabel, 'Guru');
  assert.strictEqual(terms.creditLabel, 'Jam Pelajaran');
  assert.strictEqual(terms.groupLabel, 'Kelas');
});

test('Terminology: University context strictly yields University terms', () => {
  const terms = resolveTerminology(ROLES.DOSEN);
  assert.strictEqual(terms.courseLabel, 'Mata Kuliah');
  assert.strictEqual(terms.learnerLabel, 'Mahasiswa');
  assert.strictEqual(terms.educatorLabel, 'Dosen');
  assert.strictEqual(terms.creditLabel, 'SKS');
  assert.strictEqual(terms.groupLabel, 'Rombel');
});

test('Track Retention: Admin navigating via /kelas retains SMK track', () => {
  const path = '/kelas/kelas-1';
  const isFromKelas = path.startsWith('/kelas');
  const resolvedTrack = isFromKelas ? 'smk' : 'univ';
  const terms = resolveTerminology(resolvedTrack);
  assert.strictEqual(terms.courseLabel, 'Mata Pelajaran');
  assert.strictEqual(terms.learnerLabel, 'Siswa');
});

test('Track Retention: Admin navigating via /mk retains University track', () => {
  const path = '/mk';
  const isFromKelas = path.startsWith('/kelas');
  const resolvedTrack = isFromKelas ? 'smk' : 'univ';
  const terms = resolveTerminology(resolvedTrack);
  assert.strictEqual(terms.courseLabel, 'Mata Kuliah');
  assert.strictEqual(terms.learnerLabel, 'Mahasiswa');
});

// ================================================================
// SECTION 5: CROSS-ROLE STATE ISOLATION & SESSION PURGING
// ================================================================
console.log('\n--- SECTION 5: CROSS-ROLE STATE ISOLATION ---');

class MockAuthSessionManager {
  constructor() {
    this.session = null;
    this.cachedRoleData = new Map();
  }

  login(user) {
    this.session = { ...user, token: `token_${user.role}_${Date.now()}` };
    this.cachedRoleData.set(user.role, { lastActive: Date.now() });
  }

  logout() {
    this.session = null;
    // Sensitive session caches are cleared
    this.cachedRoleData.clear();
  }

  isAuthenticated() {
    return !!this.session;
  }
}

test('Session: Logging out completely purges authentication and cached role tokens', () => {
  const authManager = new MockAuthSessionManager();
  authManager.login({ id: 'u1', full_name: 'Dr. Kardiyem', role: ROLES.DOSEN });
  assert.strictEqual(authManager.isAuthenticated(), true);
  assert.strictEqual(authManager.session.role, ROLES.DOSEN);

  authManager.logout();
  assert.strictEqual(authManager.isAuthenticated(), false);
  assert.strictEqual(authManager.session, null);
  assert.strictEqual(authManager.cachedRoleData.size, 0);
});

test('Session: Rapid role switching maintains strict boundary without data leakage', () => {
  const authManager = new MockAuthSessionManager();
  
  // Dosen session
  authManager.login({ id: 'u-dosen', full_name: 'Dosen A', role: ROLES.DOSEN });
  assert.strictEqual(authManager.session.role, ROLES.DOSEN);
  authManager.logout();

  // Siswa session
  authManager.login({ id: 'u-siswa', full_name: 'Siswa B', role: ROLES.SISWA });
  assert.strictEqual(authManager.session.role, ROLES.SISWA);
  assert.strictEqual(authManager.session.full_name, 'Siswa B');
  authManager.logout();

  assert.strictEqual(authManager.isAuthenticated(), false);
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
