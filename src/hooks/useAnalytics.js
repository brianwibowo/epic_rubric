import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const MOCK_ASSESSMENTS_KEY = 'epic_mock_assessments';

// Hardcoded initial stats to show if local storage is empty
const DEFAULT_MOCK_ASSESSMENTS = [
  { student_id: 'siswa-1', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Jurnal', final_score: 78, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-10T08:00:00Z' },
  { student_id: 'siswa-2', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Jurnal', final_score: 82, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-10T08:10:00Z' },
  { student_id: 'siswa-3', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Jurnal', final_score: 64, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-10T08:20:00Z' },
  { student_id: 'mock-siswa-uuid', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Jurnal', final_score: 72, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-10T08:30:00Z' },
  
  { student_id: 'siswa-1', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Besar', final_score: 84, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-24T08:00:00Z' },
  { student_id: 'siswa-2', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Besar', final_score: 89, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-24T08:10:00Z' },
  { student_id: 'siswa-3', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Besar', final_score: 75, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-24T08:20:00Z' },
  { student_id: 'mock-siswa-uuid', class_id: 'XII-AKL-1', project_name: 'Praktikum Buku Besar', final_score: 81, status: 'SENT_TO_ANALYTICS', created_at: '2026-05-24T08:30:00Z' },

  { student_id: 'siswa-1', class_id: 'XII-AKL-1', project_name: 'Praktikum Siklus Akuntansi AKL-1', final_score: 88, status: 'SENT_TO_ANALYTICS', created_at: '2026-06-08T08:00:00Z' },
  { student_id: 'siswa-2', class_id: 'XII-AKL-1', project_name: 'Praktikum Siklus Akuntansi AKL-1', final_score: 93, status: 'SENT_TO_ANALYTICS', created_at: '2026-06-08T08:10:00Z' },
  { student_id: 'siswa-3', class_id: 'XII-AKL-1', project_name: 'Praktikum Siklus Akuntansi AKL-1', final_score: 58, status: 'SENT_TO_ANALYTICS', created_at: '2026-06-08T08:20:00Z' },
  { student_id: 'mock-siswa-uuid', class_id: 'XII-AKL-1', project_name: 'Praktikum Siklus Akuntansi AKL-1', final_score: 88, status: 'SENT_TO_ANALYTICS', created_at: '2026-06-08T08:30:00Z' }
];

export function useAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const { isMock } = useAuthStore();
  const { addToast } = useUiStore();

  /**
   * Fetch macro statistics and grade distribution for a class project
   */
  const fetchClassStats = useCallback(async (classId, projectName) => {
    setIsLoading(true);
    try {
      if (isMock) {
        // Read assessments from local storage
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY);
        let assessments = localData ? JSON.parse(localData) : [];
        
        // If empty, seed default analytics dataset so charts are populated
        if (assessments.length === 0) {
          localStorage.setItem(MOCK_ASSESSMENTS_KEY, JSON.stringify(DEFAULT_MOCK_ASSESSMENTS));
          assessments = DEFAULT_MOCK_ASSESSMENTS;
        }

        // Filter by class, project and sent status
        const classAssessments = assessments.filter(
          (a) => a.class_id === classId && a.project_name === projectName && a.status === 'SENT_TO_ANALYTICS'
        );

        if (classAssessments.length === 0) {
          return {
            summary: { avg: 0, max: 0, min: 0, passingRate: 0, total: 0 },
            distribution: [
              { name: 'Remedial (<75)', count: 0 },
              { name: 'Kompeten (75-84)', count: 0 },
              { name: 'Sangat Baik (≥85)', count: 0 }
            ]
          };
        }

        const scores = classAssessments.map(a => a.final_score);
        const total = scores.length;
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / total);
        
        const passedCount = scores.filter(s => s >= 75).length;
        const passingRate = Math.round((passedCount / total) * 100);

        // Grade ranges distribution
        const ranges = {
          remedial: scores.filter(s => s < 75).length,
          kompeten: scores.filter(s => s >= 75 && s < 85).length,
          sangatBaik: scores.filter(s => s >= 85).length
        };

        const distribution = [
          { name: 'Remedial (<75)', count: ranges.remedial },
          { name: 'Kompeten (75-84)', count: ranges.kompeten },
          { name: 'Sangat Baik (≥85)', count: ranges.sangatBaik }
        ];

        return {
          summary: { avg, max, min, passingRate, total },
          distribution
        };
      } else {
        // Real Supabase analytical queries
        const { data, error } = await supabase
          .from('assessments')
          .select('final_score')
          .eq('class_id', classId)
          .eq('project_name', projectName)
          .eq('status', 'SENT_TO_ANALYTICS');

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            summary: { avg: 0, max: 0, min: 0, passingRate: 0, total: 0 },
            distribution: [
              { name: 'Remedial (<75)', count: 0 },
              { name: 'Kompeten (75-84)', count: 0 },
              { name: 'Sangat Baik (≥85)', count: 0 }
            ]
          };
        }

        const scores = data.map(d => d.final_score);
        const total = scores.length;
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / total);
        const passedCount = scores.filter(s => s >= 75).length;
        const passingRate = Math.round((passedCount / total) * 100);

        const distribution = [
          { name: 'Remedial (<75)', count: scores.filter(s => s < 75).length },
          { name: 'Kompeten (75-84)', count: scores.filter(s => s >= 75 && s < 85).length },
          { name: 'Sangat Baik (≥85)', count: scores.filter(s => s >= 85).length }
        ];

        return {
          summary: { avg, max, min, passingRate, total },
          distribution
        };
      }
    } catch (e) {
      console.error('Error fetching class stats:', e.message);
      addToast('Gagal memuat analitik kelas: ' + e.message, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  /**
   * Fetch chronological assessments list for a specific student (Progress Line Chart)
   */
  const fetchStudentTimeline = useCallback(async (studentId) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const localData = localStorage.getItem(MOCK_ASSESSMENTS_KEY) || JSON.stringify(DEFAULT_MOCK_ASSESSMENTS);
        const assessments = JSON.parse(localData);
        
        // Filter student sent assessments, sorted by date
        const timeline = assessments
          .filter(a => a.student_id === studentId && a.status === 'SENT_TO_ANALYTICS')
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(a => ({
            name: a.project_name,
            score: a.final_score,
            date: new Date(a.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            E: a.score_e || 0,
            P: a.score_p || 0,
            I: a.score_i || 0,
            C: a.score_c || 0,
            PE: a.score_pe || 0
          }));
          
        return timeline;
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .select('project_name, final_score, created_at, score_e, score_p, score_i, score_c, score_pe')
          .eq('student_id', studentId)
          .eq('status', 'SENT_TO_ANALYTICS')
          .order('created_at', { ascending: true });

        if (error) throw error;

        return (data || []).map(d => ({
          name: d.project_name,
          score: d.final_score,
          date: new Date(d.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          E: d.score_e,
          P: d.score_p,
          I: d.score_i,
          C: d.score_c,
          PE: d.score_pe
        }));
      }
    } catch (e) {
      console.error('Error fetching student timeline:', e.message);
      addToast('Gagal memuat histori perkembangan siswa: ' + e.message, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  return {
    isLoading,
    fetchClassStats,
    fetchStudentTimeline
  };
}
