import { create } from 'zustand';
import { DEFAULT_KOMPONEN } from '@/utils/constants';

const INITIAL_MKS = [
  {
    id: 'mk-1',
    name: 'Praktikum Akuntansi Dasar',
    kode_mk: '25P04085',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    sks: 2,
    kelas: 'PE 2025 A',
    status: 'ACTIVE',
    join_code: 'A3B7F2',
    description: 'Mata kuliah praktikum yang membahas siklus akuntansi perusahaan jasa dan dagang secara komprehensif.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    created_at: '2026-07-01T08:00:00Z',
    komponen: [
      { id: 'k1', name: 'Proyek', bobot: 0.20, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 1 },
      { id: 'k2', name: 'Partisipasi Kelas', bobot: 0.10, rubricId: 'r2', rubricName: 'Rubrik Partisipasi Standar', urutan: 2 },
      { id: 'k3', name: 'Quiz', bobot: 0.15, rubricId: 'r2', rubricName: 'Rubrik Quiz Standar', urutan: 3 },
      { id: 'k4', name: 'Tugas', bobot: 0.15, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 4 },
      { id: 'k5', name: 'UTS', bobot: 0.20, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 5 },
      { id: 'k6', name: 'UAS', bobot: 0.20, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 6 },
    ],
    students: [
      { id: 's1', student_id: 'mock-mahasiswa-uuid', nim: '2024081001', full_name: 'Feri Irawan', enrolled_at: '2026-07-15' },
      { id: 's2', student_id: 's2-uuid', nim: '2024081002', full_name: 'Rina Permata Sari', enrolled_at: '2026-07-15' },
      { id: 's3', student_id: 's3-uuid', nim: '2024081003', full_name: 'Andi Prasetyo', enrolled_at: '2026-07-16' },
      { id: 's4', student_id: 's4-uuid', nim: '2024081004', full_name: 'Dewi Lestari', enrolled_at: '2026-07-15' },
      { id: 's5', student_id: 's5-uuid', nim: '2024081005', full_name: 'Budi Hartono', enrolled_at: '2026-07-17' },
      { id: 's6', student_id: 's6-uuid', nim: '2024081006', full_name: 'Siti Nurhaliza', enrolled_at: '2026-07-15' },
      { id: 's7', student_id: 's7-uuid', nim: '2024081007', full_name: 'Rahmat Hidayat', enrolled_at: '2026-07-18' },
    ],
    scoringData: {
      's1': {
        'k1': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Sangat baik menganalisis transaksi akuntansi.', P: 'Prediksi tajam.', I: 'Penerapan efisien.', C: 'Refleksi kritis.' }, rawScore: 93, status: 'PUBLISHED' },
        'k2': { scores: { K: 4, A: 4, W: 4 }, feedbacks: { K: 'Sangat tepat.', A: 'Analisis mendalam.', W: 'Disiplin.' }, rawScore: 100, status: 'PUBLISHED' },
        'k3': { scores: { K: 3, A: 4, W: 3 }, feedbacks: { K: 'Jawaban benar.', A: 'Analisis tajam.', W: 'Cepat.' }, rawScore: 83, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 4, I: 3, C: 4 }, feedbacks: { E: 'Evaluasi mendalam.', P: 'Prediksi logis.', I: 'Penerapan terstruktur.', C: 'Audit mandiri baik.' }, rawScore: 95, status: 'PUBLISHED' },
        'k5': { scores: { T: 4, P: 3, A: 4 }, feedbacks: { T: 'Sangat menguasai teori.', P: 'Sesuai standar.', A: 'Analisis komprehensif.' }, rawScore: 90, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Penguasaan teori sempurna.', P: 'Penerapan tepat.', A: 'Analisis tajam.' }, rawScore: 100, status: 'PUBLISHED' },
      },
      'mock-mahasiswa-uuid': {
        'k1': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Sangat baik menganalisis transaksi akuntansi.', P: 'Prediksi tajam.', I: 'Penerapan efisien.', C: 'Refleksi kritis.' }, rawScore: 93, status: 'PUBLISHED' },
        'k2': { scores: { K: 4, A: 4, W: 4 }, feedbacks: { K: 'Sangat tepat.', A: 'Analisis mendalam.', W: 'Disiplin.' }, rawScore: 100, status: 'PUBLISHED' },
        'k3': { scores: { K: 3, A: 4, W: 3 }, feedbacks: { K: 'Jawaban benar.', A: 'Analisis tajam.', W: 'Cepat.' }, rawScore: 83, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 4, I: 3, C: 4 }, feedbacks: { E: 'Evaluasi mendalam.', P: 'Prediksi logis.', I: 'Penerapan terstruktur.', C: 'Audit mandiri baik.' }, rawScore: 95, status: 'PUBLISHED' },
        'k5': { scores: { T: 4, P: 3, A: 4 }, feedbacks: { T: 'Sangat menguasai teori.', P: 'Sesuai standar.', A: 'Analisis komprehensif.' }, rawScore: 90, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Penguasaan teori sempurna.', P: 'Penerapan tepat.', A: 'Analisis tajam.' }, rawScore: 100, status: 'PUBLISHED' },
      },
      's2': {
        'k1': { scores: { E: 4, P: 4, I: 4, C: 3 }, feedbacks: { E: 'Evaluasi tajam.', P: 'Prediksi akurat.', I: 'Penerapan rapi.', C: 'Refleksi baik.' }, rawScore: 95, status: 'PUBLISHED' },
        'k2': { scores: { K: 4, A: 3, W: 4 }, feedbacks: { K: 'Sangat baik.', A: 'Analisis cukup.', W: 'Tepat waktu.' }, rawScore: 93, status: 'PUBLISHED' },
        'k3': { scores: { K: 4, A: 4, W: 3 }, feedbacks: { K: 'Presisi tinggi.', A: 'Analisis bagus.', W: 'Cepat.' }, rawScore: 95, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Evaluasi kuat.', P: 'Prediksi baik.', I: 'Kertas kerja komprehensif.', C: 'Kritikal.' }, rawScore: 93, status: 'PUBLISHED' },
        'k5': { scores: { T: 3, P: 4, A: 4 }, feedbacks: { T: 'Teori baik.', P: 'Standar presisi.', A: 'Analisis kasus mendalam.' }, rawScore: 93, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 4, A: 3 }, feedbacks: { T: 'Teori matang.', P: 'Penerapan rapi.', A: 'Analisis baik.' }, rawScore: 93, status: 'PUBLISHED' },
      },
      's3': {
        'k1': { scores: { E: 3, P: 3, I: 3, C: 3 }, feedbacks: { E: 'Evaluasi cukup.', P: 'Prediksi terstruktur.', I: 'Penerapan sesuai.', C: 'Refleksi ada.' }, rawScore: 75, status: 'PUBLISHED' },
        'k2': { scores: { K: 3, A: 3, W: 3 }, feedbacks: { K: 'Jawaban benar.', A: 'Analisis standar.', W: 'Tepat waktu.' }, rawScore: 75, status: 'PUBLISHED' },
        'k3': { scores: { K: 3, A: 2, W: 3 }, feedbacks: { K: 'Cukup baik.', A: 'Perlu latihan analisis.', W: 'Cepat.' }, rawScore: 68, status: 'PUBLISHED' },
        'k4': { scores: { E: 3, P: 3, I: 3, C: 2 }, feedbacks: { E: 'Evaluasi dasar.', P: 'Prediksi terstruktur.', I: 'Penerapan ada.', C: 'Perlu verifikasi ulang.' }, rawScore: 70, status: 'PUBLISHED' },
        'k5': { scores: { T: 3, P: 3, A: 3 }, feedbacks: { T: 'Paham dasar.', P: 'Sesuai standar.', A: 'Analisis dasar.' }, rawScore: 75, status: 'PUBLISHED' },
        'k6': { scores: { T: 3, P: 3, A: 3 }, feedbacks: { T: 'Pemahaman baik.', P: 'Penerapan terstruktur.', A: 'Analisis cukup.' }, rawScore: 75, status: 'PUBLISHED' },
      },
      's4': {
        'k1': { scores: { E: 4, P: 3, I: 3, C: 4 }, feedbacks: { E: 'Mendalam.', P: 'Prediksi logis.', I: 'Penerapan baik.', C: 'Kritik tajam.' }, rawScore: 88, status: 'PUBLISHED' },
        'k2': { scores: { K: 4, A: 4, W: 3 }, feedbacks: { K: 'Tepat.', A: 'Analisis mendalam.', W: 'Cepat.' }, rawScore: 95, status: 'PUBLISHED' },
        'k3': { scores: { K: 3, A: 3, W: 4 }, feedbacks: { K: 'Benar.', A: 'Analisis baik.', W: 'Sangat cepat.' }, rawScore: 80, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 3, I: 4, C: 3 }, feedbacks: { E: 'Evaluasi kuat.', P: 'Prediksi baik.', I: 'Efisien.', C: 'Refleksi ada.' }, rawScore: 88, status: 'PUBLISHED' },
        'k5': { scores: { T: 4, P: 3, A: 3 }, feedbacks: { T: 'Menguasai teori.', P: 'Sesuai standar.', A: 'Analisis cukup.' }, rawScore: 83, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 4, A: 3 }, feedbacks: { T: 'Teori kuat.', P: 'Penerapan baik.', A: 'Analisis tajam.' }, rawScore: 93, status: 'PUBLISHED' },
      },
      's5': {
        'k1': { scores: { E: 3, P: 2, I: 3, C: 2 }, feedbacks: { E: 'Cukup.', P: 'Perlu latihan prediksi.', I: 'Penerapan dasar.', C: 'Refleksi kurang.' }, rawScore: 63, status: 'PUBLISHED' },
        'k2': { scores: { K: 3, A: 2, W: 3 }, feedbacks: { K: 'Cukup.', A: 'Perlu bimbingan.', W: 'Tepat waktu.' }, rawScore: 68, status: 'PUBLISHED' },
        'k3': { scores: { K: 2, A: 3, W: 2 }, feedbacks: { K: 'Perlu teliti.', A: 'Analisis ada.', W: 'Melewati sedikit waktu.' }, rawScore: 58, status: 'PUBLISHED' },
        'k4': { scores: { E: 3, P: 2, I: 3, C: 2 }, feedbacks: { E: 'Cukup.', P: 'Perlu bantuan.', I: 'Dasar.', C: 'Kurang.' }, rawScore: 63, status: 'PUBLISHED' },
        'k5': { scores: { T: 2, P: 3, A: 2 }, feedbacks: { T: 'Pemahaman dasar.', P: 'Penerapan ada.', A: 'Perlu peningkatan.' }, rawScore: 60, status: 'PUBLISHED' },
        'k6': { scores: { T: 3, P: 2, A: 3 }, feedbacks: { T: 'Cukup.', P: 'Perlu latihan.', A: 'Analisis ada.' }, rawScore: 65, status: 'PUBLISHED' },
      },
      's6': {
        'k1': { scores: { E: 4, P: 4, I: 4, C: 4 }, feedbacks: { E: 'Luar biasa.', P: 'Sangat tajam.', I: 'Sangat efisien.', C: 'Audit mandiri sempurna.' }, rawScore: 100, status: 'PUBLISHED' },
        'k2': { scores: { K: 4, A: 4, W: 4 }, feedbacks: { K: 'Sempurna.', A: 'Analisis hebat.', W: 'Disiplin tinggi.' }, rawScore: 100, status: 'PUBLISHED' },
        'k3': { scores: { K: 4, A: 3, W: 4 }, feedbacks: { K: 'Presisi.', A: 'Analisis baik.', W: 'Cepat.' }, rawScore: 93, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 4, I: 4, C: 3 }, feedbacks: { E: 'Mendalam.', P: 'Sangat akurat.', I: 'Rapi.', C: 'Kritis.' }, rawScore: 95, status: 'PUBLISHED' },
        'k5': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Sangat menguasai.', P: 'Sempurna.', A: 'Komprehensif.' }, rawScore: 100, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Sempurna.', P: 'Sangat tepat.', A: 'Luar biasa.' }, rawScore: 100, status: 'PUBLISHED' },
      },
      's7': {
        'k1': { scores: { E: 3, P: 3, I: 4, C: 3 }, feedbacks: { E: 'Baik.', P: 'Logis.', I: 'Terstruktur.', C: 'Refleksi ada.' }, rawScore: 80, status: 'PUBLISHED' },
        'k2': { scores: { K: 3, A: 4, W: 3 }, feedbacks: { K: 'Baik.', A: 'Analisis tajam.', W: 'Tepat waktu.' }, rawScore: 83, status: 'PUBLISHED' },
        'k3': { scores: { K: 3, A: 3, W: 3 }, feedbacks: { K: 'Cukup.', A: 'Baik.', W: 'Tepat.' }, rawScore: 75, status: 'PUBLISHED' },
        'k4': { scores: { E: 4, P: 3, I: 3, C: 3 }, feedbacks: { E: 'Mendalam.', P: 'Logis.', I: 'Baik.', C: 'Terstruktur.' }, rawScore: 83, status: 'PUBLISHED' },
        'k5': { scores: { T: 3, P: 3, A: 4 }, feedbacks: { T: 'Baik.', P: 'Sesuai.', A: 'Analisis tajam.' }, rawScore: 83, status: 'PUBLISHED' },
        'k6': { scores: { T: 4, P: 3, A: 3 }, feedbacks: { T: 'Menguasai.', P: 'Baik.', A: 'Analisis baik.' }, rawScore: 83, status: 'PUBLISHED' },
      }
    }
  },
  {
    id: 'mk-2',
    name: 'Akuntansi Keuangan Menengah',
    kode_mk: '25P04086',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    sks: 3,
    kelas: 'PE 2025 B',
    status: 'ACTIVE',
    join_code: 'K9M2P1',
    description: 'Studi mendalam mengenai pelaporan keuangan, aset lancar, dan kewajiban jangka pendek.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    created_at: '2026-07-05T09:00:00Z',
    komponen: [
      { id: 'k21', name: 'Proyek', bobot: 0, rubricId: null, rubricName: null, urutan: 1 },
      { id: 'k22', name: 'Partisipasi Kelas', bobot: 0, rubricId: null, rubricName: null, urutan: 2 },
      { id: 'k23', name: 'Quiz', bobot: 0, rubricId: null, rubricName: null, urutan: 3 },
      { id: 'k24', name: 'Tugas', bobot: 0, rubricId: null, rubricName: null, urutan: 4 },
      { id: 'k25', name: 'UTS', bobot: 0, rubricId: null, rubricName: null, urutan: 5 },
      { id: 'k26', name: 'UAS', bobot: 0, rubricId: null, rubricName: null, urutan: 6 },
    ],
    students: [
      { id: 's1', student_id: 'mock-mahasiswa-uuid', nim: '2024081001', full_name: 'Feri Irawan', enrolled_at: '2026-07-15' },
    ]
  },
  {
    id: 'mk-3',
    name: 'Auditing & Assurance',
    kode_mk: '25P04090',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    sks: 3,
    kelas: 'PE 2025 A',
    status: 'ACTIVE',
    join_code: 'X5N8Q4',
    description: 'Prinsip-prinsip pemeriksaan akuntansi, opini audit, dan etika profesi akuntan publik.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    created_at: '2026-07-10T10:00:00Z',
    komponen: [
      { id: 'k31', name: 'Proyek Audit', bobot: 0.30, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 1 },
      { id: 'k32', name: 'Kuis Etika', bobot: 0.20, rubricId: 'r2', rubricName: 'Rubrik Quiz Standar', urutan: 2 },
      { id: 'k33', name: 'Ujian Akhir Audit', bobot: 0.50, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 3 },
    ],
    students: [
      { id: 's1', student_id: 'mock-mahasiswa-uuid', nim: '2024081001', full_name: 'Feri Irawan', enrolled_at: '2026-07-15' },
      { id: 's2', student_id: 's2-uuid', nim: '2024081002', full_name: 'Rina Permata Sari', enrolled_at: '2026-07-15' },
    ]
  }
];

const STORAGE_KEY = 'epic_mks_v4';

const loadSavedMKs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Migrate: remove old version data
      localStorage.removeItem('epic_mks_v3');
      return INITIAL_MKS;
    }
    const parsed = JSON.parse(saved);
    const mk1 = parsed.find(mk => mk.id === 'mk-1');
    // If institutional fields or scoringData is missing, force re-initialize
    if (!mk1?.scoringData?.['s2'] || mk1?.sks === undefined) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MKS));
      return INITIAL_MKS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_MKS;
  }
};

const saveMKsToStorage = (mks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mks));
  } catch (e) {}
};

export const useMKStore = create((set, get) => ({
  mkList: loadSavedMKs(),

  // Create MK
  createMK: (mkData, customKomponen = null) => {
    const { mkList } = get();
    const newId = `mk-${Date.now()}`;
    const code = mkData.join_code || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const komponenToUse = customKomponen || DEFAULT_KOMPONEN.map((k, idx) => ({
      id: `k-${Date.now()}-${idx}`,
      name: k.name,
      bobot: 0,
      rubricId: null,
      rubricName: null,
      urutan: k.urutan
    }));

    const newMK = {
      id: newId,
      name: mkData.name,
      kode_mk: mkData.kode_mk,
      semester: mkData.semester,
      kode_semester: mkData.kode_semester || '',
      sks: Number(mkData.sks) || 2,
      kelas: mkData.kelas || '',
      status: 'ACTIVE',
      join_code: code,
      description: mkData.description || '',
      dosen_id: mkData.dosen_id || 'mock-dosen-uuid',
      dosen_name: mkData.dosen_name || 'Dwi Puji Astuti, S.Pd., M.Pd.',
      created_at: new Date().toISOString(),
      komponen: komponenToUse,
      students: []
    };

    const updated = [newMK, ...mkList];
    set({ mkList: updated });
    saveMKsToStorage(updated);
    return newMK;
  },

  // Update MK details
  updateMK: (id, partialData) => {
    const { mkList } = get();
    const updated = mkList.map(mk => mk.id === id ? { ...mk, ...partialData } : mk);
    set({ mkList: updated });
    saveMKsToStorage(updated);
  },

  // Delete MK
  deleteMK: (id) => {
    const { mkList } = get();
    const updated = mkList.filter(mk => mk.id !== id);
    set({ mkList: updated });
    saveMKsToStorage(updated);
  },

  // Student join MK by code
  joinMKByCode: (joinCode, student) => {
    const { mkList } = get();
    const cleanCode = joinCode.trim().toUpperCase();
    const targetMK = mkList.find(mk => mk.join_code === cleanCode);

    if (!targetMK) {
      return { success: false, message: 'Kode MK tidak ditemukan' };
    }

    const alreadyEnrolled = targetMK.students.some(s => s.student_id === student.id);
    if (alreadyEnrolled) {
      return { success: false, message: 'Anda sudah terdaftar di mata kuliah ini' };
    }

    const newEnrollment = {
      id: `enr-${Date.now()}`,
      student_id: student.id,
      nim: student.nim || '2024081001',
      full_name: student.full_name || 'Mahasiswa',
      enrolled_at: new Date().toISOString()
    };

    const updated = mkList.map(mk => {
      if (mk.id === targetMK.id) {
        return { ...mk, students: [...mk.students, newEnrollment] };
      }
      return mk;
    });

    set({ mkList: updated });
    saveMKsToStorage(updated);
    return { success: true, mk: targetMK };
  },

  // Komponen Management
  updateKomponenList: (mkId, newKomponenList) => {
    const { mkList } = get();
    
    const updated = mkList.map(mk => {
      if (mk.id === mkId) {
        return {
          ...mk,
          status: 'ACTIVE',
          komponen: newKomponenList
        };
      }
      return mk;
    });

    set({ mkList: updated });
    saveMKsToStorage(updated);
  },

  // Assign Rubric to Komponen
  assignRubricToKomponen: (mkId, komponenId, rubricId, rubricName) => {
    const { mkList } = get();
    const targetMK = mkList.find(mk => mk.id === mkId);
    if (!targetMK) return;

    const updatedKomponen = targetMK.komponen.map(k => {
      if (k.id === komponenId) {
        return { ...k, rubricId, rubricName };
      }
      return k;
    });

    get().updateKomponenList(mkId, updatedKomponen);
  },

  // Get single MK by ID
  getMKById: (id) => {
    return get().mkList.find(mk => mk.id === id);
  }
}));
