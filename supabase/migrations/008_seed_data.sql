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
