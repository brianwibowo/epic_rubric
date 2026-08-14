import { create } from 'zustand';
import { DEFAULT_KOMPONEN } from '@/utils/constants';

const INITIAL_MKS = [
  {
    id: 'mk-1',
    name: 'Praktikum Akuntansi Dasar',
    kode_mk: '25P04085',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    tahun_ajaran: '2025/2026',
    sks: 2,
    status: 'ACTIVE',
    join_code: 'A3B7F2',
    description: 'Mata kuliah praktikum yang membahas siklus akuntansi perusahaan jasa dan dagang secara komprehensif.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    guru_id: 'mock-guru-uuid',
    guru_name: 'Siti Rahmawati, S.Pd.',
    created_at: '2026-07-01T08:00:00Z',
    komponen: [
      { id: 'k1', name: 'Proyek', bobot: 0.20, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 1 },
      { id: 'k2', name: 'Partisipasi Kelas', bobot: 0.10, rubricId: 'r2', rubricName: 'Rubrik Partisipasi Standar', urutan: 2 },
      { id: 'k3', name: 'Quiz', bobot: 0.15, rubricId: 'r2', rubricName: 'Rubrik Quiz Standar', urutan: 3 },
      { id: 'k4', name: 'Tugas', bobot: 0.15, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 4 },
      { id: 'k5', name: 'UTS', bobot: 0.20, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 5 },
      { id: 'k6', name: 'UAS', bobot: 0.20, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 6 },
    ],
    rombel: [
      {
        id: 'rombel-smk-1',
        name: 'XII AKL 1',
        kode_rombel: 'XII-AKL-1',
        semester: 'Tahun Ajaran 2025/2026',
        tahun_ajaran: '2025/2026',
        is_school: true,
        kapasitas: 36,
        guru_pengampu: 'Siti Rahmawati, S.Pd.',
        dosen_pengampu: 'Siti Rahmawati, S.Pd.',
        jadwal: 'Senin, 07:30 - 09:30 WIB',
        ruangan: 'Ruang Teori AKL 1 / Lab 2',
        students: [
          { id: 'sk-1', student_id: 'mock-siswa-uuid', nim: '0081234567', nisn: '0081234567', full_name: 'Ahmad Rifai', enrolled_at: '2025-07-14' },
          { id: 'sk-2', student_id: 'sk2-uuid', nim: '0051234002', nisn: '0051234002', full_name: 'Budi Setiawan', enrolled_at: '2025-07-14' },
          { id: 'sk-3', student_id: 'sk3-uuid', nim: '0051234003', nisn: '0051234003', full_name: 'Citra Dewi', enrolled_at: '2025-07-14' },
          { id: 'sk-4', student_id: 'sk4-uuid', nim: '0051234004', nisn: '0051234004', full_name: 'Dina Rahmawati', enrolled_at: '2025-07-14' },
          { id: 'sk-5', student_id: 'sk5-uuid', nim: '0051234005', nisn: '0051234005', full_name: 'Eko Prasetyo', enrolled_at: '2025-07-14' },
          { id: 'sk-6', student_id: 'sk6-uuid', nim: '0051234006', nisn: '0051234006', full_name: 'Fitri Handayani', enrolled_at: '2025-07-14' },
        ],
        scoringData: {
          'sk-1': {
            'k1': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Sangat baik menganalisis jurnal transaksi.', P: 'Prediksi arus kas tepat.', I: 'Penerapan rapi.', C: 'Refleksi kritis.' }, rawScore: 93, status: 'PUBLISHED' },
            'k2': { scores: { K: 4, A: 4, W: 4 }, feedbacks: { K: 'Aktif dalam praktik.', A: 'Analisis mendalam.', W: 'Disiplin.' }, rawScore: 100, status: 'PUBLISHED' },
            'k3': { scores: { K: 3, A: 4, W: 3 }, feedbacks: { K: 'Jawaban benar.', A: 'Analisis tajam.', W: 'Cepat.' }, rawScore: 83, status: 'PUBLISHED' },
            'k4': { scores: { E: 4, P: 4, I: 3, C: 4 }, feedbacks: { E: 'Evaluasi mendalam.', P: 'Logis.', I: 'Penerapan terstruktur.', C: 'Audit baik.' }, rawScore: 95, status: 'PUBLISHED' },
            'k5': { scores: { T: 4, P: 3, A: 4 }, feedbacks: { T: 'Menguasai teori.', P: 'Sesuai standar.', A: 'Analisis komprehensif.' }, rawScore: 90, status: 'PUBLISHED' },
            'k6': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Penguasaan teori sempurna.', P: 'Penerapan tepat.', A: 'Analisis tajam.' }, rawScore: 100, status: 'PUBLISHED' },
          },
          'mock-siswa-uuid': {
            'k1': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Sangat baik menganalisis jurnal transaksi.', P: 'Prediksi arus kas tepat.', I: 'Penerapan rapi.', C: 'Refleksi kritis.' }, rawScore: 93, status: 'PUBLISHED' },
            'k2': { scores: { K: 4, A: 4, W: 4 }, feedbacks: { K: 'Aktif dalam praktik.', A: 'Analisis mendalam.', W: 'Disiplin.' }, rawScore: 100, status: 'PUBLISHED' },
            'k3': { scores: { K: 3, A: 4, W: 3 }, feedbacks: { K: 'Jawaban benar.', A: 'Analisis tajam.', W: 'Cepat.' }, rawScore: 83, status: 'PUBLISHED' },
            'k4': { scores: { E: 4, P: 4, I: 3, C: 4 }, feedbacks: { E: 'Evaluasi mendalam.', P: 'Logis.', I: 'Penerapan terstruktur.', C: 'Audit baik.' }, rawScore: 95, status: 'PUBLISHED' },
            'k5': { scores: { T: 4, P: 3, A: 4 }, feedbacks: { T: 'Menguasai teori.', P: 'Sesuai standar.', A: 'Analisis komprehensif.' }, rawScore: 90, status: 'PUBLISHED' },
            'k6': { scores: { T: 4, P: 4, A: 4 }, feedbacks: { T: 'Penguasaan teori sempurna.', P: 'Penerapan tepat.', A: 'Analisis tajam.' }, rawScore: 100, status: 'PUBLISHED' },
          },
          'sk-2': {
            'k1': { scores: { E: 4, P: 4, I: 4, C: 3 }, feedbacks: { E: 'Evaluasi tajam.', P: 'Prediksi akurat.', I: 'Penerapan rapi.', C: 'Refleksi baik.' }, rawScore: 95, status: 'PUBLISHED' },
            'k2': { scores: { K: 4, A: 3, W: 4 }, feedbacks: { K: 'Sangat baik.', A: 'Analisis cukup.', W: 'Tepat waktu.' }, rawScore: 93, status: 'PUBLISHED' },
            'k3': { scores: { K: 4, A: 4, W: 3 }, feedbacks: { K: 'Presisi tinggi.', A: 'Analisis bagus.', W: 'Cepat.' }, rawScore: 95, status: 'PUBLISHED' },
            'k4': { scores: { E: 4, P: 3, I: 4, C: 4 }, feedbacks: { E: 'Evaluasi kuat.', P: 'Prediksi baik.', I: 'Kertas kerja rapi.', C: 'Kritikal.' }, rawScore: 93, status: 'PUBLISHED' },
            'k5': { scores: { T: 3, P: 4, A: 4 }, feedbacks: { T: 'Teori baik.', P: 'Standar presisi.', A: 'Analisis kasus mendalam.' }, rawScore: 93, status: 'PUBLISHED' },
            'k6': { scores: { T: 4, P: 4, A: 3 }, feedbacks: { T: 'Teori matang.', P: 'Penerapan rapi.', A: 'Analisis baik.' }, rawScore: 93, status: 'PUBLISHED' },
          }
        }
      },
      {
        id: 'rombel-smk-2',
        name: 'XII AKL 2',
        kode_rombel: 'XII-AKL-2',
        semester: 'Tahun Ajaran 2025/2026',
        tahun_ajaran: '2025/2026',
        is_school: true,
        kapasitas: 36,
        guru_pengampu: 'Budi Santoso, M.Pd.',
        dosen_pengampu: 'Budi Santoso, M.Pd.',
        jadwal: 'Rabu, 07:30 - 09:30 WIB',
        ruangan: 'Ruang Teori AKL 2 / Lab 2',
        students: [
          { id: 'sk-7', student_id: 'sk7-uuid', nim: '0051234007', nisn: '0051234007', full_name: 'Gilang Ramadhan', enrolled_at: '2025-07-14' },
          { id: 'sk-8', student_id: 'sk8-uuid', nim: '0051234008', nisn: '0051234008', full_name: 'Hesti Wulandari', enrolled_at: '2025-07-14' },
          { id: 'sk-9', student_id: 'sk9-uuid', nim: '0051234009', nisn: '0051234009', full_name: 'Irfan Hakim', enrolled_at: '2025-07-14' },
          { id: 'sk-10', student_id: 'sk10-uuid', nim: '0051234010', nisn: '0051234010', full_name: 'Julia Sari', enrolled_at: '2025-07-14' },
          { id: 'sk-11', student_id: 'sk11-uuid', nim: '0051234011', nisn: '0051234011', full_name: 'Kevin Aditya', enrolled_at: '2025-07-14' },
        ],
        scoringData: {}
      },
      {
        id: 'rombel-1a',
        name: 'PE 2025 A',
        kode_rombel: '25P04085-A',
        semester: 'Ganjil 2025/2026',
        is_school: false,
        kapasitas: 40,
        dosen_pengampu: 'Dwi Puji Astuti, S.Pd., M.Pd.',
        guru_pengampu: 'Dwi Puji Astuti, S.Pd., M.Pd.',
        jadwal: 'Senin, 08:00 - 09:40 WIB',
        ruangan: 'Lab Akuntansi 1 / D302',
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
          }
        }
      },
      {
        id: 'rombel-1b',
        name: 'PE 2025 B',
        kode_rombel: '25P04085-B',
        semester: 'Ganjil 2025/2026',
        is_school: false,
        kapasitas: 40,
        dosen_pengampu: 'Dwi Puji Astuti, S.Pd., M.Pd.',
        guru_pengampu: 'Dwi Puji Astuti, S.Pd., M.Pd.',
        jadwal: 'Selasa, 10:00 - 11:40 WIB',
        ruangan: 'Lab Akuntansi 2 / D304',
        students: [
          { id: 's8', student_id: 's8-uuid', nim: '2024081008', full_name: 'Yuliana Sari', enrolled_at: '2026-07-15' },
          { id: 's9', student_id: 's9-uuid', nim: '2024081009', full_name: 'Agus Setiawan', enrolled_at: '2026-07-15' },
          { id: 's10', student_id: 's10-uuid', nim: '2024081010', full_name: 'Maya Putri', enrolled_at: '2026-07-16' },
        ],
        scoringData: {}
      }
    ]
  },
  {
    id: 'mk-2',
    name: 'Akuntansi Keuangan Menengah',
    kode_mk: '25P04086',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    tahun_ajaran: '2025/2026',
    sks: 3,
    status: 'ACTIVE',
    join_code: 'K9M2P1',
    description: 'Studi mendalam mengenai pelaporan keuangan, aset lancar, dan kewajiban jangka pendek.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    guru_id: 'mock-guru-uuid',
    guru_name: 'Siti Rahmawati, S.Pd.',
    created_at: '2026-07-05T09:00:00Z',
    komponen: [
      { id: 'k21', name: 'Proyek', bobot: 0.30, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 1 },
      { id: 'k22', name: 'Partisipasi Kelas', bobot: 0.20, rubricId: 'r2', rubricName: 'Rubrik Partisipasi Standar', urutan: 2 },
      { id: 'k23', name: 'UTS', bobot: 0.25, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 3 },
      { id: 'k24', name: 'UAS', bobot: 0.25, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 4 },
    ],
    rombel: [
      {
        id: 'rombel-smk-3',
        name: 'XI AKL 1',
        kode_rombel: 'XI-AKL-1',
        semester: 'Tahun Ajaran 2025/2026',
        tahun_ajaran: '2025/2026',
        is_school: true,
        kapasitas: 36,
        guru_pengampu: 'Siti Rahmawati, S.Pd.',
        dosen_pengampu: 'Siti Rahmawati, S.Pd.',
        students: [
          { id: 'sk-12', student_id: 'sk12-uuid', nim: '0051234012', nisn: '0051234012', full_name: 'Lina Marlina', enrolled_at: '2025-07-14' },
          { id: 'sk-13', student_id: 'sk13-uuid', nim: '0051234013', nisn: '0051234013', full_name: 'Muhamad Rizki', enrolled_at: '2025-07-14' },
          { id: 'sk-14', student_id: 'sk14-uuid', nim: '0051234014', nisn: '0051234014', full_name: 'Nadia Putri', enrolled_at: '2025-07-14' },
          { id: 'sk-15', student_id: 'sk15-uuid', nim: '0051234015', nisn: '0051234015', full_name: 'Omar Faruq', enrolled_at: '2025-07-14' },
          { id: 'sk-16', student_id: 'sk16-uuid', nim: '0051234016', nisn: '0051234016', full_name: 'Putri Amelia', enrolled_at: '2025-07-14' },
          { id: 'sk-17', student_id: 'sk17-uuid', nim: '0051234017', nisn: '0051234017', full_name: 'Qori Hidayat', enrolled_at: '2025-07-14' },
          { id: 'sk-18', student_id: 'sk18-uuid', nim: '0051234018', nisn: '0051234018', full_name: 'Rina Agustina', enrolled_at: '2025-07-14' },
        ],
        scoringData: {}
      },
      {
        id: 'rombel-2a',
        name: 'PE 2025 B',
        kode_rombel: '25P04086-B',
        is_school: false,
        students: [
          { id: 's1', student_id: 'mock-mahasiswa-uuid', nim: '2024081001', full_name: 'Feri Irawan', enrolled_at: '2026-07-15' },
        ],
        scoringData: {}
      }
    ]
  },
  {
    id: 'mk-3',
    name: 'Auditing & Assurance',
    kode_mk: '25P04090',
    semester: 'Ganjil 2025/2026',
    kode_semester: 'R225',
    tahun_ajaran: '2025/2026',
    sks: 3,
    status: 'ACTIVE',
    join_code: 'X5N8Q4',
    description: 'Prinsip-prinsip pemeriksaan akuntansi, opini audit, dan etika profesi akuntan publik.',
    dosen_id: 'mock-dosen-uuid',
    dosen_name: 'Dwi Puji Astuti, S.Pd., M.Pd.',
    guru_id: 'mock-guru-uuid',
    guru_name: 'Siti Rahmawati, S.Pd.',
    created_at: '2026-07-10T10:00:00Z',
    komponen: [
      { id: 'k31', name: 'Proyek Audit', bobot: 0.30, rubricId: 'r1', rubricName: 'Rubrik Proyek AKT', urutan: 1 },
      { id: 'k32', name: 'Kuis Etika', bobot: 0.20, rubricId: 'r2', rubricName: 'Rubrik Quiz Standar', urutan: 2 },
      { id: 'k33', name: 'Ujian Akhir Audit', bobot: 0.50, rubricId: 'r3', rubricName: 'Rubrik UTS AKL', urutan: 3 },
    ],
    rombel: [
      {
        id: 'rombel-smk-5',
        name: 'XII AKL 1',
        kode_rombel: 'XII-AKL-1',
        semester: 'Tahun Ajaran 2025/2026',
        tahun_ajaran: '2025/2026',
        is_school: true,
        guru_pengampu: 'Siti Rahmawati, S.Pd.',
        dosen_pengampu: 'Siti Rahmawati, S.Pd.',
        students: [
          { id: 'sk-1', student_id: 'mock-siswa-uuid', nim: '0081234567', nisn: '0081234567', full_name: 'Ahmad Rifai', enrolled_at: '2025-07-14' },
          { id: 'sk-2', student_id: 'sk2-uuid', nim: '0051234002', nisn: '0051234002', full_name: 'Budi Setiawan', enrolled_at: '2025-07-14' },
        ],
        scoringData: {}
      },
      {
        id: 'rombel-3a',
        name: 'PE 2025 A',
        kode_rombel: '25P04090-A',
        is_school: false,
        students: [
          { id: 's1', student_id: 'mock-mahasiswa-uuid', nim: '2024081001', full_name: 'Feri Irawan', enrolled_at: '2026-07-15' },
          { id: 's2', student_id: 's2-uuid', nim: '2024081002', full_name: 'Rina Permata Sari', enrolled_at: '2026-07-15' },
        ],
        scoringData: {}
      }
    ]
  }
];

const STORAGE_KEY = 'epic_mks_v6';

const loadSavedMKs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saveMKsToStorage(INITIAL_MKS);
      return INITIAL_MKS;
    }
    const parsed = JSON.parse(saved);
    const mk1 = parsed.find(mk => mk.id === 'mk-1');
    if (!mk1?.rombel || !Array.isArray(mk1.rombel) || mk1.rombel.length < 2) {
      saveMKsToStorage(INITIAL_MKS);
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

    const initialRombel = [{
      id: `rombel-${Date.now()}`,
      name: mkData.kelas || 'Kelas / Rombel 1',
      students: [],
      scoringData: {}
    }];

    const newMK = {
      id: newId,
      name: mkData.name,
      kode_mk: mkData.kode_mk || 'MK-' + Math.floor(1000 + Math.random() * 9000),
      semester: mkData.semester || 'Ganjil 2026/2027',
      sks: parseInt(mkData.sks) || 2,
      status: 'ACTIVE',
      join_code: code,
      description: mkData.description || '',
      dosen_id: mkData.dosen_id || 'mock-dosen-uuid',
      dosen_name: mkData.dosen_name || 'Dosen Pengampu',
      guru_id: mkData.guru_id || 'mock-guru-uuid',
      guru_name: mkData.guru_name || 'Guru Pengampu',
      created_at: new Date().toISOString(),
      komponen: komponenToUse,
      rombel: initialRombel
    };

    const updated = [newMK, ...mkList];
    set({ mkList: updated });
    saveMKsToStorage(updated);
    return newMK;
  },

  // Update MK
  updateMK: (id, updates) => {
    const { mkList } = get();
    const updated = mkList.map(mk => {
      if (mk.id === id) {
        return { ...mk, ...updates };
      }
      return mk;
    });

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

  // Reset to initial mock data
  resetMKs: () => {
    set({ mkList: INITIAL_MKS });
    saveMKsToStorage(INITIAL_MKS);
  },

  // === MULTI-ROMBEL METHODS ===

  addRombel: (mkId, rombelData) => {
    const { mkList } = get();
    const newRombelId = `rombel-${Date.now()}`;
    const newRombel = {
      id: newRombelId,
      name: rombelData.name,
      students: rombelData.students || [],
      scoringData: rombelData.scoringData || {}
    };

    const updated = mkList.map(mk => {
      if (mk.id === mkId) {
        const currentRombel = mk.rombel || [];
        return {
          ...mk,
          rombel: [...currentRombel, newRombel]
        };
      }
      return mk;
    });

    set({ mkList: updated });
    saveMKsToStorage(updated);
    return newRombel;
  },

  updateRombel: (mkId, rombelId, updates) => {
    const { mkList } = get();
    const updated = mkList.map(mk => {
      if (mk.id === mkId) {
        const currentRombel = mk.rombel || [];
        const updatedRombel = currentRombel.map(r => {
          if (r.id === rombelId) {
            return { ...r, ...updates };
          }
          return r;
        });
        return { ...mk, rombel: updatedRombel };
      }
      return mk;
    });

    set({ mkList: updated });
    saveMKsToStorage(updated);
  },

  deleteRombel: (mkId, rombelId) => {
    const { mkList } = get();
    const updated = mkList.map(mk => {
      if (mk.id === mkId) {
        const currentRombel = mk.rombel || [];
        if (currentRombel.length <= 1) {
          return mk; // Don't delete the last rombel
        }
        return {
          ...mk,
          rombel: currentRombel.filter(r => r.id !== rombelId)
        };
      }
      return mk;
    });

    set({ mkList: updated });
    saveMKsToStorage(updated);
  },

  getRombelById: (mkId, rombelId) => {
    const mk = get().mkList.find(m => m.id === mkId);
    if (!mk) return null;
    return (mk.rombel || []).find(r => r.id === rombelId) || null;
  },

  // Get all students across all rombel in an MK
  getAllStudents: (mkId) => {
    const mk = get().mkList.find(m => m.id === mkId);
    if (!mk) return [];
    return (mk.rombel || []).flatMap(r => r.students || []);
  },

  // Get all scoring data across all rombel (merged)
  getAllScoringData: (mkId) => {
    const mk = get().mkList.find(m => m.id === mkId);
    if (!mk) return {};
    return (mk.rombel || []).reduce((acc, r) => ({ ...acc, ...(r.scoringData || {}) }), {});
  },

  getDefaultRombel: (mkId) => {
    const mk = get().mkList.find(m => m.id === mkId);
    if (!mk || !mk.rombel || mk.rombel.length === 0) return null;
    return mk.rombel[0];
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

  getMKById: (id) => {
    return get().mkList.find(mk => mk.id === id);
  }
}));
