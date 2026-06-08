import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const MOCK_USERS_KEY = 'epic_mock_users';
const MOCK_STUDENTS_KEY = 'epic_mock_students';

const INITIAL_MOCK_USERS = [
  { id: 'mock-admin-uuid', full_name: 'Budi Santoso, M.Pd.', role: 'admin', nip: '198203112009021003', email: 'admin@epic.id', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60' },
  { id: 'mock-guru-uuid', full_name: 'Dra. Sri Wahyuni', role: 'guru', nip: '197508242000032001', email: 'guru@epic.id', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' },
  { id: 'siswa-1', full_name: 'Ahmad Rifai', role: 'siswa', nisn: '0081234567', email: 'ahmad@epic.id', class_id: 'XII-AKL-1' },
  { id: 'siswa-2', full_name: 'Citra Lestari', role: 'siswa', nisn: '0082345678', email: 'citra@epic.id', class_id: 'XII-AKL-1' },
  { id: 'siswa-3', full_name: 'Dewi Sartika', role: 'siswa', nisn: '0083456789', email: 'dewi@epic.id', class_id: 'XII-AKL-2' },
  { id: 'mock-siswa-uuid', full_name: 'Feri Irawan', role: 'siswa', nisn: '0087654321', email: 'siswa@epic.id', class_id: 'XII-AKL-1', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60' }
];

export function useUserManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { isMock } = useAuthStore();
  const { addToast } = useUiStore();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isMock) {
        let localData = localStorage.getItem(MOCK_USERS_KEY);
        if (!localData) {
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
          localData = JSON.stringify(INITIAL_MOCK_USERS);
        }
        return JSON.parse(localData);
      } else {
        // Fetch users from Supabase profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('role', { ascending: true })
          .order('full_name', { ascending: true });

        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
      addToast('Gagal memuat daftar pengguna: ' + error.message, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  const fetchClassesList = useCallback(async () => {
    try {
      if (isMock) {
        return [
          { id: 'XII-AKL-1', name: 'XII AKL 1', academic_year: '2025/2026' },
          { id: 'XII-AKL-2', name: 'XII AKL 2', academic_year: '2025/2026' },
          { id: 'XI-AKL-1', name: 'XI AKL 1', academic_year: '2025/2026' },
          { id: 'XI-AKL-2', name: 'XI AKL 2', academic_year: '2025/2026' }
        ];
      } else {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching classes:', error.message);
      return [];
    }
  }, [isMock]);

  const createUser = async (user) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
        const currentUsers = JSON.parse(localData);

        const newUser = {
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          full_name: user.full_name,
          role: user.role,
          email: user.email,
          nisn: user.role === 'siswa' ? user.nisn : null,
          nip: user.role === 'guru' || user.role === 'admin' ? user.nip : null,
          class_id: user.role === 'siswa' ? user.class_id : null,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`
        };

        const updated = [...currentUsers, newUser];
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));

        // If student, synchronize with epic_mock_students
        if (newUser.role === 'siswa') {
          const studentData = localStorage.getItem(MOCK_STUDENTS_KEY) || '[]';
          const parsedStudents = JSON.parse(studentData);
          parsedStudents.push({
            id: newUser.id,
            full_name: newUser.full_name,
            nisn: newUser.nisn,
            role: 'siswa'
          });
          localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(parsedStudents));
        }

        addToast('Pengguna baru berhasil ditambahkan (Local Mode)!', 'success');
        return newUser;
      } else {
        // Real Supabase workflow for Admins:
        // Standard user creation requires supabase auth signup. In Supabase, the trigger
        // handles creating the public.profiles record.
        // We write to profiles table as stub or notify user.
        // For security, admins can use edge functions or register them.
        // We will try inserting into profiles table directly (only works if auth setup allows it).
        // Let's do profiles insert with UUID.
        const authUserId = crypto.randomUUID(); // Stub ID or signup trigger
        const profileData = {
          id: authUserId,
          full_name: user.full_name,
          role: user.role,
          nisn: user.role === 'siswa' ? user.nisn : null,
          nip: user.role === 'guru' || user.role === 'admin' ? user.nip : null,
          class_id: user.role === 'siswa' ? user.class_id : null
        };

        const { data, error } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();

        if (error) throw error;

        // If student is assigned to class, create class enrollment mapping
        if (user.role === 'siswa' && user.class_id) {
          await supabase.from('class_enrollments').insert([
            { class_id: user.class_id, student_id: authUserId }
          ]);
        }

        addToast('Pengguna baru berhasil didaftarkan!', 'success');
        return data[0];
      }
    } catch (error) {
      console.error('Error creating user:', error.message);
      addToast('Gagal menambahkan pengguna: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId, updatedFields) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
        const currentUsers = JSON.parse(localData);

        const updated = currentUsers.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              ...updatedFields,
              // clean up attributes that don't belong to the role
              nisn: updatedFields.role === 'siswa' ? updatedFields.nisn || u.nisn : null,
              nip: updatedFields.role !== 'siswa' ? updatedFields.nip || u.nip : null,
              class_id: updatedFields.role === 'siswa' ? updatedFields.class_id || u.class_id : null
            };
          }
          return u;
        });

        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));

        // Sync with mock students if updated
        const studentData = localStorage.getItem(MOCK_STUDENTS_KEY) || '[]';
        const parsedStudents = JSON.parse(studentData);
        const updatedStudents = parsedStudents.map(s => {
          if (s.id === userId) {
            return {
              ...s,
              full_name: updatedFields.full_name || s.full_name,
              nisn: updatedFields.nisn || s.nisn
            };
          }
          return s;
        });
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(updatedStudents));

        addToast('Detail profil pengguna berhasil diperbarui!', 'success');
        return true;
      } else {
        const profileData = {
          full_name: updatedFields.full_name,
          role: updatedFields.role,
          nisn: updatedFields.role === 'siswa' ? updatedFields.nisn : null,
          nip: updatedFields.role !== 'siswa' ? updatedFields.nip : null,
          class_id: updatedFields.role === 'siswa' ? updatedFields.class_id : null
        };

        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);

        if (error) throw error;

        // If class assignment changed for student
        if (updatedFields.role === 'siswa' && updatedFields.class_id) {
          // Delete old enrollments, and insert new one
          await supabase.from('class_enrollments').delete().eq('student_id', userId);
          await supabase.from('class_enrollments').insert([
            { class_id: updatedFields.class_id, student_id: userId }
          ]);
        }

        addToast('Detail profil pengguna berhasil diperbarui di database!', 'success');
        return true;
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      addToast('Gagal memproses pembaruan: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
        const currentUsers = JSON.parse(localData);

        const filtered = currentUsers.filter(u => u.id !== userId);
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(filtered));

        // Sync with mock students
        const studentData = localStorage.getItem(MOCK_STUDENTS_KEY) || '[]';
        const parsedStudents = JSON.parse(studentData);
        const filteredStudents = parsedStudents.filter(s => s.id !== userId);
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(filteredStudents));

        addToast('Akun pengguna berhasil dihapus!', 'success');
        return true;
      } else {
        // Delete profile. CASCADE constraint will delete enrollments and scores.
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        addToast('Akun pengguna berhasil dihapus dari database!', 'success');
        return true;
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      addToast('Gagal menghapus pengguna: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchUsers,
    fetchClassesList,
    createUser,
    updateUser,
    deleteUser
  };
}
