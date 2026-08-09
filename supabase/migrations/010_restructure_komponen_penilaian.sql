-- ============================================================
-- EPIC e-Rubric v2.0: Komponen Penilaian
-- Each MK has N assessment components with weights summing to 100%
-- ============================================================

CREATE TABLE IF NOT EXISTS public.komponen_penilaian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_id UUID NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                              -- e.g. "Proyek", "Quiz", "UTS"
  bobot DECIMAL(5,4),                             -- weight 0.0000-1.0000 (nullable until configured)
  rubric_template_id UUID REFERENCES public.rubric_templates(id) ON DELETE SET NULL,
  urutan INTEGER NOT NULL DEFAULT 0,              -- display order
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate component names within same MK
  UNIQUE(mk_id, name)
);

-- Auto update updated_at
CREATE OR REPLACE TRIGGER update_komponen_updated_at
  BEFORE UPDATE ON public.komponen_penilaian
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate default 6 components when MK is created
CREATE OR REPLACE FUNCTION create_default_komponen()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.komponen_penilaian (mk_id, name, urutan) VALUES
    (NEW.id, 'Proyek', 1),
    (NEW.id, 'Partisipasi Kelas', 2),
    (NEW.id, 'Quiz', 3),
    (NEW.id, 'Tugas', 4),
    (NEW.id, 'UTS', 5),
    (NEW.id, 'UAS', 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER auto_create_default_komponen
  AFTER INSERT ON public.mata_kuliah
  FOR EACH ROW EXECUTE FUNCTION create_default_komponen();

-- Function to check if MK should become ACTIVE
-- MK is ACTIVE when ALL komponen have rubric assigned AND bobot sum = 1.0
CREATE OR REPLACE FUNCTION check_mk_activation()
RETURNS TRIGGER AS $$
DECLARE
  total_bobot DECIMAL;
  unassigned_count INTEGER;
  mk_status TEXT;
BEGIN
  -- Get current MK status
  SELECT status INTO mk_status FROM public.mata_kuliah WHERE id = NEW.mk_id;
  
  -- Only auto-activate from DRAFT
  IF mk_status != 'DRAFT' THEN
    RETURN NEW;
  END IF;

  -- Check if all komponen have rubric assigned
  SELECT COUNT(*) INTO unassigned_count
  FROM public.komponen_penilaian
  WHERE mk_id = NEW.mk_id AND rubric_template_id IS NULL;

  -- Check total bobot
  SELECT COALESCE(SUM(bobot), 0) INTO total_bobot
  FROM public.komponen_penilaian
  WHERE mk_id = NEW.mk_id;

  -- Auto-activate if all conditions met
  IF unassigned_count = 0 AND total_bobot = 1.0000 THEN
    UPDATE public.mata_kuliah SET status = 'ACTIVE' WHERE id = NEW.mk_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_mk_activation_on_komponen_update
  AFTER UPDATE ON public.komponen_penilaian
  FOR EACH ROW EXECUTE FUNCTION check_mk_activation();

-- Enable RLS
ALTER TABLE public.komponen_penilaian ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "komponen_select_authenticated" ON public.komponen_penilaian;
CREATE POLICY "komponen_select_authenticated" ON public.komponen_penilaian
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "komponen_write_dosen_admin" ON public.komponen_penilaian;
CREATE POLICY "komponen_write_dosen_admin" ON public.komponen_penilaian
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mata_kuliah mk
      WHERE mk.id = mk_id AND (
        mk.dosen_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );
