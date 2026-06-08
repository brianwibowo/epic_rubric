export const ROLES = {
  ADMIN: 'admin',
  GURU: 'guru',
  SISWA: 'siswa'
};

export const ASSESSMENT_STATUS = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  SENT_TO_ANALYTICS: 'SENT_TO_ANALYTICS'
};

export const EPIC_DIMENSIONS = {
  E: {
    code: 'E',
    name: 'Evaluative Understanding',
    label: 'Pemahaman Evaluatif',
    desc: 'Pemahaman konsep akuntansi, pencatatan transaksi, dan dasar penyesuaian.',
    color: 'var(--color-epic-e)',
    textColor: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  P: {
    code: 'P',
    name: 'Predictive Reasoning',
    label: 'Penalaran Prediktif',
    desc: 'Kemampuan memproyeksikan saldo akun, menganalisis trend, dan mengantisipasi deviasi ledger.',
    color: 'var(--color-epic-p)',
    textColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  I: {
    code: 'I',
    name: 'Intelligent Application',
    label: 'Penerapan Cerdas',
    desc: 'Penerapan standar akuntansi (SAK ETAP/EMKM) pada lembar kerja praktikum riil.',
    color: 'var(--color-epic-i)',
    textColor: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)'
  },
  C: {
    code: 'C',
    name: 'Critical Reflection',
    label: 'Refleksi Kritis',
    desc: 'Kemampuan menganalisis kesalahan neraca, melakukan audit mandiri, dan refleksi jurnal penyesuaian.',
    color: 'var(--color-epic-c)',
    textColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  PE: {
    code: 'PE',
    name: 'Professional Ethics',
    label: 'Etika Profesi',
    desc: 'Ketelitian, kerapian pelaporan keuangan, kejujuran data, dan kepatuhan prinsip objektivitas.',
    color: 'var(--color-epic-pe)',
    textColor: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.1)'
  }
};

export const DEFAULT_WEIGHTS = {
  E: 0.20,  // 20%
  P: 0.20,  // 20%
  I: 0.20,  // 20%
  C: 0.20,  // 20%
  PE: 0.20  // 20%
};

export const LIKERT_LABELS = {
  1: { title: 'Sangat Kurang', desc: 'Siswa belum menunjukkan kompetensi dasar.' },
  2: { title: 'Kurang / Cukup', desc: 'Siswa memahami dasar, namun banyak kesalahan teknis.' },
  3: { title: 'Baik', desc: 'Siswa menunjukkan kompetensi yang sesuai standar akuntansi.' },
  4: { title: 'Sangat Baik', desc: 'Siswa menunjukkan akurasi sempurna dan analisis tajam.' }
};
