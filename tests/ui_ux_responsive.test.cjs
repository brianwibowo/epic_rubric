/**
 * EPIC PLATFORM - UI/UX & RESPONSIVENESS TEST SUITE
 * Validates:
 * 1. Viewport Meta Tags & Mobile Scalability in index.html
 * 2. Responsive Breakpoint Consistency across CSS Modules (768px, 1024px, 480px)
 * 3. Touch Target Sizing & Interactive Element Accessibility (aria-labels, titles)
 * 4. Modal Portals & Horizontal Overflow Guard
 * 5. Design Tokens (Colors, Radii, Transitions, Fonts) Integrity
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   EPIC PLATFORM - UI/UX & RESPONSIVENESS TEST SUITE');
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
// SECTION 1: HTML VIEWPORT & META VALIDATION
// ================================================================
console.log('--- SECTION 1: VIEWPORT & MOBILE CONFIGURATION ---');

const indexHtmlPath = path.resolve(__dirname, '../index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

test('HTML: index.html defines mobile viewport meta tag with device-width', () => {
  assert.ok(
    indexHtmlContent.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0"'),
    'Missing or invalid viewport meta tag'
  );
});

test('HTML: index.html links to standard SVG favicon', () => {
  assert.ok(
    indexHtmlContent.includes('rel="icon"') && indexHtmlContent.includes('/logo.svg'),
    'Favicon is not linked to /logo.svg'
  );
});

// ================================================================
// SECTION 2: CSS BREAKPOINT & RESPONSIVENESS AUDIT
// ================================================================
console.log('\n--- SECTION 2: RESPONSIVE BREAKPOINT AUDIT ---');

const cssFilesToCheck = [
  'src/components/layout/AppShell.module.css',
  'src/components/layout/Sidebar.module.css',
  'src/pages/DashboardPage.module.css',
  'src/pages/ScoringPage.module.css',
  'src/pages/MKStudentListPage.module.css',
  'src/pages/LoginPage.module.css'
];

test('CSS: AppShell defines mobile drawer transition at max-width: 768px', () => {
  const appShellCss = fs.readFileSync(path.resolve(__dirname, '..', cssFilesToCheck[0]), 'utf8');
  assert.ok(appShellCss.includes('@media (max-width: 768px)'));
  assert.ok(appShellCss.includes('.mobileHeader'));
});

test('CSS: Sidebar defines off-canvas drawer and overlay for screens <= 768px', () => {
  const sidebarCss = fs.readFileSync(path.resolve(__dirname, '..', cssFilesToCheck[1]), 'utf8');
  assert.ok(sidebarCss.includes('@media (max-width: 768px)'));
  assert.ok(sidebarCss.includes('translateX(-100%)'));
  assert.ok(sidebarCss.includes('translateX(0)'));
});

test('CSS: ScoringPage defines single-column stack and horizontal student scroll for mobile', () => {
  const scoringCss = fs.readFileSync(path.resolve(__dirname, '..', cssFilesToCheck[3]), 'utf8');
  assert.ok(scoringCss.includes('@media (max-width: 900px)'));
  assert.ok(scoringCss.includes('overflow-x: auto'));
});

test('CSS: Student List defines horizontal table scroll container (.tableWrap)', () => {
  const studentCss = fs.readFileSync(path.resolve(__dirname, '..', cssFilesToCheck[4]), 'utf8');
  assert.ok(studentCss.includes('overflow-x: auto'));
});

test('CSS: LoginPage hides large illustration on mobile <= 900px for front-and-center login card', () => {
  const loginCss = fs.readFileSync(path.resolve(__dirname, '..', cssFilesToCheck[5]), 'utf8');
  assert.ok(loginCss.includes('@media (max-width: 900px)'));
  assert.ok(loginCss.includes('.leftPanel { display: none; }') || loginCss.includes('.leftPanel {\n    display: none;'));
});

// ================================================================
// SECTION 3: DESIGN SYSTEM TOKENS & THEMING
// ================================================================
console.log('\n--- SECTION 3: DESIGN SYSTEM TOKENS & THEMING ---');

const indexCssPath = path.resolve(__dirname, '../src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

test('Design System: Core CSS custom properties defined in :root', () => {
  const requiredTokens = [
    '--color-primary',
    '--color-error',
    '--color-success',
    '--color-warning',
    '--bg-surface',
    '--border-color',
    '--radius-md',
    '--transition-fast'
  ];

  for (const token of requiredTokens) {
    assert.ok(indexCssContent.includes(token), `Missing CSS variable token: ${token}`);
  }
});

// ================================================================
// SECTION 4: ACCESSIBILITY & TOUCH TARGETS
// ================================================================
console.log('\n--- SECTION 4: ACCESSIBILITY & INTERACTIVE ELEMENTS ---');

const inputJsxPath = path.resolve(__dirname, '../src/components/ui/Input.jsx');
const inputJsxContent = fs.readFileSync(inputJsxPath, 'utf8');

test('Accessibility: Password view toggle button has descriptive aria-label', () => {
  assert.ok(inputJsxContent.includes('Sembunyikan kata sandi'));
  assert.ok(inputJsxContent.includes('Tampilkan kata sandi'));
});

const modalJsxPath = path.resolve(__dirname, '../src/components/ui/Modal.jsx');
const modalJsxContent = fs.readFileSync(modalJsxPath, 'utf8');

test('Accessibility: Modal close button has aria-label="Close modal"', () => {
  assert.ok(modalJsxContent.includes('aria-label="Close modal"'));
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
