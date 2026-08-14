import { create } from 'zustand';

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'SCORE_PUBLISHED', title: 'Nilai Quiz dipublikasikan', message: 'Dosen telah mempublikasikan nilai Quiz untuk Praktikum Akuntansi Dasar.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: false, is_archived: false, created_at: '2026-08-14T14:30:00Z' },
  { id: 'n2', type: 'NEW_COMMENT', title: 'Catatan Privat 1-on-1 dari Dosen', message: 'Dosen memberikan catatan evaluasi privat untuk Anda pada Praktikum Akuntansi Dasar.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: false, is_archived: false, created_at: '2026-08-14T10:15:00Z' },
  { id: 'n3', type: 'COMMENT_REPLY', title: 'Balasan Diskusi Baru', message: 'Feri Irawan membalas topik pengumuman kelas di Praktikum Akuntansi Dasar.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: true, is_archived: false, created_at: '2026-08-13T16:45:00Z' },
  { id: 'n4', type: 'MK_ACTIVATED', title: 'Mata Kuliah Diaktifkan', message: 'Akuntansi Keuangan Menengah telah diaktifkan untuk semester berjalan.', mkId: 'mk-2', mkName: 'Akuntansi Keuangan Menengah', is_read: true, is_archived: false, created_at: '2026-08-12T09:00:00Z' },
  { id: 'n5', type: 'SCORE_PUBLISHED', title: 'Nilai Proyek dipublikasikan', message: 'Nilai Proyek untuk Praktikum Akuntansi Dasar telah tersedia di laman analitik.', mkId: 'mk-1', mkName: 'Praktikum Akuntansi Dasar', is_read: true, is_archived: false, created_at: '2026-08-11T11:20:00Z' },
];

const loadSavedNotifications = () => {
  try {
    const saved = localStorage.getItem('epic_notifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    const parsed = JSON.parse(saved);
    return parsed.map(n => ({ ...n, is_archived: n.is_archived ?? false }));
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};

const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem('epic_notifications', JSON.stringify(notifications));
  } catch (e) {}
};

export const useNotificationStore = create((set, get) => ({
  notifications: loadSavedNotifications(),

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.is_read && !n.is_archived).length;
  },

  markAsRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  archiveNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, is_archived: true, is_read: true } : n);
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  unarchiveNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, is_archived: false } : n);
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  archiveAllNotifications: () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, is_archived: true, is_read: true }));
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  deleteNotification: (id) => {
    const { notifications } = get();
    const updated = notifications.filter(n => n.id !== id);
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
  },

  addNotification: (notifData) => {
    const { notifications } = get();
    const newNotif = {
      id: `n-${Date.now()}`,
      type: notifData.type || 'SYSTEM',
      title: notifData.title,
      message: notifData.message,
      mkId: notifData.mkId || null,
      mkName: notifData.mkName || '',
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    set({ notifications: updated });
    saveNotificationsToStorage(updated);
    return newNotif;
  }
}));
