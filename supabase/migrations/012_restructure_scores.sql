-- ============================================================
-- EPIC e-Rubric v2.0: Restructured Scores
-- Uses JSONB for dynamic dimension scores instead of fixed columns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  komponen_id UUID NOT NULL REFERENCES public.komponen_penilaian(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Dynamic scores stored as JSONB: { "E": 3, "P": 4, "CUSTOM1": 2 }
  dimension_scores JSONB DEFAULT '{}',
  -- Dynamic feedback stored as JSONB: { "E": "Great work...", "P": "Needs improvement..." }
  dimension_feedback JSONB DEFAULT '{}',
  
  -- Calculated values
  raw_score DECIMAL(6,2),                          -- score within this component (0-100)
  
  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINALIZED', 'PUBLISHED')),
  revision_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  finalized_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- One score per student per component
  UNIQUE(komponen_id, student_id)
);

-- Auto update updated_at
CREATE OR REPLACE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- RLS: Students can only see PUBLISHED scores for themselves
DROP POLICY IF EXISTS "scores_select_student_published" ON public.scores;
CREATE POLICY "scores_select_student_published" ON public.scores
  FOR SELECT TO authenticated
  USING (
    (student_id = auth.uid() AND status = 'PUBLISHED')
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );

-- RLS: Only dosen/admin can write scores
DROP POLICY IF EXISTS "scores_write_dosen_admin" ON public.scores;
CREATE POLICY "scores_write_dosen_admin" ON public.scores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );
