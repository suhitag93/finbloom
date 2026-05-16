
-- 1. Trigger to protect computed fields from client manipulation
CREATE OR REPLACE FUNCTION public.protect_computed_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.xp_points := OLD.xp_points;
  NEW.finbloom_level := OLD.finbloom_level;
  NEW.financial_score := OLD.financial_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER protect_profile_computed_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_computed_fields();

-- 2. SECURITY DEFINER function for awarding XP
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_reason text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  v_current_xp integer;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  IF p_xp_amount <= 0 OR p_xp_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid XP amount: %', p_xp_amount;
  END IF;

  IF p_source_type NOT IN (
    'mission_completed', 'achievement_earned', 'goal_milestone',
    'goal_created', 'bank_connected', 'onboarding_completed',
    'onboarding', 'banking', 'engagement', 'streak_bonus',
    'weekly_review', 'saving'
  ) THEN
    RAISE EXCEPTION 'Invalid source_type: %', p_source_type;
  END IF;

  -- Prevent duplicate awards for same source
  IF p_source_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM xp_ledger
      WHERE user_id = p_user_id
      AND source_id = p_source_id
      AND source_type = p_source_type
    ) THEN
      RETURN json_build_object('success', false, 'reason', 'already_awarded');
    END IF;
  END IF;

  SELECT xp_points INTO v_current_xp
  FROM profiles WHERE user_id = p_user_id;

  v_new_xp := v_current_xp + p_xp_amount;

  -- Level thresholds matching xp-system.ts
  IF v_new_xp >= 15000 THEN v_new_level := 5;
  ELSIF v_new_xp >= 8000 THEN v_new_level := 4;
  ELSIF v_new_xp >= 4000 THEN v_new_level := 3;
  ELSIF v_new_xp >= 1500 THEN v_new_level := 2;
  ELSIF v_new_xp >= 500 THEN v_new_level := 1;
  ELSE v_new_level := 0;
  END IF;

  INSERT INTO xp_ledger (user_id, xp_amount, source_type, source_id, reason)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_reason);

  -- SECURITY DEFINER bypasses the trigger for this update
  UPDATE profiles SET
    xp_points = v_new_xp,
    finbloom_level = v_new_level,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'leveled_up', v_new_level > (SELECT finbloom_level FROM profiles WHERE user_id = p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.award_xp TO authenticated;

-- 3. Secure xp_ledger: users can only READ, not write directly
DROP POLICY IF EXISTS "Users can insert own xp" ON xp_ledger;
DROP POLICY IF EXISTS "Users can manage their own xp_ledger" ON xp_ledger;

CREATE POLICY "Users can read their own xp_ledger"
  ON xp_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- 4. SECURITY DEFINER function for financial score
CREATE OR REPLACE FUNCTION public.recalculate_financial_score(
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_score integer := 0;
BEGIN
  -- Emergency fund (25 points)
  IF EXISTS (
    SELECT 1 FROM accounts a
    JOIN goal_accounts ga ON ga.account_id = a.id
    WHERE a.user_id = p_user_id
    AND ga.goal_name ILIKE '%emergency%'
    AND a.balance > 0
  ) THEN
    v_score := v_score + 25;
  END IF;

  -- Investments (25 points)
  IF EXISTS (
    SELECT 1 FROM investment_holdings
    WHERE user_id = p_user_id AND current_value > 0
  ) THEN
    v_score := v_score + 25;
  END IF;

  -- Bank connected (10 points)
  IF EXISTS (
    SELECT 1 FROM plaid_connections WHERE user_id = p_user_id
  ) THEN
    v_score := v_score + 10;
  END IF;

  -- Active goals (10 points)
  IF EXISTS (
    SELECT 1 FROM goals WHERE user_id = p_user_id AND status = 'active'
  ) THEN
    v_score := v_score + 10;
  END IF;

  -- Completed missions (up to 30 points)
  v_score := v_score + LEAST(30, (
    SELECT COUNT(*) * 5 FROM user_missions
    WHERE user_id = p_user_id AND completed = true
  ));

  UPDATE profiles SET
    financial_score = v_score,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.recalculate_financial_score TO authenticated;
