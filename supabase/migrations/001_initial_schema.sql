-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  current_level INTEGER NOT NULL DEFAULT 1,
  current_exp INTEGER NOT NULL DEFAULT 0,
  total_exp_earned INTEGER NOT NULL DEFAULT 0,
  minutes_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Game Config
CREATE TABLE game_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE game_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own config" ON game_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON game_config FOR UPDATE USING (auth.uid() = user_id);

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('main', 'daily', 'urgent')),
  title TEXT NOT NULL,
  description TEXT,
  exp_reward INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quests" ON quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON quests FOR UPDATE USING (auth.uid() = user_id);

-- Daily Logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diary TEXT DEFAULT '',
  mistakes TEXT DEFAULT '',
  exp_gained INTEGER NOT NULL DEFAULT 0,
  exp_lost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);

-- Spending Records
CREATE TABLE spending_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_baht INTEGER NOT NULL,
  minutes_deducted INTEGER NOT NULL,
  description TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE spending_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own spending" ON spending_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spending" ON spending_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spending" ON spending_records FOR UPDATE USING (auth.uid() = user_id);

-- EXP Transactions
CREATE TABLE exp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  spending_id UUID REFERENCES spending_records(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON exp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON exp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-create profile + config on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

  INSERT INTO public.game_config (user_id, config)
  VALUES (NEW.id, '{
    "exp": {
      "main_quest_default": 3,
      "daily_routine": 1,
      "urgent_quest": 2,
      "fail_penalty": -1,
      "fail_threshold": 3,
      "fail_threshold_penalty_exp": -5,
      "fail_threshold_penalty_minutes": -100
    },
    "leveling": {
      "base_exp": 10,
      "low_level_cap": 5,
      "low_level_multiplier": 2,
      "high_level_bonus_divisor": 2,
      "high_level_flat_bonus": 25
    },
    "spending": {
      "tiers": [
        {"threshold": 100, "cost": 10},
        {"threshold": 500, "cost": 30},
        {"threshold": 1000, "cost": 60},
        {"threshold": 999999, "cost": 100}
      ],
      "monthly_limit": 1,
      "delay_days": 3
    }
  }'::jsonb);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
