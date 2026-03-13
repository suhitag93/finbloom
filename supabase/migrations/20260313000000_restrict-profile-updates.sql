-- Restrict profile updates: replace permissive ALL policy with granular policies
-- and enforce column-level protection on computed gamification fields.
--
-- Problem: the "Users can manage their own profile" FOR ALL policy allows any
-- authenticated user to UPDATE xp_points, finbloom_level, and financial_score
-- directly via the API, bypassing all server-side gamification logic.
-- The existing protect_computed_fields() trigger attempted to block this but
-- used an app.bypass_computed_protection session config that any user could set
-- via set_config() in the same transaction, making the protection ineffective.
--
-- Fix:
--   1. Drop the permissive FOR ALL policy (and any earlier per-operation policies).
--   2. Create granular SELECT / INSERT / UPDATE policies – UPDATE covers only
--      the fields users legitimately control.
--   3. REVOKE column-level UPDATE on computed fields from the authenticated role.
--      SECURITY DEFINER functions run as their owner (postgres/superuser) and are
--      therefore unaffected by the column-level revoke.
--   4. Drop the protect_computed_fields trigger and its bypass plumbing; the
--      column-level REVOKE is the authoritative enforcement layer.
--   5. Re-create award_xp, recalculate_financial_score, and recalculate_user_xp
--      without the bypass mechanism – they no longer need it.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Drop ALL existing policies on profiles (permissive ALL + earlier granular)
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"   ON public.profiles;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Granular RLS policies
-- ────────────────────────────────────────────────────────────────────────────

-- Users may read their own profile row.
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- The handle_new_user trigger inserts the initial row as a SECURITY DEFINER
-- function, so authenticated users also need INSERT for the rare client-side
-- path (e.g., onboarding upsert via the client SDK).
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users may update ONLY the fields they legitimately own.
-- Column-level REVOKE (step 3) prevents writes to computed fields regardless of
-- what columns the client passes in an UPDATE payload.
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Column-level REVOKE: block authenticated users from writing computed fields
--    The service role (postgres / superuser) retains full access.
-- ────────────────────────────────────────────────────────────────────────────
REVOKE UPDATE (xp_points, finbloom_level, financial_score)
  ON public.profiles
  FROM authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Drop the protect_computed_fields trigger and its insecure bypass plumbing
--    The trigger relied on set_config('app.bypass_computed_protection', ...) to
--    let SECURITY DEFINER functions write computed fields; any authenticated user
--    could call set_config() in the same transaction to exploit the same bypass.
--    Now that the column-level REVOKE is the enforcement layer, the trigger is
--    both unnecessary and a security liability.
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS protect_profile_computed_fields ON public.profiles;
DROP FUNCTION IF EXISTS public.protect_computed_fields();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Re-create SECURITY DEFINER functions without the bypass mechanism
--    These functions execute as their owner (postgres superuser) and therefore
--    bypass both RLS and column-level grants automatically – no session config
--    trick needed.
-- ────────────────────────────────────────────────────────────────────────────

-- award_xp: validates, deduplicates, inserts ledger entry, updates profile
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id   uuid,
  p_xp_amount integer,
  p_source_type text,
  p_source_id uuid    DEFAULT NULL,
  p_reason    text    DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_xp integer;
  v_new_xp     integer;
  v_new_level  integer;
  v_old_level  integer;
BEGIN
  -- Validate XP amount
  IF p_xp_amount <= 0 OR p_xp_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid XP amount: %', p_xp_amount;
  END IF;

  -- Validate source type
  IF p_source_type NOT IN (
    'mission_completed', 'achievement_earned', 'goal_milestone',
    'goal_created', 'bank_connected', 'onboarding_completed',
    'onboarding', 'banking', 'engagement', 'streak_bonus',
    'weekly_review', 'saving'
  ) THEN
    RAISE EXCEPTION 'Invalid source_type: %', p_source_type;
  END IF;

  -- Ownership check: authenticated users may only award XP to themselves
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Permission denied: cannot award XP to another user';
  END IF;

  -- Deduplication: prevent awarding the same source twice
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

  SELECT xp_points, finbloom_level
  INTO v_current_xp, v_old_level
  FROM profiles
  WHERE user_id = p_user_id;

  v_new_xp := v_current_xp + p_xp_amount;

  -- Level thresholds (kept in sync with xp-system.ts)
  IF    v_new_xp >= 15000 THEN v_new_level := 5;
  ELSIF v_new_xp >=  8000 THEN v_new_level := 4;
  ELSIF v_new_xp >=  4000 THEN v_new_level := 3;
  ELSIF v_new_xp >=  1500 THEN v_new_level := 2;
  ELSIF v_new_xp >=   500 THEN v_new_level := 1;
  ELSE                         v_new_level := 0;
  END IF;

  INSERT INTO xp_ledger (user_id, xp_amount, source_type, source_id, reason)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_reason);

  -- SECURITY DEFINER → runs as postgres superuser → column-level REVOKE does
  -- not apply → direct update of computed fields is permitted.
  UPDATE profiles
  SET xp_points      = v_new_xp,
      finbloom_level = v_new_level,
      updated_at     = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success',    true,
    'xp_awarded', p_xp_amount,
    'new_xp',     v_new_xp,
    'new_level',  v_new_level,
    'leveled_up', v_new_level > v_old_level
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_xp TO authenticated;

-- recalculate_financial_score: computes score from real data and writes to profile
CREATE OR REPLACE FUNCTION public.recalculate_financial_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score integer := 0;
BEGIN
  -- Emergency fund (25 points)
  IF EXISTS (
    SELECT 1
    FROM   accounts a
    JOIN   goal_accounts ga ON ga.account_id = a.id
    WHERE  a.user_id = p_user_id
      AND  ga.goal_name ILIKE '%emergency%'
      AND  a.balance > 0
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
  IF EXISTS (SELECT 1 FROM plaid_connections WHERE user_id = p_user_id) THEN
    v_score := v_score + 10;
  END IF;

  -- Active goals (10 points)
  IF EXISTS (
    SELECT 1 FROM goals WHERE user_id = p_user_id AND status = 'active'
  ) THEN
    v_score := v_score + 10;
  END IF;

  -- Completed missions (up to 30 points, 5 per mission)
  v_score := v_score + LEAST(30, (
    SELECT COUNT(*) * 5
    FROM   user_missions
    WHERE  user_id = p_user_id AND completed = true
  ));

  -- SECURITY DEFINER → runs as postgres superuser → permitted to write financial_score
  UPDATE profiles
  SET financial_score = v_score,
      updated_at      = now()
  WHERE user_id = p_user_id;

  RETURN v_score;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalculate_financial_score TO authenticated;

-- recalculate_user_xp: trigger function that syncs xp_points/finbloom_level
-- from the xp_ledger after any insert into that table
CREATE OR REPLACE FUNCTION public.recalculate_user_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_xp  integer;
  new_level integer;
BEGIN
  SELECT COALESCE(SUM(xp_amount), 0) INTO total_xp
  FROM   public.xp_ledger
  WHERE  user_id = NEW.user_id;

  IF    total_xp >= 15000 THEN new_level := 5;
  ELSIF total_xp >=  8000 THEN new_level := 4;
  ELSIF total_xp >=  4000 THEN new_level := 3;
  ELSIF total_xp >=  1500 THEN new_level := 2;
  ELSIF total_xp >=   500 THEN new_level := 1;
  ELSE                         new_level := 0;
  END IF;

  -- SECURITY DEFINER → runs as postgres superuser → permitted to write computed fields
  UPDATE public.profiles
  SET xp_points      = total_xp,
      finbloom_level = new_level
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;
