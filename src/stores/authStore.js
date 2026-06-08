import { create } from 'zustand';
import { supabase } from '@/config/supabase';

// Mock Profiles for local preview/development
const MOCK_PROFILES = {
  admin: {
    id: 'mock-admin-uuid',
    full_name: 'Budi Santoso, M.Pd.',
    role: 'admin',
    nip: '198203112009021003',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  },
  guru: {
    id: 'mock-guru-uuid',
    full_name: 'Dra. Sri Wahyuni',
    role: 'guru',
    nip: '197508242000032001',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60'
  },
  siswa: {
    id: 'mock-siswa-uuid',
    full_name: 'Feri Irawan',
    role: 'siswa',
    nisn: '0087654321',
    class_id: 'class-xii-akl-1',
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
  isMock: true, // Flag indicating whether we are in mockup/simulated mode

  initializeAuth: async () => {
    // Check if we have a saved mock session or real session
    const savedProfile = localStorage.getItem('epic_profile');
    const isMockStr = localStorage.getItem('epic_is_mock');
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      const isMockVal = isMockStr === 'true';

      if (!isMockVal && isSupabaseConfigured()) {
        // Double check Supabase session validity
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
          // Session expired
          localStorage.removeItem('epic_profile');
          localStorage.removeItem('epic_is_mock');
        }
      } else {
        // Mock session
        set({
          user: { email: parsed.role + '@epic.school.id', id: parsed.id },
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
    
    // Simulating delay for premium loading micro-interactions
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Check if they used demo login credentials
    if (cleanEmail === 'admin@epic.id' || cleanEmail === 'admin') {
      const prof = MOCK_PROFILES.admin;
      localStorage.setItem('epic_profile', JSON.stringify(prof));
      localStorage.setItem('epic_is_mock', 'true');
      set({
        user: { email: 'admin@epic.id', id: prof.id },
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
        user: { email: 'guru@epic.id', id: prof.id },
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
        user: { email: 'siswa@epic.id', id: prof.id },
        profile: prof,
        isAuthenticated: true,
        isMock: true,
        isLoading: false
      });
      return { success: true };
    }

    // 2. Real Supabase Login
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;

        // Fetch corresponding user profile from the database
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

    // Invalid credentials
    set({ isLoading: false });
    throw new Error('Email atau password salah. Gunakan kredensial demo (admin/guru/siswa) atau set up koneksi Supabase Anda.');
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
