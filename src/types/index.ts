export interface Profile {
  id: string;
  display_name: string;
  current_level: number;
  current_exp: number;
  total_exp_earned: number;
  minutes_balance: number;
  created_at: string;
  updated_at: string;
}

export interface GameConfig {
  exp: {
    main_quest_default: number;
    daily_routine: number;
    urgent_quest: number;
    fail_penalty: number;
    fail_threshold: number;
    fail_threshold_penalty_exp: number;
    fail_threshold_penalty_minutes: number;
  };
  leveling: {
    base_exp: number;
    low_level_cap: number;
    low_level_multiplier: number;
    high_level_bonus_divisor: number;
    high_level_flat_bonus: number;
  };
  spending: {
    tiers: Array<{ threshold: number; cost: number }>;
    monthly_limit: number;
    delay_days: number;
  };
}

export interface GameConfigRow {
  id: string;
  user_id: string;
  config: GameConfig;
  updated_at: string;
}

export type QuestType = "main" | "daily" | "urgent";
export type QuestStatus = "active" | "completed" | "failed";

export interface Quest {
  id: string;
  user_id: string;
  quest_type: QuestType;
  title: string;
  description: string | null;
  exp_reward: number;
  status: QuestStatus;
  is_recurring: boolean;
  due_date: string | null;
  assigned_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  diary: string;
  mistakes: string;
  exp_gained: number;
  exp_lost: number;
  created_at: string;
  updated_at: string;
}

export interface SpendingRecord {
  id: string;
  user_id: string;
  amount_baht: number;
  minutes_deducted: number;
  description: string | null;
  requested_at: string;
  approved_at: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ExpTransaction {
  id: string;
  user_id: string;
  quest_id: string | null;
  spending_id: string | null;
  amount: number;
  reason: string;
  created_at: string;
}
