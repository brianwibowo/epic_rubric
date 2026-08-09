import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import Button from '@/components/ui/Button';
import styles from './NotificationsPage.module.css';
import { Bell, BookOpen, MessageSquare, Award, CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const { setNotificationCount } = useUiStore();

  const unreadCount = getUnreadCount();

  const getIcon = (type) => {
    switch (type) {
      case 'SCORE_PUBLISHED': return <Award size={18} />;
      case 'NEW_COMMENT': case 'COMMENT_REPLY': return <MessageSquare size={18} />;
      case 'MK_ACTIVATED': case 'MK_ENROLLMENT': return <BookOpen size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'SCORE_PUBLISHED': return '#059669';
      case 'NEW_COMMENT': case 'COMMENT_REPLY': return '#2563eb';
      case 'MK_ACTIVATED': return '#7c3aed';
      default: return '#94a3b8';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotificationCount(0);
  };

  const handleClick = (notif) => {
    markAsRead(notif.id);
    const newCount = getUnreadCount();
    setNotificationCount(newCount);

    if (notif.mkId) {
      if (notif.type === 'NEW_COMMENT' || notif.type === 'COMMENT_REPLY') {
        navigate(`/mk/${notif.mkId}/comments`);
      } else {
        navigate(`/mk/${notif.mkId}/analytics`);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifikasi</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Tandai semua dibaca
          </Button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`${styles.notifItem} ${!n.is_read ? styles.unread : ''}`}
            onClick={() => handleClick(n)}
          >
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
                <span className={styles.notifMk}>{n.mkName}</span>
                <span className={styles.notifTime}>{formatDate(n.created_at)}</span>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Bell size={36} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>Tidak ada notifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
