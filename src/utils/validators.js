/**
 * Memvalidasi apakah penjumlahan bobot dimensi tepat 100% (1.00)
 * Menggunakan konversi ke integer untuk menghindari error floating-point di JS.
 * 
 * @param {Object} weights - Bobot desimal { E: 0-1, P: 0-1, I: 0-1, C: 0-1, PE: 0-1 }
 * @returns {boolean} True jika penjumlahan tepat 1.00
 */
export function validateWeightsSum(weights) {
  if (!weights) return false;
  
  const dimensions = ['E', 'P', 'I', 'C', 'PE'];
  
  // Konversi masing-masing bobot ke persentase bulat (0-100)
  const sum = dimensions.reduce((acc, dim) => {
    const w = Number(weights[dim] || 0);
    // Kita bulatkan ke 2 desimal, lalu kali 100 untuk mendapatkan angka bulat 0-100
    const percentage = Math.round(w * 100);
    return acc + percentage;
  }, 0);
  
  return sum === 100;
}

/**
 * Memvalidasi apakah skor Likert berada pada rentang 1-4
 * 
 * @param {number|string} score 
 * @returns {boolean}
 */
export function validateLikertScore(score) {
  const s = Number(score);
  return !isNaN(s) && s >= 1 && s <= 4 && Number.isInteger(s);
}
