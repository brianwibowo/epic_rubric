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
CREATE POLICY "Classes SELECT Policy" ON public.classes
  FOR SELECT TO authenticated USING (true);

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
CREATE POLICY "Enrollments SELECT Policy" ON public.class_enrollments
  FOR SELECT TO authenticated USING (true);

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
CREATE POLICY "Audit Logs SELECT Policy" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Audit Logs INSERT Policy" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
