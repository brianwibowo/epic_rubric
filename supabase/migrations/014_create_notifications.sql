-- ============================================================
-- EPIC e-Rubric v2.0: Notifications
-- Persistent notifications for real-time alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'SCORE_PUBLISHED',     -- nilai dipublikasikan
    'NEW_COMMENT',         -- komentar baru dari dosen
    'COMMENT_REPLY',       -- balasan komentar
    'MK_ENROLLMENT',       -- mahasiswa join MK
    'MK_ACTIVATED',        -- MK diaktifkan
    'SYSTEM'               -- system notification
  )),
  title TEXT NOT NULL,
  message TEXT,
  -- Reference data for navigation
  ref_mk_id UUID REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
  ref_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  ref_score_id UUID REFERENCES public.scores(id) ON DELETE SET NULL,
  -- State
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: System/admin/dosen can create notifications for anyone
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);  -- Notification creation is controlled at application level

-- RLS: Users can update (mark read) their own notifications
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS: Users can delete their own notifications
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Index for fast unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, is_read) 
  WHERE is_read = false;
