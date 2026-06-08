-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- e.g. "XII-AKL-1"
  academic_year TEXT NOT NULL,         -- e.g. "2025/2026"
  guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create class_enrollments mapping table
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent double enrollments in same class
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to classes"
  ON public.classes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to write classes"
  ON public.classes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow public read access to enrollments"
  ON public.class_enrollments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to write enrollments"
  ON public.class_enrollments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
