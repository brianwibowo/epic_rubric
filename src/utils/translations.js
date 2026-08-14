/**
 * Comprehensive Multi-Language Dictionary for EPIC e-Rubric System (Indonesian 🇮🇩 & English 🇺🇸)
 */
export const TRANSLATIONS = {
  id: {
    // App & Header
    appTitle: 'EPIC e-Rubric',
    appSub: 'Standar Vokasi 2.0',
    tagline: 'Sistem Rubrik Penilaian Akuntansi Vokasi Digital',

    // Navigation
    navDashboard: 'Dasbor',
    navMK: 'Daftar Mata Kuliah',
    navKelas: 'Daftar Kelas',
    navRubric: 'Bank Rubrik',
    navAnalytics: 'Analisis & Radar',
    navStudents: 'Daftar Siswa / Mahasiswa',
    navNotifications: 'Notifikasi',
    navUsers: 'Manajemen Pengguna',
    navAudit: 'Audit Logs',
    navCredits: 'Kredit & Tim Peneliti',

    // Roles & User
    roleAdmin: 'Administrator',
    roleDosen: 'Dosen Vokasi',
    roleGuru: 'Guru SMK',
    roleMahasiswa: 'Mahasiswa',
    roleSiswa: 'Siswa SMK',
    welcomeUser: 'Selamat Datang',
    logout: 'Keluar Sesi',

    // Login Page
    loginTitle: 'Masuk Sesi',
    loginSubtitle: 'Masukkan kredensial Anda untuk mengakses portal akademik',
    emailLabel: 'Surel / Username',
    emailPlaceholder: "nama@kampus.ac.id atau 'dosen'",
    passwordLabel: 'Kata Sandi',
    loginSubmit: 'Masuk Sesi',
    quickDemoTitle: 'Akses Cepat Demo',
    quickDemoHint: 'Klik salah satu peran di bawah untuk simulasi langsung:',
    heroHeadline: 'Evaluasi Kompetensi Vokasi Akuntansi Berbasis Rubrik EPIC',
    heroSubtext: 'Sistem asesmen terstruktur dengan 4 Dimensi EPIC (Evaluative, Predictive, Integrative, Critical) serta penerbitan rapor otomatis berbasis institusi.',
    feature4Dim: '4 Dimensi EPIC',
    featureAudit: 'Audit Penilaian',
    featureExcel: 'Format Institusi (.xlsx)',

    // Admin Executive Command Center
    adminCommandCenter: 'Pusat Komando Eksekutif Administrator',
    adminSubtitle: 'Monitoring terpadu seluruh jalur institusi: SMK & Perguruan Tinggi, tata kelola pengguna, dan audit keamanan.',
    smkTrack: 'Jalur SMK',
    univTrack: 'Jalur Perguruan Tinggi',
    userDemographics: 'Distribusi Akun & Peran',
    recentAudit: 'Audit Trail & Aktivitas Terkini',
    btnManageUsers: 'Kelola Pengguna',
    btnViewAuditLogs: 'Buka Audit Logs',

    // MK List & Overview
    mkListTitle: 'Daftar Mata Kuliah',
    mkListSubtitleDosen: 'Mata kuliah yang Anda ampu semester ini',
    mkListSubtitleMhs: 'Mata kuliah yang Anda ikuti',
    btnCreateMK: 'Buat MK Baru',
    btnCreateMKFirst: 'Buat MK Pertama',
    noMKTitle: 'Belum Ada Mata Kuliah',
    noMKDescDosen: 'Buat mata kuliah pertama Anda untuk memulai proses penilaian.',
    noMKDescMhs: 'Anda belum terdaftar di mata kuliah manapun. Silakan hubungi Dosen atau Admin.',
    studentCount: 'Mahasiswa',
    codeLabel: 'Kode',
    sksLabel: 'SKS',
    classLabel: 'Kelas',

    // MK Detail Header & Tabs
    btnBackMK: 'Kembali ke Daftar MK',
    btnBackKelas: 'Kembali ke Detail Kelas',
    tabOverview: 'Ringkasan',
    tabStudents: 'Daftar Siswa & Nilai',
    tabComponents: 'Komponen & Rubrik',
    tabAnalytics: 'Analisis & Radar',
    tabComments: 'Komentar & Diskusi',

    // Actions & General
    btnExportExcel: 'Ekspor Excel (.xlsx)',
    btnExportPdf: 'Cetak Rapor A4 (.pdf)',
    btnImportExcel: 'Impor Excel',
    btnSave: 'Simpan',
    btnCancel: 'Batal',
    btnBack: 'Kembali',
    btnNext: 'Lanjut',
    searchPlaceholder: 'Cari nama, NIM, atau NISN...',
    
    // Rubric Dimensions
    dimEvaluative: 'Evaluatif',
    dimPredictive: 'Prediktif',
    dimIntegrative: 'Integratif',
    dimCritical: 'Kritis',

    // Photo Upload
    uploadPhotoTitle: 'Unggah Foto Profil',
    uploadPhotoFormats: 'Mendukung: JPG, PNG, WEBP, HEIC, HEIF (iOS)'
  },

  en: {
    // App & Header
    appTitle: 'EPIC e-Rubric',
    appSub: 'Vocational Standard 2.0',
    tagline: 'Digital Vocational Accounting Assessment SaaS Platform',

    // Navigation
    navDashboard: 'Dashboard',
    navMK: 'Course Directory',
    navKelas: 'Classes Directory',
    navRubric: 'Rubric Bank',
    navAnalytics: 'Analytics & Radar',
    navStudents: 'Student Directory',
    navNotifications: 'Notifications',
    navUsers: 'User Management',
    navAudit: 'Audit Logs',
    navCredits: 'Credits & Research Team',

    // Roles & User
    roleAdmin: 'Administrator',
    roleDosen: 'Vocational Lecturer',
    roleGuru: 'Vocational Teacher (SMK)',
    roleMahasiswa: 'University Student',
    roleSiswa: 'School Student (SMK)',
    welcomeUser: 'Welcome',
    logout: 'Sign Out',

    // Login Page
    loginTitle: 'Sign In',
    loginSubtitle: 'Enter your credentials to access the academic portal',
    emailLabel: 'Email / Username',
    emailPlaceholder: "name@campus.ac.id or 'dosen'",
    passwordLabel: 'Password',
    loginSubmit: 'Sign In',
    quickDemoTitle: 'Quick Demo Access',
    quickDemoHint: 'Click a role below for instant interactive simulation:',
    heroHeadline: 'Vocational Accounting Competency Evaluation with EPIC Rubric',
    heroSubtext: 'Structured competency assessment powered by 4 EPIC Dimensions (Evaluative, Predictive, Integrative, Critical) with automated institutional reporting.',
    feature4Dim: '4 EPIC Dimensions',
    featureAudit: 'Assessment Audit',
    featureExcel: 'Institutional Excel (.xlsx)',

    // Admin Executive Command Center
    adminCommandCenter: 'Executive Administrator Command Center',
    adminSubtitle: 'Unified institutional monitoring for Vocational High Schools (SMK) & Universities, user management, and security audit.',
    smkTrack: 'Vocational School (SMK)',
    univTrack: 'Higher Education (Univ)',
    userDemographics: 'User Demographics & Roles',
    recentAudit: 'Recent Audit Trail & Activity',
    btnManageUsers: 'Manage Users',
    btnViewAuditLogs: 'View Audit Logs',

    // MK List & Overview
    mkListTitle: 'Course Directory',
    mkListSubtitleDosen: 'Courses assigned to you this semester',
    mkListSubtitleMhs: 'Courses you are currently enrolled in',
    btnCreateMK: 'Create New Course',
    btnCreateMKFirst: 'Create First Course',
    noMKTitle: 'No Courses Found',
    noMKDescDosen: 'Create your first course to start evaluating student competencies.',
    noMKDescMhs: 'You are not enrolled in any courses yet. Please contact your Lecturer or Administrator.',
    studentCount: 'Students',
    codeLabel: 'Code',
    sksLabel: 'Credits',
    classLabel: 'Class',

    // MK Detail Header & Tabs
    btnBackMK: 'Back to Courses List',
    btnBackKelas: 'Back to Class Details',
    tabOverview: 'Overview',
    tabStudents: 'Students & Roster Scores',
    tabComponents: 'Components & Rubrics',
    tabAnalytics: 'Competency Analytics & Radar',
    tabComments: 'Comments & Discussion',

    // Actions & General
    btnExportExcel: 'Export Excel (.xlsx)',
    btnExportPdf: 'Print A4 Report (.pdf)',
    btnImportExcel: 'Import Excel',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnBack: 'Back',
    btnNext: 'Next',
    searchPlaceholder: 'Search name, NIM, or NISN...',
    
    // Rubric Dimensions
    dimEvaluative: 'Evaluative',
    dimPredictive: 'Predictive',
    dimIntegrative: 'Integrative',
    dimCritical: 'Critical',

    // Photo Upload
    uploadPhotoTitle: 'Upload Profile Photo',
    uploadPhotoFormats: 'Supports: JPG, PNG, WEBP, HEIC, HEIF (iOS)'
  }
};
