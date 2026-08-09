-- ============================================================
-- EPIC e-Rubric v2.0: Restructure Mata Kuliah
-- Replaces the old 'classes' concept with 'mata_kuliah'
-- ============================================================

-- Create mata_kuliah table
CREATE TABLE IF NOT EXISTS public.mata_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                              -- e.g. "Praktikum Akuntansi"
  kode_mk TEXT NOT NULL,                           -- e.g. "AKT301"
  semester TEXT NOT NULL,                          -- e.g. "Ganjil 2026/2027"
  dosen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  join_code TEXT UNIQUE,                           -- auto-generated join code for students
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  description TEXT,                                -- optional MK description
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate MK code in same semester by same dosen
  UNIQUE(kode_mk, semester, dosen_id)
);

-- Create MK enrollments table
CREATE TABLE IF NOT EXISTS public.mk_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_id UUID REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mk_id, student_id)
);

-- Auto update updated_at
CREATE OR REPLACE TRIGGER update_mata_kuliah_updated_at
  BEFORE UPDATE ON public.mata_kuliah
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate join code function
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 6-char alphanumeric code
    code := upper(substr(md5(random()::text), 1, 6));
    SELECT COUNT(*) INTO exists_count FROM public.mata_kuliah WHERE join_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate join_code on insert
CREATE OR REPLACE FUNCTION set_join_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code := generate_join_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_mk_join_code
  BEFORE INSERT ON public.mata_kuliah
  FOR EACH ROW EXECUTE FUNCTION set_join_code();

-- Enable RLS
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mk_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mata_kuliah
CREATE POLICY "mk_select_authenticated" ON public.mata_kuliah
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "mk_insert_dosen_admin" ON public.mata_kuliah
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );

CREATE POLICY "mk_update_owner_admin" ON public.mata_kuliah
  FOR UPDATE TO authenticated
  USING (
    dosen_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "mk_delete_owner_admin" ON public.mata_kuliah
  FOR DELETE TO authenticated
  USING (
    dosen_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for mk_enrollments
CREATE POLICY "enrollment_select_authenticated" ON public.mk_enrollments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "enrollment_insert_dosen_admin" ON public.mk_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin/Dosen can enroll students
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
    OR
    -- Students can self-enroll (join via code handled in app logic)
    student_id = auth.uid()
  );

CREATE POLICY "enrollment_delete_dosen_admin" ON public.mk_enrollments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );
