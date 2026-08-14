import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import { ROLES, STAFF_ROLES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import styles from './NotificationsPage.module.css';
import { 
  Bell, BookOpen, MessageSquare, Award, CheckCheck, 
  Archive, ArchiveRestore, Trash2, Clock, Check
} from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { 
    notifications, markAsRead, markAllAsRead, 
    archiveNotification, unarchiveNotification, archiveAllNotifications, 
    deleteNotification, getUnreadCount 
  } = useNotificationStore();
  const { setNotificationCount, addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SCORE' | 'COMMENT' | 'MK' | 'ARCHIVED'

  const isStaff = STAFF_ROLES.includes(profile?.role);
  const unreadCount = getUnreadCount();

  // Active (non-archived) vs Archived list
  const activeNotifications = useMemo(() => notifications.filter(n => !n.is_archived), [notifications]);
  const archivedNotifications = useMemo(() => notifications.filter(n => n.is_archived), [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'SCORE_PUBLISHED': return <Award size={20} />;
      case 'NEW_COMMENT': case 'COMMENT_REPLY': return <MessageSquare size={20} />;
      case 'MK_ACTIVATED': case 'MK_ENROLLMENT': return <BookOpen size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'SCORE_PUBLISHED': return '#059669';
      case 'NEW_COMMENT': case 'COMMENT_REPLY': return '#2563eb';
      case 'MK_ACTIVATED': case 'MK_ENROLLMENT': return '#7c3aed';
      default: return '#64748b';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotificationCount(0);
    addToast('Semua notifikasi ditandai sebagai sudah dibaca', 'success');
  };

  const handleArchiveAll = () => {
    archiveAllNotifications();
    setNotificationCount(0);
    addToast('Semua notifikasi aktif telah dipindahkan ke arsip', 'info');
  };

  const handleArchiveItem = (e, id) => {
    e.stopPropagation();
    archiveNotification(id);
    const newCount = getUnreadCount();
    setNotificationCount(newCount);
    addToast('Notifikasi diarsipkan', 'info');
  };

  const handleUnarchiveItem = (e, id) => {
    e.stopPropagation();
    unarchiveNotification(id);
    const newCount = getUnreadCount();
    setNotificationCount(newCount);
    addToast('Notifikasi dipulihkan dari arsip', 'success');
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
    const newCount = getUnreadCount();
    setNotificationCount(newCount);
    addToast('Notifikasi dihapus permanen', 'info');
  };

  const handleClick = (notif) => {
    markAsRead(notif.id);
    const newCount = getUnreadCount();
    setNotificationCount(newCount);

    if (notif.mkId) {
      if (notif.type === 'NEW_COMMENT' || notif.type === 'COMMENT_REPLY') {
        navigate(`/mk/${notif.mkId}/comments`);
      } else if (notif.type === 'SCORE_PUBLISHED') {
        if (isStaff) {
          navigate(`/mk/${notif.mkId}/scoring`);
        } else {
          navigate(`/mk/${notif.mkId}/analytics`);
        }
      } else {
        navigate(`/mk/${notif.mkId}`);
      }
    }
  };

  // Filtered notifications based on active tab
  const filteredNotifs = useMemo(() => {
    if (activeTab === 'ARCHIVED') {
      return archivedNotifications;
    }
    if (activeTab === 'SCORE') {
      return activeNotifications.filter(n => n.type === 'SCORE_PUBLISHED');
    }
    if (activeTab === 'COMMENT') {
      return activeNotifications.filter(n => n.type === 'NEW_COMMENT' || n.type === 'COMMENT_REPLY');
    }
    if (activeTab === 'MK') {
      return activeNotifications.filter(n => n.type === 'MK_ACTIVATED' || n.type === 'MK_ENROLLMENT' || n.type === 'SYSTEM');
    }
    return activeNotifications;
  }, [activeNotifications, archivedNotifications, activeTab]);

  return (
    <div className={styles.page}>
      {/* 1. HEADER */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Pusat Notifikasi & Aktivitas</h1>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount} Baru
              </Badge>
            )}
            <HelpButton size={22} />
          </div>
          <p className={styles.subtitle}>
            Pantau pembaruan nilai publikasi, diskusi forum akademik, dan aktivitas mata kuliah secara terpusat.
          </p>
        </div>

        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck size={15} /> Tandai Semua Dibaca
            </Button>
          )}
          {activeNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleArchiveAll}>
              <Archive size={15} /> Arsipkan Semua
            </Button>
          )}
        </div>
      </div>

      {/* 2. FILTER TABS */}
      <div className={styles.filterTabs}>
        <button 
          type="button"
          className={`${styles.filterTab} ${activeTab === 'ALL' ? styles.active : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          <Bell size={14} /> Semua ({activeNotifications.length})
        </button>

        <button 
          type="button"
          className={`${styles.filterTab} ${activeTab === 'SCORE' ? styles.active : ''}`}
          onClick={() => setActiveTab('SCORE')}
        >
          <Award size={14} /> Nilai & Asesmen ({activeNotifications.filter(n => n.type === 'SCORE_PUBLISHED').length})
        </button>

        <button 
          type="button"
          className={`${styles.filterTab} ${activeTab === 'COMMENT' ? styles.active : ''}`}
          onClick={() => setActiveTab('COMMENT')}
        >
          <MessageSquare size={14} /> Komentar & Diskusi ({activeNotifications.filter(n => n.type === 'NEW_COMMENT' || n.type === 'COMMENT_REPLY').length})
        </button>

        <button 
          type="button"
          className={`${styles.filterTab} ${activeTab === 'MK' ? styles.active : ''}`}
          onClick={() => setActiveTab('MK')}
        >
          <BookOpen size={14} /> Info Akademik ({activeNotifications.filter(n => n.type === 'MK_ACTIVATED' || n.type === 'MK_ENROLLMENT' || n.type === 'SYSTEM').length})
        </button>

        <button 
          type="button"
          className={`${styles.filterTab} ${activeTab === 'ARCHIVED' ? styles.active : ''}`}
          onClick={() => setActiveTab('ARCHIVED')}
        >
          <Archive size={14} /> Terarsip ({archivedNotifications.length})
        </button>
      </div>

      {/* 3. NOTIFICATION LIST */}
      <div className={styles.list}>
        {filteredNotifs.map((n) => (
          <div 
            key={n.id} 
            className={`${styles.notifItem} ${!n.is_read ? styles.unread : ''}`}
            onClick={() => handleClick(n)}
          >
            <div className={styles.notifMain}>
              <div 
                className={styles.notifIcon}
                style={{ background: getIconColor(n.type) + '15', color: getIconColor(n.type) }}
              >
                {getIcon(n.type)}
              </div>

              <div className={styles.notifBody}>
                <div className={styles.notifTitleRow}>
                  <h4 className={styles.notifTitle}>{n.title}</h4>
                  {!n.is_read && <div className={styles.unreadDot} />}
                </div>
                <p className={styles.notifMessage}>{n.message}</p>
                <div className={styles.notifMeta}>
                  {n.mkName && <span className={styles.notifMk}>{n.mkName}</span>}
                  <span className={styles.notifTime}>
                    <Clock size={12} /> {formatDate(n.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.notifActions}>
              {n.is_archived ? (
                <>
                  <button 
                    type="button" 
                    className={styles.iconBtn}
                    title="Pulihkan ke Notifikasi Aktif"
                    onClick={(e) => handleUnarchiveItem(e, n.id)}
                  >
                    <ArchiveRestore size={15} style={{ color: '#2563eb' }} />
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.iconBtn} ${styles.delete}`}
                    title="Hapus Permanen"
                    onClick={(e) => handleDeleteItem(e, n.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className={styles.iconBtn}
                  title="Arsipkan Notifikasi Ini"
                  onClick={(e) => handleArchiveItem(e, n.id)}
                >
                  <Archive size={15} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeTab === 'ARCHIVED' ? <Archive size={26} /> : <Bell size={26} />}
            </div>
            <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeTab === 'ARCHIVED' ? 'Tidak Ada Notifikasi Terarsip' : 'Tidak Ada Notifikasi'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {activeTab === 'ARCHIVED' 
                ? 'Notifikasi yang Anda arsipkan akan tersimpan rapi di sini.' 
                : activeTab === 'ALL'
                ? 'Semua pembaruan aktivitas baru akan muncul di sini.' 
                : 'Tidak ada notifikasi pada kategori yang dipilih.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
