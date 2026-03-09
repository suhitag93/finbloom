
CREATE TABLE public.plaid_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  item_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own plaid_connections"
  ON public.plaid_connections
  FOR ALL
  USING (auth.uid() = user_id);
