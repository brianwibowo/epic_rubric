import { create } from 'zustand';

/**
 * Zustand Store for Scoring Session (PRD v2.0)
 * Supports dynamic N dimensions stored in JSONB format.
 */
export const useScoringStore = create((set, get) => ({
  scoreId: null,
  komponenId: null,
  mkId: null,
  student: null,
  dimensions: [], // [{ code, name, weight, feedback_1..4 }]
  scores: {},     // { E: 3, P: 4, ... }
  feedbacks: {},  // { E: "...", P: "..." }
  status: 'DRAFT',
  isDirty: false,

  initSession: ({ scoreId, komponenId, mkId, student, dimensions = [], initialScores = {}, initialFeedbacks = {}, status = 'DRAFT' }) => {
    const scoresMap = {};
    const feedbacksMap = {};

    dimensions.forEach(d => {
      scoresMap[d.code] = initialScores[d.code] !== undefined ? initialScores[d.code] : null;
      feedbacksMap[d.code] = initialFeedbacks[d.code] || '';
    });

    set({
      scoreId,
      komponenId,
      mkId,
      student,
      dimensions,
      scores: scoresMap,
      feedbacks: feedbacksMap,
      status,
      isDirty: false
    });
  },

  setScore: (dimCode, scoreValue) => {
    const { scores, feedbacks, dimensions } = get();
    const currentFb = feedbacks[dimCode] || '';
    
    // Find dimension metadata for feedback auto-fill
    const dim = dimensions.find(d => d.code === dimCode);
    let newFb = currentFb;

    if (dim) {
      const templateKey = `feedback_${scoreValue}`;
      const templateText = dim[templateKey];
      const allTemplates = [dim.feedback_1, dim.feedback_2, dim.feedback_3, dim.feedback_4].filter(Boolean);

      if (!currentFb || allTemplates.includes(currentFb)) {
        newFb = templateText || '';
      }
    }

    set({
      scores: { ...scores, [dimCode]: scoreValue },
      feedbacks: { ...feedbacks, [dimCode]: newFb },
      isDirty: true
    });
  },

  setFeedback: (dimCode, feedbackText) => {
    set((state) => ({
      feedbacks: { ...state.feedbacks, [dimCode]: feedbackText },
      isDirty: true
    }));
  },

  clearSession: () => {
    set({
      scoreId: null,
      komponenId: null,
      mkId: null,
      student: null,
      dimensions: [],
      scores: {},
      feedbacks: {},
      status: 'DRAFT',
      isDirty: false
    });
  }
}));
