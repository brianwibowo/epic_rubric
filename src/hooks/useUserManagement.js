import { useState, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { ROLES, ROLE_LABELS } from '@/utils/constants';
import { createClient } from '@supabase/supabase-js';

const MOCK_USERS_KEY = 'epic_mock_users_v2';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes('placeholder-project') && !url.includes('your-project');
};

const INITIAL_MOCK_USERS = [
  {
    id: 'mock-admin-uuid',
    full_name: 'Dr. Budi Santoso, M.Pd.',
    role: ROLES.ADMIN,
    email: 'admin@epic.id',
    password: 'password',
    nip: '198203112009021003',
    unit_info: 'Pusat Inovasi Asesmen Vokasi',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-dosen-uuid',
    full_name: 'Dra. Sri Wahyuni, M.Ak.',
    role: ROLES.DOSEN,
    email: 'dosen@epic.id',
    password: 'password',
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
    password: 'password',
    nip: '198506122010012023',
    unit_info: 'Akuntansi & Keuangan Lembaga (AKL)',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-mahasiswa-uuid',
    full_name: 'Feri Irawan',
    role: ROLES.MAHASISWA,
    email: 'mahasiswa@epic.id',
    password: 'password',
    nim: '2024081001',
    unit_info: 'Kelas PE 2025 A',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mock-siswa-uuid',
    full_name: 'Ahmad Rifai',
    role: ROLES.SISWA,
    email: 'siswa@epic.id',
    password: 'password',
    nisn: '0081234567',
    unit_info: 'Kelas XII AKL 1',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'mhs-2-uuid',
    full_name: 'Rina Permata Sari',
    role: ROLES.MAHASISWA,
    email: 'rina@epic.id',
    password: 'password',
    nim: '2024081002',
    unit_info: 'Kelas PE 2025 A',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'siswa-2-uuid',
    full_name: 'Citra Lestari',
    role: ROLES.SISWA,
    email: 'citra@epic.id',
    password: 'password',
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
      let localUsers = [];
      const localData = localStorage.getItem(MOCK_USERS_KEY);
      if (localData) {
        try {
          localUsers = JSON.parse(localData);
        } catch (e) {
          localUsers = [];
        }
      } else {
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
        localUsers = INITIAL_MOCK_USERS;
      }

      // If connected to Supabase, query profiles and gracefully merge
      if (isSupabaseConfigured()) {
        try {
          const { data: remoteProfiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('role', { ascending: true })
            .order('full_name', { ascending: true });

          if (!error && remoteProfiles && remoteProfiles.length > 0) {
            const localByEmail = new Map(localUsers.map(u => [u.email?.toLowerCase().trim(), u]));
            const localById = new Map(localUsers.map(u => [u.id, u]));

            const merged = remoteProfiles.map(rp => {
              const localMatch = localById.get(rp.id) || localByEmail.get(rp.email?.toLowerCase().trim());
              return {
                id: rp.id,
                full_name: rp.full_name,
                role: rp.role || localMatch?.role || ROLES.GURU,
                email: rp.email || localMatch?.email || `${rp.role || 'user'}@epic.id`,
                password: localMatch?.password || 'password',
                nip: rp.nip || localMatch?.nip || null,
                nisn: rp.nisn || localMatch?.nisn || null,
                nidn: rp.nidn || localMatch?.nidn || null,
                nim: rp.nim || localMatch?.nim || null,
                unit_info: rp.unit_info || localMatch?.unit_info || (rp.role === ROLES.GURU ? 'Akuntansi & Keuangan Lembaga (AKL)' : null),
                avatar_url: rp.avatar_url || localMatch?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rp.full_name)}`
              };
            });

            // Retain any local accounts created that might not be in remote yet
            for (const lu of localUsers) {
              if (!merged.some(m => m.id === lu.id || m.email?.toLowerCase().trim() === lu.email?.toLowerCase().trim())) {
                merged.push(lu);
              }
            }

            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(merged));
            return merged;
          }
        } catch (dbErr) {
          console.warn('Supabase fetch profiles notice:', dbErr.message);
        }
      }

      return localUsers;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      addToast('Gagal memuat daftar pengguna: ' + error.message, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const createUser = async (user) => {
    setIsLoading(true);
    try {
      const cleanEmail = user.email.toLowerCase().trim();
      const generatedId = 'user-' + Math.random().toString(36).substring(2, 9);

      const newUser = {
        id: generatedId,
        full_name: user.full_name.trim(),
        role: user.role,
        email: cleanEmail,
        password: user.password || 'password',
        nim: user.role === ROLES.MAHASISWA ? user.nim : null,
        nisn: user.role === ROLES.SISWA ? user.nisn : null,
        nidn: user.role === ROLES.DOSEN ? (user.nidn || user.nip) : null,
        nip: (user.role === ROLES.GURU || user.role === ROLES.DOSEN || user.role === ROLES.ADMIN) ? (user.nip || user.nidn) : null,
        unit_info: user.unit_info || null,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`,
        created_at: new Date().toISOString()
      };

      // 1. If Supabase is configured, create via isolated client (without logging out current Admin)
      if (isSupabaseConfigured()) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          if (supabaseUrl && supabaseAnonKey) {
            const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                persistSession: false,
                autoRefreshToken: false
              }
            });

            const { data: authData, error: authError } = await isolatedClient.auth.signUp({
              email: cleanEmail,
              password: newUser.password,
              options: {
                data: {
                  full_name: newUser.full_name,
                  role: newUser.role,
                  nip: newUser.nip,
                  nisn: newUser.nisn,
                  nidn: newUser.nidn,
                  unit_info: newUser.unit_info
                }
              }
            });

            if (authData?.user?.id) {
              newUser.id = authData.user.id;
            }

            // Sync with profiles table
            try {
              await supabase.from('profiles').upsert({
                id: newUser.id,
                full_name: newUser.full_name,
                role: newUser.role,
                nip: newUser.nip,
                nisn: newUser.nisn
              });
            } catch (e) {
              // Handled by Postgres trigger on_auth_user_created
            }
          }
        } catch (authErr) {
          console.warn('Supabase auth signup notice:', authErr.message);
        }
      }

      // 2. Always persist to MOCK_USERS_KEY so immediate login works seamlessly
      const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
      let currentUsers = [];
      try {
        currentUsers = JSON.parse(localData);
      } catch (e) {
        currentUsers = [];
      }

      const filtered = currentUsers.filter(u => (u.email || '').toLowerCase().trim() !== cleanEmail);
      const updated = [newUser, ...filtered];
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updated));

      const roleDisplay = ROLE_LABELS[newUser.role] || newUser.role.toUpperCase();
      addToast(`Akun ${newUser.full_name} (${roleDisplay}) berhasil dibuat dan siap digunakan login!`, 'success');
      return newUser;
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
      const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
      let currentUsers = [];
      try {
        currentUsers = JSON.parse(localData);
      } catch (e) {
        currentUsers = [];
      }

      const updated = currentUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ...updatedFields,
            password: updatedFields.password ? updatedFields.password : u.password,
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

      if (isSupabaseConfigured()) {
        try {
          const profileData = {
            full_name: updatedFields.full_name,
            role: updatedFields.role,
            nip: (updatedFields.role === ROLES.GURU || updatedFields.role === ROLES.DOSEN || updatedFields.role === ROLES.ADMIN)
              ? updatedFields.nip
              : null,
            nisn: updatedFields.role === ROLES.SISWA ? updatedFields.nisn : null
          };
          await supabase.from('profiles').update(profileData).eq('id', userId);
        } catch (dbErr) {
          console.warn('Supabase update profile notice:', dbErr.message);
        }
      }

      addToast('Perubahan data akun berhasil disimpan!', 'success');
      return true;
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
      const localData = localStorage.getItem(MOCK_USERS_KEY) || JSON.stringify(INITIAL_MOCK_USERS);
      let currentUsers = [];
      try {
        currentUsers = JSON.parse(localData);
      } catch (e) {
        currentUsers = [];
      }

      const filtered = currentUsers.filter(u => u.id !== userId);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(filtered));

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('profiles').delete().eq('id', userId);
        } catch (dbErr) {
          console.warn('Supabase delete profile notice:', dbErr.message);
        }
      }

      addToast('Akun pengguna berhasil dihapus!', 'info');
      return true;
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
