# Product Requirement Document (PRD)
## Project: EPIC e-Rubric Platform (Assessment SaaS for Vocational Accounting Education)

**Document Version:** 1.0  
**Date:** June 9, 2026  
**Author:** PT Vuriko Developer Studio  
**Target Audience:** Frontend/Backend Engineers, UI/UX Designers, Quality Assurance (QA), Project Manager  
**Status:** Ready for Review  

---

## 1. Executive Summary & Product Vision

### 1.1 Product Vision
EPIC e-Rubric adalah platform berbasis Web & Mobile (Responsive) yang dirancang khusus untuk mendigitalisasi, mengotomatisasi, dan mengoptimalkan proses penilaian praktikum/simulasi pada pendidikan vokasi (SMK) rumpun Akuntansi dan Keuangan Lembaga (AKL). Platform ini menyelesaikan masalah penilaian manual yang memakan waktu, subjektif, dan minim umpan balik diagnostik, dengan menyediakan mesin perhitungan otomatis berbasis bobot kompetensi dan generator umpan balik cerdas (*Explainable Feedback*).

### 1.2 Core Value Proposition
* **Efisiensi Waktu Guru:** Mengurangi beban pengetikan catatan evaluasi hingga 70% melalui *Rule-Based/Predictive Feedback Generation*.
* **Transparansi Siswa:** Siswa menerima visualisasi analitik performa yang jelas beserta rekomendasi spesifik area perbaikan (*Fokus Perbaikan*).
* **Integritas Data:** Menghilangkan kesalahan kalkulasi nilai akhir menggunakan formula terstandardisasi yang terkunci di sisi *backend*.

---

## 2. User Personas & Role-Based Access Control (RBAC)

Sistem wajib membatasi hak akses fitur berdasarkan matriks peran berikut:

| Fitur / Modul | Admin / Kaprog | Guru Akuntansi (Evaluator) | Siswa SMK (User) |
| :--- | :---: | :---: | :---: |
| **Manajemen User & Kelas** | Write / Read | Read Only | No Access |
| **Konfigurasi Templat Rubrik** | Write / Read | Write / Read | No Access |
| **Input Penilaian (Draft/Final)** | No Access | Write / Read | No Access |
| **Learning Analytics Dashboard** | Read (All Classes) | Read (Own Classes) | Read (Personal Only) |
| **Export Report (.xlsx / .pdf)** | Read / Export | Read / Export | Export Personal PDF |
| **Audit Activity Logs** | Read Only | No Access | No Access |

---

## 3. Information Architecture & System Flow

Aplikasi dibangun di atas struktur 4-lapisan (*4-Tier Architecture*) untuk memastikan skalabilitas:

```
[ User Interface Layer ]
       ├── Guru Akuntansi (Web & Tablet Responsive)
       └── Siswa SMK (Web & Mobile View)
              │
[ EPIC Core Engine Layer ]
       ├── Rubric Configuration Module
       ├── Rule-Based Scoring Engine
       ├── Predictive Intelligence System
       └── Explainable Feedback Generator
              │
[ Learning Analytics Module ]
       ├── Teacher/Student Dashboard Rendering
       ├── Progress Analysis Line-Chart Component
       └── Export Engine (PDF/Excel Generator)
              │
[ Database & Model Repository ]
       ├── Student Data & Class Roster (SQL)
       ├── Rubric Templates Metadata (JSON/SQL)
       └── System Activity Logs (NoSQL/Log Engine)
```

---

## 4. Functional Requirements & Feature Breakdowns

### 4.1 Modul 1: EPIC Core Engine
Modul utama untuk memproses input penilaian praktikum siswa menggunakan kerangka kerja komponen **EPIC-P**.

#### 4.1.1 Dinamis Rubric Configuration (Sisi Guru)
* **FR-CE-001:** Sistem wajib menyediakan antarmuka untuk mengatur bobot persentase (%) pada 5 dimensi kompetensi:
  1. **E** - *Evaluative Understanding* (Pemahaman konsep & alasan)
  2. **P** - *Predictive Reasoning* (Analisis data & pola)
  3. **I** - *Intelligent Application* (Penerapan pada kasus nyata)
  4. **C** - *Critical Reflection* (Analisis & refleksi akun)
  5. **P** - *Professional Ethics* (Etika profesi akuntansi)
* **FR-CE-002:** Sistem wajib melakukan validasi *real-time* sebelum konfigurasi disimpan. **Total penjumlahan bobot harus tepat 100%**. Jika total $
eq 100\%$, tombol "Simpan" harus *disabled* dan memunculkan *error tooltip*.

#### 4.1.2 Rule-Based Scoring & Automated Calculation
* **FR-CE-003:** Sistem wajib menyediakan komponen input skala Likert (nilai 1, 2, 3, 4) berbentuk tombol radio (*radio button*) atau *chip selection* untuk masing-masing dimensi.
* **FR-CE-004:** Backend wajib menghitung Nilai Akhir secara otomatis setiap kali ada perubahan skor Likert menggunakan formula matematis yang telah ditentukan (lihat Seksi 5).

#### 4.1.3 Predictive Intelligence & Explainable Feedback
* **FR-CE-005:** Setiap skor (1-4) pada tiap dimensi wajib berasosiasi dengan sebuah templat kalimat umpan balik (*default feedback sentence*) di database.
* **FR-CE-006:** Ketika Guru memilih skor pada suatu dimensi, sistem harus secara otomatis mengisi (*auto-populate*) komponen *Text Box* "Catatan Guru" pada dimensi tersebut dengan kalimat templat yang sesuai.
* **FR-CE-007:** Guru wajib diberikan hak akses untuk menyunting, menambah, atau menghapus teks di dalam *Text Box* Catatan Guru secara bebas tanpa memengaruhi templat master di database.

---

### 4.2 Modul 2: Learning Analytics Module

#### 4.2.1 Dashboard & Ringkasan Skor
* **FR-LA-001:** Dashboard Guru wajib menampilkan visualisasi distribusi nilai kelas (berbentuk *Bar Chart*) dan statistik makro (Nilai Rata-rata, Nilai Tertinggi, Nilai Terendah, Persentase Kelulusan KKM).
* **FR-LA-002:** Halaman penilaian individu wajib menampilkan komponen "Ringkasan Skor" berupa visualisasi baris berwarna (*Horizontal Progress Bar*) yang mencerminkan capaian skor 1-4 tiap komponen secara visual (Mengikuti palet warna UI: Biru, Kuning, Orange, Hijau, Tosca).

#### 4.2.2 Progress Analysis & Fokus Perbaikan
* **FR-LA-003:** Sistem wajib melacak perkembangan nilai akhir siswa secara kronologis antar-proyek simulasi dan menampilkannya dalam grafik garis (*Line Chart*).
* **FR-LA-004:** Sistem wajib mengidentifikasi secara otomatis 1 dimensi EPIC yang memiliki **skor terendah** pada penilaian berjalan, lalu merendernya pada label **"Fokus Perbaikan"** di bagian bawah halaman. Jika terdapat >1 dimensi dengan skor terendah yang sama, sistem mengambil dimensi dengan bobot tertinggi.

#### 4.2.3 Export Report Engine
* **FR-LA-005:** Sistem harus mampu mengekspor seluruh data nilai satu kelas ke dalam format berkas `.xlsx` (Excel) dengan struktur kolom: `No, NISN, Nama Siswa, Kelas, Skor_E, Skor_P, Skor_I, Skor_C, Skor_PE, Nilai_Akhir, Status`.
* **FR-LA-006:** Sistem harus mampu mencetak lembar hasil penilaian individu (Rapor Praktikum) ke dalam format `.pdf` resmi sekolah yang dilengkapi dengan grafik performa siswa dan tanda tangan digital guru.

---

### 4.3 Modul 3: Database & Model Repository
* **FR-DB-001 (Bulk Import):** Sistem wajib menyediakan fitur impor data siswa dan kelas secara massal menggunakan berkas templat Excel (.xlsx) untuk menghindari entri manual satu per satu oleh admin sekolah.
* **FR-DB-002 (Rubric Templates):** Konfigurasi bobot rubrik yang telah dibuat oleh Guru/Kaprog dapat disimpan sebagai "Master Template" yang dapat digunakan kembali (*reusable*) di kelas atau tahun ajaran lain.
* **FR-DB-003 (Audit Activity Logs):** Setiap aksi sensitif wajib dicatat dalam log sistem dengan format JSON: `timestamp`, `user_id`, `action_type` (e.g., `CREATE_DRAFT`, `FINALIZE_SCORE`, `EDIT_SCORE`), `target_student_id`, dan `ip_address`.

---

## 5. Mathematical Model & Scoring Logic

Proses konversi dari skala metrik performa (1-4) menuju skala standar akademis (0-100) diatur penuh oleh aturan matematika berikut pada arsitektur *backend*:

### 5.1 Rumus Perhitungan Nilai Akhir
Nilai Akhir didapatkan dari perkalian total skor tertimbang terhadap konstanta normalisasi maksimum (25), sehingga nilai akhir berada pada rentang batas maksimum 100.

$$	ext{Nilai Akhir} = \left( \sum_{i=1}^{n} (	ext{Skor Dimensi}_i 	imes 	ext{Bobot Dimensi}_i) ight) 	imes 25$$

Dimana:
* $n$ = Total Dimensi Evaluasi ($n = 5$)
* $	ext{Skor Dimensi}_i$ = Nilai integer bulat $[1, 2, 3, 4]$
* $	ext{Bobot Dimensi}_i$ = Nilai desimal persentase $[0.00 	ext{ s.d } 1.00]$ dengan syarat $\sum 	ext{Bobot} = 1.00$

### 5.2 Aturan Pembulatan (Rounding Policy)
* Hasil akhir kalkulasi bertipe data *Float*. Sistem wajib melakukan pembulatan ke atas (*Round Up*) ke bilangan bulat (*Integer*) terdekat jika nilai desimal $\ge 0.5$, dan pembulatan ke bawah (*Round Down*) jika desimal $< 0.5$.
* *Exception:* Untuk kebutuhan administratif sekolah yang ketat, pembulatan diatur menggunakan fungsi standardisasi `Math.round()` pada tingkat *backend layer*.

---

## 6. State Management & Data Lifecycle

Status penilaian mengontrol integritas data agar nilai tidak dapat dimanipulasi secara ilegal ketika sudah didistribusikan ke siswa.

```
+---------------+      Simpan Draft       +---------------+
|               | ----------------------> |               |
|  Initialization |                         |     DRAFT     | <---+ Guru mengubah nilai
|               | <---------------------- |               |     | dan simpan ulang
+---------------+      Batal/Reset        +---------------+
                                                  |
                                                  | Klik "Finalisasi Penilaian"
                                                  v
                                          +---------------+
                                          |   FINALIZED   | (Data terkunci / Read-Only bagi Guru)
                                          +---------------+
                                                  |
                                                  | Klik "Kirim ke Learning Analytics"
                                                  v
                                          +---------------+
                                          |    SENT TO    | (Masuk ke Dashboard Siswa &
                                          |   ANALYTICS   |  Rapor PDF)
                                          +---------------+
```

### 6.1 Aturan Transisi Status
1. **DRAFT:** Data nilai disimpan di database, flag `is_editable = true`. Siswa **tidak dapat** melihat nilai ini di dashboard mereka.
2. **FINALIZED:** Guru mengonfirmasi nilai selesai. Flag `is_editable = false`. UI mengunci semua input komponen (menjadi *read-only*). Proses kalkulasi analitik kelas dijalankan oleh sistem.
3. **SENT TO ANALYTICS:** Data dilempar ke *endpoint data distribution*. Siswa menerima notifikasi *real-time* dan nilai muncul di dashboard siswa.
4. **Alur Remedial (Re-open State):** Jika siswa membutuhkan perbaikan nilai, peran **Kaprog (Admin)** wajib memberikan otorisasi terlebih dahulu untuk mengubah kembali status dari `SENT TO ANALYTICS` menjadi `DRAFT` melalui tombol khusus *Buka Kunci Nilai*. Setiap aksi re-open wajib menaikkan parameter `revision_count` (+1).

---

## 7. Non-Functional Requirements (NFR) & Security

### 7.1 Security & Data Privacy
* **NFR-SEC-001:** Enkripsi kata sandi menggunakan algoritma **bcrypt** dengan *salt round* minimum 10.
* **NFR-SEC-002:** Autentikasi sesi menggunakan **JWT (JSON Web Token)** yang disimpan di dalam `httpOnly Cookie` untuk mencegah serangan *Cross-Site Scripting* (XSS).
* **NFR-SEC-003:** Proteksi terhadap API Endpoint menggunakan skema *Middleware RBAC* (Pengecekan token & peran di setiap request server).

### 7.2 Performance & Reliability
* **NFR-PER-001:** Waktu muat halaman (*Page Load Time*) untuk dashboard analitik yang menampung hingga 10,000 baris riwayat nilai tidak boleh lebih dari **2.0 detik** pada koneksi internet standard 10 Mbps.
* **NFR-PER-002:** Skalabilitas basis data harus mampu menangani aktivitas *concurrent writes* dari 50 Guru secara bersamaan saat periode ujian praktikum massal tanpa terjadinya kegagalan transaksi (*Database Lock*).

### 7.3 Responsiveness & Accessibility
* **NFR-ACC-001:** Halaman penilaian komponen rubrik wajib dirancang responsif dengan pendekatan *Mobile-First* atau *Tablet-Optimized* (Aman diakses pada resolusi lebar minimum 768px ke atas), memfasilitasi guru yang melakukan penilaian langsung di lab akuntansi menggunakan tablet.

---

## 8. Product Boundaries & Out-of-Scope (Batasan Produk)

Untuk memastikan rilis MVP tepat waktu dan mencegah terjadinya perluasan ruang lingkup (*scope creep*), komponen berikut dideklarasikan sebagai **DI LUAR RUANG LINGKUP (Out of Scope)** Versi 1.0:
* Aplikasi **TIDAK** menyediakan modul koreksi jawaban otomatis berbasis AI untuk lembar kerja esai siswa. Input skor sepenuhnya mengandalkan penilaian subjektif guru yang dipandu oleh instrumen rubrik digital.
* Aplikasi **TIDAK** memiliki fitur Computer Based Test (CBT) pilihan ganda atau sistem ujian daring mandiri. Aplikasi murni bertindak sebagai platform manajemen penilaian berbasis rubrik proyek (*Project-Based Assessment*).
* Integrasi otomatis *Two-Way Sync* dengan Dapodik ditiadakan di versi awal; pertukaran data siswa sepenuhnya menggunakan mekanisme *Bulk Import/Export* via Excel (.xlsx).

---

## 9. User Stories & Acceptance Criteria (AC)

### User Story 1: Automated Feedback Generation
> **As a** Guru Akuntansi (Evaluator)  
> **I want** sistem otomatis mengisi kotak catatan kritik/saran sesaat setelah saya memilih skor Likert untuk siswa  
> **So that** saya dapat menghemat waktu pengerjaan penilaian tanpa perlu mengetik draf feedback yang sama berulang kali.

* **Acceptance Criteria 1:**
  * **GIVEN:** Guru berada di dalam halaman pengisian rubrik penilaian siswa untuk dimensi *Predictive Reasoning*.
  * **WHEN:** Guru melakukan klik pada angka skala `3`.
  * **THEN:** Sistem secara instan (*latency* < 200ms) memicu teks templat untuk skor 3 dimasukkan ke dalam *Text Box* "Catatan Guru" (Contoh teks: *"Analisis data menunjukkan pemahaman pola yang cukup baik, namun klasifikasi akun masih belum konsisten: Pastikan semua transaksi sesuai jenis akun sebelum membuat kesimpulan."*).
* **Acceptance Criteria 2:**
  * **GIVEN:** Kotak catatan telah terisi teks otomatis oleh sistem.
  * **WHEN:** Guru memblokir teks tersebut dan menambahkan kalimat modifikasi kustom sendiri.
  * **THEN:** Sistem mengizinkan perubahan tersebut dan menyimpannya sebagai catatan unik untuk siswa bersangkutan, tanpa merusak kalimat templat master yang tersimpan di database.

### User Story 2: Automatic Actionable Focus Area
> **As a** Siswa SMK  
> **I want** sistem merangkum satu fokus perbaikan utama secara otomatis di halaman hasil nilai saya  
> **So that** saya langsung mengetahui kelemahan terbesar saya yang perlu diperbaiki untuk proyek berikutnya.

* **Acceptance Criteria 1:**
  * **GIVEN:** Guru telah mengisi seluruh skor komponen rubrik siswa (E=3, P=3, I=3, C=2, P=4).
  * **WHEN:** Guru melihat seksi "Ringkasan Skor" atau Siswa melihat Rapor Hasil Akhir.
  * **THEN:** Sistem membaca skor terkecil (yaitu skor `2` pada komponen *Critical Reflection*) dan secara otomatis menampilkan teks **"Fokus Perbaikan: Critical Reflection"** pada field hasil ringkasan di bagian bawah halaman secara dinamis.
