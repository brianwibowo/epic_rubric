-- ============================================================
-- EPIC e-Rubric v2.0: Dynamic Rubric Dimensions
-- Rubrics now have fully custom N dimensions (not fixed EPICP)
-- ============================================================

-- Add is_template flag to existing rubric_templates (if not exists)
-- Remove old fixed weight columns, keep as template metadata
ALTER TABLE public.rubric_templates 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Drop old fixed-weight constraint if exists
ALTER TABLE public.rubric_templates DROP CONSTRAINT IF EXISTS weights_sum_100;

-- Create rubric_dimensions table for dynamic N dimensions
CREATE TABLE IF NOT EXISTS public.rubric_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES public.rubric_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                              -- e.g. "Evaluative Understanding"
  code TEXT NOT NULL,                              -- e.g. "E", "P", "CUSTOM1"
  weight DECIMAL(5,4) NOT NULL DEFAULT 0.0000,    -- weight within this rubric
  urutan INTEGER NOT NULL DEFAULT 0,              -- display order
  -- Feedback templates for each Likert score (1-4)
  feedback_1 TEXT,                                 -- feedback for score 1
  feedback_2 TEXT,                                 -- feedback for score 2
  feedback_3 TEXT,                                 -- feedback for score 3
  feedback_4 TEXT,                                 -- feedback for score 4
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate dimension codes within same rubric
  UNIQUE(rubric_id, code)
);

-- Enable RLS
ALTER TABLE public.rubric_dimensions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "dimensions_select_authenticated" ON public.rubric_dimensions;
CREATE POLICY "dimensions_select_authenticated" ON public.rubric_dimensions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "dimensions_write_dosen_admin" ON public.rubric_dimensions;
CREATE POLICY "dimensions_write_dosen_admin" ON public.rubric_dimensions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rubric_templates rt
      WHERE rt.id = rubric_id AND (
        rt.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );
