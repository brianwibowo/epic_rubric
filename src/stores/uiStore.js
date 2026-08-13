import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  toasts: [],
  notificationCount: 0,
  
  // Sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (isCollapsed) => set({ sidebarCollapsed: isCollapsed }),
  
  // Toasts
  addToast: (message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  // Notification badge count
  setNotificationCount: (count) => set({ notificationCount: count }),
  decrementNotificationCount: () => set((state) => ({
    notificationCount: Math.max(0, state.notificationCount - 1)
  }))
}));
