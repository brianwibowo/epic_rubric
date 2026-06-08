/**
 * Mengitung Nilai Akhir (0-100) berdasarkan skor Likert (1-4) dan bobot desimal (0-1)
 * Formula: Nilai Akhir = (Σ SkorDimensi_i * BobotDimensi_i) * 25
 * Pembulatan: Standard Math.round()
 * 
 * @param {Object} scores - Skor Likert { E: 1-4, P: 1-4, I: 1-4, C: 1-4, PE: 1-4 }
 * @param {Object} weights - Bobot desimal { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 }
 * @returns {number|null} Nilai Akhir rounded, atau null jika skor belum lengkap
 */
export function calculateFinalScore(scores, weights) {
  if (!scores || !weights) return null;
  
  const dimensions = ['E', 'P', 'I', 'C', 'PE'];
  
  // Memastikan semua skor terisi
  for (const dim of dimensions) {
    if (scores[dim] === undefined || scores[dim] === null) {
      return null;
    }
  }

  const weightedSum = dimensions.reduce((sum, dim) => {
    const score = Number(scores[dim]);
    const weight = Number(weights[dim] || 0);
    return sum + (score * weight);
  }, 0);

  return Math.round(weightedSum * 25);
}

/**
 * Mendeteksi 1 dimensi EPIC yang memiliki skor terendah.
 * Aturan tie-breaker: Jika terdapat >1 dimensi dengan skor terendah yang sama,
 * sistem mengambil dimensi yang memiliki BOBOT tertinggi.
 * 
 * @param {Object} scores - Skor Likert { E: 1-4, P: 1-4, I: 1-4, C: 1-4, PE: 1-4 }
 * @param {Object} weights - Bobot desimal { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 }
 * @returns {string|null} Kode dimensi terendah ('E', 'P', 'I', 'C', atau 'PE'), atau null jika skor belum lengkap
 */
export function detectFocusArea(scores, weights) {
  if (!scores || !weights) return null;
  
  const dimensions = ['E', 'P', 'I', 'C', 'PE'];
  
  // Memastikan semua skor terisi
  for (const dim of dimensions) {
    if (scores[dim] === undefined || scores[dim] === null) {
      return null;
    }
  }

  // Cari skor minimum
  let minScore = 5; // likert max is 4
  dimensions.forEach(dim => {
    const score = Number(scores[dim]);
    if (score < minScore) {
      minScore = score;
    }
  });

  // Filter dimensi yang memiliki skor terendah
  const tiedDimensions = dimensions.filter(dim => Number(scores[dim]) === minScore);

  if (tiedDimensions.length === 1) {
    return tiedDimensions[0];
  }

  // Jika ada tie (skor terendah sama), ambil dimensi dengan bobot tertinggi
  let highestWeightDim = tiedDimensions[0];
  let maxWeight = Number(weights[highestWeightDim] || 0);

  for (let i = 1; i < tiedDimensions.length; i++) {
    const dim = tiedDimensions[i];
    const weight = Number(weights[dim] || 0);
    if (weight > maxWeight) {
      maxWeight = weight;
      highestWeightDim = dim;
    }
  }

  return highestWeightDim;
}
