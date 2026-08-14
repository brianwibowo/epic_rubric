import React, { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMKStore } from '@/stores/mkStore';
import { useCommentsStore } from '@/stores/commentsStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import { useTerminology } from '@/hooks/useTerminology';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HelpButton from '@/components/ui/HelpButton';
import styles from './CommentsPage.module.css';
import { 
  Send, Reply, MessageSquare, Trash2, ArrowLeft,
  Pin, Lock, Globe, Users, Bold, Italic, 
  Underline, List, ListOrdered, Quote, Code, 
  CheckCircle2, Sparkles, AlertCircle, Eye, User
} from 'lucide-react';

const CommentsPage = () => {
  const { mkId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { mkList, getAllStudents } = useMKStore();
  const { comments, getCommentsByMK, addComment, addReply, deleteComment, deleteReply, togglePin } = useCommentsStore();
  const { addNotification } = useNotificationStore();
  const { addToast } = useUiStore();
  const { courseLabel, learnerLabel, educatorLabel } = useTerminology();

  const mk = mkList.find(m => m.id === mkId);
  const allStudents = getAllStudents ? (getAllStudents(mkId) || []) : [];
  const rombelList = mk?.rombel || [];

  // Filter States
  const [filterScope, setFilterScope] = useState('ALL'); // 'ALL' | 'BROADCAST' | 'PRIVATE'
  const [filterRombel, setFilterRombel] = useState('ALL');

  // Composer Form State
  const [scope, setScope] = useState('BROADCAST'); // 'BROADCAST' | 'PRIVATE'
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetRombelId, setTargetRombelId] = useState('ALL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Reply State
  const [activeReplyThreadId, setActiveReplyThreadId] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});

  const textareaRef = useRef(null);

  const isStaff = ['dosen', 'guru', 'admin', 'superadmin'].includes(profile?.role);
  const isStudent = ['mahasiswa', 'siswa'].includes(profile?.role);

  // Format Date Helper
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
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper to insert markdown syntax at cursor position
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = prefix + (selectedText || 'teks') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  // Filtered comments logic with role permission check
  const filteredComments = useMemo(() => {
    let list = getCommentsByMK(mkId);

    // Permission check for students: Only see Broadcasts or Private messages targeted to/from them
    if (isStudent) {
      list = list.filter(c => {
        if (c.scope === 'BROADCAST') return true;
        if (c.scope === 'PRIVATE') {
          return c.target_student_id === profile?.id || c.author.id === profile?.id;
        }
        return true;
      });
    }

    // Filter by Scope
    if (filterScope !== 'ALL') {
      list = list.filter(c => c.scope === filterScope);
    }

    // Filter by Rombel
    if (filterRombel !== 'ALL') {
      list = list.filter(c => c.rombel_id === filterRombel || c.rombel_id === 'ALL');
    }

    // Sort: Pinned first, then newest first
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [mkId, comments, isStudent, profile, filterScope, filterRombel]);

  // Submit Main Comment
  const handleSendComment = (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    if (scope === 'PRIVATE' && !targetStudentId) {
      addToast(`Silakan pilih ${learnerLabel.toLowerCase()} penerima pesan privat terlebih dahulu`, 'warning');
      return;
    }

    const targetStudent = allStudents.find(s => s.id === targetStudentId || s.student_id === targetStudentId);

    addComment({
      mk_id: mkId,
      rombel_id: targetRombelId,
      scope,
      target_student_id: scope === 'PRIVATE' ? targetStudentId : null,
      target_student_name: scope === 'PRIVATE' ? (targetStudent?.full_name || targetStudent?.name || 'Mahasiswa') : null,
      title: title.trim(),
      author: {
        id: profile?.id || 'usr-default',
        name: profile?.full_name || 'User',
        role: profile?.role || 'dosen',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60'
      },
      content: content.trim()
    });

    // Automatically emit persistent notification
    if (scope === 'PRIVATE') {
      addNotification({
        type: 'NEW_COMMENT',
        title: 'Catatan Privat 1-on-1 dari Dosen',
        message: `${profile?.full_name || 'Dosen'} memberikan catatan evaluasi privat untuk ${targetStudent?.full_name || 'Mahasiswa'} pada ${mk?.name}.`,
        mkId,
        mkName: mk?.name
      });
    } else {
      addNotification({
        type: 'NEW_COMMENT',
        title: 'Pengumuman Broadcast Kelas',
        message: `${profile?.full_name || 'Dosen'} membuat pengumuman baru: "${title || content.substring(0, 45)}..."`,
        mkId,
        mkName: mk?.name
      });
    }

    setTitle('');
    setContent('');
    if (scope === 'PRIVATE') setTargetStudentId('');
    addToast(scope === 'PRIVATE' ? 'Feedback privat 1-on-1 berhasil dikirim!' : 'Pengumuman broadcast berhasil dipublikasikan!', 'success');
  };

  // Submit Reply
  const handleSendReply = (commentId) => {
    const replyText = replyTextMap[commentId];
    if (!replyText || !replyText.trim()) return;

    addReply(commentId, {
      author: {
        id: profile?.id || 'usr-default',
        name: profile?.full_name || 'User',
        role: profile?.role || 'mahasiswa',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=60'
      },
      content: replyText.trim()
    });

    // Automatically emit persistent notification
    addNotification({
      type: 'COMMENT_REPLY',
      title: 'Balasan Diskusi Baru',
      message: `${profile?.full_name || 'User'} membalas diskusi pada mata kuliah ${mk?.name}.`,
      mkId,
      mkName: mk?.name
    });

    setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    addToast('Balasan terkirim!', 'success');
  };

  // Robust Markdown & Rich Text Formatter
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    const elements = [];
    let quoteLines = [];

    const flushQuote = (key) => {
      if (quoteLines.length > 0) {
        elements.push(
          <blockquote key={key}>
            {quoteLines.map((qLine, qIdx) => {
              if (qLine.startsWith('- ') || qLine.startsWith('* ')) {
                return (
                  <div key={`qli-${qIdx}`} style={{ display: 'flex', gap: '8px', marginLeft: '6px' }}>
                    <span>•</span>
                    <span>{parseInline(qLine.substring(2))}</span>
                  </div>
                );
              }
              const numMatch = qLine.match(/^(\d+)\.\s(.*)$/);
              if (numMatch) {
                return (
                  <div key={`qnli-${qIdx}`} style={{ display: 'flex', gap: '8px', marginLeft: '6px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{numMatch[1]}.</span>
                    <span>{parseInline(numMatch[2])}</span>
                  </div>
                );
              }
              return <div key={`qp-${qIdx}`}>{parseInline(qLine)}</div>;
            })}
          </blockquote>
        );
        quoteLines = [];
      }
    };

    lines.forEach((line, index) => {
      // Check blockquote line
      if (line.startsWith('> ') || line.startsWith('>')) {
        const contentAfter = line.startsWith('> ') ? line.substring(2) : line.substring(1);
        quoteLines.push(contentAfter);
        if (index === lines.length - 1 || (!lines[index + 1].startsWith('> ') && !lines[index + 1].startsWith('>'))) {
          flushQuote(`q-${index}`);
        }
        return;
      }

      // If we exit a quote block
      flushQuote(`q-${index}`);

      // Check List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={`li-${index}`} style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <span>•</span>
            <span>{parseInline(line.substring(2))}</span>
          </div>
        );
        return;
      }

      // Check numbered list
      const numMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`nli-${index}`} style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{numMatch[1]}.</span>
            <span>{parseInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Normal paragraph
      if (line.trim() === '') {
        elements.push(<div key={`br-${index}`} style={{ height: '8px' }} />);
      } else {
        elements.push(
          <div key={`p-${index}`}>
            {parseInline(line)}
          </div>
        );
      }
    });

    return elements;
  };

  // Helper for **bold**, *italic*, <u>underline</u>, `code`
  const parseInline = (text) => {
    if (!text) return null;
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Code `text`
      const codeMatch = remaining.match(/`(.+?)`/);
      // Italic *text* (single asterisk)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      // Underline <u>text</u>
      const uMatch = remaining.match(/<u>(.+?)<\/u>/i);

      // Find first occurrence
      const matches = [
        { type: 'bold', match: boldMatch },
        { type: 'code', match: codeMatch },
        { type: 'italic', match: italicMatch },
        { type: 'underline', match: uMatch }
      ].filter(m => m.match && m.match.index !== undefined)
       .sort((a, b) => a.match.index - b.match.index);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0];
      const matchIndex = first.match.index;
      const matchedString = first.match[0];
      const innerText = first.match[1];

      // Add text before match
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }

      // Add matched styled element (recursively parse inside)
      if (first.type === 'bold') {
        parts.push(<strong key={`b-${keyIdx++}`}>{parseInline(innerText)}</strong>);
      } else if (first.type === 'code') {
        parts.push(<code key={`c-${keyIdx++}`}>{innerText}</code>);
      } else if (first.type === 'italic') {
        parts.push(<em key={`i-${keyIdx++}`}>{parseInline(innerText)}</em>);
      } else if (first.type === 'underline') {
        parts.push(<u key={`u-${keyIdx++}`}>{parseInline(innerText)}</u>);
      }

      remaining = remaining.substring(matchIndex + matchedString.length);
    }

    return parts;
  };

  if (!mk) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2>{courseLabel} Tidak Ditemukan</h2>
          <Button variant="primary" onClick={() => navigate('/mk')}>
            Kembali ke Daftar Mata Kuliah
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 1. HEADER & BREADCRUMB */}
      <div>
        <div className={styles.headerNavRow}>
          <button className={styles.backBtn} onClick={() => navigate(`/mk/${mkId}`)}>
            <ArrowLeft size={14} /> Kembali ke Ringkasan {mk.name}
          </button>
        </div>

        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Komentar & Diskusi Akademik</h1>
              <HelpButton size={22} />
            </div>
            <p className={styles.subtitle}>
              Ruang komunikasi evaluasi nilai, broadcast pengumuman kelas, dan catatan feedback 1-on-1 untuk <strong>{mk.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 2. RICH TEXT COMPOSER (BROADCAST VS PRIVATE) */}
      <div className={styles.composerCard}>
        {/* Target Scope Switcher */}
        <div className={styles.composerHeader}>
          <div className={styles.scopeToggleWrap}>
            <button 
              type="button"
              className={`${styles.scopeBtn} ${scope === 'BROADCAST' ? styles.activeBroadcast : ''}`}
              onClick={() => setScope('BROADCAST')}
            >
              <Globe size={14} /> Broadcast Kelas
            </button>
            <button 
              type="button"
              className={`${styles.scopeBtn} ${scope === 'PRIVATE' ? styles.activePrivate : ''}`}
              onClick={() => setScope('PRIVATE')}
            >
              <Lock size={14} /> Pesan Privat (1-on-1)
            </button>
          </div>

          <div className={styles.targetSelectorRow}>
            {scope === 'PRIVATE' ? (
              <select
                className={styles.targetSelect}
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                required
              >
                <option value="">-- Pilih {learnerLabel} Penerima Feedback --</option>
                {allStudents.map(s => {
                  const stuId = s.id || s.student_id;
                  return (
                    <option key={stuId} value={stuId}>
                      👤 {s.full_name || s.name} ({s.nim || s.nisn || '-'})
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                className={styles.targetSelect}
                value={targetRombelId}
                onChange={(e) => setTargetRombelId(e.target.value)}
              >
                <option value="ALL">📢 Seluruh Rombel ({rombelList.length} Kelas)</option>
                {rombelList.map(r => (
                  <option key={r.id} value={r.id}>
                    Kelas: {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Subject/Title (Optional) */}
        <input 
          type="text"
          className={styles.titleInput}
          placeholder="Subjek / Topik Diskusi (Opsional, contoh: Feedback Proyek Siklus Akuntansi)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Rich Text Toolbar */}
        <div className={styles.toolbarRow}>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('**', '**')} title="Tebal (Bold)">
            <Bold size={14} />
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('*', '*')} title="Miring (Italic)">
            <Italic size={14} />
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('<u>', '</u>')} title="Garis Bawah (Underline)">
            <Underline size={14} />
          </button>

          <div className={styles.toolDivider} />

          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('- ')} title="Daftar Poin (Bullet List)">
            <List size={14} />
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('1. ')} title="Daftar Nomor (Numbered List)">
            <ListOrdered size={14} />
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('> ')} title="Kutipan / Catatan Penting">
            <Quote size={14} />
          </button>
          <button type="button" className={styles.toolBtn} onClick={() => insertFormatting('`', '`')} title="Kode / Format Monospace">
            <Code size={14} />
          </button>
        </div>

        {/* Formatted Textarea */}
        <textarea
          ref={textareaRef}
          className={styles.textareaInput}
          placeholder={scope === 'PRIVATE' ? `Ketik catatan feedback evaluasi 1-on-1 khusus untuk ${learnerLabel.toLowerCase()}...` : 'Tuliskan pengumuman broadcast atau topik diskusi kelas di sini...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={styles.composerFooter}>
          <span className={styles.formatTip}>
            Tip: Gunakan tombol format di atas untuk menebalkan teks atau membuat poin evaluasi.
          </span>
          <button 
            type="button"
            className={styles.sendBtn}
            onClick={handleSendComment}
            disabled={!content.trim() || (scope === 'PRIVATE' && !targetStudentId)}
          >
            <Send size={15} /> Kirim Pesan
          </button>
        </div>
      </div>

      {/* 3. FILTER TABS & AUDIENCE BAR */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button 
            type="button"
            className={`${styles.filterTab} ${filterScope === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilterScope('ALL')}
          >
            <MessageSquare size={14} /> Semua Diskusi ({filteredComments.length})
          </button>

          <button 
            type="button"
            className={`${styles.filterTab} ${filterScope === 'BROADCAST' ? styles.active : ''}`}
            onClick={() => setFilterScope('BROADCAST')}
          >
            <Globe size={14} /> Pengumuman Broadcast
          </button>

          <button 
            type="button"
            className={`${styles.filterTab} ${filterScope === 'PRIVATE' ? styles.active : ''}`}
            onClick={() => setFilterScope('PRIVATE')}
          >
            <Lock size={14} /> Catatan Privat 1-on-1
          </button>
        </div>

        <select
          className={styles.rombelFilterSelect}
          value={filterRombel}
          onChange={(e) => setFilterRombel(e.target.value)}
        >
          <option value="ALL">Semua Rombel</option>
          {rombelList.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* 4. COMMENTS FEED & THREAD CARDS */}
      <div className={styles.commentsContainer}>
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const isAuthor = comment.author.id === profile?.id;
            const replies = comment.replies || [];
            const isThreadOpen = activeReplyThreadId === comment.id;

            return (
              <div 
                key={comment.id} 
                className={`${styles.threadCard} ${comment.pinned ? styles.pinned : ''} ${comment.scope === 'PRIVATE' ? styles.privateCard : ''}`}
              >
                {/* Thread Header */}
                <div className={styles.threadHeader}>
                  <div className={styles.authorMetaWrap}>
                    <img 
                      src={comment.author.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60'} 
                      alt="" 
                      className={styles.authorAvatar} 
                    />
                    <div className={styles.authorInfo}>
                      <div className={styles.authorNameRow}>
                        <span className={styles.authorName}>{comment.author.name}</span>
                        <span className={`${styles.roleBadge} ${comment.author.role === 'dosen' ? styles.dosen : styles.mahasiswa}`}>
                          {comment.author.role === 'dosen' ? educatorLabel : learnerLabel}
                        </span>
                      </div>
                      <span className={styles.timeText}>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  {/* Header Badges & Actions */}
                  <div className={styles.headerPills}>
                    {comment.pinned && (
                      <span className={styles.pinnedPill}>
                        <Pin size={11} /> Disematkan
                      </span>
                    )}

                    {comment.scope === 'PRIVATE' ? (
                      <span className={styles.privatePill}>
                        <Lock size={12} /> Privat untuk: {comment.target_student_name || 'Mahasiswa'}
                      </span>
                    ) : (
                      <span className={styles.broadcastPill}>
                        <Globe size={12} /> Broadcast Kelas
                      </span>
                    )}

                    {isStaff && (
                      <button 
                        className={styles.pinActionBtn}
                        onClick={() => togglePin(comment.id)}
                        title={comment.pinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                      >
                        <Pin size={14} style={{ color: comment.pinned ? '#2563eb' : 'inherit' }} />
                      </button>
                    )}

                    {(isAuthor || isStaff) && (
                      <button 
                        className={styles.deleteActionBtn}
                        onClick={() => {
                          if (window.confirm('Hapus komentar/diskusi ini?')) {
                            deleteComment(comment.id);
                            addToast('Komentar dihapus', 'info');
                          }
                        }}
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Title & Content */}
                {comment.title && (
                  <h3 className={styles.postTitle}>{comment.title}</h3>
                )}

                <div className={styles.postContent}>
                  {renderFormattedText(comment.content)}
                </div>

                {/* Thread Footer: Reply Toggle */}
                <div className={styles.threadFooter}>
                  <button 
                    className={styles.replyToggleBtn}
                    onClick={() => setActiveReplyThreadId(isThreadOpen ? null : comment.id)}
                  >
                    <Reply size={14} /> {replies.length > 0 ? `${replies.length} Balasan` : 'Balas Diskusi'}
                  </button>
                </div>

                {/* Replies Section */}
                {(isThreadOpen || replies.length > 0) && (
                  <div className={styles.repliesSection}>
                    {replies.map((reply) => (
                      <div key={reply.id} className={styles.replyItem}>
                        <img 
                          src={reply.author.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=60'} 
                          alt="" 
                          className={styles.replyAvatar} 
                        />
                        <div className={styles.replyBody}>
                          <div className={styles.replyMeta}>
                            <span className={styles.replyAuthor}>{reply.author.name}</span>
                            <span className={`${styles.roleBadge} ${reply.author.role === 'dosen' ? styles.dosen : styles.mahasiswa}`}>
                              {reply.author.role === 'dosen' ? educatorLabel : learnerLabel}
                            </span>
                            <span className={styles.timeText}>{formatDate(reply.created_at)}</span>

                            {(reply.author.id === profile?.id || isStaff) && (
                              <button 
                                className={styles.deleteActionBtn}
                                onClick={() => {
                                  deleteReply(comment.id, reply.id);
                                  addToast('Balasan dihapus', 'info');
                                }}
                                style={{ marginLeft: 'auto' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <p className={styles.replyText}>{reply.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Inline Reply Form */}
                    <div className={styles.inlineReplyForm}>
                      <textarea
                        className={styles.replyInput}
                        placeholder="Tulis balasan Anda..."
                        value={replyTextMap[comment.id] || ''}
                        onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        rows={1}
                      />
                      <button 
                        type="button"
                        className={styles.sendReplyBtn}
                        onClick={() => handleSendReply(comment.id)}
                        disabled={!replyTextMap[comment.id]?.trim()}
                      >
                        <Send size={13} /> Balas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <MessageSquare size={36} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Belum Ada Diskusi atau Catatan Evaluasi
            </h3>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Gunakan kotak di atas untuk membagikan pengumuman broadcast atau mengirimkan feedback privat 1-on-1 kepada {learnerLabel.toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;
