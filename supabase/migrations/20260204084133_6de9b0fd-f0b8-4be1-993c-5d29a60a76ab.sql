-- Create market_insights table for storing AI-generated market intelligence
CREATE TABLE public.market_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry_slug TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  industry_name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  key_trends TEXT[] DEFAULT '{}'::text[],
  risk_signals TEXT[] DEFAULT '{}'::text[],
  opportunities TEXT[] DEFAULT '{}'::text[],
  raw_response JSONB,
  model_used TEXT DEFAULT 'sonar-pro',
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Unique constraint for active insight per combination
  CONSTRAINT unique_active_insight UNIQUE (industry_slug, category_slug, is_active) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create index for fast lookups
CREATE INDEX idx_market_insights_combo ON public.market_insights(industry_slug, category_slug);
CREATE INDEX idx_market_insights_active ON public.market_insights(is_active) WHERE is_active = true;
CREATE INDEX idx_market_insights_created ON public.market_insights(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- Public read access (market insights are shared knowledge base)
CREATE POLICY "Market insights are publicly readable"
ON public.market_insights
FOR SELECT
USING (true);

-- Only allow inserts/updates via service role (edge functions)
CREATE POLICY "Allow service role insert on market_insights"
ON public.market_insights
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow service role update on market_insights"
ON public.market_insights
FOR UPDATE
USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.market_insights IS 'Stores AI-generated market intelligence for industry+category combinations, used for grounding procurement analysis';