import { create } from 'zustand';
import { supabase } from '@/config/supabase';

// Mock Profiles for local preview/development
const MOCK_PROFILES = {
  admin: {
    id: 'mock-admin-uuid',
    full_name: 'Dr. Budi Santoso, M.Pd.',
    role: 'admin',
    nidn: '198203112009021003',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  dosen: {
    id: 'mock-dosen-uuid',
    full_name: 'Dra. Sri Wahyuni, M.Ak.',
    role: 'dosen',
    nidn: '197508242000032001',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
  },
  mahasiswa: {
    id: 'mock-mahasiswa-uuid',
    full_name: 'Feri Irawan',
    role: 'mahasiswa',
    nim: '2024081001',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60'
  }
};

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
          user: { email: parsed.role + '@epic.ac.id', id: parsed.id },
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
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanEmail = email.toLowerCase().trim();
    
    // Demo login credentials
    if (cleanEmail === 'admin@epic.id' || cleanEmail === 'admin') {
      const prof = MOCK_PROFILES.admin;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: 'admin@epic.ac.id', id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }
    
    if (cleanEmail === 'dosen@epic.id' || cleanEmail === 'dosen' || cleanEmail === 'guru@epic.id' || cleanEmail === 'guru') {
      const prof = MOCK_PROFILES.dosen;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: 'dosen@epic.ac.id', id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }
    
    if (cleanEmail === 'mahasiswa@epic.id' || cleanEmail === 'mahasiswa' || cleanEmail === 'siswa@epic.id' || cleanEmail === 'siswa') {
      const prof = MOCK_PROFILES.mahasiswa;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: 'mahasiswa@epic.ac.id', id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    // Real Supabase Login
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw new Error('Profil pengguna tidak ditemukan di database. Hubungi Administrator.');
        }

        localStorage.setItem('epic_profile', JSON.stringify(profileData));
        localStorage.setItem('epic_is_mock', 'false');

        set({
          user: data.user,
          profile: profileData,
          isAuthenticated: true,
          isMock: false,
          isLoading: false
        });

        return { success: true };
      } catch (error) {
        set({ isLoading: false });
        throw new Error('Gagal masuk: ' + error.message);
      }
    }

    set({ isLoading: false });
    throw new Error('Email atau password salah. Gunakan kredensial demo (admin/dosen/mahasiswa) atau set up koneksi Supabase Anda.');
  },

  logout: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const isMockVal = localStorage.getItem('epic_is_mock') === 'true';

    if (!isMockVal && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out from Supabase:', error.message);
      }
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
  }
}));
