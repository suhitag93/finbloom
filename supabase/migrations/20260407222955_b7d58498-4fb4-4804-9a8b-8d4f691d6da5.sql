
CREATE TABLE public.root_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  sage_calls_today integer NOT NULL DEFAULT 0,
  sage_reset_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.root_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own root_state"
  ON public.root_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own root_state"
  ON public.root_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own root_state"
  ON public.root_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
