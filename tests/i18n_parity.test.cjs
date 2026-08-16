/**
 * EPIC PLATFORM - i18n MULTI-LANGUAGE PARITY TEST SUITE
 * Validates:
 * 1. 100% Key Parity between Indonesian (id) and English (en) dictionaries
 * 2. Non-empty string validation (no undefined, null, or empty string values)
 * 3. Role Label translations alignment across all 5 roles
 * 4. Critical UI keys (logout, confirmation, navigation, auth)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   EPIC PLATFORM - i18n MULTI-LANGUAGE PARITY TEST SUITE');
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

// Load translations from file directly
const transPath = path.resolve(__dirname, '../src/utils/translations.js');
const fileContent = fs.readFileSync(transPath, 'utf8');

// Parse TRANSLATIONS object safely
const matchId = fileContent.match(/id:\s*\{([\s\S]*?)\n\s*\},/);
const matchEn = fileContent.match(/en:\s*\{([\s\S]*?)\n\s*\}\n\};/);

function extractKeysAndValues(blockStr) {
  const result = {};
  const lines = blockStr.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*['"`](.*)['"`],?$/);
    if (kvMatch) {
      result[kvMatch[1]] = kvMatch[2];
    }
  }
  return result;
}

const idDict = extractKeysAndValues(matchId ? matchId[1] : '');
const enDict = extractKeysAndValues(matchEn ? matchEn[1] : '');

const idKeys = Object.keys(idDict);
const enKeys = Object.keys(enDict);

// ================================================================
// SECTION 1: KEY COUNT & DICTIONARY COMPLETENESS
// ================================================================
console.log('--- SECTION 1: DICTIONARY KEY PARITY ---');

test('i18n: Indonesian dictionary contains substantial UI keys (> 40 keys)', () => {
  assert.ok(idKeys.length >= 40, `Found ${idKeys.length} Indonesian keys`);
});

test('i18n: English dictionary contains substantial UI keys (> 40 keys)', () => {
  assert.ok(enKeys.length >= 40, `Found ${enKeys.length} English keys`);
});

test('i18n: Every key in Indonesian (id) dictionary must exist in English (en)', () => {
  const missingInEn = idKeys.filter(k => !(k in enDict));
  assert.strictEqual(
    missingInEn.length, 
    0, 
    `Missing in EN dictionary: [${missingInEn.join(', ')}]`
  );
});

test('i18n: Every key in English (en) dictionary must exist in Indonesian (id)', () => {
  const missingInId = enKeys.filter(k => !(k in idDict));
  assert.strictEqual(
    missingInId.length, 
    0, 
    `Missing in ID dictionary: [${missingInId.join(', ')}]`
  );
});

// ================================================================
// SECTION 2: VALUE INTEGRITY (NO EMPTY STRINGS)
// ================================================================
console.log('\n--- SECTION 2: VALUE INTEGRITY & SANITY ---');

test('i18n: No empty string values in Indonesian dictionary', () => {
  const emptyKeys = idKeys.filter(k => !idDict[k] || idDict[k].trim() === '');
  assert.strictEqual(emptyKeys.length, 0, `Empty ID keys: ${emptyKeys.join(', ')}`);
});

test('i18n: No empty string values in English dictionary', () => {
  const emptyKeys = enKeys.filter(k => !enDict[k] || enDict[k].trim() === '');
  assert.strictEqual(emptyKeys.length, 0, `Empty EN keys: ${emptyKeys.join(', ')}`);
});

// ================================================================
// SECTION 3: CRITICAL UI & LOGOUT KEYS
// ================================================================
console.log('\n--- SECTION 3: CRITICAL UI & LOGOUT KEYS ---');

test('i18n: Logout confirmation keys present and non-empty in both languages', () => {
  const requiredKeys = [
    'logout',
    'logoutConfirmTitle',
    'logoutConfirmMessage',
    'logoutConfirmSub',
    'logoutCancel',
    'logoutConfirmBtn'
  ];

  for (const k of requiredKeys) {
    assert.ok(idDict[k], `Missing ID key: ${k}`);
    assert.ok(enDict[k], `Missing EN key: ${k}`);
  }
});

test('i18n: All 5 role labels defined in both languages', () => {
  const roleKeys = ['roleAdmin', 'roleDosen', 'roleGuru', 'roleMahasiswa', 'roleSiswa'];
  for (const r of roleKeys) {
    assert.ok(idDict[r], `Missing ID role: ${r}`);
    assert.ok(enDict[r], `Missing EN role: ${r}`);
  }
});

test('i18n: 4 EPIC dimensions defined in both languages', () => {
  const dimKeys = ['dimEvaluative', 'dimPredictive', 'dimIntegrative', 'dimCritical'];
  for (const d of dimKeys) {
    assert.ok(idDict[d], `Missing ID dimension: ${d}`);
    assert.ok(enDict[d], `Missing EN dimension: ${d}`);
  }
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
