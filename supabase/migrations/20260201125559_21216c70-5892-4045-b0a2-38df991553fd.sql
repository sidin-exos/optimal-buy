-- Public share links for reports (no login required)
CREATE TABLE IF NOT EXISTS public.shared_reports (
  share_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_reports_expires_at
  ON public.shared_reports (expires_at);

ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Deny direct table access from client SDK; access is only via SECURITY DEFINER RPCs below.
REVOKE ALL ON TABLE public.shared_reports FROM anon, authenticated;

CREATE POLICY "No direct select on shared_reports"
  ON public.shared_reports
  FOR SELECT
  USING (false);

CREATE POLICY "No direct insert on shared_reports"
  ON public.shared_reports
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update on shared_reports"
  ON public.shared_reports
  FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete on shared_reports"
  ON public.shared_reports
  FOR DELETE
  USING (false);

-- Create / upsert a shared report. The share_id is the "secret" in the URL.
CREATE OR REPLACE FUNCTION public.create_shared_report(
  p_share_id text,
  p_payload jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.shared_reports (share_id, payload, expires_at)
  VALUES (p_share_id, p_payload, p_expires_at)
  ON CONFLICT (share_id)
  DO UPDATE SET
    payload = EXCLUDED.payload,
    expires_at = EXCLUDED.expires_at;
END;
$$;

-- Fetch a shared report by share_id, returning NULL if missing/expired.
CREATE OR REPLACE FUNCTION public.get_shared_report(
  p_share_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payload jsonb;
BEGIN
  -- Opportunistic cleanup for this ID
  DELETE FROM public.shared_reports
  WHERE share_id = p_share_id
    AND expires_at <= now();

  SELECT payload
    INTO v_payload
  FROM public.shared_reports
  WHERE share_id = p_share_id
    AND expires_at > now();

  RETURN v_payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_shared_report(text, jsonb, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_report(text) TO anon, authenticated;
