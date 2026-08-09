-- ============================================================
-- EPIC e-Rubric v2.0: Comments with Threading
-- Supports dosen-mahasiswa 2-way communication per MK
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_id UUID NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  -- NULL = general MK comment
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,   -- for thread replies
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto update updated_at
CREATE OR REPLACE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see comments in MKs they belong to
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (
    -- Admin/Dosen can see all comments in their MK
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
    OR
    -- Students can see comments directed to them or general MK comments
    (
      author_id = auth.uid()
      OR student_id = auth.uid()
      OR student_id IS NULL
    )
  );

-- RLS: Authenticated users can create comments in MKs they're part of
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      -- Dosen/Admin of the MK
      EXISTS (
        SELECT 1 FROM public.mata_kuliah mk
        WHERE mk.id = mk_id AND (
          mk.dosen_id = auth.uid() OR
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
      )
      OR
      -- Student enrolled in the MK
      EXISTS (
        SELECT 1 FROM public.mk_enrollments me
        WHERE me.mk_id = mk_id AND me.student_id = auth.uid()
      )
    )
  );

-- RLS: Users can update their own comments
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

-- RLS: Users can delete their own comments; admin can delete any
DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
