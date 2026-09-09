import { create } from 'zustand';
import { supabase } from '@/config/supabase';

/**
 * Kelas Store (SMK Context)
 * 
 * Manages class/rombongan belajar data for SMK/SMA.
 * Each Kelas has students and references to Mapel (MK) IDs.
 * A student belongs to one active Kelas at a time but can progress
 * to a new Kelas each academic year (e.g., XI AKL 1 → XII AKL 1).
 */

const INITIAL_KELAS = [
  {
    id: 'kelas-1',
    name: 'XII AKL 1',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Dra. Sri Wahyuni',
    status: 'ACTIVE',
    mapel_ids: ['mk-1', 'mk-3'],
    students: [
      { id: 'sk-1', student_id: 'mock-siswa-uuid', nisn: '0051234001', full_name: 'Andi Pratama', enrolled_at: '2025-07-14' },
      { id: 'sk-2', student_id: 'sk2-uuid', nisn: '0051234002', full_name: 'Budi Setiawan', enrolled_at: '2025-07-14' },
      { id: 'sk-3', student_id: 'sk3-uuid', nisn: '0051234003', full_name: 'Citra Dewi', enrolled_at: '2025-07-14' },
      { id: 'sk-4', student_id: 'sk4-uuid', nisn: '0051234004', full_name: 'Dina Rahmawati', enrolled_at: '2025-07-14' },
      { id: 'sk-5', student_id: 'sk5-uuid', nisn: '0051234005', full_name: 'Eko Prasetyo', enrolled_at: '2025-07-14' },
      { id: 'sk-6', student_id: 'sk6-uuid', nisn: '0051234006', full_name: 'Fitri Handayani', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: 'kelas-2',
    name: 'XII AKL 2',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Budi Santoso, M.Pd.',
    status: 'ACTIVE',
    mapel_ids: ['mk-1'],
    students: [
      { id: 'sk-7', student_id: 'sk7-uuid', nisn: '0051234007', full_name: 'Gilang Ramadhan', enrolled_at: '2025-07-14' },
      { id: 'sk-8', student_id: 'sk8-uuid', nisn: '0051234008', full_name: 'Hesti Wulandari', enrolled_at: '2025-07-14' },
      { id: 'sk-9', student_id: 'sk9-uuid', nisn: '0051234009', full_name: 'Irfan Hakim', enrolled_at: '2025-07-14' },
      { id: 'sk-10', student_id: 'sk10-uuid', nisn: '0051234010', full_name: 'Julia Sari', enrolled_at: '2025-07-14' },
      { id: 'sk-11', student_id: 'sk11-uuid', nisn: '0051234011', full_name: 'Kevin Aditya', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: 'kelas-3',
    name: 'XI AKL 1',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Siti Nurjanah, S.Pd.',
    status: 'ACTIVE',
    mapel_ids: ['mk-2'],
    students: [
      { id: 'sk-12', student_id: 'sk12-uuid', nisn: '0051234012', full_name: 'Lina Marlina', enrolled_at: '2025-07-14' },
      { id: 'sk-13', student_id: 'sk13-uuid', nisn: '0051234013', full_name: 'Muhamad Rizki', enrolled_at: '2025-07-14' },
      { id: 'sk-14', student_id: 'sk14-uuid', nisn: '0051234014', full_name: 'Nadia Putri', enrolled_at: '2025-07-14' },
      { id: 'sk-15', student_id: 'sk15-uuid', nisn: '0051234015', full_name: 'Omar Faruq', enrolled_at: '2025-07-14' },
      { id: 'sk-16', student_id: 'sk16-uuid', nisn: '0051234016', full_name: 'Putri Amelia', enrolled_at: '2025-07-14' },
      { id: 'sk-17', student_id: 'sk17-uuid', nisn: '0051234017', full_name: 'Qori Hidayat', enrolled_at: '2025-07-14' },
      { id: 'sk-18', student_id: 'sk18-uuid', nisn: '0051234018', full_name: 'Rina Agustina', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: 'kelas-4',
    name: 'XI AKL 2',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Ahmad Fauzi, S.E.',
    status: 'ACTIVE',
    mapel_ids: ['mk-2'],
    students: [
      { id: 'sk-19', student_id: 'sk19-uuid', nisn: '0051234019', full_name: 'Sandi Permana', enrolled_at: '2025-07-14' },
      { id: 'sk-20', student_id: 'sk20-uuid', nisn: '0051234020', full_name: 'Tina Marlina', enrolled_at: '2025-07-14' },
      { id: 'sk-21', student_id: 'sk21-uuid', nisn: '0051234021', full_name: 'Umar Hadi', enrolled_at: '2025-07-14' },
      { id: 'sk-22', student_id: 'sk22-uuid', nisn: '0051234022', full_name: 'Vina Oktavia', enrolled_at: '2025-07-14' },
      { id: 'sk-23', student_id: 'sk23-uuid', nisn: '0051234023', full_name: 'Wahyu Nugroho', enrolled_at: '2025-07-14' },
      { id: 'sk-24', student_id: 'sk24-uuid', nisn: '0051234024', full_name: 'Xena Paramita', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: 'kelas-5',
    name: 'X AKL 1',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Ratna Dewi, S.Pd.',
    status: 'ACTIVE',
    mapel_ids: [],
    students: [
      { id: 'sk-25', student_id: 'sk25-uuid', nisn: '0051234025', full_name: 'Yanto Susilo', enrolled_at: '2025-07-14' },
      { id: 'sk-26', student_id: 'sk26-uuid', nisn: '0051234026', full_name: 'Zahra Maulida', enrolled_at: '2025-07-14' },
      { id: 'sk-27', student_id: 'sk27-uuid', nisn: '0051234027', full_name: 'Adi Nugraha', enrolled_at: '2025-07-14' },
      { id: 'sk-28', student_id: 'sk28-uuid', nisn: '0051234028', full_name: 'Bella Safitri', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: 'kelas-6',
    name: 'X AKL 2',
    jurusan: 'Akuntansi & Keuangan Lembaga',
    tahun_ajaran: '2025/2026',
    wali_kelas: 'Hendri Kurniawan, S.Pd.',
    status: 'ACTIVE',
    mapel_ids: [],
    students: [
      { id: 'sk-29', student_id: 'sk29-uuid', nisn: '0051234029', full_name: 'Candra Wijaya', enrolled_at: '2025-07-14' },
      { id: 'sk-30', student_id: 'sk30-uuid', nisn: '0051234030', full_name: 'Devi Anggraini', enrolled_at: '2025-07-14' },
      { id: 'sk-31', student_id: 'sk31-uuid', nisn: '0051234031', full_name: 'Farhan Maulana', enrolled_at: '2025-07-14' },
      { id: 'sk-32', student_id: 'sk32-uuid', nisn: '0051234032', full_name: 'Gita Pramesti', enrolled_at: '2025-07-14' },
      { id: 'sk-33', student_id: 'sk33-uuid', nisn: '0051234033', full_name: 'Hendra Saputra', enrolled_at: '2025-07-14' },
    ],
    created_at: '2025-07-01T08:00:00Z'
  }
];

const STORAGE_KEY = 'epic_kelas_v1';

const loadSavedKelas = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_KELAS;
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_KELAS;
  }
};

const saveKelasToStorage = (kelasList) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kelasList));
  } catch (e) {}
};

export const useKelasStore = create((set, get) => ({
  kelasList: loadSavedKelas(),
  isSyncing: false,

  // Synchronize classes from Supabase
  syncFromSupabase: async () => {
    try {
      set({ isSyncing: true });
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase sync classes info:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const remoteClasses = data.map(c => ({
          id: c.id,
          name: c.name,
          jurusan: c.jurusan || 'Akuntansi & Keuangan Lembaga',
          tahun_ajaran: c.tahun_ajaran || c.academic_year || '2025/2026',
          wali_kelas: c.wali_kelas || '',
          status: c.status || 'ACTIVE',
          mapel_ids: c.mapel_ids || [],
          students: (c.students_data && c.students_data.length > 0) 
            ? c.students_data 
            : (get().getKelasById(c.id)?.students || []),
          created_at: c.created_at
        }));

        // Merge remote classes with seed data
        const localList = get().kelasList;
        const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        // Map remote classes with any local seed student data if empty
        const merged = remoteClasses.map(rc => {
          const matchingLocal = localList.find(l => l.id === rc.id || norm(l.name) === norm(rc.name));
          return {
            ...rc,
            students: (rc.students && rc.students.length > 0) ? rc.students : (matchingLocal?.students || []),
            mapel_ids: Array.from(new Set([...(rc.mapel_ids || []), ...(matchingLocal?.mapel_ids || [])]))
          };
        });

        // Add any local classes that don't exist remotely yet
        localList.forEach(localItem => {
          if (!merged.some(m => m.id === localItem.id || norm(m.name) === norm(localItem.name))) {
            merged.push(localItem);
          }
        });

        set({ kelasList: merged, isSyncing: false });
        saveKelasToStorage(merged);
      }
    } catch (e) {
      console.warn('syncFromSupabase exception:', e);
    } finally {
      set({ isSyncing: false });
    }
  },

  // Create a new Kelas
  createKelas: (kelasData) => {
    const { kelasList } = get();
    const newKelas = {
      id: `kelas-${Date.now()}`,
      name: kelasData.name,
      jurusan: kelasData.jurusan || '',
      tahun_ajaran: kelasData.tahun_ajaran || '',
      wali_kelas: kelasData.wali_kelas || '',
      status: 'ACTIVE',
      mapel_ids: kelasData.mapel_ids || [],
      students: kelasData.students || [],
      created_at: new Date().toISOString()
    };
    const updated = [newKelas, ...kelasList];
    set({ kelasList: updated });
    saveKelasToStorage(updated);

    // Sync to Supabase in background
    supabase
      .from('classes')
      .insert({
        name: newKelas.name,
        academic_year: newKelas.tahun_ajaran,
        tahun_ajaran: newKelas.tahun_ajaran,
        jurusan: newKelas.jurusan,
        wali_kelas: newKelas.wali_kelas,
        status: 'ACTIVE',
        students_data: newKelas.students,
        mapel_ids: newKelas.mapel_ids
      })
      .select()
      .then(({ data, error }) => {
        if (!error && data && data[0]) {
          const remoteId = data[0].id;
          const currentList = get().kelasList;
          const mapped = currentList.map(k => k.id === newKelas.id ? { ...k, id: remoteId } : k);
          set({ kelasList: mapped });
          saveKelasToStorage(mapped);
        } else if (error) {
          // Fallback if specific columns not yet added
          supabase.from('classes').insert({
            name: newKelas.name,
            academic_year: newKelas.tahun_ajaran
          }).catch(() => {});
        }
      })
      .catch((err) => console.warn('Supabase background insert error:', err));

    return newKelas;
  },

  // Update a Kelas
  updateKelas: (id, partialData) => {
    const { kelasList } = get();
    const updated = kelasList.map(k => k.id === id ? { ...k, ...partialData } : k);
    set({ kelasList: updated });
    saveKelasToStorage(updated);

    // Sync update to Supabase
    if (!id.startsWith('kelas-')) {
      supabase.from('classes').update({
        name: partialData.name,
        academic_year: partialData.tahun_ajaran,
        tahun_ajaran: partialData.tahun_ajaran,
        jurusan: partialData.jurusan,
        wali_kelas: partialData.wali_kelas,
        mapel_ids: partialData.mapel_ids,
        students_data: partialData.students
      }).eq('id', id).catch(() => {});
    }
  },

  // Delete a Kelas
  deleteKelas: (id) => {
    const { kelasList } = get();
    const target = kelasList.find(k => k.id === id);
    const updated = kelasList.filter(k => k.id !== id);
    set({ kelasList: updated });
    saveKelasToStorage(updated);

    // Sync delete to Supabase
    if (target && !id.startsWith('kelas-')) {
      supabase.from('classes').delete().eq('id', id).catch(() => {});
    } else if (target) {
      supabase.from('classes').delete().eq('name', target.name).catch(() => {});
    }
  },

  // Get single Kelas by ID
  getKelasById: (id) => {
    return get().kelasList.find(k => k.id === id);
  },

  // Add a student to a Kelas
  addStudentToKelas: (kelasId, student) => {
    const { kelasList } = get();
    const updated = kelasList.map(k => {
      if (k.id === kelasId) {
        const alreadyExists = k.students.some(s => s.student_id === student.student_id);
        if (alreadyExists) return k;
        return { ...k, students: [...k.students, student] };
      }
      return k;
    });
    set({ kelasList: updated });
    saveKelasToStorage(updated);
  },

  // Remove a student from a Kelas
  removeStudentFromKelas: (kelasId, studentId) => {
    const { kelasList } = get();
    const updated = kelasList.map(k => {
      if (k.id === kelasId) {
        return { ...k, students: k.students.filter(s => s.id !== studentId && s.student_id !== studentId) };
      }
      return k;
    });
    set({ kelasList: updated });
    saveKelasToStorage(updated);
  },

  // Link a Mapel (MK) to a Kelas
  addMapelToKelas: (kelasId, mkId) => {
    const { kelasList } = get();
    let newMapelIds = [];
    const updated = kelasList.map(k => {
      if (k.id === kelasId) {
        if (k.mapel_ids.includes(mkId)) {
          newMapelIds = k.mapel_ids;
          return k;
        }
        newMapelIds = [...k.mapel_ids, mkId];
        return { ...k, mapel_ids: newMapelIds };
      }
      return k;
    });
    set({ kelasList: updated });
    saveKelasToStorage(updated);

    // Sync to Supabase - merge with remote mapel_ids to avoid race conditions
    const targetKelas = kelasList.find(k => k.id === kelasId);
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const query = !kelasId.startsWith('kelas-')
      ? supabase.from('classes').select('id, mapel_ids').eq('id', kelasId)
      : supabase.from('classes').select('id, mapel_ids, name');

    query.then(({ data }) => {
      let targetRow = null;
      if (Array.isArray(data)) {
        targetRow = data.find(d => d.id === kelasId || norm(d.name) === norm(targetKelas?.name));
      } else {
        targetRow = data;
      }

      if (targetRow) {
        const remoteIds = Array.isArray(targetRow.mapel_ids) ? targetRow.mapel_ids : [];
        const mergedSet = Array.from(new Set([...remoteIds, ...newMapelIds, mkId]));
        supabase.from('classes').update({ mapel_ids: mergedSet }).eq('id', targetRow.id).catch(() => {});
      }
    }).catch(() => {});
  },

  // Unlink a Mapel from a Kelas
  removeMapelFromKelas: (kelasId, mkId) => {
    const { kelasList } = get();
    let newMapelIds = [];
    const updated = kelasList.map(k => {
      if (k.id === kelasId) {
        newMapelIds = k.mapel_ids.filter(id => id !== mkId);
        return { ...k, mapel_ids: newMapelIds };
      }
      return k;
    });
    set({ kelasList: updated });
    saveKelasToStorage(updated);

    const targetKelas = kelasList.find(k => k.id === kelasId);
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const query = !kelasId.startsWith('kelas-')
      ? supabase.from('classes').select('id, mapel_ids').eq('id', kelasId)
      : supabase.from('classes').select('id, mapel_ids, name');

    query.then(({ data }) => {
      let targetRow = null;
      if (Array.isArray(data)) {
        targetRow = data.find(d => d.id === kelasId || norm(d.name) === norm(targetKelas?.name));
      } else {
        targetRow = data;
      }

      if (targetRow) {
        const remoteIds = Array.isArray(targetRow.mapel_ids) ? targetRow.mapel_ids : [];
        const filtered = remoteIds.filter(id => id !== mkId);
        supabase.from('classes').update({ mapel_ids: filtered }).eq('id', targetRow.id).catch(() => {});
      }
    }).catch(() => {});
  }
}));
