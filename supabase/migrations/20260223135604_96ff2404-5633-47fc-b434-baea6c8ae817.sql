
CREATE TABLE public.scenario_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id text NOT NULL,
  rating integer NOT NULL,
  feedback_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scenario_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit scenario feedback"
  ON public.scenario_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read scenario feedback"
  ON public.scenario_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
