import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { calculateFinalScore, detectFocusArea } from '@/utils/scoringEngine';

const MOCK_ASSESSMENTS_KEY = 'epic_mock_assessments';

export function useScoring() {
  const [isLoading, setIsLoading] = useState(false);
  const { isMock, profile } = useAuthStore();
  const { addToast } = useUiStore();

  const writeMockAuditLog = useCallback((actionType, studentId) => {
    try {
      const localLogs = localStorage.getItem('epic_mock_audit_logs');
      const logs = localLogs ? JSON.parse(localLogs) : [];
      
      const localStudents = localStorage.getItem('epic_mock_students');
      const students = localStudents ? JSON.parse(localStudents) : [];
      
      const allStudents = [
        { id: 'siswa-1', full_name: 'Ahmad Rifai' },
        { id: 'siswa-2', full_name: 'Citra Lestari' },
        { id: 'siswa-3', full_name: 'Dewi Sartika' },
        { id: 'mock-siswa-uuid', full_name: 'Feri Irawan' },
        ...students
      ];
      
      const student = allStudents.find(s => s.id === studentId) || { full_name: 'Siswa' };

      const newLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        user_email: (profile?.role || 'guru') + '@epic.id',
        user_name: profile?.full_name || 'Evaluator',
        action_type: actionType,
        target_student: student.full_name,
        ip_address: '192.168.10.45',
        created_at: new Date().toISOString()
      };

      logs.unshift(newLog);
      localStorage.setItem('epic_mock_audit_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error writing mock audit log:', e);
    }
  }, [profile]);

  const fetchAssessment = useCallback(async (studentId, projectId) => {
    setIsLoading(true);
    try {
      if (isMock) {
        // Read from local storage mock table
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        const assessments = localData ? JSON.parse(localData) : [];
        // Find matching student + project assessment
        const match = assessments.find(
          (a) => a.student_id === studentId && (projectId ? a.project_name === projectId : true)
        );
        return match || null;
      } else {
        // Fetch from Supabase
        let query = supabase
          .from('assessments')
          .select('*')
          .eq('student_id', studentId);
          
        if (projectId) {
          query = query.eq('project_name', projectId);
        }
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for no rows returned
        return data || null;
      }
    } catch (error) {
      console.error('Error fetching assessment:', error.message);
      addToast('Gagal memuat detail penilaian: ' + error.message, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  const saveAssessmentDraft = async ({
    id,
    studentId,
    classId,
    projectName,
    rubricTemplateId,
    scores,
    feedbacks,
    weights
  }) => {
    setIsLoading(true);
    try {
      const finalScore = calculateFinalScore(scores, weights);
      const focusArea = detectFocusArea(scores, weights);

      const payload = {
        student_id: studentId,
        class_id: classId,
        project_name: projectName,
        rubric_template_id: rubricTemplateId,
        evaluator_id: profile?.id || 'mock-evaluator-uuid',
        status: 'DRAFT',
        is_editable: true,
        score_e: scores.E,
        score_p: scores.P,
        score_i: scores.I,
        score_c: scores.C,
        score_pe: scores.PE,
        feedback_e: feedbacks.E,
        feedback_p: feedbacks.P,
        feedback_i: feedbacks.I,
        feedback_c: feedbacks.C,
        feedback_pe: feedbacks.PE,
        final_score: finalScore,
        focus_area: focusArea,
        updated_at: new Date().toISOString()
      };

      if (isMock) {
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        const assessments = localData ? JSON.parse(localData) : [];
        
        let existingIndex = -1;
        if (id) {
          existingIndex = assessments.findIndex(a => a.id === id);
        } else {
          existingIndex = assessments.findIndex(
            a => a.student_id === studentId && a.project_name === projectName
          );
        }

        let savedRecord;
        if (existingIndex > -1) {
          // Update
          savedRecord = { ...assessments[existingIndex], ...payload };
          assessments[existingIndex] = savedRecord;
        } else {
          // Insert
          savedRecord = { 
            ...payload, 
            id: 'assess-' + Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString(),
            revision_count: 0
          };
          assessments.push(savedRecord);
        }

        localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(assessments));
        writeMockAuditLog('CREATE_DRAFT', studentId);
        addToast('Draf penilaian berhasil disimpan (Local Mode)!', 'success');
        return savedRecord;
      } else {
        // Supabase Save (Upsert based on student_id + project_name or ID)
        let result;
        if (id) {
          const { data, error } = await supabase
            .from('assessments')
            .update(payload)
            .eq('id', id)
            .select();
          if (error) throw error;
          result = data[0];
        } else {
          // Try to upsert
          const { data, error } = await supabase
            .from('assessments')
            .upsert({
              ...payload,
              revision_count: 0
            }, { onConflict: 'student_id,project_name' })
            .select();
          if (error) throw error;
          result = data[0];
        }

        addToast('Draf penilaian berhasil disimpan ke database!', 'success');
        return result;
      }
    } catch (error) {
      console.error('Error saving assessment draft:', error.message);
      addToast('Gagal menyimpan draf: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeAssessment = async (id, scores, feedbacks, weights) => {
    setIsLoading(true);
    try {
      const finalScore = calculateFinalScore(scores, weights);
      const focusArea = detectFocusArea(scores, weights);

      // Validate all scores are filled
      for (const key of ['E', 'P', 'I', 'C', 'PE']) {
        if (!scores[key]) {
          throw new Error(`Dimensi ${key} belum diberi nilai Likert.`);
        }
      }

      const updatePayload = {
        status: 'FINALIZED',
        is_editable: false,
        score_e: scores.E,
        score_p: scores.P,
        score_i: scores.I,
        score_c: scores.C,
        score_pe: scores.PE,
        feedback_e: feedbacks.E,
        feedback_p: feedbacks.P,
        feedback_i: feedbacks.I,
        feedback_c: feedbacks.C,
        feedback_pe: feedbacks.PE,
        final_score: finalScore,
        focus_area: focusArea,
        finalized_at: new Date().toISOString()
      };

      if (isMock) {
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        const assessments = localData ? JSON.parse(localData) : [];
        const index = assessments.findIndex(a => a.id === id);
        
        if (index === -1) throw new Error('Penilaian tidak ditemukan.');
        
        const finalizedRecord = { ...assessments[index], ...updatePayload };
        assessments[index] = finalizedRecord;
        
        localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(assessments));
        writeMockAuditLog('FINALIZE_SCORE', finalizedRecord.student_id);
        addToast('Penilaian berhasil difinalisasi! Data dikunci (Local Mode).', 'success');
        return finalizedRecord;
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .update(updatePayload)
          .eq('id', id)
          .select();

        if (error) throw error;
        addToast('Penilaian berhasil difinalisasi! Data dikunci.', 'success');
        return data[0];
      }
    } catch (error) {
      console.error('Error finalizing assessment:', error.message);
      addToast('Gagal finalisasi penilaian: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendToAnalytics = async (id) => {
    setIsLoading(true);
    try {
      const updatePayload = {
        status: 'SENT_TO_ANALYTICS',
        sent_at: new Date().toISOString()
      };

      if (isMock) {
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        const assessments = localData ? JSON.parse(localData) : [];
        const index = assessments.findIndex(a => a.id === id);
        
        if (index === -1) throw new Error('Penilaian tidak ditemukan.');
        
        const record = { ...assessments[index], ...updatePayload };
        assessments[index] = record;
        
        localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(assessments));
        writeMockAuditLog('SENT_TO_ANALYTICS', record.student_id);
        addToast('Hasil terkirim ke Learning Analytics & Rapor Siswa!', 'success');
        return record;
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .update(updatePayload)
          .eq('id', id)
          .select();

        if (error) throw error;
        addToast('Hasil terkirim ke Learning Analytics & Rapor Siswa!', 'success');
        return data[0];
      }
    } catch (error) {
      console.error('Error sending to analytics:', error.message);
      addToast('Gagal mengirim hasil: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reopenAssessment = async (id) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        const assessments = localData ? JSON.parse(localData) : [];
        const index = assessments.findIndex(a => a.id === id);
        
        if (index === -1) throw new Error('Penilaian tidak ditemukan.');
        
        const record = {
          ...assessments[index],
          status: 'DRAFT',
          is_editable: true,
          revision_count: (assessments[index].revision_count || 0) + 1,
          updated_at: new Date().toISOString()
        };
        assessments[index] = record;
        
        localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(assessments));
        writeMockAuditLog('REOPEN_REMEDIAL', record.student_id);
        addToast('Penilaian dibuka kembali untuk remedial (Local Mode)!', 'success');
        return record;
      } else {
        // Read current revision count
        const { data: currentRecord, error: readError } = await supabase
          .from('assessments')
          .select('revision_count')
          .eq('id', id)
          .single();
          
        if (readError) throw readError;

        const { data, error } = await supabase
          .from('assessments')
          .update({
            status: 'DRAFT',
            is_editable: true,
            revision_count: (currentRecord.revision_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) throw error;
        addToast('Penilaian dibuka kembali untuk remedial!', 'success');
        return data[0];
      }
    } catch (error) {
      console.error('Error reopening assessment:', error.message);
      addToast('Gagal membuka kembali penilaian: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchAssessment,
    saveAssessmentDraft,
    finalizeAssessment,
    sendToAnalytics,
    reopenAssessment
  };
}
