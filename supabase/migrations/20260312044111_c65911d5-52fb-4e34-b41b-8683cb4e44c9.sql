CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_xp_amount integer, p_source_type text, p_source_id uuid DEFAULT NULL::uuid, p_reason text DEFAULT ''::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_xp integer;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  -- Ownership check: authenticated users can only award XP to themselves
  -- Service role (auth.uid() IS NULL) is allowed for server-side seeding
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot award XP to another user';
  END IF;

  -- Always require a source_id to prevent unlimited XP farming
  IF p_source_id IS NULL THEN
    RAISE EXCEPTION 'source_id is required';
  END IF;

  IF p_xp_amount <= 0 OR p_xp_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid XP amount: %', p_xp_amount;
  END IF;

  IF p_source_type NOT IN (
    'mission_completed', 'achievement_earned', 'goal_milestone',
    'goal_created', 'bank_connected', 'onboarding_completed',
    'onboarding', 'banking', 'engagement', 'streak_bonus',
    'weekly_review', 'saving', 'achievement', 'investing', 'mission'
  ) THEN
    RAISE EXCEPTION 'Invalid source_type: %', p_source_type;
  END IF;

  -- Deduplication check
  IF EXISTS (
    SELECT 1 FROM xp_ledger
    WHERE user_id = p_user_id AND source_id = p_source_id AND source_type = p_source_type
  ) THEN
    RETURN json_build_object('success', false, 'reason', 'already_awarded');
  END IF;

  SELECT xp_points INTO v_current_xp FROM profiles WHERE user_id = p_user_id;
  v_new_xp := v_current_xp + p_xp_amount;

  IF v_new_xp >= 15000 THEN v_new_level := 5;
  ELSIF v_new_xp >= 8000 THEN v_new_level := 4;
  ELSIF v_new_xp >= 4000 THEN v_new_level := 3;
  ELSIF v_new_xp >= 1500 THEN v_new_level := 2;
  ELSIF v_new_xp >= 500 THEN v_new_level := 1;
  ELSE v_new_level := 0;
  END IF;

  INSERT INTO xp_ledger (user_id, xp_amount, source_type, source_id, reason)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_reason);

  PERFORM set_config('app.bypass_computed_protection', 'true', true);
  UPDATE profiles SET xp_points = v_new_xp, finbloom_level = v_new_level, updated_at = now()
  WHERE user_id = p_user_id;
  PERFORM set_config('app.bypass_computed_protection', 'false', true);

  RETURN json_build_object(
    'success', true, 'xp_awarded', p_xp_amount,
    'new_xp', v_new_xp, 'new_level', v_new_level,
    'leveled_up', v_new_level > (SELECT finbloom_level FROM profiles WHERE user_id = p_user_id)
  );
END;
$function$;