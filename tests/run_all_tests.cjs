/**
 * EPIC PLATFORM - UNIFIED MASTER TEST RUNNER
 * Executes all automated test suites across core, multi-role, data engines, i18n, and storage.
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║               EPIC e-RUBRIC PLATFORM - MASTER TEST RUNNER                ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const testSuites = [
  { name: '1. Core Scoring Engine & System CRUD Suite', path: 'scratch/test_suite.cjs' },
  { name: '2. Multi-Role Workflow & Forward/Backward Navigation Matrix', path: 'tests/workflow_role_matrix.test.cjs' },
  { name: '3. Excel Data & Smart Import/Export Engine', path: 'tests/excel_data_engine.test.cjs' },
  { name: '4. i18n Multi-Language (ID ↔ EN) Key Parity', path: 'tests/i18n_parity.test.cjs' },
  { name: '5. Storage Resilience, Recovery & Data Sanitization', path: 'tests/storage_resilience.test.cjs' },
  { name: '6. UI/UX Responsiveness, Viewport & Accessibility Audit', path: 'tests/ui_ux_responsive.test.cjs' }
];

let allPassed = true;
let suiteCount = 0;

for (const suite of testSuites) {
  suiteCount++;
  console.log(`\n▶ [SUITE ${suiteCount}/${testSuites.length}] RUNNING: ${suite.name}...`);
  console.log('─'.repeat(70));
  
  const result = spawnSync('node', [suite.path], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  if (result.status !== 0) {
    allPassed = false;
    console.error(`\n❌ Test Suite '${suite.name}' failed with exit code ${result.status}`);
  }
}

console.log('\n' + '═'.repeat(74));
if (allPassed) {
  console.log(`🎉 ALL ${testSuites.length} TEST SUITES COMPLETED SUCCESSFULLY! ZERO REGRESSIONS FOUND.`);
  console.log('═'.repeat(74) + '\n');
  process.exit(0);
} else {
  console.error('💥 ONE OR MORE TEST SUITES FAILED. PLEASE CHECK LOGS ABOVE.');
  console.log('═'.repeat(74) + '\n');
  process.exit(1);
}
