import { create } from 'zustand';

const INITIAL_RUBRICS = [
  {
    id: 'r1',
    name: 'Rubrik Proyek AKT',
    description: 'Rubrik penilaian untuk proyek akuntansi dasar dengan fokus pada siklus akuntansi komprehensif.',
    usedIn: ['Praktikum Akuntansi Dasar'],
    created_by: 'mock-dosen-uuid',
    created_at: '2026-07-10',
    dimensions: [
      { code: 'E', name: 'Evaluative Understanding', weight: 0.30, feedback_1: 'Belum mampu mengevaluasi data.', feedback_2: 'Evaluasi dasar.', feedback_3: 'Evaluasi baik.', feedback_4: 'Evaluasi sangat mendalam.' },
      { code: 'P', name: 'Predictive Reasoning', weight: 0.30, feedback_1: 'Belum mampu memprediksi.', feedback_2: 'Prediksi dasar.', feedback_3: 'Prediksi baik.', feedback_4: 'Prediksi tajam.' },
      { code: 'I', name: 'Intelligent Application', weight: 0.20, feedback_1: 'Penerapan belum tepat.', feedback_2: 'Penerapan dasar.', feedback_3: 'Penerapan terstruktur.', feedback_4: 'Penerapan efisien.' },
      { code: 'C', name: 'Critical Reflection', weight: 0.20, feedback_1: 'Belum ada refleksi.', feedback_2: 'Refleksi terbatas.', feedback_3: 'Refleksi baik.', feedback_4: 'Refleksi kritis.' }
    ]
  },
  {
    id: 'r2',
    name: 'Rubrik Quiz Standar',
    description: 'Rubrik umum untuk penilaian kuis cepat dengan 3 dimensi utama.',
    usedIn: ['Praktikum Akuntansi Dasar', 'Auditing & Assurance'],
    created_by: 'mock-dosen-uuid',
    created_at: '2026-07-12',
    dimensions: [
      { code: 'K', name: 'Ketepatan Jawaban', weight: 0.50, feedback_1: 'Jawaban salah.', feedback_2: 'Sebagian benar.', feedback_3: 'Benar.', feedback_4: 'Sangat tepat dan rapi.' },
      { code: 'A', name: 'Analisis Soal', weight: 0.30, feedback_1: 'Tidak ada analisis.', feedback_2: 'Analisis kurang.', feedback_3: 'Analisis baik.', feedback_4: 'Analisis sangat mendalam.' },
      { code: 'W', name: 'Waktu Pengerjaan', weight: 0.20, feedback_1: 'Melewati batas waktu.', feedback_2: 'Tepat batas waktu.', feedback_3: 'Cepat.', feedback_4: 'Sangat cepat dan efisien.' },
    ]
  },
  {
    id: 'r3',
    name: 'Rubrik UTS AKL',
    description: 'Rubrik ujian tengah semester khusus Akuntansi Keuangan Lanjutan.',
    usedIn: ['Akuntansi Keuangan Menengah'],
    created_by: 'mock-dosen-uuid',
    created_at: '2026-07-15',
    dimensions: [
      { code: 'T', name: 'Teori Akuntansi', weight: 0.30, feedback_1: 'Kurang paham teori.', feedback_2: 'Paham dasar.', feedback_3: 'Paham baik.', feedback_4: 'Sangat menguasai teori.' },
      { code: 'P', name: 'Penerapan Standar', weight: 0.40, feedback_1: 'Penerapan salah.', feedback_2: 'Beberapa error.', feedback_3: 'Sesuai standar.', feedback_4: 'Sangat tepat standar.' },
      { code: 'A', name: 'Analisis Kasus', weight: 0.30, feedback_1: 'Belum mampu.', feedback_2: 'Analisis dasar.', feedback_3: 'Analisis tajam.', feedback_4: 'Analisis komprehensif.' },
    ]
  }
];

const loadSavedRubrics = () => {
  try {
    const saved = localStorage.getItem('epic_rubrics');
    return saved ? JSON.parse(saved) : INITIAL_RUBRICS;
  } catch (e) {
    return INITIAL_RUBRICS;
  }
};

const saveRubricsToStorage = (rubrics) => {
  try {
    localStorage.setItem('epic_rubrics', JSON.stringify(rubrics));
  } catch (e) {}
};

export const useRubricStore = create((set, get) => ({
  rubrics: loadSavedRubrics(),

  createRubric: (rubricData) => {
    const { rubrics } = get();
    const newRubric = {
      id: `r-${Date.now()}`,
      name: rubricData.name,
      description: rubricData.description || '',
      dimensions: rubricData.dimensions || [],
      usedIn: [],
      created_by: rubricData.created_by || 'mock-dosen-uuid',
      created_at: new Date().toISOString().split('T')[0]
    };
    const updated = [newRubric, ...rubrics];
    set({ rubrics: updated });
    saveRubricsToStorage(updated);
    return newRubric;
  },

  updateRubric: (id, partialData) => {
    const { rubrics } = get();
    const updated = rubrics.map(r => r.id === id ? { ...r, ...partialData } : r);
    set({ rubrics: updated });
    saveRubricsToStorage(updated);
  },

  deleteRubric: (id) => {
    const { rubrics } = get();
    const updated = rubrics.filter(r => r.id !== id);
    set({ rubrics: updated });
    saveRubricsToStorage(updated);
  },

  duplicateRubric: (id) => {
    const { rubrics } = get();
    const target = rubrics.find(r => r.id === id);
    if (!target) return;

    const copy = {
      ...target,
      id: `r-${Date.now()}`,
      name: `${target.name} (Salinan)`,
      usedIn: [],
      created_at: new Date().toISOString().split('T')[0]
    };

    const updated = [copy, ...rubrics];
    set({ rubrics: updated });
    saveRubricsToStorage(updated);
    return copy;
  }
}));
