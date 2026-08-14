/**
 * EPIC e-Rubric v2.0 — Academic Grading Scale Standard
 *
 * | Nilai | Rentang Skor | Arti Nilai |
 * | --- | --- | --- |
 * | A   | > 85 – 100   | Baik sekali |
 * | AB  | > 80 – 85    | Lebih dari baik |
 * | B   | > 70 – 80    | Baik |
 * | BC  | > 65 – 70    | Lebih dari cukup |
 * | C   | > 60 – 65    | Cukup |
 * | CD  | > 55 – 60    | Kurang dari cukup |
 * | D   | > 50 – 55    | Kurang |
 * | E   | <= 50        | Gagal (tidak lulus) |
 */

export const GRADE_SCALE = [
  { grade: 'A', min: 85, max: 100, range: '> 85 – 100', desc: 'Baik sekali', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', isPassing: true },
  { grade: 'AB', min: 80, max: 85, range: '> 80 – 85', desc: 'Lebih dari baik', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isPassing: true },
  { grade: 'B', min: 70, max: 80, range: '> 70 – 80', desc: 'Baik', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', isPassing: true },
  { grade: 'BC', min: 65, max: 70, range: '> 65 – 70', desc: 'Lebih dari cukup', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', isPassing: true },
  { grade: 'C', min: 60, max: 65, range: '> 60 – 65', desc: 'Cukup', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', isPassing: true },
  { grade: 'CD', min: 55, max: 60, range: '> 55 – 60', desc: 'Kurang dari cukup', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', isPassing: false },
  { grade: 'D', min: 50, max: 55, range: '> 50 – 55', desc: 'Kurang', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)', isPassing: false },
  { grade: 'E', min: 0, max: 50, range: '≤ 50', desc: 'Gagal (tidak lulus)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isPassing: false },
];

/**
 * Get comprehensive grade information for a numeric score (0-100)
 * @param {number|string|null} score 
 * @returns {{ grade: string, letter: string, desc: string, color: string, bg: string, isPassing: boolean }}
 */
export function getGradeInfo(score) {
  if (score === null || score === undefined || isNaN(Number(score)) || score === '') {
    return {
      grade: '-',
      letter: '-',
      desc: 'Belum Dinilai',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      isPassing: false
    };
  }

  const s = Number(score);
  if (s > 85) return { grade: 'A', letter: 'A', desc: 'Baik sekali', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', isPassing: true };
  if (s > 80) return { grade: 'AB', letter: 'AB', desc: 'Lebih dari baik', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', isPassing: true };
  if (s > 70) return { grade: 'B', letter: 'B', desc: 'Baik', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', isPassing: true };
  if (s > 65) return { grade: 'BC', letter: 'BC', desc: 'Lebih dari cukup', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', isPassing: true };
  if (s > 60) return { grade: 'C', letter: 'C', desc: 'Cukup', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', isPassing: true };
  if (s > 55) return { grade: 'CD', letter: 'CD', desc: 'Kurang dari cukup', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', isPassing: false };
  if (s > 50) return { grade: 'D', letter: 'D', desc: 'Kurang', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)', isPassing: false };
  return { grade: 'E', letter: 'E', desc: 'Gagal (tidak lulus)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', isPassing: false };
}

export function getGradeLetter(score) {
  return getGradeInfo(score).grade;
}

export function getGradeDesc(score) {
  return getGradeInfo(score).desc;
}

export function getGradeColor(score) {
  return getGradeInfo(score).color;
}

export function getGradeBg(score) {
  return getGradeInfo(score).bg;
}
