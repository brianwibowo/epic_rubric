/**
 * EPIC e-Rubric v2.0 — Contextual Page Guides & Guided Tour Steps
 * Registry mapping every route to page explanations, key workflows, tips, and step-by-step tour guides.
 */

export const PAGE_GUIDES = {
  dashboard: {
    title: 'Dashboard Utama',
    icon: 'LayoutDashboard',
    route: '/',
    summary: 'Pusat informasi utama untuk memantau ringkasan mata kuliah, jumlah mahasiswa, ketersediaan rubrik, dan notifikasi terbaru.',
    keyFeatures: [
      'Statistik Ringkas: Total Mata Kuliah, Mahasiswa, Komponen, dan Rata-rata Nilai.',
      'Daftar MK Cepat: Klik kartu MK untuk langsung menuju ringkasan MK.',
      'Notifikasi Terbaru: Pantau pembaruan penilaian dan komentar terkini.'
    ],
    dosenTips: 'Gunakan tombol "+ Buat MK Baru" di kanan atas untuk membuat mata kuliah baru dalam 3 langkah mudah.',
    mahasiswaTips: 'Pantau nilai rata-rata Anda dan klik mata kuliah untuk melihat transparansi penilaian rubrik.',
    tourSteps: [
      {
        title: 'Selamat Datang di EPIC e-Rubric! 🚀',
        description: 'Sistem Penilaian Rubrik Berbasis Predictive Intelligence (EPIC). Mari jelajahi fitur utamanya.',
        target: 'welcome'
      },
      {
        title: 'Statistik Ringkas 📊',
        description: 'Lihat ringkasan total Mata Kuliah, Mahasiswa, Komponen Penilaian, dan Ketersediaan Rubrik secara real-time.',
        target: 'stats'
      },
      {
        title: 'Daftar Mata Kuliah 📚',
        description: 'Akses cepat ke seluruh mata kuliah yang Anda ampu atau ikuti. Klik pada kartu untuk masuk ke detail MK.',
        target: 'mk-list'
      },
      {
        title: 'Bantuan Universal ❓',
        description: 'Tekan tombol "?" ini di halaman mana pun untuk membaca panduan cepat dan memulai kembali tour ini.',
        target: 'help-btn'
      }
    ]
  },

  mkList: {
    title: 'Daftar Mata Kuliah',
    icon: 'BookOpen',
    route: '/mk',
    summary: 'Kelola seluruh mata kuliah yang Anda ampu atau ikuti dalam satu tampilan kartu yang rapi.',
    keyFeatures: [
      'Informasi Institusi: Kode MK, SKS, Semester, dan Kelas tersusun rapi.',
      'Daftar Mahasiswa: Terhubung langsung dengan roster kelas.'
    ],
    dosenTips: 'Mata kuliah yang Anda buat langsung siap digunakan untuk kegiatan perkuliahan dan penilaian.',
    mahasiswaTips: 'Anda dapat melihat seluruh mata kuliah yang telah didaftarkan oleh Dosen atau Admin.',
    tourSteps: [
      {
        title: 'Katalog Mata Kuliah 📖',
        description: 'Semua mata kuliah tersusun rapi beserta informasi SKS, kelas, dan jumlah mahasiswa terdaftar.',
        target: 'grid'
      }
    ]
  },

  createMK: {
    title: 'Buat Mata Kuliah Baru',
    icon: 'PlusCircle',
    route: '/mk/create',
    summary: 'Wizard 3 langkah untuk membuat mata kuliah, menetapkan semester, serta menentukan komponen & rubrik penilaian.',
    keyFeatures: [
      'Langkah 1: Informasi Dasar (Nama MK, Kode, Semester, Deskripsi).',
      'Langkah 2: Komponen Penilaian & Bobot (Total bobot wajib 100%).',
      'Langkah 3: Assign Rubrik (Pilih template rubrik EPIC untuk tiap komponen).'
    ],
    dosenTips: 'Sistem akan secara otomatis memvalidasi agar total bobot komponen bernilai tepat 100% (1.00).',
    mahasiswaTips: 'Halaman ini khusus untuk Dosen dan Admin.',
    tourSteps: [
      {
        title: 'Wizard Pembuatan MK 🛠️',
        description: 'Ikuti 3 langkah terstruktur untuk mengonfigurasi MK baru hingga siap dinilai.',
        target: 'wizard'
      }
    ]
  },

  mkOverview: {
    title: 'Ringkasan Mata Kuliah',
    icon: 'BookOpen',
    route: '/mk/:id',
    summary: 'Dashboard khusus untuk satu mata kuliah — berisi navigasi cepat ke komponen, mahasiswa, analitik, dan pengaturan.',
    keyFeatures: [
      'Quick Navigation: Pindah cepat ke Kelola Komponen, Daftar Mahasiswa, atau Rapor Analisis.',
      'Kode Join MK: Tampilkan & salin kode join mahasiswa.',
      'Export Data: Export seluruh nilai mahasiswa ke format Excel (.xlsx).'
    ],
    dosenTips: 'Gunakan navigasi cepat "Kelola Komponen Penilaian" untuk mengatur rubrik dan mengecek status keaktifan MK.',
    mahasiswaTips: 'Klik "Analisis Kompetensi & Rapor" untuk melihat grafik radar 5 dimensi EPIC Anda.',
    tourSteps: [
      {
        title: 'Ringkasan MK 🎯',
        description: 'Pantau informasi penting MK dan akses menu pengelolaan utama dalam satu klik.',
        target: 'header'
      }
    ]
  },

  komponen: {
    title: 'Komponen Penilaian & Rubrik',
    icon: 'ClipboardList',
    route: '/mk/:id/komponen',
    summary: 'Atur komponen penilaian (Tugas, UTS, UAS, Proyek), sesuaikan bobot hingga 100%, dan pasangkan template rubrik EPIC.',
    keyFeatures: [
      'Manajemen Bobot: Edit nama & bobot komponen secara interaktif.',
      'Assign Rubrik: Hubungkan komponen dengan template rubrik N-dimensi.',
      'Status Aktivasi MK: MK otomatis menjadi ACTIVE saat bobot 100% dan seluruh komponen berubrik.'
    ],
    dosenTips: 'Klik tombol "Assign Rubrik" pada setiap komponen untuk memilih rubrik standar (EPIC, Presentasi, Laporan, dll).',
    mahasiswaTips: 'Lihat rincian pembobotan nilai MK untuk mengetahui komponen mana yang memiliki bobot terbesar.',
    tourSteps: [
      {
        title: 'Pengaturan Komponen ⚖️',
        description: 'Pastikan total bobot indikator di atas mencapai 100% dan semua komponen memiliki rubrik yang valid.',
        target: 'komponen-table'
      }
    ]
  },

  rubrikLibrary: {
    title: 'Library Rubrik Template',
    icon: 'Sparkles',
    route: '/rubrik',
    summary: 'Kumpulan template rubrik standar EPIC N-dimensi yang siap digunakan atau disesuaikan untuk berbagai jenis penugasan.',
    keyFeatures: [
      'Model Dimensi EPIC: Evaluative Understanding (E), Predictive Reasoning (P), Intelligent Application (I), Critical Reflection (C).',
      'Kala Likert 1-4: Penilaian terstandar dengan deskriptor feedback otomatis.',
      'Buat Rubrik Custom: Tambah template rubrik baru dengan jumlah dimensi fleksibel.'
    ],
    dosenTips: 'Template rubrik dapat digunakan kembali di berbagai mata kuliah tanpa perlu membuat ulang dari awal.',
    mahasiswaTips: 'Pelajari kriteria penilaian dimensi EPIC untuk memahami standar ekspektasi tugas.',
    tourSteps: [
      {
        title: 'Perpustakaan Rubrik 💎',
        description: 'Jelajahi template rubrik terstandar yang dilengkapi deskriptor indikator kinerja Likert 1-4.',
        target: 'library'
      }
    ]
  },

  scoring: {
    title: 'Lembar Penilaian (Scoring Engine)',
    icon: 'Award',
    route: '/scoring',
    summary: 'Antarmuka khusus dosen untuk menginput skor rubrik Likert 1-4 per dimensi mahasiswa secara intuitif dan cepat.',
    keyFeatures: [
      'Pilih Skor Likert (1-4): Klik opsi 1, 2, 3, atau 4 pada tiap dimensi.',
      'Auto-Feedback: Deskripsi feedback terisi otomatis sesuai skor yang dipilih dan dapat diedit manual.',
      'Preview Raw Score: Skor mentah (skala 0-100) dihitung secara instan saat Anda menilai.',
      'Navigasi Mahasiswa: Pindah antar mahasiswa dengan satu klik tanpa kehilangan progres draft.'
    ],
    dosenTips: 'Klik "Simpan Draft" untuk menyimpan progres penilaian sementara, atau "Publikasikan" jika semua dimensi sudah terisi.',
    mahasiswaTips: 'Penilaian dilakukan oleh dosen pengampu. Nilai Anda akan tampil setelah dipublikasikan.',
    tourSteps: [
      {
        title: 'Lembar Penilaian Mahasiswa 📝',
        description: 'Pilih mahasiswa di panel kiri, lalu beri nilai Likert 1-4 pada setiap dimensi rubrik di panel kanan.',
        target: 'scoring-main'
      }
    ]
  },

  studentList: {
    title: 'Daftar Mahasiswa Terdaftar',
    icon: 'Users',
    route: '/mk/:id/students',
    summary: 'Daftar lengkap mahasiswa di mata kuliah ini beserta status progress penilaian dan nilai akhir.',
    keyFeatures: [
      'Import Excel: Tambah banyak mahasiswa sekaligus dengan mengunggah file (.xlsx / .csv).',
      'Pencarian Cepat: Cari mahasiswa berdasarkan Nama atau NIM.',
      'Export Nilai: Unduh rekapitulasi nilai akhir mahasiswa.'
    ],
    dosenTips: 'Gunakan tombol "Import Excel" untuk mendaftarkan 100+ mahasiswa dalam hitungan detik.',
    mahasiswaTips: 'Lihat posisi daftar rekan sekelas Anda.',
    tourSteps: [
      {
        title: 'Manajemen Peserta MK 👥',
        description: 'Kelola pendaftaran mahasiswa, import dari Excel, dan pantau progres penilaian tiap mahasiswa.',
        target: 'student-table'
      }
    ]
  },

  analytics: {
    title: 'Analisis Kompetensi & Rapor',
    icon: 'BarChart3',
    route: '/analytics',
    summary: 'Visualisasi analitik performa mahasiswa berbasis 5 Dimensi EPIC (Grafik Radar, Bar Chart, dan Rekomendasi AI).',
    keyFeatures: [
      'Radar Chart Kompetensi: Menganalisis kekuatan & kelemahan dimensi (E, P, I, C, PE).',
      'Rekomendasi AI: Masukan otomatis untuk peningkatan kompetensi spesifik.',
      'Cetak Rapor PDF: Unduh rapor hasil belajar mahasiswa format A4.'
    ],
    dosenTips: 'Gunakan chart ini untuk mengevaluasi dimensi mana yang paling memerlukan penguatan di kelas.',
    mahasiswaTips: 'Perhatikan grafik radar Anda — area yang paling menonjol menunjukkan keunggulan kompetensi utama Anda.',
    tourSteps: [
      {
        title: 'Analitik & Rapor 📈',
        description: 'Visualisasi grafik radar 5 dimensi EPIC memberikan gambaran komprehensif atas kompetensi mahasiswa.',
        target: 'analytics-main'
      }
    ]
  },

  userManagement: {
    title: 'Manajemen Pengguna (Admin)',
    icon: 'UserCheck',
    route: '/users',
    summary: 'Halaman khusus Administrator untuk mengelola akun pengguna, hak akses (Role: Admin, Dosen, Mahasiswa), dan status akun.',
    keyFeatures: [
      'Filter Role: Kelompokkan pengguna berdasarkan Admin, Dosen, atau Mahasiswa.',
      'Tambah/Edit Pengguna: Kelola informasi profil dan kredensial pengguna.',
      'Status Akun: Aktifkan atau nonaktifkan akses pengguna.'
    ],
    dosenTips: 'Fitur ini hanya dapat diakses oleh akun berkewenangan Administrator.',
    mahasiswaTips: 'Fitur ini hanya dapat diakses oleh Administrator.',
    tourSteps: [
      {
        title: 'Manajemen User 🔑',
        description: 'Kelola seluruh pengguna sistem, atur hak akses role, dan kelola kredensial.',
        target: 'users-table'
      }
    ]
  },

  auditLog: {
    title: 'Audit Logs (Keamanan & Aktivitas)',
    icon: 'Shield',
    route: '/audit',
    summary: 'Catatan aktivitas sistem secara real-time untuk transparansi, pelacakan perubahan data, dan keamanan (Audit Trail).',
    keyFeatures: [
      'Pencatatan Aktivitas: Login, peribahan nilai, penetapan rubrik, dan pembuatan MK.',
      'Filter Berdasarkan Pengguna & Aksi.',
      'Timestamp Presisi: Melacak kapan aktivitas terjadi.'
    ],
    dosenTips: 'Gunakan audit log untuk memverifikasi riwayat perubahan nilai atau aktivitas akun.',
    mahasiswaTips: 'Audit log memastikan seluruh proses penilaian tercatat secara transparan dan akuntabel.',
    tourSteps: [
      {
        title: 'Audit Trail 🛡️',
        description: 'Setiap aksi penting di dalam sistem dicatat secara permanen demi transparansi dan keamanan.',
        target: 'audit-list'
      }
    ]
  },

  notifications: {
    title: 'Pusat Notifikasi',
    icon: 'Bell',
    route: '/notifications',
    summary: 'Daftar notifikasi aktivitas penting seperti publikasi nilai, komentar baru, atau keanggotaan MK.',
    keyFeatures: [
      'Mark as Read: Tandai notifikasi yang sudah dibaca.',
      'Navigasi Langsung: Klik notifikasi untuk langsung menuju ke halaman terkait.'
    ],
    dosenTips: 'Notifikasi akan memberi tahu Anda saat ada komentar baru dari mahasiswa di MK yang Anda ampu.',
    mahasiswaTips: 'Anda akan menerima notifikasi otomatis saat dosen mempublikasikan nilai baru.',
    tourSteps: [
      {
        title: 'Notifikasi Sistem 🔔',
        description: 'Pantau pesan dan pembaruan penting seputar aktivitas akademik Anda.',
        target: 'notif-list'
      }
    ]
  },

  comments: {
    title: 'Diskusi & Komentar MK',
    icon: 'MessageSquare',
    route: '/mk/:id/comments',
    summary: 'Ruang komunikasi dan diskusi interaktif antara dosen dan mahasiswa mengenai mata kuliah atau tugas.',
    keyFeatures: [
      'Utas Komentar (Threaded Discussions): Balas komentar spesifik.',
      'Tag Penulis: Pembedaan jelas antara Dosen dan Mahasiswa.',
      'Dukungan Notifikasi: Pengiriman notifikasi otomatis saat ada balasan.'
    ],
    dosenTips: 'Gunakan ruang ini untuk memberikan pengumuman atau menjawab pertanyaan umum mahasiswa.',
    mahasiswaTips: 'Manfaatkan fasilitas ini untuk berkonsultasi mengenai tugas atau penjelasan rubrik penilaian.',
    tourSteps: [
      {
        title: 'Ruang Diskusi 💬',
        description: 'Kirim komentar dan berdiskusi langsung dengan dosen dan rekan mahasiswa.',
        target: 'comments-list'
      }
    ]
  }
};

/**
 * Helper function to find page guide by current URL path
 */
export const getGuideByPath = (pathname) => {
  if (pathname.includes('/scoring')) return PAGE_GUIDES.scoring;
  if (pathname.includes('/komponen')) return PAGE_GUIDES.komponen;
  if (pathname.includes('/students')) return PAGE_GUIDES.studentList;
  if (pathname.includes('/comments')) return PAGE_GUIDES.comments;
  if (pathname.includes('/analytics')) return PAGE_GUIDES.analytics;
  if (pathname.includes('/mk/create')) return PAGE_GUIDES.createMK;
  if (pathname.match(/\/mk\/[^\/]+$/)) return PAGE_GUIDES.mkOverview;
  if (pathname.startsWith('/mk')) return PAGE_GUIDES.mkList;
  if (pathname.startsWith('/rubrik')) return PAGE_GUIDES.rubrikLibrary;
  if (pathname.startsWith('/users')) return PAGE_GUIDES.userManagement;
  if (pathname.startsWith('/audit')) return PAGE_GUIDES.auditLog;
  if (pathname.startsWith('/notifications')) return PAGE_GUIDES.notifications;
  return PAGE_GUIDES.dashboard;
};
