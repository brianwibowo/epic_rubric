import { create } from 'zustand';

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'SCORE_PUBLISHED', title: 'Nilai Quiz dipublikasikan', message: 'Dosen telah mempublikasikan nilai Quiz untuk Praktikum Akuntansi Dasar.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: false, created_at: '2026-07-31T14:30:00Z' },
  { id: 'n2', type: 'NEW_COMMENT', title: 'Komentar baru dari dosen', message: 'Dra. Sri Wahyuni memberikan komentar pada MK Auditing & Assurance.', mkId: 'mk-3', mkName: 'Auditing & Assurance', is_read: false, created_at: '2026-07-31T10:15:00Z' },
  { id: 'n3', type: 'COMMENT_REPLY', title: 'Balasan komentar', message: 'Feri Irawan membalas komentar Anda di Praktikum Akuntansi Dasar.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: true, created_at: '2026-07-30T16:45:00Z' },
  { id: 'n4', type: 'MK_ACTIVATED', title: 'MK diaktifkan', message: 'Akuntansi Keuangan Menengah telah diaktifkan. Mahasiswa sekarang bisa bergabung.', mkId: 'mk-2', mkName: 'Akuntansi Keuangan Menengah', is_read: true, created_at: '2026-07-29T09:00:00Z' },
  { id: 'n5', type: 'SCORE_PUBLISHED', title: 'Nilai Proyek dipublikasikan', message: 'Nilai Proyek untuk Praktikum Akuntansi Dasar telah tersedia.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: true, created_at: '2026-07-28T11:20:00Z' },
];

export const useNotificationStore = create((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.is_read).length;
  },

  markAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true }))
    }));
  },

  addNotification: (notifData) => {
    const newNotif = {
      id: `n-${Date.now()}`,
      type: notifData.type || 'SYSTEM',
      title: notifData.title,
      message: notifData.message,
      mkId: notifData.mkId || null,
      mkName: notifData.mkName || '',
      is_read: false,
      created_at: new Date().toISOString()
    };
    set(state => ({ notifications: [newNotif, ...state.notifications] }));
    return newNotif;
  }
}));
