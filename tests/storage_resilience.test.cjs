/**
 * EPIC PLATFORM - STORAGE RESILIENCE & DATA INTEGRITY TEST SUITE
 * Validates:
 * 1. Corrupted / Malformed JSON in localStorage fallback resilience
 * 2. Store State Initialization & Deserialization
 * 3. Graceful degradation when storage quota is restricted
 * 4. Boundary value sanitization in state stores
 */

const assert = require('assert');

console.log('================================================================');
console.log('   EPIC PLATFORM - STORAGE RESILIENCE & INTEGRITY TESTS');
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

// Mock localStorage with failure injection capability
class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.throwOnSet = false;
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    if (this.throwOnSet) {
      throw new Error('QuotaExceededError: DOM Exception 22');
    }
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// Safe JSON loader pattern used in Zustand stores
function safeLoadFromStorage(storage, key, defaultValue) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (err) {
    // Malformed JSON -> return default fallback without throwing
    return defaultValue;
  }
}

function safeSaveToStorage(storage, key, data) {
  try {
    storage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    // Graceful degradation when storage is full
    console.warn(`[Storage Warning] Failed to write ${key}: ${err.message}`);
    return false;
  }
}

// ================================================================
// SECTION 1: MALFORMED JSON RECOVERY
// ================================================================
console.log('--- SECTION 1: CORRUPTED / MALFORMED JSON RECOVERY ---');

test('Storage: Corrupted JSON strings safely fallback to initial default array', () => {
  const mockStorage = new MockLocalStorage();
  mockStorage.setItem('epic_notifications', '{ corrupt json string [');

  const defaultNotifications = [{ id: 'n1', title: 'Default' }];
  const loaded = safeLoadFromStorage(mockStorage, 'epic_notifications', defaultNotifications);

  assert.deepStrictEqual(loaded, defaultNotifications);
  assert.strictEqual(loaded.length, 1);
});

test('Storage: Truncated JSON safely fallbacks without throwing syntax error', () => {
  const mockStorage = new MockLocalStorage();
  mockStorage.setItem('epic_mk_data', '{"id": "mk-1", "name": "Akunt');

  const defaultMK = [];
  const loaded = safeLoadFromStorage(mockStorage, 'epic_mk_data', defaultMK);

  assert.deepStrictEqual(loaded, []);
});

test('Storage: Null or undefined stored values fallback to default object', () => {
  const mockStorage = new MockLocalStorage();
  mockStorage.setItem('epic_user_profile', 'null');

  const defaultProfile = { role: 'dosen', full_name: 'Guest' };
  const loaded = safeLoadFromStorage(mockStorage, 'epic_user_profile', defaultProfile);

  assert.deepStrictEqual(loaded, defaultProfile);
});

// ================================================================
// SECTION 2: QUOTA EXHAUSTION & WRITE SAFETY
// ================================================================
console.log('\n--- SECTION 2: QUOTA EXHAUSTION & GRACEFUL DEGRADATION ---');

test('Storage: QuotaExceededError is caught safely without breaking application flow', () => {
  const mockStorage = new MockLocalStorage();
  mockStorage.throwOnSet = true; // Inject quota error

  const success = safeSaveToStorage(mockStorage, 'epic_scores', { raw: 100 });
  assert.strictEqual(success, false); // Safe fallback returns false, does not throw
});

test('Storage: Valid JSON serializes and deserializes cleanly with nested objects', () => {
  const mockStorage = new MockLocalStorage();
  const testData = {
    mk_id: 'mk-1',
    komponen: [
      { id: 'k1', bobot: 0.4, dimensions: { e: 4, p: 3, i: 4, c: 4 } }
    ],
    timestamp: '2026-08-17T03:11:00Z'
  };

  safeSaveToStorage(mockStorage, 'epic_mk_state', testData);
  const loaded = safeLoadFromStorage(mockStorage, 'epic_mk_state', null);

  assert.deepStrictEqual(loaded, testData);
  assert.strictEqual(loaded.komponen[0].dimensions.e, 4);
});

// ================================================================
// SECTION 3: BOUNDARY CLAMPING & SANITIZATION
// ================================================================
console.log('\n--- SECTION 3: STATE DATA SANITIZATION ---');

function sanitizeStudentData(rawStudent) {
  const trimmedName = rawStudent.full_name ? String(rawStudent.full_name).trim() : '';
  return {
    id: String(rawStudent.id || `std_${Date.now()}`),
    nim: String(rawStudent.nim || rawStudent.nisn || '').trim().toUpperCase(),
    nisn: String(rawStudent.nisn || rawStudent.nim || '').trim().toUpperCase(),
    full_name: trimmedName || 'Peserta Didik',
    email: rawStudent.email ? String(rawStudent.email).trim().toLowerCase() : null
  };
}

test('Sanitization: Empty student fields sanitized with defaults', () => {
  const sanitized = sanitizeStudentData({ id: '', nim: '  7101422001  ', full_name: '   ' });
  assert.ok(sanitized.id.startsWith('std_'));
  assert.strictEqual(sanitized.nim, '7101422001');
  assert.strictEqual(sanitized.full_name, 'Peserta Didik');
});

test('Sanitization: Lowercase email and uppercase NIM/NISN', () => {
  const sanitized = sanitizeStudentData({
    id: 's10',
    nim: '7101422055',
    full_name: 'Maya Indah',
    email: '  MAYA.INDAH@CAMPUS.AC.ID  '
  });
  assert.strictEqual(sanitized.email, 'maya.indah@campus.ac.id');
  assert.strictEqual(sanitized.nim, '7101422055');
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
