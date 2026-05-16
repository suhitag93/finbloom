
-- 1. Add gamification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS finbloom_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS financial_score integer,
  ADD COLUMN IF NOT EXISTS financial_personality text;

-- 2. XP Ledger - tracks every XP transaction
CREATE TABLE public.xp_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount integer NOT NULL,
  reason text NOT NULL,
  source_type text NOT NULL,
  source_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_ledger_user ON public.xp_ledger(user_id);
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON public.xp_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.xp_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Missions
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  mission_type text NOT NULL DEFAULT 'weekly',
  difficulty text NOT NULL DEFAULT 'easy',
  xp_reward integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active missions" ON public.missions FOR SELECT USING (is_active = true);

-- 4. User Missions
CREATE TABLE public.user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress_value integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, mission_id)
);
CREATE INDEX idx_user_missions_user ON public.user_missions(user_id);
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own missions" ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- 5. Achievements
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 0,
  badge_icon text,
  category text NOT NULL DEFAULT 'milestones',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

-- 6. User Achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Function to recalculate user XP from ledger
CREATE OR REPLACE FUNCTION public.recalculate_user_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_xp integer;
  new_level integer;
BEGIN
  SELECT COALESCE(SUM(xp_amount), 0) INTO total_xp
  FROM public.xp_ledger WHERE user_id = NEW.user_id;

  -- Level thresholds: 0=Seed, 500=Sprout, 1500=Bloom, 4000=Thrive, 8000=Flourish, 15000=Legacy
  IF total_xp >= 15000 THEN new_level := 5;
  ELSIF total_xp >= 8000 THEN new_level := 4;
  ELSIF total_xp >= 4000 THEN new_level := 3;
  ELSIF total_xp >= 1500 THEN new_level := 2;
  ELSIF total_xp >= 500 THEN new_level := 1;
  ELSE new_level := 0;
  END IF;

  UPDATE public.profiles
  SET xp_points = total_xp, finbloom_level = new_level
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_xp
AFTER INSERT ON public.xp_ledger
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_user_xp();
