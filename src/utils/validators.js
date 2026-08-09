/**
 * Memvalidasi apakah penjumlahan bobot tepat 100% (1.00)
 * Support baik format Array [0.2, 0.3, ...] maupun Object map { dimCode: weight }.
 * 
 * @param {Array<number>|Object} weights 
 * @returns {boolean} True jika penjumlahan tepat 1.00 (dengan toleransi 0.001)
 */
export function validateWeightsSum(weights) {
  if (!weights) return false;
  
  let weightValues = [];
  if (Array.isArray(weights)) {
    weightValues = weights;
  } else if (typeof weights === 'object') {
    weightValues = Object.values(weights);
  } else {
    return false;
  }

  const sum = weightValues.reduce((acc, w) => {
    const percentage = Math.round(Number(w || 0) * 100);
    return acc + percentage;
  }, 0);
  
  return sum === 100;
}

/**
 * Memvalidasi apakah skor Likert berada pada rentang 1-4
 * @param {number|string} score 
 * @returns {boolean}
 */
export function validateLikertScore(score) {
  const s = Number(score);
  return !isNaN(s) && s >= 1 && s <= 4 && Number.isInteger(s);
}

/**
 * Validasi form pembuatan Mata Kuliah
 * @param {Object} formData { name, kode_mk, semester }
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateMataKuliahForm(formData) {
  const errors = {};

  if (!formData?.name || !formData.name.trim()) {
    errors.name = 'Nama Mata Kuliah wajib diisi';
  }

  if (!formData?.kode_mk || !formData.kode_mk.trim()) {
    errors.kode_mk = 'Kode MK wajib diisi';
  } else if (!/^[A-Za-z0-9_-]{3,10}$/.test(formData.kode_mk.trim())) {
    errors.kode_mk = 'Kode MK harus 3-10 karakter alfanumerik';
  }

  if (!formData?.semester || !formData.semester.trim()) {
    errors.semester = 'Semester wajib dipilih';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validasi komponen penilaian
 * @param {string} name 
 * @param {number} bobot 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateKomponen(name, bobot) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Nama komponen wajib diisi' };
  }
  const b = Number(bobot);
  if (isNaN(b) || b < 0 || b > 1) {
    return { valid: false, error: 'Bobot harus bernilai 0 - 1 (0% - 100%)' };
  }
  return { valid: true };
}
