/**
 * Format date strings to Indonesian format (e.g. 09 Juni 2026)
 * @param {string|Date} date 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('id-ID', options);
}

/**
 * Format role strings to localized user-friendly titles
 * @param {string} role 
 * @returns {string}
 */
export function formatRole(role) {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'Admin / Kaprog';
    case 'dosen':
    case 'guru':
      return 'Dosen / Guru';
    case 'mahasiswa':
    case 'siswa':
      return 'Mahasiswa / Siswa';
    default:
      return 'Pengguna';
  }
}

/**
 * Format decimal numbers to percentages (e.g. 0.2 -> 20%)
 * @param {number} decimal 
 * @returns {string}
 */
export function formatPercent(decimal) {
  if (decimal === undefined || decimal === null) return '0%';
  return `${Math.round(Number(decimal) * 100)}%`;
}

export { 
  GRADE_SCALE, 
  getGradeInfo, 
  getGradeLetter, 
  getGradeDesc, 
  getGradeColor, 
  getGradeBg 
} from './gradeHelper';

/**
 * Capitalize first letter of each word (Title Case)
 * e.g. "praktikum akuntansi dasar" -> "Praktikum Akuntansi Dasar"
 * @param {string} str 
 * @returns {string}
 */
export function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

/**
 * Capitalize only the first letter of the sentence/string
 * @param {string} str 
 * @returns {string}
 */
export function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

