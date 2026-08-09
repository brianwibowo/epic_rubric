import { create } from 'zustand';

const INITIAL_COMMENTS = [
  {
    id: 'c1',
    mk_id: 'mk-1',
    author: { id: 'mock-dosen-uuid', name: 'Dra. Sri Wahyuni, M.Ak.', role: 'dosen', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60' },
    content: 'Perhatikan kembali pencatatan jurnal penyesuaian pada bagian Proyek. Beberapa akun belum sesuai dengan SAK ETAP. Silakan perbaiki sebelum UAS.',
    created_at: '2026-07-28T14:30:00Z',
    student_id: 'mock-mahasiswa-uuid',
    replies: [
      {
        id: 'c1r1',
        author: { id: 'mock-mahasiswa-uuid', name: 'Feri Irawan', role: 'mahasiswa', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=60' },
        content: 'Terima kasih Bu, saya akan perbaiki bagian akun aset tetap dan penyusutannya.',
        created_at: '2026-07-28T15:10:00Z',
      }
    ]
  },
  {
    id: 'c2',
    mk_id: 'mk-1',
    author: { id: 'mock-dosen-uuid', name: 'Dra. Sri Wahyuni, M.Ak.', role: 'dosen', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60' },
    content: 'Nilai Quiz 2 sudah dipublikasikan. Secara keseluruhan ada peningkatan dari Quiz 1. Pertahankan! 👏',
    created_at: '2026-07-25T10:00:00Z',
    student_id: null,
    replies: []
  }
];

export const useCommentsStore = create((set, get) => ({
  comments: INITIAL_COMMENTS,

  getCommentsByMK: (mkId) => {
    return get().comments.filter(c => c.mk_id === mkId);
  },

  addComment: ({ mk_id, author, content, student_id = null }) => {
    const newComment = {
      id: `c-${Date.now()}`,
      mk_id,
      author,
      content,
      student_id,
      created_at: new Date().toISOString(),
      replies: []
    };
    set(state => ({ comments: [newComment, ...state.comments] }));
    return newComment;
  },

  addReply: (commentId, { author, content }) => {
    const newReply = {
      id: `r-${Date.now()}`,
      author,
      content,
      created_at: new Date().toISOString()
    };
    set(state => ({
      comments: state.comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...c.replies, newReply] };
        }
        return c;
      })
    }));
    return newReply;
  },

  deleteComment: (commentId) => {
    set(state => ({ comments: state.comments.filter(c => c.id !== commentId) }));
  }
}));
