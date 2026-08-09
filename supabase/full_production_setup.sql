-- ============================================================
-- EPIC e-Rubric Platform — Consolidated Production Setup SQL (Idempotent)
-- Target: Supabase Postgres Database
-- Generated: 2026-08-09T13:46:30.549Z
-- ============================================================

-- ------------------------------------------------------------
-- MIGRATION FILE: 001_create_users.sql
-- ------------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
  nisn TEXT UNIQUE,           -- For students
  nip TEXT UNIQUE,            -- For teachers
  class_id UUID,              -- Will be linked to classes table later
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Profiles are readable by authenticated users
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- 2. Users can update their own profile details
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- 3. Only admins can insert/delete profiles directly
DROP POLICY IF EXISTS "Allow admin full CRUD profiles" ON public.profiles;
CREATE POLICY "Allow admin full CRUD profiles" 
  ON public.profiles 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: Automatically create profile record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, nisn, nip, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE(new.raw_user_meta_data->>'role', 'siswa'),
    new.raw_user_meta_data->>'nisn',
    new.raw_user_meta_data->>'nip',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- MIGRATION FILE: 002_create_classes.sql
-- ------------------------------------------------------------

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
DROP POLICY IF EXISTS "Allow public read access to classes" ON public.classes;
CREATE POLICY "Allow public read access to classes"
  ON public.classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin to write classes" ON public.classes;
CREATE POLICY "Allow admin to write classes"
  ON public.classes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow public read access to enrollments" ON public.class_enrollments;
CREATE POLICY "Allow public read access to enrollments"
  ON public.class_enrollments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin to write enrollments" ON public.class_enrollments;
CREATE POLICY "Allow admin to write enrollments"
  ON public.class_enrollments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- MIGRATION FILE: 003_create_rubrics.sql
-- ------------------------------------------------------------

-- Create rubric_templates table
CREATE TABLE IF NOT EXISTS public.rubric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  weight_e DECIMAL(5,4) NOT NULL,  -- Evaluative Understanding
  weight_p DECIMAL(5,4) NOT NULL,  -- Predictive Reasoning
  weight_i DECIMAL(5,4) NOT NULL,  -- Intelligent Application
  weight_c DECIMAL(5,4) NOT NULL,  -- Critical Reflection
  weight_pe DECIMAL(5,4) NOT NULL, -- Professional Ethics
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Constraint to ensure weights sum to exactly 1.0000
  CONSTRAINT weights_sum_100 CHECK (
    weight_e + weight_p + weight_i + weight_c + weight_pe = 1.0000
  )
);

-- Create feedback_templates table
CREATE TABLE IF NOT EXISTS public.feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL CHECK (dimension IN ('E','P','I','C','PE')),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 4),
  template_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicates for dimension + score combination
  UNIQUE(dimension, score)
);

-- Enable RLS
ALTER TABLE public.rubric_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_templates ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to rubric templates" ON public.rubric_templates;
CREATE POLICY "Allow public read access to rubric templates"
  ON public.rubric_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow teachers and admins to create/update rubric templates" ON public.rubric_templates;
CREATE POLICY "Allow teachers and admins to create/update rubric templates"
  ON public.rubric_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'guru')
    )
  );

DROP POLICY IF EXISTS "Allow public read access to feedback templates" ON public.feedback_templates;
CREATE POLICY "Allow public read access to feedback templates"
  ON public.feedback_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admins to CRUD feedback templates" ON public.feedback_templates;
CREATE POLICY "Allow admins to CRUD feedback templates"
  ON public.feedback_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed initial feedback templates
INSERT INTO public.feedback_templates (dimension, score, template_text) VALUES
('E', 1, 'Siswa kesulitan memahami konsep dasar persamaan akuntansi dan pencatatan debit-kredit. Perlu bimbingan intensif dari guru untuk materi penggolongan akun.'),
('E', 2, 'Siswa memahami konsep dasar akuntansi, tetapi masih sering melakukan kesalahan saat mengklasifikasikan akun aset, liabilitas, dan ekuitas dalam jurnal.'),
('E', 3, 'Siswa mampu menganalisis transaksi keuangan dan melakukan penjurnalan dengan tepat sesuai dengan Standar Akuntansi Keuangan (SAK).'),
('E', 4, 'Siswa menunjukkan pemahaman konseptual yang luar biasa. Mampu menganalisis transaksi kompleks secara mandiri dan mengklasifikasikannya dengan akurasi 100%.'),
('P', 1, 'Siswa belum mampu memproyeksikan saldo akhir buku besar maupun mengantisipasi ketidakseimbangan pada neraca saldo.'),
('P', 2, 'Siswa dapat membuat neraca saldo, namun kesulitan mendeteksi penyebab selisih angka dan kurang teliti memproyeksikan penutupan buku besar.'),
('P', 3, 'Siswa memiliki penalaran yang baik dalam memperkirakan aliran akun penyesuaian dan memproyeksikan saldo akun riil serta nominal setelah penutupan.'),
('P', 4, 'Analisis data sangat tajam. Siswa mampu mendeteksi potensi selisih saldo secara dini dan memproyeksikan laporan laba-rugi serta posisi keuangan dengan sangat akurat.'),
('I', 1, 'Siswa belum mampu menyusun kertas kerja (worksheet) akuntansi maupun laporan keuangan sederhana secara runut.'),
('I', 2, 'Siswa mampu menyusun laporan keuangan (Laba Rugi, Perubahan Ekuitas, Neraca) tetapi masih memerlukan bantuan untuk menyelesaikan penyesuaian akhir di kertas kerja.'),
('I', 3, 'Siswa terampil mengaplikasikan siklus akuntansi pada kasus riil perusahaan jasa atau dagang menggunakan format kertas kerja standar.'),
('I', 4, 'Penerapan siklus akuntansi sangat matang. Kertas kerja diselesaikan secara komprehensif, cepat, tepat, dan sesuai dengan prinsip akuntansi yang berlaku.'),
('C', 1, 'Siswa tidak menyadari kesalahan pencatatan atau ketidaksesuaian angka dan tidak melakukan verifikasi ulang pada lembar kerjanya.'),
('C', 2, 'Siswa menyadari adanya kesalahan jumlah saldo, tetapi kesulitan melacak sumber kesalahan jurnal penyesuaian secara mandiri.'),
('C', 3, 'Siswa secara kritis memeriksa kembali kertas kerja, mendeteksi selisih angka, dan mampu melakukan koreksi jurnal penyesuaian dengan benar.'),
('C', 4, 'Siswa menunjukkan kemampuan audit mandiri yang sangat baik. Mampu memberikan analisis reflektif atas deviasi laporan keuangan dan memberikan solusi jurnal koreksi yang tepat.'),
('PE', 1, 'Dokumen laporan keuangan diselesaikan dengan tidak rapi, banyak coretan, dan tidak mengindahkan batas waktu pengerjaan yang disepakati.'),
('PE', 2, 'Laporan keuangan cukup lengkap, namun kerapian penulisan angka desimal, garis pembatas saldo, dan ketepatan waktu pengumpulan masih harus ditingkatkan.'),
('PE', 3, 'Siswa menunjukkan sikap profesional: pengerjaan bersih, penulisan angka rapi, jujur dalam penyajian data keuangan, dan mengumpulkan tepat waktu.'),
('PE', 4, 'Sikap profesionalisme sangat menonjol. Hasil kerja sangat bersih dan rapi, integritas data keuangan terjaga penuh, serta diselesaikan sebelum batas waktu.')
ON CONFLICT (dimension, score) DO UPDATE SET template_text = EXCLUDED.template_text;

-- ------------------------------------------------------------
-- MIGRATION FILE: 004_create_scores.sql
-- ------------------------------------------------------------

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
DROP POLICY IF EXISTS "Allow students to view own sent assessments" ON public.assessments;
CREATE POLICY "Allow students to view own sent assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() 
    AND status = 'SENT_TO_ANALYTICS'
  );

-- 2. Teachers can view/insert/update assessments
DROP POLICY IF EXISTS "Allow teachers full access to assessments" ON public.assessments;
CREATE POLICY "Allow teachers full access to assessments"
  ON public.assessments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'guru')
    )
  );

-- ------------------------------------------------------------
-- MIGRATION FILE: 005_create_analytics.sql
-- ------------------------------------------------------------

-- Create indexes to optimize analytics queries (NFR-PER-001)
CREATE INDEX IF NOT EXISTS idx_assessments_class_project 
  ON public.assessments(class_id, project_name, status);

CREATE INDEX IF NOT EXISTS idx_assessments_student 
  ON public.assessments(student_id, status);

-- Create a view for class-level performance statistics with RLS enforcement
CREATE OR REPLACE VIEW public.class_performance_summary 
WITH (security_invoker = true) AS
SELECT 
  class_id,
  project_name,
  COUNT(id) as total_students_assessed,
  ROUND(AVG(final_score), 2) as average_score,
  MAX(final_score) as highest_score,
  MIN(final_score) as lowest_score,
  -- KKM is standard 75
  COUNT(CASE WHEN final_score >= 75 THEN 1 END) as passed_kkm_count,
  ROUND(
    (COUNT(CASE WHEN final_score >= 75 THEN 1 END)::DECIMAL / COUNT(id)::DECIMAL) * 100, 
    2
  ) as passing_rate_percentage
FROM 
  public.assessments
WHERE 
  status = 'SENT_TO_ANALYTICS'
GROUP BY 
  class_id, project_name;

-- ------------------------------------------------------------
-- MIGRATION FILE: 006_create_audit_logs.sql
-- ------------------------------------------------------------

-- Create audit_logs table for system auditing (FR-DB-003)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,          -- e.g. 'CREATE_DRAFT', 'FINALIZE_SCORE', 'REOPEN_REMEDIAL'
  target_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB,                     -- Extra payload details
  ip_address TEXT,                    -- Store client IP string
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Immutable logs: only readable by admins, insertions allowed by anyone authenticated)
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow authenticated users to write audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to write audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- MIGRATION FILE: 007_rls_policies.sql
-- ------------------------------------------------------------

-- ROW LEVEL SECURITY (RLS) POLICIES UPGRADE (Fase 7)
-- This migration refines access controls across all tables to enforce role-based access.

-- ----------------------------------------------------
-- 1. ASSESSMENTS TABLE (Core Scoring Records)
-- ----------------------------------------------------
-- Drop existing basic policies from 004 migration
DROP POLICY IF EXISTS "Allow students to view own sent assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow teachers full access to assessments" ON public.assessments;

-- Siswa only read assessments belonging to themselves and status is SENT_TO_ANALYTICS.
-- Guru only read/write assessments in classes they teach (where c.guru_id = auth.uid()).
-- Admin has full read/write access to all records.

DROP POLICY IF EXISTS "Assessments SELECT Policy" ON public.assessments;
CREATE POLICY "Assessments SELECT Policy" ON public.assessments
  FOR SELECT TO authenticated
  USING (
    -- Admin: Full Access
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    -- Guru: Only classes taught by the Guru
    (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assessments.class_id AND c.guru_id = auth.uid()))
    OR
    -- Siswa: Only own assessments that have been released/sent to analytics
    (student_id = auth.uid() AND status = 'SENT_TO_ANALYTICS')
  );

DROP POLICY IF EXISTS "Assessments INSERT Policy" ON public.assessments;
CREATE POLICY "Assessments INSERT Policy" ON public.assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Admin: Full Access
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    -- Guru: Only classes taught by this Guru, and evaluator matches self
    (
      EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.guru_id = auth.uid())
      AND evaluator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Assessments UPDATE Policy" ON public.assessments;
CREATE POLICY "Assessments UPDATE Policy" ON public.assessments
  FOR UPDATE TO authenticated
  USING (
    -- Admin: Full Access (allows reopening finalized grades)
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    -- Guru: Only classes taught, and record must be editable (DRAFT status)
    (
      EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assessments.class_id AND c.guru_id = auth.uid())
      AND is_editable = true
    )
  )
  WITH CHECK (
    -- Admin: Full Access
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    -- Guru: Only classes taught, evaluator matches self, and remains editable
    (
      EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.guru_id = auth.uid())
      AND evaluator_id = auth.uid()
      AND is_editable = true
    )
  );

DROP POLICY IF EXISTS "Assessments DELETE Policy" ON public.assessments;
CREATE POLICY "Assessments DELETE Policy" ON public.assessments
  FOR DELETE TO authenticated
  USING (
    -- Admin: Full Access
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    -- Guru: Only classes taught
    (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assessments.class_id AND c.guru_id = auth.uid()))
  );


-- ----------------------------------------------------
-- 2. CLASSES & ENROLLMENTS TABLES
-- ----------------------------------------------------
-- Drop existing policies to refine them
DROP POLICY IF EXISTS "Allow public read access to classes" ON public.classes;
DROP POLICY IF EXISTS "Allow admin to write classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public read access to enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Allow admin to write enrollments" ON public.class_enrollments;

-- Classes:
-- - Read: Any authenticated user.
-- - Write (CRUD): Admin or teaching Guru.
DROP POLICY IF EXISTS "Classes SELECT Policy" ON public.classes;
CREATE POLICY "Classes SELECT Policy" ON public.classes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Classes Write Policy" ON public.classes;
CREATE POLICY "Classes Write Policy" ON public.classes
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    (guru_id = auth.uid())
  );

-- Enrollments:
-- - Read: Any authenticated user.
-- - Write (CRUD): Admin or class-teacher Guru.
DROP POLICY IF EXISTS "Enrollments SELECT Policy" ON public.class_enrollments;
CREATE POLICY "Enrollments SELECT Policy" ON public.class_enrollments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enrollments Write Policy" ON public.class_enrollments;
CREATE POLICY "Enrollments Write Policy" ON public.class_enrollments
  FOR ALL TO authenticated
  USING (
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
    OR
    (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_enrollments.class_id AND c.guru_id = auth.uid()))
  );


-- ----------------------------------------------------
-- 3. AUDIT LOGS TABLE
-- ----------------------------------------------------
-- Drop existing to refine
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to write audit logs" ON public.audit_logs;

-- Read: Admin only.
-- Write: Any authenticated user (insert actions they perform).
DROP POLICY IF EXISTS "Audit Logs SELECT Policy" ON public.audit_logs;
CREATE POLICY "Audit Logs SELECT Policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Audit Logs INSERT Policy" ON public.audit_logs;
CREATE POLICY "Audit Logs INSERT Policy" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- MIGRATION FILE: 008_seed_data.sql
-- ------------------------------------------------------------

-- ----------------------------------------------------
-- DATABASE SEED DATA (Fase 8 - Produksi)
-- Menambahkan akun Admin, Guru, Siswa, Kelas, dan Pendaftaran awal.
-- Password untuk semua akun demo: Brianscottkennedy120404$
-- ----------------------------------------------------

-- Aktivasi ekstensi pgcrypto untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. SEED AKUN AUTH (auth.users)
-- Data ini akan menyalin secara otomatis ke public.profiles melalui trigger on_auth_user_created.

-- Akun Admin: admin@epic.id
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@epic.id',
  extensions.crypt('Brianscottkennedy120404$', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Budi Santoso, M.Pd.","role":"admin","nip":"198203112009021003"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Akun Guru: guru@epic.id
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'guru@epic.id',
  extensions.crypt('Brianscottkennedy120404$', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dra. Sri Wahyuni","role":"guru","nip":"197508242000032001"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Akun Siswa: siswa@epic.id
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'siswa@epic.id',
  extensions.crypt('Brianscottkennedy120404$', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Feri Irawan","role":"siswa","nisn":"0087654321"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED KELAS (public.classes)
-- Pastikan ID kelas sinkron dengan data profil siswa

INSERT INTO public.classes (id, name, academic_year, guru_id) VALUES
('11111111-c1a5-5555-5555-111111111111', 'XII-AKL-1', '2025/2026', 'b2222222-2222-2222-2222-222222222222'),
('22222222-c2a5-5555-5555-222222222222', 'XII-AKL-2', '2025/2026', 'b2222222-2222-2222-2222-222222222222'),
('33333333-c3a5-5555-5555-333333333333', 'XI-AKL-1', '2025/2026', 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (name) DO NOTHING;

-- Update class_id untuk profil siswa yang didefaultkan trigger
UPDATE public.profiles 
SET class_id = '11111111-c1a5-5555-5555-111111111111' 
WHERE id = 'c3333333-3333-3333-3333-333333333333';

-- 3. SEED PENDAFTARAN SISWA (public.class_enrollments)
INSERT INTO public.class_enrollments (class_id, student_id) VALUES
('11111111-c1a5-5555-5555-111111111111', 'c3333333-3333-3333-3333-333333333333')
ON CONFLICT (class_id, student_id) DO NOTHING;

-- ------------------------------------------------------------
-- MIGRATION FILE: 009_restructure_mata_kuliah.sql
-- ------------------------------------------------------------

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
DROP POLICY IF EXISTS "mk_select_authenticated" ON public.mata_kuliah;
CREATE POLICY "mk_select_authenticated" ON public.mata_kuliah
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mk_insert_dosen_admin" ON public.mata_kuliah;
CREATE POLICY "mk_insert_dosen_admin" ON public.mata_kuliah
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );

DROP POLICY IF EXISTS "mk_update_owner_admin" ON public.mata_kuliah;
CREATE POLICY "mk_update_owner_admin" ON public.mata_kuliah
  FOR UPDATE TO authenticated
  USING (
    dosen_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "mk_delete_owner_admin" ON public.mata_kuliah;
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
DROP POLICY IF EXISTS "enrollment_select_authenticated" ON public.mk_enrollments;
CREATE POLICY "enrollment_select_authenticated" ON public.mk_enrollments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "enrollment_insert_dosen_admin" ON public.mk_enrollments;
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

DROP POLICY IF EXISTS "enrollment_delete_dosen_admin" ON public.mk_enrollments;
CREATE POLICY "enrollment_delete_dosen_admin" ON public.mk_enrollments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dosen')
    )
  );

-- ------------------------------------------------------------
-- MIGRATION FILE: 010_restructure_komponen_penilaian.sql
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- MIGRATION FILE: 011_restructure_rubric_dimensions.sql
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- MIGRATION FILE: 012_restructure_scores.sql
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- MIGRATION FILE: 013_create_comments.sql
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- MIGRATION FILE: 014_create_notifications.sql
-- ------------------------------------------------------------

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

