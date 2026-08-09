import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCommentsStore } from '@/stores/commentsStore';
import { useUiStore } from '@/stores/uiStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import HelpButton from '@/components/ui/HelpButton';
import styles from './CommentsPage.module.css';
import { Send, Reply, MessageSquare, Trash2 } from 'lucide-react';

const CommentsPage = () => {
  const { mkId } = useParams();
  const { profile } = useAuthStore();
  const { comments, getCommentsByMK, addComment, addReply, deleteComment } = useCommentsStore();
  const { addToast } = useUiStore();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const mkComments = getCommentsByMK(mkId);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    addComment({
      mk_id: mkId,
      author: {
        id: profile?.id,
        name: profile?.full_name || 'User',
        role: profile?.role || 'dosen',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60'
      },
      content: newComment.trim()
    });

    setNewComment('');
    addToast('Komentar berhasil dikirim!', 'success');
  };

  const handleSendReply = (commentId) => {
    if (!replyText.trim()) return;

    addReply(commentId, {
      author: {
        id: profile?.id,
        name: profile?.full_name || 'User',
        role: profile?.role || 'mahasiswa',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=60'
      },
      content: replyText.trim()
    });

    setReplyText('');
    setReplyingTo(null);
    addToast('Balasan dikirim!', 'success');
  };

  const handleDelete = (commentId) => {
    deleteComment(commentId);
    addToast('Komentar dihapus', 'info');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className={styles.title}>Komentar & Diskusi</h1>
          <HelpButton size={22} />
        </div>
        <p className={styles.subtitle}>Ruang diskusi antara dosen dan mahasiswa</p>
      </div>

      {/* New Comment Input */}
      <div className={styles.newCommentBox}>
        <img 
          src={profile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60'} 
          alt="" 
          className={styles.inputAvatar}
        />
        <div className={styles.inputWrap}>
          <textarea
            className={styles.commentInput}
            placeholder="Tulis komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className={styles.sendBtn}
          >
            <Send size={14} /> Kirim
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {mkComments.map((comment) => (
          <div key={comment.id} className={styles.commentThread}>
            {/* Main Comment */}
            <div className={styles.comment}>
              <img src={comment.author.avatar} alt="" className={styles.commentAvatar} />
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>{comment.author.name}</span>
                  <span className={styles.commentRole}>
                    {comment.author.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                  </span>
                  <span className={styles.commentTime}>{formatDate(comment.created_at)}</span>
                  {comment.student_id === null && (
                    <span className={styles.generalTag}>Umum</span>
                  )}
                  {comment.author.id === profile?.id && (
                    <button 
                      onClick={() => handleDelete(comment.id)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                <button 
                  className={styles.replyBtn}
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply size={14} /> Balas
                </button>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className={styles.replies}>
                {comment.replies.map((reply) => (
                  <div key={reply.id} className={styles.comment}>
                    <img src={reply.author.avatar} alt="" className={styles.commentAvatar} />
                    <div className={styles.commentBody}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>{reply.author.name}</span>
                        <span className={styles.commentRole}>
                          {reply.author.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                        </span>
                        <span className={styles.commentTime}>{formatDate(reply.created_at)}</span>
                      </div>
                      <p className={styles.commentContent}>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className={styles.replyInputBox}>
                <textarea
                  className={styles.replyInput}
                  placeholder="Tulis balasan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  autoFocus
                />
                <div className={styles.replyActions}>
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Batal</Button>
                  <Button variant="primary" size="sm" onClick={() => handleSendReply(comment.id)} disabled={!replyText.trim()}>
                    <Send size={12} /> Balas
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {mkComments.length === 0 && (
          <div className={styles.emptyState}>
            <MessageSquare size={40} />
            <p>Belum ada komentar di mata kuliah ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;
