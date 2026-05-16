
-- Drop the overly permissive FOR ALL policy
DROP POLICY IF EXISTS "Users can manage their own plaid_connections" ON public.plaid_connections;

-- Only allow INSERT and DELETE from the client (no SELECT, no UPDATE)
-- SELECT is never needed client-side; access_token is only read server-side via service role
CREATE POLICY "Users can insert own plaid_connections"
  ON public.plaid_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plaid_connections"
  ON public.plaid_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
