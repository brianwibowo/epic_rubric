// ============================================================
// EPIC e-Rubric v2.0 Constants
// Fully dynamic rubric system — no fixed EPICP dimensions
// ============================================================

export const ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',      // was 'guru'
  MAHASISWA: 'mahasiswa' // was 'siswa'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin / Kaprog',
  [ROLES.DOSEN]: 'Dosen / Guru',
  [ROLES.MAHASISWA]: 'Mahasiswa / Siswa'
};

export const MK_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
};

export const MK_STATUS_LABELS = {
  [MK_STATUS.DRAFT]: 'Draft',
  [MK_STATUS.ACTIVE]: 'Aktif',
  [MK_STATUS.ARCHIVED]: 'Diarsipkan'
};

export const MK_STATUS_COLORS = {
  [MK_STATUS.DRAFT]: 'warning',
  [MK_STATUS.ACTIVE]: 'success',
  [MK_STATUS.ARCHIVED]: 'default'
};

export const SCORE_STATUS = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  PUBLISHED: 'PUBLISHED'
};

export const SCORE_STATUS_LABELS = {
  [SCORE_STATUS.DRAFT]: 'Draft',
  [SCORE_STATUS.FINALIZED]: 'Final',
  [SCORE_STATUS.PUBLISHED]: 'Dipublikasikan'
};

export const SCORE_STATUS_COLORS = {
  [SCORE_STATUS.DRAFT]: 'warning',
  [SCORE_STATUS.FINALIZED]: 'info',
  [SCORE_STATUS.PUBLISHED]: 'success'
};

// Default 6 komponen penilaian (auto-generated when MK is created)
export const DEFAULT_KOMPONEN = [
  { name: 'Proyek', urutan: 1 },
  { name: 'Partisipasi Kelas', urutan: 2 },
  { name: 'Quiz', urutan: 3 },
  { name: 'Tugas', urutan: 4 },
  { name: 'UTS', urutan: 5 },
  { name: 'UAS', urutan: 6 }
];

// Likert scale labels (used across all rubric dimensions)
export const LIKERT_SCALE = {
  1: { title: 'Kurang', desc: 'Belum menunjukkan kompetensi yang diharapkan.' },
  2: { title: 'Cukup', desc: 'Memahami dasar, namun masih banyak kekurangan.' },
  3: { title: 'Baik', desc: 'Menunjukkan kompetensi sesuai standar.' },
  4: { title: 'Sangat Baik', desc: 'Menunjukkan penguasaan yang sangat baik.' }
};

// Notification types
export const NOTIFICATION_TYPES = {
  SCORE_PUBLISHED: 'SCORE_PUBLISHED',
  NEW_COMMENT: 'NEW_COMMENT',
  COMMENT_REPLY: 'COMMENT_REPLY',
  MK_ENROLLMENT: 'MK_ENROLLMENT',
  MK_ACTIVATED: 'MK_ACTIVATED',
  SYSTEM: 'SYSTEM'
};

// Dynamic color palette for rubric dimensions (cycle through these)
export const DIMENSION_COLORS = [
  { name: 'Blue',    hex: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)',  css: 'var(--color-dim-1)' },
  { name: 'Amber',   hex: '#d97706', bg: 'rgba(217, 119, 6, 0.10)',  css: 'var(--color-dim-2)' },
  { name: 'Orange',  hex: '#ea580c', bg: 'rgba(234, 88, 12, 0.10)',  css: 'var(--color-dim-3)' },
  { name: 'Emerald', hex: '#059669', bg: 'rgba(5, 150, 105, 0.10)',  css: 'var(--color-dim-4)' },
  { name: 'Teal',    hex: '#0d9488', bg: 'rgba(13, 148, 136, 0.10)', css: 'var(--color-dim-5)' },
  { name: 'Purple',  hex: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)', css: 'var(--color-dim-6)' },
  { name: 'Rose',    hex: '#e11d48', bg: 'rgba(225, 29, 72, 0.10)',  css: 'var(--color-dim-7)' },
  { name: 'Cyan',    hex: '#0891b2', bg: 'rgba(8, 145, 178, 0.10)',  css: 'var(--color-dim-8)' },
  { name: 'Lime',    hex: '#65a30d', bg: 'rgba(101, 163, 13, 0.10)', css: 'var(--color-dim-9)' },
  { name: 'Indigo',  hex: '#4f46e5', bg: 'rgba(79, 70, 229, 0.10)', css: 'var(--color-dim-10)' }
];

/**
 * Get color for a dimension by index (cycles through palette)
 */
export function getDimensionColor(index) {
  return DIMENSION_COLORS[index % DIMENSION_COLORS.length];
}
