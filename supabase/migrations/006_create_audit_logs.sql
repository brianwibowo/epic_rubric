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
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow authenticated users to write audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
