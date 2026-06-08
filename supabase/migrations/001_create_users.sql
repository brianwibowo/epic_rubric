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
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- 2. Users can update their own profile details
CREATE POLICY "Allow users to update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- 3. Only admins can insert/delete profiles directly
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
