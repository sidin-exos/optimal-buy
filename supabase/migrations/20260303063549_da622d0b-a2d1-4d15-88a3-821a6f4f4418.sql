
-- Add user_id column to chat_feedback
ALTER TABLE public.chat_feedback ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the permissive anonymous INSERT policy
DROP POLICY IF EXISTS "Anyone can submit chat feedback" ON public.chat_feedback;

-- Create strict authenticated-only INSERT policy
CREATE POLICY "Authenticated users can insert own feedback"
  ON public.chat_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
