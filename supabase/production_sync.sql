-- ============================================================
-- EPIC e-Rubric Platform: Production Sync & RLS Activation
-- Target: Supabase SQL Editor
-- ============================================================

-- 1. Perbarui kolom tabel 'classes' agar mendukung seluruh field SMK
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS jurusan TEXT DEFAULT 'Akuntansi & Keuangan Lembaga';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS wali_kelas TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS tahun_ajaran TEXT DEFAULT '2025/2026';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS mapel_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS students_data JSONB DEFAULT '[]'::jsonb;

-- 2. Perbarui kolom tabel 'mata_kuliah'
ALTER TABLE public.mata_kuliah ADD COLUMN IF NOT EXISTS sks INTEGER DEFAULT 2;
ALTER TABLE public.mata_kuliah ADD COLUMN IF NOT EXISTS tahun_ajaran TEXT;
ALTER TABLE public.mata_kuliah ADD COLUMN IF NOT EXISTS guru_name TEXT;
ALTER TABLE public.mata_kuliah ADD COLUMN IF NOT EXISTS dosen_name TEXT;
ALTER TABLE public.mata_kuliah ADD COLUMN IF NOT EXISTS rombel_data JSONB DEFAULT '[]'::jsonb;

-- 3. Jadikan fungsi trigger komponen_penilaian sebagai SECURITY DEFINER (agar tidak kena RLS saat insert MK)
CREATE OR REPLACE FUNCTION public.create_default_komponen()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.komponen_penilaian (mk_id, name, urutan) VALUES
    (NEW.id, 'Proyek', 1),
    (NEW.id, 'Partisipasi Kelas', 2),
    (NEW.id, 'Quiz', 3),
    (NEW.id, 'Tugas', 4),
    (NEW.id, 'UTS', 5),
    (NEW.id, 'UAS', 6)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Buka izin RLS (Row Level Security) untuk akses publik / anonim ke seluruh tabel
-- Classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all classes" ON public.classes;
CREATE POLICY "Allow anon all classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);

-- Mata Kuliah
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all mata_kuliah" ON public.mata_kuliah;
CREATE POLICY "Allow anon all mata_kuliah" ON public.mata_kuliah FOR ALL USING (true) WITH CHECK (true);

-- Komponen Penilaian
ALTER TABLE public.komponen_penilaian ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all komponen_penilaian" ON public.komponen_penilaian;
CREATE POLICY "Allow anon all komponen_penilaian" ON public.komponen_penilaian FOR ALL USING (true) WITH CHECK (true);

-- Class Enrollments & MK Enrollments
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all class_enrollments" ON public.class_enrollments;
CREATE POLICY "Allow anon all class_enrollments" ON public.class_enrollments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mk_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all mk_enrollments" ON public.mk_enrollments;
CREATE POLICY "Allow anon all mk_enrollments" ON public.mk_enrollments FOR ALL USING (true) WITH CHECK (true);

-- Rubric Templates & Dimensions
ALTER TABLE public.rubric_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all rubric_templates" ON public.rubric_templates;
CREATE POLICY "Allow anon all rubric_templates" ON public.rubric_templates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.rubric_dimensions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all rubric_dimensions" ON public.rubric_dimensions;
CREATE POLICY "Allow anon all rubric_dimensions" ON public.rubric_dimensions FOR ALL USING (true) WITH CHECK (true);

-- Scores & Assessments
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all scores" ON public.scores;
CREATE POLICY "Allow anon all scores" ON public.scores FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all assessments" ON public.assessments;
CREATE POLICY "Allow anon all assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

-- Comments & Notifications
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all comments" ON public.comments;
CREATE POLICY "Allow anon all comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all notifications" ON public.notifications;
CREATE POLICY "Allow anon all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nim TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nidn TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_info TEXT;

-- Lepaskan foreign key constraint profiles_id_fkey agar aman insert profil
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all profiles" ON public.profiles;
CREATE POLICY "Allow anon all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. Sinkronisasi Akun 5 Guru SMK ke auth.users & public.profiles
-- ============================================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
) VALUES 
(
  '02070270-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'mutiaradyah1.25@gmail.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dyah Mutiara Indriasari, S. E.","role":"guru","nip":"0207027","unit_info":"Akuntansi"}'::jsonb,
  'authenticated', 'authenticated', now(), now()
),
(
  '02070120-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'dwihasti17@gmail.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dwi Hastuti, S. E.","role":"guru","nip":"0207012","unit_info":"Akuntansi"}'::jsonb,
  'authenticated', 'authenticated', now(), now()
),
(
  '02070140-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'arifsanti14@gmail.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Arif Dwie Arysanti, S. Pd.","role":"guru","nip":"0207014","unit_info":"Manajemen Perkantoran"}'::jsonb,
  'authenticated', 'authenticated', now(), now()
),
(
  '06020440-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'xca.prasetya@gmail.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ika Prasetya Yuniati, S. Pd","role":"guru","nip":"0602044","unit_info":"Akuntansi"}'::jsonb,
  'authenticated', 'authenticated', now(), now()
)
ON CONFLICT (id) DO UPDATE 
SET 
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = now();

-- Masukkan/sinkronkan kelima akun ke public.profiles
INSERT INTO public.profiles (id, full_name, email, role, nip, unit_info)
VALUES 
  ('2d18f169-0c7f-499f-a274-0e4a4bc4dae1', 'Ratna Indriani, S. Pd', 'ratnaindriani1628@gmail.com', 'guru', '0801061', 'Manajemen Perkantoran'),
  ('02070270-0000-0000-0000-000000000001', 'Dyah Mutiara Indriasari, S. E.', 'mutiaradyah1.25@gmail.com', 'guru', '0207027', 'Akuntansi'),
  ('02070120-0000-0000-0000-000000000002', 'Dwi Hastuti, S. E.', 'dwihasti17@gmail.com', 'guru', '0207012', 'Akuntansi'),
  ('02070140-0000-0000-0000-000000000003', 'Arif Dwie Arysanti, S. Pd.', 'arifsanti14@gmail.com', 'guru', '0207014', 'Manajemen Perkantoran'),
  ('06020440-0000-0000-0000-000000000004', 'Ika Prasetya Yuniati, S. Pd', 'xca.prasetya@gmail.com', 'guru', '0602044', 'Akuntansi')
ON CONFLICT (id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  nip = EXCLUDED.nip,
  unit_info = EXCLUDED.unit_info;


