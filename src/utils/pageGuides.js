/**
 * EPIC e-Rubric v2.0 — Contextual Page Guides & Guided Feature Tour Steps
 * Registry mapping every route to page explanations, key workflows, tips, and step-by-step tour guides.
 */

export const PAGE_GUIDES = {
  dashboard: {
    title: 'Dashboard Utama',
    icon: 'LayoutDashboard',
    route: '/',
    summary: 'Pusat komando dan ringkasan eksekutif untuk memantau aktivitas mata kuliah, progres penilaian mahasiswa, ketersediaan rubrik, dan notifikasi terkini.',
    keyFeatures: [
      'Statistik Ringkas: Total Mata Kuliah, Mahasiswa Terdaftar, Komponen Asesmen, dan Rata-rata Nilai.',
      'Daftar Mata Kuliah: Akses cepat ke ruang evaluasi dan analitik mata kuliah.',
      'Aktivitas & Notifikasi: Pembaruan publikasi nilai dan diskusi kelas terbaru.'
    ],
    dosenTips: 'Gunakan tombol "+ Buat MK Baru" di kanan atas untuk membuat mata kuliah dan mengonfigurasi rubrik penilaian.',
    mahasiswaTips: 'Pantau status nilai akhir dan klik kartu mata kuliah untuk melihat rapor transparansi penilaian rubrik.',
    tourSteps: [
      {
        title: 'Selamat Datang di EPIC e-Rubric! 🚀',
        description: 'Platform Asesmen Vokasi Digital Berbasis 4 Dimensi EPIC (Evaluative, Predictive, Integrative, Critical). Mari jelajahi fitur utamanya.',
        target: 'welcome'
      },
      {
        title: 'Statistik Ringkas Real-Time 📊',
        description: 'Pantau ringkasan total Mata Kuliah yang diampu, jumlah mahasiswa aktif, komponen penilaian, serta rata-rata akumulasi nilai kelas.',
        target: 'stats'
      },
      {
        title: 'Katalog Mata Kuliah Aktif 📚',
        description: 'Seluruh mata kuliah Anda tersaji dalam kartu interaktif. Klik kartu MK untuk masuk ke Ringkasan Mata Kuliah atau Penilaian.',
        target: 'mk-list'
      },
      {
        title: 'Bantuan Universal (?) ❓',
        description: 'Tekan tombol tanda tanya "?" pada header setiap halaman kapan pun Anda membutuhkan penjelasan atau ingin mengulang panduan tour.',
        target: 'help-btn'
      }
    ]
  },

  mkList: {
    title: 'Daftar Mata Kuliah',
    icon: 'BookOpen',
    route: '/mk',
    summary: 'Katalog lengkap seluruh mata kuliah yang Anda ampu atau ikuti dengan fitur pencarian instan, filter mode tampilan (Grid / List), dan paginasi.',
    keyFeatures: [
      'Pencarian Instan: Cari berdasarkan nama mata kuliah, kode MK, semester, atau nama rombel.',
      'Pengalih Tampilan: Pilih mode kartu (Grid) atau tabel terstruktur (List).',
      'Paginasi Dinamis: Navigasi mudah dengan pilihan 6, 12, atau 24 mata kuliah per halaman.'
    ],
    dosenTips: 'Klik tombol "+ Buat MK Baru" untuk membuat mata kuliah baru dan menetapkan bobot komponen hingga 100%.',
    mahasiswaTips: 'Klik kartu mata kuliah untuk langsung membuka Rapor Analitik Capaian Kompetensi Anda.',
    tourSteps: [
      {
        title: 'Katalog Mata Kuliah 📖',
        description: 'Halaman ini memuat seluruh mata kuliah yang terdaftar dalam akun Anda lengkap dengan kode MK, semester, SKS, dan rombel.',
        target: 'header'
      },
      {
        title: 'Pencarian Instan 🔍',
        description: 'Ketik nama mata kuliah, kode MK (contoh: 25P04085), atau semester di kotak pencarian untuk menyaring data seketika.',
        target: 'search'
      },
      {
        title: 'Pengalih Tampilan (Grid / List) 🎛️',
        description: 'Gunakan tombol Grid untuk melihat kartu visual lengkap atau tombol List untuk melihat tampilan baris tabel yang ringkas.',
        target: 'view-toggle'
      },
      {
        title: 'Buka Mata Kuliah 🎯',
        description: 'Klik pada kartu mata kuliah atau baris tabel untuk masuk ke pusat pengelolaan, input nilai, dan analitik kompetensi.',
        target: 'card'
      }
    ]
  },

  createMK: {
    title: 'Buat Mata Kuliah Baru',
    icon: 'PlusCircle',
    route: '/mk/create',
    summary: 'Wizard terpandu 2 langkah untuk membuat mata kuliah baru, menetapkan semester dan SKS, serta mengonfigurasi komponen penilaian berbobot 100%.',
    keyFeatures: [
      'Langkah 1: Informasi Dasar (Nama MK, Kode MK, Semester, SKS, Deskripsi).',
      'Langkah 2: Komponen Penilaian & Rubrik (Total bobot wajib tepat 100%).',
      'Validasi Cerdas: Sistem mencegah penyimpanan jika total bobot belum mencapai 100%.'
    ],
    dosenTips: 'Pastikan total akumulasi bobot komponen penilaian tepat 100% agar mata kuliah dapat langsung diaktifkan.',
    mahasiswaTips: 'Halaman pembuatan mata kuliah khusus diperuntukkan bagi Dosen dan Tenaga Pendidik.',
    tourSteps: [
      {
        title: 'Langkah 1: Informasi Mata Kuliah 📝',
        description: 'Isi nama lengkap mata kuliah, kode MK institusional, semester akademik aktif, dan beban SKS.',
        target: 'step1'
      },
      {
        title: 'Langkah 2: Komponen Penilaian & Bobot ⚖️',
        description: 'Tentukan komponen penilaian (Tugas, UTS, UAS, Proyek, Partisipasi) dan atur persentase bobot hingga tepat 100%.',
        target: 'step2'
      },
      {
        title: 'Pemasangan Template Rubrik 💎',
        description: 'Pilih template rubrik EPIC (4 Dimensi) atau rubrik spesifik lainnya untuk setiap komponen penilaian.',
        target: 'rubric-assign'
      },
      {
        title: 'Simpan & Publikasikan 🚀',
        description: 'Klik tombol "Buat Mata Kuliah" untuk menyimpan. Mata kuliah baru akan langsung muncul di katalog MK Anda.',
        target: 'submit'
      }
    ]
  },

  mkOverview: {
    title: 'Ringkasan Mata Kuliah',
    icon: 'BookOpen',
    route: '/mk/:id',
    summary: 'Pusat komando eksekutif untuk satu mata kuliah — menyediakan ringkasan bobot komponen, progres penilaian rombel, rekapitulasi nilai, dan ekspor data.',
    keyFeatures: [
      'Banner Informasi Utama: Menampilkan Kode MK, SKS, Semester, Rombel, dan Dosen Pengampu.',
      'Navigasi Modul: Akses langsung ke Mahasiswa, Komponen Rubrik, Rekap Penilaian, dan Analitik.',
      'Ekspor Rapor Excel: Unduh seluruh rekapitulasi nilai mahasiswa dalam berkas .xlsx rapi.'
    ],
    dosenTips: 'Klik kartu navigasi cepat "Kelola Peserta" untuk mendaftarkan mahasiswa atau mengimpor data via Excel.',
    mahasiswaTips: 'Lihat ringkasan komponen nilai dan klik menu Analisis untuk memantau radar kompetensi Anda.',
    tourSteps: [
      {
        title: 'Hero Banner Mata Kuliah 🎓',
        description: 'Menampilkan identitas resmi mata kuliah, kode SKS, semester aktif, dan dosen pengampu.',
        target: 'hero'
      },
      {
        title: 'Navigasi Modul Utama 🧭',
        description: 'Akses cepat ke 5 menu inti: Kelola Mahasiswa, Komponen & Rubrik, Scoring Engine, Analitik Rapor, dan Forum Diskusi.',
        target: 'nav-cards'
      },
      {
        title: 'Ringkasan Rombel & Komponen 📋',
        description: 'Pantau persentase progres penilaian tiap rombongan belajar dan rata-rata skor per komponen secara real-time.',
        target: 'breakdown'
      },
      {
        title: 'Ekspor Data Nilai 📥',
        description: 'Gunakan tombol "Export Nilai Excel" di kanan atas untuk mengunduh rekapitulasi nilai terstruktur ke format .xlsx.',
        target: 'export'
      }
    ]
  },

  studentList: {
    title: 'Daftar Mahasiswa & Rombel',
    icon: 'Users',
    route: '/mk/:id/students',
    summary: 'Manajemen peserta kelas lengkap dengan fitur Smart Import Excel, pencarian NIM/Nama, status kelengkapan penilaian, dan input manual.',
    keyFeatures: [
      'Smart Import Excel: Deteksi kolom NIM dan Nama otomatis dari berkas .xlsx/.csv tanpa batasan template.',
      'Filter Tab Rombel: Berpindah antar rombongan belajar (Kelas A, Kelas B, dst.) secara instan.',
      'Status Progres Penilaian: Memantau mahasiswa yang belum dinilai, sedang dinilai, atau telah selesai.'
    ],
    dosenTips: 'Gunakan tombol "Import Excel" untuk mendaftarkan puluhan mahasiswa sekaligus dalam hitungan detik.',
    mahasiswaTips: 'Pastikan nama dan NIM Anda terdaftar dengan benar pada rombongan belajar aktif.',
    tourSteps: [
      {
        title: 'Tab Rombongan Belajar 👥',
        description: 'Gunakan tab di bagian atas untuk beralih antara tampilan Semua Rombel atau kelas tertentu (misal: Rombel A).',
        target: 'tabs'
      },
      {
        title: 'Smart Import Excel 📁',
        description: 'Klik tombol "Import Excel" untuk mengunggah file data mahasiswa. Sistem cerdas otomatis membaca kolom NIM dan Nama.',
        target: 'import'
      },
      {
        title: 'Tabel Mahasiswa & Status Nilai 📋',
        description: 'Lihat daftar nama, NIM, kelengkapan komponen yang dinilai, nilai akhir, serta predikat kelulusan mahasiswa.',
        target: 'table'
      },
      {
        title: 'Aksi Cepat Penilaian ⚡',
        description: 'Klik tombol "Nilai" pada baris mahasiswa untuk langsung membuka lembar penilaian rubrik Likert 1-4.',
        target: 'action'
      }
    ]
  },

  komponen: {
    title: 'Komponen Penilaian & Rubrik',
    icon: 'ClipboardList',
    route: '/mk/:id/komponen',
    summary: 'Konfigurasi terperinci untuk mengatur nama tugas/komponen, alokasi persentase bobot hingga 100%, serta penetapan template rubrik institusi.',
    keyFeatures: [
      'Manajemen Bobot Interaktif: Tambah, edit nama, atau sesuaikan bobot komponen penilaian.',
      'Assign Rubrik: Hubungkan tiap komponen dengan template rubrik berstandar Likert 1-4.',
      'Validasi Status 100%: Indikator visual memastikan total bobot komponen genap 100%.'
    ],
    dosenTips: 'Klik tombol "Assign Rubrik" pada setiap komponen untuk memilih template rubrik (EPIC, Presentasi, Praktikum, Laporan).',
    mahasiswaTips: 'Perhatikan persentase bobot tiap komponen untuk mengetahui tugas mana yang memiliki kontribusi terbesar terhadap nilai akhir.',
    tourSteps: [
      {
        title: 'Indikator Total Bobot 100% ⚖️',
        description: 'Progress bar di bagian atas memvalidasi agar total bobot seluruh komponen penilaian mencapai tepat 100%.',
        target: 'weight-bar'
      },
      {
        title: 'Daftar Komponen Asesmen 📋',
        description: 'Setiap kartu komponen memuat nama evaluasi (UTS, UAS, Proyek, dll.), persentase bobot, dan template rubrik yang terpasang.',
        target: 'component-cards'
      },
      {
        title: 'Ganti Template Rubrik 💎',
        description: 'Klik tombol "Ganti Rubrik" untuk melihat kriteria penilaian Likert 1-4 atau memilih template rubrik alternatif.',
        target: 'assign-rubric'
      },
      {
        title: 'Tambah Komponen Baru ➕',
        description: 'Klik "+ Tambah Komponen" untuk menambahkan instrumen evaluasi tambahan sesuai rancangan silabus/RPS.',
        target: 'add-btn'
      }
    ]
  },

  rubrikLibrary: {
    title: 'Library Template Rubrik',
    icon: 'Sparkles',
    route: '/rubrik',
    summary: 'Koleksi instrumen rubrik penilaian terstandar berbasis 4 Dimensi EPIC serta rubrik spesifik institusional dengan deskriptor kinerja Likert 1-4.',
    keyFeatures: [
      'Framework EPIC: Evaluative Understanding (E), Predictive Reasoning (P), Intelligent Application (I), Critical Reflection (C).',
      'Skala Likert 1-4: Dilengkapi kriteria level kinerja (Sangat Baik, Baik, Cukup, Kurang).',
      'Pembuat Rubrik Mandiri: Buat template rubrik kustom sesuai kebutuhan spesifik program studi.'
    ],
    dosenTips: 'Template rubrik yang Anda buat di sini dapat digunakan kembali pada berbagai mata kuliah.',
    mahasiswaTips: 'Pelajari deskriptor indikator Likert 1-4 untuk memahami standar ekspektasi kualitas pengerjaan tugas.',
    tourSteps: [
      {
        title: 'Katalog Template Rubrik 💎',
        description: 'Jelajahi berbagai template rubrik terstandar yang siap digunakan untuk penilaian tugas, proyek, dan praktikum.',
        target: 'library-grid'
      },
      {
        title: 'Rubrik Utama 4 Dimensi EPIC 🌟',
        description: 'Instrumen evaluasi komprehensif yang mengukur pemahaman evaluatif, penalaran prediktif, aplikasi cerdas, dan refleksi kritis.',
        target: 'epic-card'
      },
      {
        title: 'Pratinjau Kriteria Likert 1-4 👁️',
        description: 'Klik pada kartu rubrik untuk melihat detail deskriptor dan indikator capaian tiap level penilaian.',
        target: 'preview-modal'
      },
      {
        title: 'Buat Rubrik Kustom ➕',
        description: 'Gunakan tombol "+ Buat Rubrik Baru" untuk merumuskan instrumen asesmen dengan jumlah dimensi bebas.',
        target: 'create-btn'
      }
    ]
  },

  scoring: {
    title: 'Lembar Penilaian (Scoring Engine)',
    icon: 'Award',
    route: '/scoring',
    summary: 'Mesin penilaian interaktif untuk Dosen — menginput skor Likert 1-4 per dimensi mahasiswa dengan feedback otomatis dan kalkulasi skor instan (0-100).',
    keyFeatures: [
      'Pilihan Skor Likert (1-4): Tombol skor cepat dengan deskripsi kriteria kinerja otomatis.',
      'Feedback Dinamis: Teks umpan balik tersusun otomatis sesuai level skor dan dapat disesuaikan manual.',
      'Kalkulasi Nilai Otomatis: Skor mentah (skala 0-100) dan predikat huruf dihitung secara real-time.',
      'Publikasi Nilai: Simpan sebagai draf atau publikasikan ke rapor analitik mahasiswa.'
    ],
    dosenTips: 'Gunakan navigasi daftar mahasiswa di sisi kiri untuk berpindah antar mahasiswa tanpa kehilangan perubahan draft.',
    mahasiswaTips: 'Penilaian dilakukan secara objektif oleh Dosen pengampu berdasarkan rubrik yang telah disosialisasikan.',
    tourSteps: [
      {
        title: 'Panel Daftar Mahasiswa 👤',
        description: 'Pilih nama mahasiswa di panel kiri untuk memulai pengisian skor penilaian.',
        target: 'student-list'
      },
      {
        title: 'Pilihan Skor Dimensi Rubrik ⭐',
        description: 'Klik angka 1, 2, 3, atau 4 pada tiap dimensi. Deskripsi indikator penilaian akan muncul secara otomatis.',
        target: 'dimension-scoring'
      },
      {
        title: 'Feedback Evaluasi Otomatis 💬',
        description: 'Sistem menyusun draf feedback evaluasi untuk mahasiswa yang dapat Anda lengkapi dengan catatan spesifik.',
        target: 'feedback-box'
      },
      {
        title: 'Simpan Draf & Publikasikan 🚀',
        description: 'Simpan sebagai draf untuk melanjutkan penilaian nanti, atau klik "Publikasikan Nilai" agar langsung tampil di rapor mahasiswa.',
        target: 'publish-btn'
      }
    ]
  },

  analytics: {
    title: 'Analisis Kompetensi & Rapor AI',
    icon: 'BarChart3',
    route: '/analytics',
    summary: 'Dasbor analitik visual komprehensif menampilkan Radar Capaian Kompetensi, Diagnostik Kausalitas AI (Bukti -> Sebab -> Dampak -> Solusi), dan Ekspor PDF A4.',
    keyFeatures: [
      'Radar Kompetensi Dinamis: Grafik radar yang beradaptasi secara otomatis dengan jumlah dimensi rubrik aktif.',
      'EPIC Learning Intelligence AI: Diagnosis berbasis kausalitas data nyata dengan diferensiasi MK Pendidikan vs Industri.',
      'Tabel Capaian Komponen: Rincian skor berbobot lengkap dengan baris simpulan Nilai Akhir dan Predikat.',
      'Cetak Laporan PDF 1 Halaman A4: Dokumen resmi terstruktur standar institusi siap cetak.'
    ],
    dosenTips: 'Gunakan diagnosis AI untuk mengidentifikasi learning gap spesifik dan merancang intervensi pengayaan kelas.',
    mahasiswaTips: 'Amati bentuk grafik radar Anda — sisi yang paling menonjol mencerminkan keunggulan kompetensi utama Anda.',
    tourSteps: [
      {
        title: 'Profil Eksekutif & Nilai Akhir 🏆',
        description: 'Menampilkan ringkasan Nilai Akhir Terbobot (0-100), Predikat Grade Huruf (A, AB, B, dst.), dan Status Kelulusan.',
        target: 'score-hero'
      },
      {
        title: 'Radar Capaian Kompetensi 🕸️',
        description: 'Visualisasi grafik radar dinamis yang memetakan level penguasaan kompetensi per dimensi rubrik.',
        target: 'radar-chart'
      },
      {
        title: 'EPIC Learning Intelligence & Diagnostics 🧠',
        description: 'Analisis cerdas kausalitas berbasis data riil: Faktor Pendukung, Akar Masalah (Sebab), Risiko (Dampak), dan Rekomendasi Solusi.',
        target: 'ai-diagnostics'
      },
      {
        title: 'Cetak Laporan Rapor PDF 🖨️',
        description: 'Klik "Cetak Laporan PDF" untuk menghasilkan dokumen A4 satu halaman resmi berstandar institusional.',
        target: 'print-btn'
      }
    ]
  },

  comments: {
    title: 'Forum Komunikasi & Catatan Evaluasi',
    icon: 'MessageSquare',
    route: '/mk/:id/comments',
    summary: 'Ruang interaksi akademik untuk menerbitkan Pengumuman Broadcast Kelas serta memberikan Catatan Feedback Evaluasi Privat 1-on-1.',
    keyFeatures: [
      'Dual Scope: Kirim pengumuman terbuka untuk seluruh kelas atau catatan privat khusus satu mahasiswa.',
      'Rich Text Formatter: Format teks dengan cetak tebal, miring, poin daftar, kutipan, dan blok kode.',
      'Threaded Replies: Diskusi bersarang yang rapi dengan indikator peran Dosen vs Mahasiswa.'
    ],
    dosenTips: 'Pilih opsi "Catatan Privat 1-on-1" untuk memberikan feedback pembinaan personal yang hanya dapat dibaca oleh mahasiswa yang dituju.',
    mahasiswaTips: 'Gunakan kolom balasan untuk berkonsultasi langsung dengan dosen mengenai feedback tugas Anda.',
    tourSteps: [
      {
        title: 'Composer Pesan Akademik ✍️',
        description: 'Tuliskan pengumuman kelas atau catatan feedback evaluasi menggunakan bilah pemformat teks lengkap.',
        target: 'composer'
      },
      {
        title: 'Pilihan Audiens (Broadcast vs Privat) 🔒',
        description: 'Pilih "Pengumuman Broadcast" untuk seluruh kelas, atau "Catatan Privat 1-on-1" yang hanya dapat dibaca oleh mahasiswa terpilih.',
        target: 'audience'
      },
      {
        title: 'Filter & Penyaringan Diskusi 🗂️',
        description: 'Gunakan tab filter untuk menyaring tampilan: Semua Diskusi, Pengumuman Broadcast, atau Catatan Privat.',
        target: 'filter-tabs'
      },
      {
        title: 'Balas Diskusi (Threaded Reply) 💬',
        description: 'Klik tombol "Balas" pada setiap utas pesan untuk menanggapi komentar secara terstruktur.',
        target: 'reply-btn'
      }
    ]
  },

  notifications: {
    title: 'Pusat Notifikasi & Aktivitas',
    icon: 'Bell',
    route: '/notifications',
    summary: 'Pusat monitoring seluruh aktivitas sistem — publikasi nilai baru, catatan komentar dari dosen, pengumuman kelas, dan status pengarsipan notifikasi.',
    keyFeatures: [
      'Filter Kategori: Semua, Nilai & Asesmen, Komentar & Diskusi, Informasi Akademik, serta Terarsip.',
      'Sistem Pengarsipan (Archive & Restore): Mengarsipkan notifikasi lama tanpa menghapus riwayat secara permanen.',
      'Navigasi Langsung: Klik notifikasi untuk langsung menuju ke laman rapor, penilaian, atau forum diskusi.'
    ],
    dosenTips: 'Klik notifikasi komentar untuk langsung membuka utas diskusi akademik yang bersangkutan.',
    mahasiswaTips: 'Notifikasi publikasi nilai akan langsung mengarahkan Anda ke Rapor Analitik Capaian Anda.',
    tourSteps: [
      {
        title: 'Pusat Notifikasi Terpusat 🔔',
        description: 'Pantau seluruh pembaruan aktivitas nilai dan diskusi akademik yang terhubung dengan akun Anda.',
        target: 'header'
      },
      {
        title: 'Filter Kategori Notifikasi 📑',
        description: 'Saring notifikasi berdasarkan topik: Nilai & Asesmen, Komentar & Diskusi, atau Informasi Akademik.',
        target: 'filter-tabs'
      },
      {
        title: 'Navigasi Cerdas Sekali Klik 🎯',
        description: 'Klik pada item notifikasi untuk langsung dialihkan ke halaman rapor, lembar penilaian, atau forum diskusi terkait.',
        target: 'item-click'
      },
      {
        title: 'Manajemen & Pengarsipan 📦',
        description: 'Gunakan tombol Arsip untuk merapikan notifikasi yang sudah dibaca, atau buka tab "Terarsip" untuk memulihkannya.',
        target: 'archive-actions'
      }
    ]
  },

  userManagement: {
    title: 'Manajemen Pengguna & Peran',
    icon: 'UserCheck',
    route: '/users',
    summary: 'Modul khusus Administrator untuk mengelola akun pengguna, hak akses peran (Admin, Dosen, Guru, Mahasiswa, Siswa), dan kredensial institusi.',
    keyFeatures: [
      'Filter Peran: Klasifikasi pengguna berdasarkan Admin, Dosen, Guru SMK, Mahasiswa, atau Siswa SMK.',
      'Tambah / Edit Pengguna: Formulir pendaftaran akun baru dengan validasi data institusi.',
      'Pencarian Cepat: Menyaring pengguna berdasarkan Nama, Email, NIM, NIDN, atau NISN.'
    ],
    dosenTips: 'Fitur manajemen pengguna hanya dapat diakses oleh akun dengan hak akses Administrator.',
    mahasiswaTips: 'Halaman ini khusus untuk Administrator sistem.',
    tourSteps: [
      {
        title: 'Manajemen Pengguna Terpusat 🔑',
        description: 'Kelola seluruh pengguna platform EPIC e-Rubric dalam satu dasbor administrasi terpadu.',
        target: 'header'
      },
      {
        title: 'Filter Berdasarkan Peran (Role) 👥',
        description: 'Gunakan tab peran untuk melihat daftar Admin, Dosen (Vokasi), Guru (SMK), Mahasiswa, atau Siswa.',
        target: 'role-tabs'
      },
      {
        title: 'Pencarian Pengguna 🔍',
        description: 'Ketik nama, alamat email, NIM, atau NIDN pada bilah pencarian untuk menemukan pengguna spesifik.',
        target: 'search-bar'
      },
      {
        title: 'Daftarkan Pengguna Baru ➕',
        description: 'Klik tombol "+ Tambah Pengguna Baru" untuk mendaftarkan akun baru dengan peran dan nomor induk yang sesuai.',
        target: 'add-user-btn'
      }
    ]
  },

  auditLog: {
    title: 'Audit Activity Logs',
    icon: 'Shield',
    route: '/audit',
    summary: 'Catatan aktivitas keamanan dan transparansi operasional sistem secara real-time (Audit Trail) untuk melacak perubahan nilai dan administrasi.',
    keyFeatures: [
      'Pencatatan Permanen: Pelacakan aksi penting seperti finalisasi nilai, pembukaan remedial, perubahan draf, dan login.',
      'Identitas Evaluator & Target: Menampilkan nama pengguna, email, target mahasiswa, alamat IP, dan timestamp presisi.',
      'Penyaringan Jenis Aksi: Filter log berdasarkan kategori tindakan keamanan.'
    ],
    dosenTips: 'Gunakan audit log untuk memverifikasi riwayat riil perubahan nilai atau draf penilaian yang telah Anda buat.',
    mahasiswaTips: 'Audit log memastikan seluruh proses penilaian di platform ini tercatat secara aman, obyektif, dan transparan.',
    tourSteps: [
      {
        title: 'Transparansi & Audit Trail 🛡️',
        description: 'Setiap aksi penilaian dan perubahan data di dalam sistem dicatat secara otomatis demi akuntabilitas.',
        target: 'header'
      },
      {
        title: 'Penyaringan Jenis Aksi 🔍',
        description: 'Saring riwayat aktivitas berdasarkan kategori: Lock Final Score, Remedial Open, Save Draft, atau Sent Analytics.',
        target: 'action-filter'
      },
      {
        title: 'Tabel Rekaman Aktivitas 📋',
        description: 'Menampilkan rincian waktu (timestamp), nama evaluator, jenis aksi, target siswa, serta alamat IP client.',
        target: 'logs-table'
      },
      {
        title: 'Segarkan & Sinkronisasi 🔄',
        description: 'Klik tombol "Segarkan" untuk memuat log aktivitas terbaru dari penyimpanan server.',
        target: 'refresh-btn'
      }
    ]
  }
};

/**
 * Helper function to find page guide by current URL path
 */
export const getGuideByPath = (pathname) => {
  if (!pathname) return PAGE_GUIDES.dashboard;
  const p = pathname.toLowerCase();

  if (p.includes('/scoring')) return PAGE_GUIDES.scoring;
  if (p.includes('/komponen')) return PAGE_GUIDES.komponen;
  if (p.includes('/students')) return PAGE_GUIDES.studentList;
  if (p.includes('/comments')) return PAGE_GUIDES.comments;
  if (p.includes('/analytics')) return PAGE_GUIDES.analytics;
  if (p.includes('/mk/create') || p.includes('/kelas/create')) return PAGE_GUIDES.createMK;
  if (p.match(/\/mk\/[^\/]+$/) || p.match(/\/kelas\/[^\/]+$/)) return PAGE_GUIDES.mkOverview;
  if (p.startsWith('/mk') || p.startsWith('/kelas')) return PAGE_GUIDES.mkList;
  if (p.startsWith('/rubrik')) return PAGE_GUIDES.rubrikLibrary;
  if (p.startsWith('/users')) return PAGE_GUIDES.userManagement;
  if (p.startsWith('/audit')) return PAGE_GUIDES.auditLog;
  if (p.startsWith('/notifications')) return PAGE_GUIDES.notifications;
  return PAGE_GUIDES.dashboard;
};
