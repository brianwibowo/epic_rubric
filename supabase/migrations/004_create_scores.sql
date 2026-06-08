-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID,                     -- Will link to classes table in Fase 6
  rubric_template_id UUID REFERENCES public.rubric_templates(id) ON DELETE SET NULL,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINALIZED', 'SENT_TO_ANALYTICS')),
  is_editable BOOLEAN DEFAULT true,
  revision_count INTEGER DEFAULT 0,
  
  -- Scores (Likert 1-4)
  score_e INTEGER CHECK (score_e BETWEEN 1 AND 4),
  score_p INTEGER CHECK (score_p BETWEEN 1 AND 4),
  score_i INTEGER CHECK (score_i BETWEEN 1 AND 4),
  score_c INTEGER CHECK (score_c BETWEEN 1 AND 4),
  score_pe INTEGER CHECK (score_pe BETWEEN 1 AND 4),
  
  -- Individual dimension feedback
  feedback_e TEXT,
  feedback_p TEXT,
  feedback_i TEXT,
  feedback_c TEXT,
  feedback_pe TEXT,
  
  -- Overall outcomes
  final_score INTEGER,               -- Calculated via scoring engine
  focus_area TEXT CHECK (focus_area IN ('E', 'P', 'I', 'C', 'PE')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  finalized_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Trigger: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Policies
-- 1. Students can only read finalized and sent assessments belonging to themselves
CREATE POLICY "Allow students to view own sent assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() 
    AND status = 'SENT_TO_ANALYTICS'
  );

-- 2. Teachers can view/insert/update assessments
CREATE POLICY "Allow teachers full access to assessments"
  ON public.assessments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'guru')
    )
  );
