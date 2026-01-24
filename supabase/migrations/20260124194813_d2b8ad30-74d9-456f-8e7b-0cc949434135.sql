-- Create table for industry contexts (grounding data for AI reasoning)
CREATE TABLE public.industry_contexts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    constraints TEXT[] NOT NULL DEFAULT '{}',
    kpis TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for procurement category contexts (grounding data for AI reasoning)
CREATE TABLE public.procurement_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    characteristics TEXT NOT NULL,
    kpis TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for context data)
ALTER TABLE public.industry_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (context data is reference data)
CREATE POLICY "Industry contexts are publicly readable" 
ON public.industry_contexts 
FOR SELECT 
USING (true);

CREATE POLICY "Procurement categories are publicly readable" 
ON public.procurement_categories 
FOR SELECT 
USING (true);

-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_industry_contexts_updated_at
BEFORE UPDATE ON public.industry_contexts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procurement_categories_updated_at
BEFORE UPDATE ON public.procurement_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();