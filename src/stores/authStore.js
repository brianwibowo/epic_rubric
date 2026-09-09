import { create } from 'zustand';
import { supabase } from '@/config/supabase';
import { ROLES } from '@/utils/constants';

// Mock Profiles for local preview/development
const MOCK_PROFILES = {
  admin: {
    id: 'mock-admin-uuid',
    full_name: 'Dr. Budi Santoso, M.Pd.',
    role: ROLES.ADMIN,
    nip: '198203112009021003',
    email: 'admin@epic.id',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  dosen: {
    id: 'mock-dosen-uuid',
    full_name: 'Dra. Sri Wahyuni, M.Ak.',
    role: ROLES.DOSEN,
    nidn: '197508242000032001',
    prodi: 'Pendidikan Akuntansi',
    email: 'dosen@epic.id',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
  },
  guru: {
    id: 'mock-guru-uuid',
    full_name: 'Siti Rahmawati, S.Pd.',
    role: ROLES.GURU,
    nip: '198506122010012023',
    jurusan: 'Akuntansi & Keuangan Lembaga (AKL)',
    email: 'guru@epic.id',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60'
  },
  mahasiswa: {
    id: 'mock-mahasiswa-uuid',
    full_name: 'Feri Irawan',
    role: ROLES.MAHASISWA,
    nim: '2024081001',
    kelas: 'PE 2025 A',
    email: 'mahasiswa@epic.id',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60'
  },
  siswa: {
    id: 'mock-siswa-uuid',
    full_name: 'Ahmad Rifai',
    role: ROLES.SISWA,
    nisn: '0081234567',
    kelas: 'XII AKL 1',
    email: 'siswa@epic.id',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
  }
};

const PRESET_TEACHER_ACCOUNTS = [
  {
    id: '2d18f169-0c7f-499f-a274-0e4a4bc4dae1',
    full_name: 'Ratna Indriani, S. Pd',
    role: ROLES.GURU,
    email: 'ratnaindriani1628@gmail.com',
    password: '12345678',
    nip: '0801061',
    unit_info: 'Manajemen Perkantoran',
    jurusan: 'Manajemen Perkantoran'
  },
  {
    id: 'guru-dyah-uuid',
    full_name: 'Dyah Mutiara Indriasari, S. E.',
    role: ROLES.GURU,
    email: 'mutiaradyah1.25@gmail.com',
    password: '12345678',
    nip: '0207027',
    unit_info: 'Akuntansi',
    jurusan: 'Akuntansi'
  },
  {
    id: 'guru-dwihastuti-uuid',
    full_name: 'Dwi Hastuti, S. E.',
    role: ROLES.GURU,
    email: 'dwihasti17@gmail.com',
    password: '12345678',
    nip: '0207012',
    unit_info: 'Akuntansi',
    jurusan: 'Akuntansi'
  },
  {
    id: 'guru-arif-uuid',
    full_name: 'Arif Dwie Arysanti, S. Pd.',
    role: ROLES.GURU,
    email: 'arifsanti14@gmail.com',
    password: '12345678',
    nip: '0207014',
    unit_info: 'Manajemen Perkantoran',
    jurusan: 'Manajemen Perkantoran'
  },
  {
    id: 'guru-ika-uuid',
    full_name: 'Ika Prasetya Yuniati, S. Pd',
    role: ROLES.GURU,
    email: 'xca.prasetya@gmail.com',
    password: '12345678',
    nip: '0602044',
    unit_info: 'Akuntansi',
    jurusan: 'Akuntansi'
  }
];

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes('placeholder-project') && !url.includes('your-project');
};

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isMock: true,

  initializeAuth: async () => {
    // Seed preset SMK teacher accounts to localStorage if not yet added
    try {
      const raw = localStorage.getItem('epic_mock_users_v2');
      let users = raw ? JSON.parse(raw) : [];
      let updated = false;
      for (const preset of PRESET_TEACHER_ACCOUNTS) {
        if (!users.some(u => (u.email && u.email.toLowerCase().trim() === preset.email.toLowerCase().trim()))) {
          users.push(preset);
          updated = true;
        }
      }
      if (updated || !raw) {
        localStorage.setItem('epic_mock_users_v2', JSON.stringify(users));
      }
    } catch (e) {
      // Non-blocking
    }

    const savedProfile = localStorage.getItem('epic_profile');
    const isMockStr = localStorage.getItem('epic_is_mock');
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      const isMockVal = isMockStr === 'true';

      if (!isMockVal && isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({
            user: session.user,
            profile: parsed,
            isAuthenticated: true,
            isMock: false,
            isLoading: false
          });
          return;
        } else {
          localStorage.removeItem('epic_profile');
          localStorage.removeItem('epic_is_mock');
        }
      } else {
        set({
          user: { email: parsed.email || `${parsed.role}@epic.id`, id: parsed.id },
          profile: parsed,
          isAuthenticated: true,
          isMock: true,
          isLoading: false
        });
        return;
      }
    }
    
    set({ isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanEmail = email.toLowerCase().trim();
    
    // Demo login credentials for all 5 roles
    if (cleanEmail === 'admin@epic.id' || cleanEmail === 'admin') {
      const prof = MOCK_PROFILES.admin;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }
    
    if (cleanEmail === 'dosen@epic.id' || cleanEmail === 'dosen') {
      const prof = MOCK_PROFILES.dosen;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    if (cleanEmail === 'guru@epic.id' || cleanEmail === 'guru') {
      const prof = MOCK_PROFILES.guru;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }
    
    if (cleanEmail === 'mahasiswa@epic.id' || cleanEmail === 'mahasiswa') {
      const prof = MOCK_PROFILES.mahasiswa;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    if (cleanEmail === 'siswa@epic.id' || cleanEmail === 'siswa') {
      const prof = MOCK_PROFILES.siswa;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    // 2. Check registered accounts created by Administrator (epic_mock_users_v2)
    let registeredUsers = [];
    try {
      const raw = localStorage.getItem('epic_mock_users_v2');
      if (raw) registeredUsers = JSON.parse(raw);
    } catch (e) {
      registeredUsers = [];
    }

    const matchedUser = 
      registeredUsers.find(u => (u.email || '').toLowerCase().trim() === cleanEmail) ||
      PRESET_TEACHER_ACCOUNTS.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);

    if (matchedUser) {
      // If password provided in registeredUser, verify it
      if (matchedUser.password && password && matchedUser.password !== password) {
        set({ isLoading: false });
        return { success: false, error: 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.' };
      }

      const prof = {
        id: matchedUser.id,
        full_name: matchedUser.full_name,
        role: matchedUser.role,
        email: matchedUser.email,
        nip: matchedUser.nip || null,
        nidn: matchedUser.nidn || null,
        nim: matchedUser.nim || null,
        nisn: matchedUser.nisn || null,
        unit_info: matchedUser.unit_info || null,
        jurusan: matchedUser.unit_info || (matchedUser.role === ROLES.GURU ? 'Akuntansi & Keuangan Lembaga (AKL)' : null),
        prodi: matchedUser.unit_info || (matchedUser.role === ROLES.DOSEN ? 'Pendidikan Akuntansi' : null),
        kelas: matchedUser.unit_info || (matchedUser.role === ROLES.SISWA ? 'XII AKL 1' : matchedUser.role === ROLES.MAHASISWA ? 'PE 2025 A' : null),
        avatar_url: matchedUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(matchedUser.full_name)}`
      };

      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: prof.email, id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    // 3. Real Supabase Login
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const finalProfile = profileData || {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 'Pengguna',
            role: data.user.user_metadata?.role || ROLES.GURU,
            email: data.user.email,
            nip: data.user.user_metadata?.nip || null,
            nisn: data.user.user_metadata?.nisn || null,
            unit_info: data.user.user_metadata?.unit_info || null,
            jurusan: data.user.user_metadata?.unit_info || (data.user.user_metadata?.role === ROLES.GURU ? 'Akuntansi & Keuangan Lembaga (AKL)' : null)
          };

          localStorage.setItem('epic_profile', JSON.stringify(finalProfile));
          localStorage.setItem('epic_is_mock', 'false');

          set({
            user: data.user,
            profile: finalProfile,
            isAuthenticated: true,
            isMock: false,
            isLoading: false
          });

          return { success: true };
        } else if (error) {
          // If error is Email not confirmed, check if profile exists in profiles table
          if (error.message?.includes('Email not confirmed')) {
            const { data: pData } = await supabase
              .from('profiles')
              .select('*')
              .eq('nip', cleanEmail)
              .maybeSingle();

            if (pData) {
              const prof = {
                id: pData.id,
                full_name: pData.full_name,
                role: pData.role,
                email: cleanEmail,
                nip: pData.nip,
                nisn: pData.nisn,
                unit_info: pData.unit_info,
                jurusan: pData.unit_info || 'Akuntansi & Keuangan Lembaga (AKL)'
              };
              localStorage.setItem('epic_profile', JSON.stringify(prof));
              localStorage.setItem('epic_is_mock', 'false');
              set({
                user: { email: cleanEmail, id: prof.id },
                profile: prof,
                isAuthenticated: true,
                isMock: false,
                isLoading: false
              });
              return { success: true };
            }
          }
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      } catch (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }
    }

    // Fallback if password or email not matched
    set({ isLoading: false });
    return { success: false, error: 'Email atau kata sandi tidak valid. Pastikan akun sudah didaftarkan.' };
  },

  logout: async () => {
    set({ isLoading: true });
    
    if (isSupabaseConfigured() && !get().isMock) {
      await supabase.auth.signOut();
    }
    
    localStorage.removeItem('epic_profile');
    localStorage.removeItem('epic_is_mock');
    
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isMock: true,
      isLoading: false
    });
  },

  updateProfile: async (updates) => {
    const currentProfile = get().profile;
    const updatedProfile = { ...currentProfile, ...updates };

    if (get().isMock) {
      localStorage.setItem('epic_profile', JSON.stringify(updatedProfile));
      set({ profile: updatedProfile });
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('epic_profile', JSON.stringify(data));
      set({ profile: data });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    if (get().isMock) {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}));
