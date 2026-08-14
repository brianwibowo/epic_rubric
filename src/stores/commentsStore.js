import { create } from 'zustand';

const INITIAL_COMMENTS = [
  {
    id: 'c1',
    mk_id: 'mk-1',
    rombel_id: 'ALL',
    scope: 'PRIVATE',
    target_student_id: 's-1786701503436',
    target_student_name: 'Feri Irawan',
    title: 'Catatan Evaluasi Siklus Akuntansi & Jurnal Penyesuaian',
    author: { 
      id: 'mock-dosen-uuid', 
      name: 'Dwi Puji Astuti, S.Pd., M.Pd.', 
      role: 'dosen', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60' 
    },
    content: `Halo **Feri Irawan**, berikut adalah beberapa poin evaluasi hasil pengerjaan proyek siklus akuntansi Anda:

1. **Jurnal Penyesuaian**: Perhatikan kembali perhitungan beban penyusutan mesin dan akun piutang tak tertagih.
2. **Kertas Kerja (Worksheet)**: Kolom neraca saldo setelah penyesuaian sudah seimbang (*balanced*), namun pastikan format akun konsisten sesuai SAK ETAP.
3. **Dimensi Kritis EPIC**: Pada bagian *Critical Reflection*, berikan penjelasan lebih mendalam terkait dampak penyesuaian terhadap laba bersih.

Silakan pelajari kembali materi modul 4 dan lakukan revisi sebelum batas akhir UAS. Semangat!`,
    created_at: '2026-08-14T09:30:00Z',
    pinned: true,
    replies: [
      {
        id: 'c1r1',
        author: { 
          id: 'mock-mahasiswa-uuid', 
          name: 'Feri Irawan', 
          role: 'mahasiswa', 
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=60' 
        },
        content: 'Terima kasih banyak atas feedback dan arahannya, Bu. Saya akan segera merevisi akun aset tetap dan perhitungan penyusutannya sesuai catatan Ibu.',
        created_at: '2026-08-14T10:15:00Z',
      }
    ]
  },
  {
    id: 'c2',
    mk_id: 'mk-1',
    rombel_id: 'ALL',
    scope: 'BROADCAST',
    target_student_id: null,
    target_student_name: null,
    title: 'Pengumuman Hasil Penilaian Quiz & Persiapan Ujian Tengah Semester',
    author: { 
      id: 'mock-dosen-uuid', 
      name: 'Dwi Puji Astuti, S.Pd., M.Pd.', 
      role: 'dosen', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60' 
    },
    content: `Selamat pagi rekan-rekan mahasiswa Praktikum Akuntansi Dasar,

Seluruh nilai untuk komponen **Kuis (NKUS)** dan **Aktivitas Partisipatif (NAPF)** telah selesai dipublikasikan ke sistem.
Rata-rata kelas menunjukkan peningkatan pemahaman yang sangat baik dalam menganalisis transaksi jurnal umum.

> **PENTING UNTUK DIPERSIAPKAN:**
> - Pastikan seluruh tugas praktikum mandiri dikumpulkan tepat waktu sebelum batas deadline.
> - Pelajari kembali rubrik analitik 4 Dimensi EPIC (*Evaluative, Predictive, Intelligent, Critical*) agar capaian skor optimal.

Jika ada pertanyaan seputar penilaian, silakan diskusikan melalui kolom komentar di bawah ini. Terima kasih.`,
    created_at: '2026-08-14T08:00:00Z',
    pinned: false,
    replies: []
  }
];

const loadSavedComments = () => {
  try {
    const saved = localStorage.getItem('epic_comments_v2');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  } catch (e) {
    return INITIAL_COMMENTS;
  }
};

const saveComments = (comments) => {
  try {
    localStorage.setItem('epic_comments_v2', JSON.stringify(comments));
  } catch (e) {}
};

export const useCommentsStore = create((set, get) => ({
  comments: loadSavedComments(),

  getCommentsByMK: (mkId) => {
    return get().comments.filter(c => c.mk_id === mkId);
  },

  addComment: ({ 
    mk_id, 
    rombel_id = 'ALL', 
    scope = 'BROADCAST', 
    target_student_id = null, 
    target_student_name = null, 
    title = '', 
    author, 
    content 
  }) => {
    const newComment = {
      id: `c-${Date.now()}`,
      mk_id,
      rombel_id,
      scope,
      target_student_id,
      target_student_name,
      title: title.trim(),
      author,
      content,
      created_at: new Date().toISOString(),
      pinned: false,
      replies: []
    };
    const updated = [newComment, ...get().comments];
    set({ comments: updated });
    saveComments(updated);
    return newComment;
  },

  addReply: (commentId, { author, content }) => {
    const newReply = {
      id: `r-${Date.now()}`,
      author,
      content,
      created_at: new Date().toISOString()
    };
    const updated = get().comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    });
    set({ comments: updated });
    saveComments(updated);
    return newReply;
  },

  deleteComment: (commentId) => {
    const updated = get().comments.filter(c => c.id !== commentId);
    set({ comments: updated });
    saveComments(updated);
  },

  deleteReply: (commentId, replyId) => {
    const updated = get().comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: (c.replies || []).filter(r => r.id !== replyId)
        };
      }
      return c;
    });
    set({ comments: updated });
    saveComments(updated);
  },

  togglePin: (commentId) => {
    const updated = get().comments.map(c => {
      if (c.id === commentId) {
        return { ...c, pinned: !c.pinned };
      }
      return c;
    });
    set({ comments: updated });
    saveComments(updated);
  }
}));
