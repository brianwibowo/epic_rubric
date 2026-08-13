/**
 * EPIC e-Rubric v2.0 — Academic Component Name & Code Helper
 * Maps component short codes (NAPF, NHPY, NTGS, NKUS, NUTS, NUAS) to their full names.
 * Ensures precise placement: Short codes for tight spaces (tables/headers),
 * full names for subtitles/tooltips/legends.
 */

export const KOMPONEN_MAP = {
  // Partisipasi
  'NAPF': { code: 'NAPF', name: 'Aktivitas Partisipatif' },
  'Aktivitas Partisipatif': { code: 'NAPF', name: 'Aktivitas Partisipatif' },
  'Partisipasi Kelas': { code: 'NAPF', name: 'Aktivitas Partisipatif' },
  'Partisipasi': { code: 'NAPF', name: 'Aktivitas Partisipatif' },

  // Proyek
  'NHPY': { code: 'NHPY', name: 'Hasil Proyek' },
  'Hasil Proyek': { code: 'NHPY', name: 'Hasil Proyek' },
  'Proyek': { code: 'NHPY', name: 'Hasil Proyek' },
  'Proyek Audit': { code: 'NHPY', name: 'Hasil Proyek' },

  // Tugas
  'NTGS': { code: 'NTGS', name: 'Tugas' },
  'Tugas': { code: 'NTGS', name: 'Tugas' },

  // Kuis
  'NKUS': { code: 'NKUS', name: 'Kuis' },
  'Kuis': { code: 'NKUS', name: 'Kuis' },
  'Quiz': { code: 'NKUS', name: 'Kuis' },
  'Kuis Etika': { code: 'NKUS', name: 'Kuis' },

  // UTS
  'NUTS': { code: 'NUTS', name: 'Ujian Tengah Semester' },
  'UTS': { code: 'NUTS', name: 'Ujian Tengah Semester' },
  'Ujian Tengah Semester': { code: 'NUTS', name: 'Ujian Tengah Semester' },

  // UAS
  'NUAS': { code: 'NUAS', name: 'Ujian Akhir Semester' },
  'UAS': { code: 'NUAS', name: 'Ujian Akhir Semester' },
  'Ujian Akhir Semester': { code: 'NUAS', name: 'Ujian Akhir Semester' },
  'Ujian Akhir Audit': { code: 'NUAS', name: 'Ujian Akhir Semester' }
};

/**
 * Get short code for a component (e.g., "NHPY", "NAPF", "NUTS")
 */
export function getKomponenCode(input) {
  if (!input) return '';
  return KOMPONEN_MAP[input]?.code || String(input).toUpperCase();
}

/**
 * Get full name for a component (e.g., "Hasil Proyek", "Aktivitas Partisipatif")
 */
export function getKomponenFullName(input) {
  if (!input) return '';
  return KOMPONEN_MAP[input]?.name || String(input);
}

/**
 * Get formatted label for UI tabs / headings:
 * "NHPY — Hasil Proyek" or "NHPY (Hasil Proyek)"
 */
export function getKomponenFormatted(input) {
  const code = getKomponenCode(input);
  const name = getKomponenFullName(input);
  if (code === name) return code;
  return `${code} — ${name}`;
}

/**
 * Get Excel Header column title: "NHPY (25%)" or "NAPF (25%)"
 */
export function getKomponenExcelHeader(input, bobot = 0) {
  const code = getKomponenCode(input);
  const pct = (Number(bobot) * 100).toFixed(0);
  return `${code} (${pct}%)`;
}

/**
 * Get standard legend dictionary for Excel export footer notes
 */
export function getKomponenLegends() {
  return [
    { code: 'NAPF', name: 'Aktivitas Partisipatif' },
    { code: 'NHPY', name: 'Hasil Proyek' },
    { code: 'NTGS', name: 'Tugas' },
    { code: 'NKUS', name: 'Kuis' },
    { code: 'NUTS', name: 'Ujian Tengah Semester' },
    { code: 'NUAS', name: 'Ujian Akhir Semester' }
  ];
}
