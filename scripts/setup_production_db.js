import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 EPIC e-Rubric Production Database Helper');
console.log('============================================');

const sqlPath = path.join(rootDir, 'supabase', 'full_production_setup.sql');

if (fs.existsSync(sqlPath)) {
  const stats = fs.statSync(sqlPath);
  console.log(`✅ Master SQL File Ready: ${sqlPath}`);
  console.log(`📊 File Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log('\n📖 INTRUKSI SUPABASE PRODUCTION:');
  console.log('--------------------------------------------------');
  console.log('1. Buka Supabase Dashboard Anda: https://supabase.com/dashboard');
  console.log('2. Pilih Project Production Anda.');
  console.log('3. Masuk ke menu "SQL Editor" -> "+ New query".');
  console.log('4. Salin seluruh isi file: supabase/full_production_setup.sql');
  console.log('5. Klik tombol "Run" (1x klik untuk memasang seluruh tabel, RLS, & data demo).\n');
} else {
  console.error('❌ File full_production_setup.sql tidak ditemukan.');
}
