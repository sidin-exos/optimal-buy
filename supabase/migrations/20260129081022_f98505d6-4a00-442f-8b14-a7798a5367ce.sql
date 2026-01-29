-- Create testing database for XML prompts and AI reports
-- This allows tracking and debugging the full pipeline: UI → XML Prompt → AI → Report

-- Table to store generated XML prompts
CREATE TABLE public.test_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_type TEXT NOT NULL,
  scenario_data JSONB NOT NULL DEFAULT '{}',
  industry_slug TEXT,
  category_slug TEXT,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  grounding_context JSONB,
  anonymization_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to store AI responses/reports
CREATE TABLE public.test_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.test_prompts(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  raw_response TEXT NOT NULL,
  validation_result JSONB,
  deanonymized_response TEXT,
  processing_time_ms INTEGER,
  token_usage JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;

-- Public read/write for testing (no auth required for MVP testing)
CREATE POLICY "Test prompts are publicly accessible"
ON public.test_prompts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Test reports are publicly accessible"
ON public.test_reports FOR ALL USING (true) WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_test_prompts_scenario ON public.test_prompts(scenario_type);
CREATE INDEX idx_test_prompts_created ON public.test_prompts(created_at DESC);
CREATE INDEX idx_test_reports_prompt ON public.test_reports(prompt_id);
CREATE INDEX idx_test_reports_created ON public.test_reports(created_at DESC);