
-- Institutions table (mock financial institutions)
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'plaid',
  logo_url text,
  institution_type text NOT NULL DEFAULT 'bank',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read institutions" ON public.institutions FOR SELECT USING (true);

-- Seed mock institutions
INSERT INTO public.institutions (name, provider, logo_url, institution_type) VALUES
  ('Marcus by Goldman Sachs', 'plaid', '🏦', 'bank'),
  ('Chase', 'plaid', '🏦', 'bank'),
  ('Vanguard', 'plaid', '📈', 'investment'),
  ('Fidelity', 'plaid', '📈', 'investment'),
  ('Bank of America', 'plaid', '🏦', 'bank'),
  ('Capital One', 'plaid', '💳', 'bank'),
  ('Robinhood', 'plaid', '📊', 'investment'),
  ('Schwab', 'plaid', '📈', 'investment');

-- User accounts table
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  account_type text NOT NULL DEFAULT 'checking',
  account_subtype text,
  nickname text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  is_manual boolean NOT NULL DEFAULT false,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Goal-account mapping (many-to-many)
CREATE TABLE public.goal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_name text NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goal_accounts" ON public.goal_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goal_accounts" ON public.goal_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goal_accounts" ON public.goal_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goal_accounts" ON public.goal_accounts FOR DELETE USING (auth.uid() = user_id);
