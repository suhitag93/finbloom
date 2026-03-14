-- Secure user_missions: remove all client write access and delegate progress
-- and completion writes to a validated SECURITY DEFINER function.
--
-- Problem: three overlapping policies exist on user_missions:
--   • "Users can insert own missions"  (FOR INSERT)
--   • "Users can update own missions"  (FOR UPDATE)
--   • "Users can manage their own user_missions" (FOR ALL)
--
-- Any authenticated user could therefore UPDATE their own mission row and
-- set completed = true, completed_at to an arbitrary timestamp, and
-- progress_value to any integer — bypassing the actual mission requirements.
-- Because recalculate_financial_score() counts completed user_missions rows
-- to compute the financial_score, and award_xp() accepts 'mission_completed'
-- as a source_type, a client exploit here cascades into both the score and
-- the XP/level system.
--
-- Fix:
--   1. Drop the FOR ALL policy and all granular write policies on user_missions.
--   2. Keep SELECT so users can still read their own mission progress in the UI.
--   3. REVOKE INSERT and UPDATE on user_missions FROM authenticated to close
--      any table-level grant path as well.
--   4. Create record_mission_progress(), a SECURITY DEFINER function that is
--      the single authorised write path:
--        • Validates the mission_id exists and is active.
--        • Validates progress_value is in [0, 100].
--        • Enforces that completion requires progress_value = 100.
--        • Upserts the user_missions row.
--        • On first completion, calls award_xp() so the XP grant is always
--          paired with a verified server-side completion check.
--        • Is NOT granted to the authenticated role — only the service role
--          (Edge Functions, backend workers) may call it.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Drop all existing policies on user_missions
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage their own user_missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can view own missions"              ON public.user_missions;
DROP POLICY IF EXISTS "Users can insert own missions"            ON public.user_missions;
DROP POLICY IF EXISTS "Users can update own missions"            ON public.user_missions;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. SELECT-only policy: users can read their own mission progress
-- ────────────────────────────────────────────────────────────────────────────
CREATE POLICY "Users can view their own missions"
  ON public.user_missions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Revoke table-level INSERT and UPDATE from authenticated
-- ────────────────────────────────────────────────────────────────────────────
REVOKE INSERT, UPDATE ON public.user_missions FROM authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Trusted server-side function: record_mission_progress()
--
--    All writes to user_missions MUST go through this function.
--    It runs as the function owner (postgres / superuser), which bypasses RLS
--    and is unaffected by the REVOKE above.
--
--    NOT granted to authenticated — service role only.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_mission_progress(
  p_user_id       uuid,
  p_mission_id    uuid,
  p_progress      integer,          -- 0–100
  p_completed     boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_reward      integer;
  v_already_done   boolean;
BEGIN
  -- Validate progress range
  IF p_progress < 0 OR p_progress > 100 THEN
    RAISE EXCEPTION 'progress must be between 0 and 100, got %', p_progress;
  END IF;

  -- Completion requires full progress
  IF p_completed AND p_progress < 100 THEN
    RAISE EXCEPTION 'Cannot mark mission complete with progress_value = %', p_progress;
  END IF;

  -- Validate the mission exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM missions WHERE id = p_mission_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Mission not found or inactive: %', p_mission_id;
  END IF;

  -- Validate the user has a profile
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unknown user_id: %', p_user_id;
  END IF;

  -- Check whether it was already completed before this call
  SELECT completed INTO v_already_done
  FROM user_missions
  WHERE user_id = p_user_id AND mission_id = p_mission_id;

  -- Upsert the progress row (SECURITY DEFINER bypasses RLS + REVOKE)
  INSERT INTO user_missions (user_id, mission_id, progress_value, completed, completed_at)
  VALUES (
    p_user_id,
    p_mission_id,
    p_progress,
    p_completed,
    CASE WHEN p_completed THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, mission_id) DO UPDATE
    SET progress_value = EXCLUDED.progress_value,
        completed      = EXCLUDED.completed,
        completed_at   = CASE
                           WHEN EXCLUDED.completed AND NOT user_missions.completed
                           THEN now()
                           ELSE user_missions.completed_at
                         END;

  -- Award XP exactly once on first completion
  IF p_completed AND (v_already_done IS NULL OR v_already_done = false) THEN
    SELECT xp_reward INTO v_xp_reward
    FROM missions WHERE id = p_mission_id;

    IF v_xp_reward > 0 THEN
      PERFORM public.award_xp(
        p_user_id    => p_user_id,
        p_xp_amount  => v_xp_reward,
        p_source_type => 'mission_completed',
        p_source_id  => p_mission_id,
        p_reason     => 'Mission completed'
      );
    END IF;
  END IF;

  RETURN json_build_object(
    'success',    true,
    'user_id',    p_user_id,
    'mission_id', p_mission_id,
    'progress',   p_progress,
    'completed',  p_completed
  );
END;
$$;

-- Intentionally NOT granted to authenticated — service role only.
-- GRANT EXECUTE ON FUNCTION public.record_mission_progress TO authenticated;
