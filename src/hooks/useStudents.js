import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const MOCK_STUDENTS_KEY = 'epic_mock_students';
const MOCK_ENROLLMENTS_KEY = 'epic_mock_enrollments';

const INITIAL_MOCK_STUDENTS = [
  { id: 'siswa-1', full_name: 'Ahmad Rifai', nisn: '0081234567', role: 'siswa' },
  { id: 'siswa-2', full_name: 'Citra Lestari', nisn: '0082345678', role: 'siswa' },
  { id: 'siswa-3', full_name: 'Dewi Sartika', nisn: '0083456789', role: 'siswa' },
  { id: 'mock-siswa-uuid', full_name: 'Feri Irawan', nisn: '0087654321', role: 'siswa' }
];

export function useStudents() {
  const [isLoading, setIsLoading] = useState(false);
  const { isMock } = useAuthStore();
  const { addToast } = useUiStore();

  const fetchClassRoster = useCallback(async (classId) => {
    setIsLoading(true);
    try {
      if (isMock) {
        let localData = localStorage.getItem(MOCK_STUDENTS_KEY);
        if (!localData) {
          localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(INITIAL_MOCK_STUDENTS));
          localData = JSON.stringify(INITIAL_MOCK_STUDENTS);
        }
        return JSON.parse(localData);
      } else {
        // Fetch class enrollment profiles from Supabase
        const { data, error } = await supabase
          .from('class_enrollments')
          .select(`
            profiles (
              id,
              full_name,
              nisn,
              avatar_url,
              role
            )
          `)
          .eq('class_id', classId);

        if (error) throw error;
        // Map nested structures
        return (data || []).map(d => d.profiles);
      }
    } catch (error) {
      console.error('Error fetching roster:', error.message);
      addToast('Gagal memuat roster siswa: ' + error.message, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  const bulkImportStudents = useCallback(async (classId, studentsList) => {
    setIsLoading(true);
    try {
      // Validate array
      if (!Array.isArray(studentsList) || studentsList.length === 0) {
        throw new Error('Data siswa kosong atau format salah.');
      }

      if (isMock) {
        const localData = localStorage.getItem(MOCK_STUDENTS_KEY) || JSON.stringify(INITIAL_MOCK_STUDENTS);
        const currentStudents = JSON.parse(localData);

        const newStudents = studentsList.map(s => ({
          id: 'siswa-' + Math.random().toString(36).substring(2, 9),
          full_name: s.nama,
          nisn: String(s.nisn),
          role: 'siswa',
          created_at: new Date().toISOString()
        }));

        const combined = [...currentStudents, ...newStudents];
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(combined));
        
        addToast(`Berhasil mengimpor ${newStudents.length} siswa baru (Local Mode)!`, 'success');
        return newStudents;
      } else {
        // Real Supabase import is complex:
        // 1. Bulk insert users into auth table (can only be done in auth schema by Admin)
        // or we upsert profiles records for existing SSO users.
        // For MVP, we insert records directly into public.profiles as stub accounts
        // and link them in class_enrollments.
        const inserts = studentsList.map(s => ({
          id: crypto.randomUUID(), // generated client-side or handled by postgres
          full_name: s.nama,
          nisn: String(s.nisn),
          role: 'siswa'
        }));

        const { data, error } = await supabase
          .from('profiles')
          .insert(inserts)
          .select();

        if (error) throw error;

        // Insert into enrollments
        const enrollments = data.map(profile => ({
          class_id: classId,
          student_id: profile.id
        }));

        const { error: enrollError } = await supabase
          .from('class_enrollments')
          .insert(enrollments);

        if (enrollError) throw enrollError;

        addToast(`Berhasil mengimpor ${data.length} siswa ke database!`, 'success');
        return data;
      }
    } catch (error) {
      console.error('Error importing students:', error.message);
      addToast('Gagal impor data siswa: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  return {
    isLoading,
    fetchClassRoster,
    bulkImportStudents
  };
}
