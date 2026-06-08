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
