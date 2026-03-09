-- User-owned tables: users can only access their own rows

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

ALTER TABLE goal_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goal_accounts" ON goal_accounts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own user_achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own user_missions" ON user_missions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own xp_ledger" ON xp_ledger FOR ALL USING (auth.uid() = user_id);

-- Reference tables: anyone authenticated can read, no one can write from client

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read achievements" ON achievements FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read missions" ON missions FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read institutions" ON institutions FOR SELECT USING (auth.role() = 'authenticated');