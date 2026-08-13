/**
 * EPIC e-Rubric v2.0 — Dynamic Scoring Engine
 * Supports fully custom N-dimension rubrics.
 * 
 * Hierarchy:
 *   MK → Komponen (with bobot) → Rubrik → Dimensions (with weight)
 *   Raw Score per Komponen = Σ(dimension_score × dimension_weight) × 25
 *   Weighted Score per Komponen = Raw Score × komponen_bobot
 *   Nilai Akhir MK = Σ(Weighted Scores all Komponen)
 */

/**
 * Calculate raw score for a single komponen (0-100).
 * Formula: Σ(skor_dimensi × bobot_dimensi) × 25
 * 
 * @param {Object} dimensionScores - { "E": 3, "P": 4, "CUSTOM1": 2 }
 * @param {Array} dimensions - [{ code: "E", weight: 0.30 }, { code: "P", weight: 0.40 }, ...]
 * @returns {number|null} Raw score (0-100) or null if incomplete
 */
export function calculateRawScore(dimensionScores, dimensions) {
  if (!dimensionScores || !dimensions || dimensions.length === 0) return null;

  // Check all dimensions have scores
  for (const dim of dimensions) {
    const score = dimensionScores[dim.code];
    if (score === undefined || score === null) return null;
  }

  const weightedSum = dimensions.reduce((sum, dim) => {
    const score = Number(dimensionScores[dim.code]);
    const weight = Number(dim.weight || 0);
    return sum + (score * weight);
  }, 0);

  return Math.round(Number((weightedSum * 25).toFixed(6)));
}

/**
 * Calculate weighted score for a komponen.
 * @param {number} rawScore - Raw score (0-100)
 * @param {number} komponenBobot - Komponen weight (0-1)
 * @returns {number|null}
 */
export function calculateWeightedScore(rawScore, komponenBobot) {
  if (rawScore === null || rawScore === undefined) return null;
  if (!komponenBobot) return null;
  return Number((rawScore * Number(komponenBobot)).toFixed(2));
}

/**
 * Calculate final MK score from all komponen weighted scores.
 * @param {Array} komponenScores - [{ rawScore: 85, bobot: 0.20 }, ...]
 * @returns {number|null} Final MK score (0-100) or null if any komponen incomplete
 */
export function calculateFinalMKScore(komponenScores) {
  if (!komponenScores || komponenScores.length === 0) return 0;

  let total = 0;

  for (const ks of komponenScores) {
    if (ks.rawScore === null || ks.rawScore === undefined) {
      continue;
    }
    total += calculateWeightedScore(ks.rawScore, ks.bobot) || 0;
  }

  return Math.round(total);
}

/**
 * Detect the weakest dimension (fokus perbaikan) across all komponen.
 * Finds the dimension with the lowest score. Tie-breaker: highest weight.
 * 
 * @param {Array} allScores - [{ dimensionScores: {...}, dimensions: [...] }, ...]
 * @returns {{ code: string, name: string, score: number }|null}
 */
export function detectFocusArea(allScores) {
  if (!allScores || allScores.length === 0) return null;

  // Aggregate all dimension scores
  const dimMap = {}; // { code: { totalScore: N, count: N, name: '', maxWeight: N } }

  for (const entry of allScores) {
    if (!entry.dimensionScores || !entry.dimensions) continue;
    for (const dim of entry.dimensions) {
      const score = entry.dimensionScores[dim.code];
      if (score === undefined || score === null) continue;

      if (!dimMap[dim.code]) {
        dimMap[dim.code] = { totalScore: 0, count: 0, name: dim.name, maxWeight: Number(dim.weight) };
      }
      dimMap[dim.code].totalScore += Number(score);
      dimMap[dim.code].count += 1;
      dimMap[dim.code].maxWeight = Math.max(dimMap[dim.code].maxWeight, Number(dim.weight));
    }
  }

  const entries = Object.entries(dimMap);
  if (entries.length === 0) return null;

  // Find lowest average score
  let lowest = null;
  for (const [code, data] of entries) {
    const avg = data.totalScore / data.count;
    if (!lowest || avg < lowest.avg || (avg === lowest.avg && data.maxWeight > lowest.maxWeight)) {
      lowest = { code, name: data.name, avg, score: avg, maxWeight: data.maxWeight };
    }
  }

  return lowest ? { code: lowest.code, name: lowest.name, score: Number(lowest.avg.toFixed(2)) } : null;
}

/**
 * Validate that weights (bobot) sum to exactly 1.00 (100%).
 * @param {Array<number>} weights - array of weight values
 * @param {number} tolerance - floating point tolerance (default 0.0001)
 * @returns {{ valid: boolean, total: number, diff: number }}
 */
export function validateWeightsSum(weights, tolerance = 0.001) {
  const total = weights.reduce((sum, w) => sum + Number(w || 0), 0);
  const diff = Math.abs(total - 1.0);
  return {
    valid: diff <= tolerance,
    total: Number(total.toFixed(4)),
    diff: Number(diff.toFixed(4))
  };
}

/**
 * Prepare radar chart data from a student's scores across all komponen.
 * @param {Array} komponenData - [{ name, dimensionScores, dimensions }]
 * @returns {Array} - [{ dimension: 'E', fullName: '...', score: 3.5, maxScore: 4 }]
 */
export function prepareRadarData(komponenData) {
  if (!komponenData || komponenData.length === 0) return [];

  // Aggregate dimension scores across all komponen
  const dimMap = {};
  for (const kd of komponenData) {
    if (!kd.dimensionScores || !kd.dimensions) continue;
    for (const dim of kd.dimensions) {
      const score = kd.dimensionScores[dim.code];
      if (score === undefined || score === null) continue;

      if (!dimMap[dim.code]) {
        dimMap[dim.code] = { fullName: dim.name, scores: [] };
      }
      dimMap[dim.code].scores.push(Number(score));
    }
  }

  return Object.entries(dimMap).map(([code, data]) => ({
    dimension: code,
    fullName: data.fullName,
    score: Number((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2)),
    maxScore: 4
  }));
}
