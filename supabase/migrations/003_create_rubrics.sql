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
CREATE POLICY "Allow public read access to rubric templates"
  ON public.rubric_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow teachers and admins to create/update rubric templates"
  ON public.rubric_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'guru')
    )
  );

CREATE POLICY "Allow public read access to feedback templates"
  ON public.feedback_templates FOR SELECT TO authenticated USING (true);

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
