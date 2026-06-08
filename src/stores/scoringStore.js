import { create } from 'zustand';
import { getFeedbackTemplate, FEEDBACK_TEMPLATES } from '@/utils/feedbackTemplates';

const emptyScores = { E: null, P: null, I: null, C: null, PE: null };
const emptyFeedbacks = { E: '', P: '', I: '', C: '', PE: '' };

export const useScoringStore = create((set, get) => ({
  assessmentId: null,
  student: null,
  classId: null,
  projectName: '',
  rubricTemplateId: null,
  scores: { ...emptyScores },
  feedbacks: { ...emptyFeedbacks },
  weights: { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 },
  status: 'DRAFT',
  isDirty: false,

  initSession: (assessment, currentWeights, studentObj, classIdStr, projectStr) => {
    if (assessment) {
      set({
        assessmentId: assessment.id,
        student: studentObj || { id: assessment.student_id, full_name: 'Siswa' },
        classId: assessment.class_id || classIdStr,
        projectName: assessment.project_name || projectStr,
        rubricTemplateId: assessment.rubric_template_id,
        scores: {
          E: assessment.score_e,
          P: assessment.score_p,
          I: assessment.score_i,
          C: assessment.score_c,
          PE: assessment.score_pe
        },
        feedbacks: {
          E: assessment.feedback_e || '',
          P: assessment.feedback_p || '',
          I: assessment.feedback_i || '',
          C: assessment.feedback_c || '',
          PE: assessment.feedback_pe || ''
        },
        weights: currentWeights || {
          E: assessment.weight_e || 0.2,
          P: assessment.weight_p || 0.2,
          I: assessment.weight_i || 0.2,
          C: assessment.weight_c || 0.2,
          PE: assessment.weight_pe || 0.2
        },
        status: assessment.status || 'DRAFT',
        isDirty: false
      });
    } else {
      // Create new session
      set({
        assessmentId: null,
        student: studentObj,
        classId: classIdStr,
        projectName: projectStr || 'Praktikum Buku Jurnal',
        rubricTemplateId: null,
        scores: { ...emptyScores },
        feedbacks: { ...emptyFeedbacks },
        weights: currentWeights || { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 },
        status: 'DRAFT',
        isDirty: false
      });
    }
  },

  setScore: (dimension, score) => {
    const { scores, feedbacks } = get();
    const previousScore = scores[dimension];
    const currentFeedback = feedbacks[dimension] || '';
    
    // Auto-populate feedback logic (PRD Sec 4.1.3 & US-1 AC-1/AC-2)
    // We update the feedback only if:
    // 1. It is currently empty
    // 2. Or it is currently equal to the template text of the PREVIOUS score of this dimension
    // 3. Or it is currently equal to one of the templates for this dimension (meaning it wasn't customized yet)
    const templatesForDimension = Object.values(FEEDBACK_TEMPLATES[dimension] || {});
    const isDefaultTemplate = currentFeedback === '' || 
      (previousScore && currentFeedback === getFeedbackTemplate(dimension, previousScore)) ||
      templatesForDimension.includes(currentFeedback);

    let newFeedback = currentFeedback;
    if (isDefaultTemplate) {
      newFeedback = getFeedbackTemplate(dimension, score);
    }

    set({
      scores: {
        ...scores,
        [dimension]: score
      },
      feedbacks: {
        ...feedbacks,
        [dimension]: newFeedback
      },
      isDirty: true
    });
  },

  setFeedback: (dimension, feedbackText) => {
    set((state) => ({
      feedbacks: {
        ...state.feedbacks,
        [dimension]: feedbackText
      },
      isDirty: true
    }));
  },

  clearSession: () => {
    set({
      assessmentId: null,
      student: null,
      classId: null,
      projectName: '',
      rubricTemplateId: null,
      scores: { ...emptyScores },
      feedbacks: { ...emptyFeedbacks },
      weights: { E: 0.2, P: 0.2, I: 0.2, C: 0.2, PE: 0.2 },
      status: 'DRAFT',
      isDirty: false
    });
  }
}));
