
-- Fix: Drop existing triggers before recreating
DROP TRIGGER IF EXISTS update_industry_contexts_updated_at ON public.industry_contexts;
DROP TRIGGER IF EXISTS update_procurement_categories_updated_at ON public.procurement_categories;

CREATE TRIGGER update_industry_contexts_updated_at
  BEFORE UPDATE ON public.industry_contexts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procurement_categories_updated_at
  BEFORE UPDATE ON public.procurement_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
