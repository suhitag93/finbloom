
-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  plaid_transaction_id TEXT UNIQUE,
  merchant_name TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'other',
  subcategory TEXT,
  pending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investment holdings table
CREATE TABLE public.investment_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT,
  name TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  cost_basis NUMERIC DEFAULT 0,
  plaid_security_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own holdings" ON public.investment_holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own holdings" ON public.investment_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holdings" ON public.investment_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Liabilities table
CREATE TABLE public.liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  liability_type TEXT NOT NULL DEFAULT 'credit_card',
  balance NUMERIC NOT NULL DEFAULT 0,
  minimum_payment NUMERIC DEFAULT 0,
  apr NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own liabilities" ON public.liabilities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own liabilities" ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liabilities" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
