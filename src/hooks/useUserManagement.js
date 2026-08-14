import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { ROLES } from '@/utils/constants';

const MOCK_USERS_KEY = 'epic_mock_users_v2';

const INITIAL_MOCK_USERS = [
  {
    id: 'mock-admin-uuid',
    full_name: 'Dr. Budi Santoso, M.Pd.',
    role: ROLES.ADMIN,
    email: 'admin@epic.id',
    nip: '198203112009021003',
    unit_info: 'Pusat Inovasi Asesmen Vokasi',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-dosen-uuid',
    full_name: 'Dra. Sri Wahyuni, M.Ak.',
    role: ROLES.DOSEN,
    email: 'dosen@epic.id',
    nidn: '197508242000032001',
    nip: '197508242000032001',
    unit_info: 'Pendidikan Akuntansi (S1/D4)',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-guru-uuid',
    full_name: 'Siti Rahmawati, S.Pd.',
    role: ROLES.GURU,
    email: 'guru@epic.id',
    nip: '198506122010012023',
    unit_info: 'Akuntansi & Keuangan Lembaga (AKL)',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-mahasiswa-uuid',
    full_name: 'Feri Irawan',
    role: ROLES.MAHASISWA,
    email: 'mahasiswa@epic.id',
    nim: '2024081001',
    unit_info: 'Kelas PE 2025 A',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-siswa-uuid',
    full_name: 'Ahmad Rifai',
    role: ROLES.SISWA,
    email: 'siswa@epic.id',
    nisn: '0081234567',
    unit_info: 'Kelas XII AKL 1',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mhs-2-uuid',
    full_name: 'Rina Permata Sari',
    role: ROLES.MAHASISWA,
    email: 'rina@epic.id',
    nim: '2024081002',
    unit_info: 'Kelas PE 2025 A',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'siswa-2-uuid',
    full_name: 'Citra Lestari',
    role: ROLES.SISWA,
    email: 'citra@epic.id',
    nisn: '0082345678',
    unit_info: 'Kelas XII AKL 1',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60'
  }
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
          nim: user.role === ROLES.MAHASISWA ? user.nim : null,
          nisn: user.role === ROLES.SISWA ? user.nisn : null,
          nidn: user.role === ROLES.DOSEN ? user.nidn : null,
          nip: user.role === ROLES.GURU || user.role === ROLES.DOSEN || user.role === ROLES.ADMIN ? user.nip : null,
          unit_info: user.unit_info || null,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`
        };

        const updated = [newUser, ...currentUsers];
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));

        addToast(`Pengguna baru (${user.full_name} sebagai ${user.role.toUpperCase()}) berhasil didaftarkan!`, 'success');
        return newUser;
      } else {
        const authUserId = crypto.randomUUID();
        const profileData = {
          id: authUserId,
          full_name: user.full_name,
          role: user.role,
          email: user.email,
          nim: user.role === ROLES.MAHASISWA ? user.nim : null,
          nisn: user.role === ROLES.SISWA ? user.nisn : null,
          nidn: user.role === ROLES.DOSEN ? user.nidn : null,
          nip: user.role === ROLES.GURU || user.role === ROLES.DOSEN || user.role === ROLES.ADMIN ? user.nip : null,
          unit_info: user.unit_info || null
        };

        const { data, error } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();

        if (error) throw error;

        addToast(`Akun ${user.full_name} berhasil didaftarkan ke sistem!`, 'success');
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
              nim: updatedFields.role === ROLES.MAHASISWA ? updatedFields.nim || u.nim : null,
              nisn: updatedFields.role === ROLES.SISWA ? updatedFields.nisn || u.nisn : null,
              nidn: updatedFields.role === ROLES.DOSEN ? updatedFields.nidn || u.nidn : null,
              nip: (updatedFields.role === ROLES.GURU || updatedFields.role === ROLES.DOSEN || updatedFields.role === ROLES.ADMIN)
                ? updatedFields.nip || u.nip
                : null,
              unit_info: updatedFields.unit_info || u.unit_info
            };
          }
          return u;
        });

        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));
        addToast('Detail informasi akun berhasil diperbarui!', 'success');
        return true;
      } else {
        const profileData = {
          full_name: updatedFields.full_name,
          role: updatedFields.role,
          email: updatedFields.email,
          nim: updatedFields.role === ROLES.MAHASISWA ? updatedFields.nim : null,
          nisn: updatedFields.role === ROLES.SISWA ? updatedFields.nisn : null,
          nidn: updatedFields.role === ROLES.DOSEN ? updatedFields.nidn : null,
          nip: (updatedFields.role === ROLES.GURU || updatedFields.role === ROLES.DOSEN || updatedFields.role === ROLES.ADMIN)
            ? updatedFields.nip
            : null,
          unit_info: updatedFields.unit_info || null
        };

        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);

        if (error) throw error;
        addToast('Perubahan data akun berhasil disimpan!', 'success');
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

        addToast('Akun pengguna berhasil dihapus!', 'info');
        return true;
      } else {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        addToast('Akun pengguna berhasil dihapus dari database!', 'info');
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
    createUser,
    updateUser,
    deleteUser
  };
}
