# EPIC e-Rubric Platform — Dokumentasi Sistem & Panduan Produksi

Selamat! Proyek **EPIC e-Rubric Platform** (Aplikasi Penilaian Praktikum Akuntansi Vokasi SMK Rumpun AKL) telah selesai dikembangkan sepenuhnya dan siap dipublikasikan ke lingkungan produksi (*Production Environment*).

Dokumentasi ini dirancang untuk menjelaskan cara kerja sistem, struktur database Supabase, kebijakan keamanan, serta alur deployment otomatis via Netlify.

---

## 📖 1. Ikhtisar Sistem & Modul Aplikasi

EPIC e-Rubric didesain khusus untuk SMK Vokasi Akuntansi, menggantikan penilaian konvensional dengan model rubrik multi-dimensi **EPIC (Evaluative, Predictive, Intelligent, Critical, & Professional Ethics)**.

### Hak Akses Pengguna (RBAC - Role Based Access Control)
*   **Admin / Kepala Program Keahlian (Kaprog):** Memiliki wewenang manajemen pengguna (tambah/hapus/edit guru & siswa), manajemen kelas, konfigurasi template bobot rubrik master, re-open kunci penilaian, dan membaca catatan log audit keamanan (*audit log*).
*   **Guru Akuntansi:** Dapat membuat draft penilaian, memberikan skor Likert (1-4) per-dimensi, menulis feedback kustom (dilengkapi auto-templates), memfinalisasi nilai, mengekspor laporan kelas (Excel), serta mengimpor siswa massal via file `.xlsx`.
*   **Siswa SMK:** Dapat login secara mandiri untuk melihat rapor hasil praktikum resmi (PDF) dan grafik tren perkembangan kompetensi personal mereka. Siswa tidak memiliki akses ke data siswa lain.

### Fitur Kunci:
1.  **Dual Mode (Lokal / Live Supabase):** Aplikasi mendeteksi variabel lingkungan secara dinamis. Jika credentials Supabase tidak diatur, aplikasi berjalan secara offline menggunakan penyimpanan browser (`localStorage`) sehingga demo tetap dapat diuji. Jika credentials aktif, aplikasi langsung terhubung ke database cloud Supabase.
2.  **Scoring & Tie-Breaker Engine:** Kalkulasi nilai akhir terstandarisasi dengan model pembulatan presisi. Jika terdapat nilai dimensi terendah yang sama, sistem melakukan *tie-break* otomatis dengan memilih dimensi yang berbobot konfigurasi paling tinggi untuk dijadikan fokus perbaikan utama siswa.
3.  **Export & Import Client-Side:** Proses pembuatan dokumen PDF Rapor (jsPDF + html2canvas) dan laporan nilai Excel (SheetJS) berjalan 100% di browser pengguna tanpa membebani server (hemat biaya).

---

## 📊 2. Skema & Persiapan Database Supabase

Untuk menjalankan aplikasi ini pada mode produksi, Anda perlu membuat proyek di [Supabase Dashboard](https://supabase.com) dan menjalankan file-file migrasi SQL yang berada di folder `supabase/migrations/` secara berurutan.

### Urutan Eksekusi Migrasi SQL:

Jalankan query di dalam **SQL Editor** Supabase sesuai urutan penomoran file berikut:

| Urutan | File Migrasi | Deskripsi |
|:---:|:---|:---|
| **1** | [001_create_users.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/001_create_users.sql) | Membuat tabel `public.profiles` yang secara otomatis terhubung dengan modul Autentikasi Supabase (`auth.users`) melalui database trigger `on_auth_user_created`. |
| **2** | [002_create_classes.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/002_create_classes.sql) | Membuat tabel rombongan belajar `classes` dan tabel relasi pendaftaran siswa `class_enrollments`. |
| **3** | [003_create_rubrics.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/003_create_rubrics.sql) | Membuat tabel konfigurasi bobot kompetensi `rubric_templates` beserta database seeding untuk 20 baris template kalimat feedback otomatis (`feedback_templates`). |
| **4** | [004_create_scores.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/004_create_scores.sql) | Membuat tabel `assessments` untuk menyimpan lembar nilai praktikum berjalan, status lifecycle (`DRAFT`, `FINALIZED`, `SENT_TO_ANALYTICS`), skor Likert 1-4, serta catatan evaluasi. |
| **5** | [005_create_analytics.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/005_create_analytics.sql) | Menambahkan database indexing untuk mempercepat muat grafik analitik dan membuat View ringkasan kelas `class_performance_summary`. |
| **6** | [006_create_audit_logs.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/006_create_audit_logs.sql) | Membuat tabel `audit_logs` untuk mencatat setiap pergantian status penilaian guna menjamin integritas data (keamanan audit internal). |
| **7** | [007_rls_policies.sql](file:///Users/mymac/Documents/Codes/epic_rubric/supabase/migrations/007_rls_policies.sql) | **[Row Level Security]** Mengaktifkan dan mengatur kebijakan granular database PostgreSQL untuk membatasi hak baca/tulis berdasarkan peran login user yang terverifikasi (Auth JWT token). |

---

## ⚙️ 3. Konfigurasi Lingkungan (*Environment Variables*)

Salin file `.env.example` menjadi `.env` di komputer Anda, lalu isi dengan URL API dan Kunci Anonim proyek Supabase Anda:

```bash
cp .env.example .env
```

Isi variabel di bawah:
```env
VITE_SUPABASE_URL=https://<id-proyek-anda>.supabase.co
VITE_SUPABASE_ANON_KEY=<kunci-anon-supa-anda>
```

> [!NOTE]
> *   Jika nilai di `.env` masih berupa placeholder (`placeholder-project` atau `your-project`), aplikasi secara otomatis mendeteksi dan mengaktifkan **Mode Simulasi Lokal** untuk kemudahan testing offline.
> *   Di Netlify Production, masukkan kedua variabel di atas pada menu pengaturan **Site configuration > Environment variables**.

---

## 🌐 4. Alur Deployment Otomatis (Netlify)

Aplikasi ini dikonfigurasi untuk ter-deploy secara otomatis ketika Anda melakukan push kode ke branch `main`.

### Konfigurasi Build di Netlify:
Netlify akan secara otomatis mendeteksi berkas [netlify.toml](file:///Users/mymac/Documents/Codes/epic_rubric/netlify.toml) yang telah dikonfigurasikan di root proyek dengan setelan berikut:
*   **Build Command:** `npm run build`
*   **Publish Directory:** `dist`
*   **SPA Redirection:** File `public/_redirects` menginstruksikan server Netlify untuk memetakan seluruh rute url statis kembali ke `index.html` (mencegah error *404 Page Not Found* saat halaman di-refresh oleh pengguna).

### Langkah-langkah Melakukan Push & Deploy:

1.  **Inisialisasi Git & Tambahkan Remote (Jika belum):**
    ```bash
    git init
    git remote add origin <url-repo-github-anda>
    ```
2.  **Lakukan Commit & Push ke Branch `main`:**
    ```bash
    git add .
    git commit -m "feat: setup production environment, user management, and rls policies"
    git branch -M main
    git push -u origin main
    ```
3.  **Hubungkan ke Netlify:**
    *   Buka dashboard Netlify, pilih **Add new site > Import an existing project**.
    *   Pilih GitHub dan cari nama repositori proyek `epic_rubric`.
    *   Netlify akan membaca berkas `netlify.toml` secara otomatis.
    *   Masukkan environment variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`) pada konfigurasi Netlify.
    *   Klik **Deploy Site**. Proses deploy biasanya memakan waktu kurang dari 1 menit.

---

## 🖥️ 5. Panduan Pengujian & Operasional Sistem

Setelah sistem aktif di production:

### Pendaftaran Akun Produksi (Supabase Auth)
1.  Admin mendaftarkan akun baru melalui menu **Manajemen User** di aplikasi atau langsung membuat user baru pada menu **Auth > Users** di Dashboard Supabase.
2.  Saat user terdaftar di Supabase Auth, trigger database PostgreSQL `on_auth_user_created` akan otomatis membuat record profil yang sesuai di tabel `public.profiles`.
3.  Peran (role) default pengguna yang baru mendaftar adalah `siswa`. Untuk menugaskan peran `guru` atau `admin`, Administrator dapat masuk ke Dashboard Supabase atau menggunakan menu pengeditan pada halaman Manajemen User untuk memperbarui kolom `role` di tabel `profiles`.

### Alur Kerja Guru di Produksi:
1.  Login ke aplikasi menggunakan email asli yang didaftarkan.
2.  Pilih **Penilaian Kelas** di sidebar $\rightarrow$ Buka roster kelas yang dituju.
3.  Gunakan tombol **Impor Siswa (.xlsx)** jika ingin memasukkan siswa secara massal menggunakan file excel.
4.  Klik **Beri Nilai** pada nama siswa untuk membuka kokpit penilaian.
5.  Pilih skor Likert 1-4. Tinjau auto-feedback yang muncul, kemudian lengkapi catatan kustom.
6.  Klik **Simpan Draft** jika pekerjaan belum selesai, atau klik **Finalisasi & Kunci Nilai** jika nilai sudah lengkap.
7.  Terakhir, klik **Kirim ke Analytics** agar siswa dapat melihat hasil rapor mereka dari akun siswa masing-masing.
