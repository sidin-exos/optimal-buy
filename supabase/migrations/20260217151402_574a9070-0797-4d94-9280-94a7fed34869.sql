ALTER TABLE public.test_reports
ADD COLUMN shadow_log jsonb DEFAULT NULL;

COMMENT ON COLUMN public.test_reports.shadow_log IS
  'Silent input quality evaluation: friction_score, redundant_fields, missing_context, input_recommendation';