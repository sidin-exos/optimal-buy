-- Create intel_queries table for market intelligence storage
CREATE TABLE public.intel_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Query details
  query_type TEXT NOT NULL CHECK (query_type IN ('supplier', 'commodity', 'industry', 'regulatory', 'm&a', 'risk')),
  query_text TEXT NOT NULL,
  recency_filter TEXT CHECK (recency_filter IN ('day', 'week', 'month', 'year')),
  domain_filter TEXT[],
  
  -- Response
  summary TEXT,
  citations JSONB,
  raw_response JSONB,
  
  -- Metadata
  model_used TEXT,
  processing_time_ms INT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Add comment
COMMENT ON TABLE public.intel_queries IS 'Stores market intelligence queries and responses from Perplexity API';

-- Enable RLS
ALTER TABLE public.intel_queries ENABLE ROW LEVEL SECURITY;

-- Public read/write policy (matching existing test_prompts pattern)
CREATE POLICY "Allow public read access to intel_queries"
  ON public.intel_queries
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to intel_queries"
  ON public.intel_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to intel_queries"
  ON public.intel_queries
  FOR UPDATE
  USING (true);

-- Create index for efficient querying
CREATE INDEX idx_intel_queries_type_created ON public.intel_queries(query_type, created_at DESC);
CREATE INDEX idx_intel_queries_success ON public.intel_queries(success, created_at DESC);