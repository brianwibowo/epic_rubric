import { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/utils/constants';

/**
 * Smart Terminology Hook
 * Dynamically provides terminology based on whether the current context is
 * School (SMK: Guru, Siswa, Mapel, NISN, Kelas, Tahun Ajaran) or
 * University (Dosen, Mahasiswa, MK, NIM, Rombel, Semester).
 * 
 * Accurately preserves track context (SMK vs Vokasi) for Admin across
 * all subroutes of a course (/overview, /students, /scoring, /komponen, /analytics, /comments).
 */
export function useTerminology() {
  const { profile } = useAuthStore();
  let location;
  try {
    location = useLocation();
  } catch (e) {
    location = null;
  }
  const role = profile?.role;
  const pathname = location?.pathname || '';
  const search = location?.search || '';

  // Synchronize session storage when explicit route is visited
  useEffect(() => {
    try {
      if (pathname.startsWith('/kelas') || search.includes('kelasId') || search.includes('track=smk')) {
        sessionStorage.setItem('epic_last_track', 'smk');
      } else if (pathname === '/mk' || pathname === '/mk/' || (pathname.startsWith('/mk') && search.includes('track=univ'))) {
        sessionStorage.setItem('epic_last_track', 'univ');
      }
    } catch (e) {}
  }, [pathname, search]);

  const terminology = useMemo(() => {
    const isRoleSchool = role === ROLES.GURU || role === ROLES.SISWA;
    const isRoleUniversity = role === ROLES.DOSEN || role === ROLES.MAHASISWA;
    const isAdmin = role === ROLES.ADMIN;

    let storedTrack = null;
    try {
      storedTrack = sessionStorage.getItem('epic_last_track');
    } catch (e) {}

    // Context detection from route/query/session
    const isExplicitSchool = pathname.startsWith('/kelas') || search.includes('kelasId') || search.includes('track=smk');
    const isExplicitUniv = (pathname === '/mk' || pathname === '/mk/') && !search.includes('track=smk');

    let isSchool = false;
    if (isRoleSchool) {
      isSchool = true;
    } else if (isRoleUniversity) {
      isSchool = false;
    } else if (isAdmin) {
      if (isExplicitSchool) {
        isSchool = true;
      } else if (isExplicitUniv) {
        isSchool = false;
      } else {
        isSchool = storedTrack === 'smk';
      }
    } else {
      isSchool = isExplicitSchool || storedTrack === 'smk';
    }

    const isUniversity = !isSchool;

    return {
      isSchool,
      isUniversity,
      isAdmin,
      
      // Course terms
      courseLabel: isSchool ? 'Mata Pelajaran' : 'Mata Kuliah',
      coursePluralLabel: isSchool ? 'Daftar Mata Pelajaran' : 'Daftar Mata Kuliah',
      courseShortLabel: isSchool ? 'Mapel' : 'MK',
      courseCodeLabel: isSchool ? 'Kode Mapel' : 'Kode MK',
      
      // Educator terms
      educatorLabel: isSchool ? 'Guru' : 'Dosen',
      educatorIdLabel: isSchool ? 'NIP' : 'NIDN',
      
      // Learner terms
      learnerLabel: isSchool ? 'Siswa' : 'Mahasiswa',
      learnerPluralLabel: isSchool ? 'Daftar Siswa' : 'Daftar Mahasiswa',
      learnerIdLabel: isSchool ? 'NISN' : 'NIM',
      
      // Class & Academic Term
      classLabel: isSchool ? 'Rombongan Belajar (Kelas)' : 'Kelas Kuliah',
      academicTermLabel: isSchool ? 'Tahun Ajaran' : 'Semester',
      
      // Rombel / Kelas navigation terms
      rombelLabel: isSchool ? 'Kelas' : 'Rombel',
      rombelPluralLabel: isSchool ? 'Daftar Kelas' : 'Daftar Rombel',
      kelasLabel: 'Kelas',
      kelasPluralLabel: 'Daftar Kelas',
      
      // Institution
      institutionType: isSchool ? 'SMK' : 'UNIVERSITAS',
      institutionTypeLabel: isSchool ? 'Sekolah Menengah Kejuruan (SMK)' : 'Perguruan Tinggi / Vokasi'
    };
  }, [role, pathname, search]);

  return terminology;
}
