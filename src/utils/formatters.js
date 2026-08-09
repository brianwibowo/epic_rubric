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

/**
 * Convert numeric score (0-100) to Letter Grade
 * @param {number} score 
 * @returns {string} 'A' | 'B' | 'C' | 'D' | '-'
 */
export function getGradeLetter(score) {
  if (score === null || score === undefined || isNaN(score)) return '-';
  const s = Number(score);
  if (s >= 85) return 'A';
  if (s >= 70) return 'B';
  if (s >= 55) return 'C';
  return 'D';
}
