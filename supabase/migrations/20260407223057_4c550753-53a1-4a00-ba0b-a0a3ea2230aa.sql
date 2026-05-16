
CREATE OR REPLACE FUNCTION public.increment_sage_calls(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE root_state
  SET sage_calls_today = sage_calls_today + 1
  WHERE user_id = p_user_id;
$$;
