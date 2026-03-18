import { z } from "zod";
import type { GameConfig } from "@/types";

export const DEFAULT_CONFIG: GameConfig = {
  exp: {
    main_quest_default: 3,
    daily_routine: 1,
    urgent_quest: 2,
    fail_penalty: -1,
    fail_threshold: 3,
    fail_threshold_penalty_exp: -5,
    fail_threshold_penalty_minutes: -100,
  },
  leveling: {
    base_exp: 10,
    low_level_cap: 5,
    low_level_multiplier: 2,
    high_level_bonus_divisor: 2,
    high_level_flat_bonus: 25,
  },
  spending: {
    tiers: [
      { threshold: 100, cost: 10 },
      { threshold: 500, cost: 30 },
      { threshold: 1000, cost: 60 },
      { threshold: Infinity, cost: 100 },
    ],
    monthly_limit: 1,
    delay_days: 3,
  },
};

export const gameConfigSchema = z.object({
  exp: z.object({
    main_quest_default: z.number().int().min(1),
    daily_routine: z.number().int().min(1),
    urgent_quest: z.number().int().min(1),
    fail_penalty: z.number().int().max(0),
    fail_threshold: z.number().int().min(1),
    fail_threshold_penalty_exp: z.number().int().max(0),
    fail_threshold_penalty_minutes: z.number().int().max(0),
  }),
  leveling: z.object({
    base_exp: z.number().int().min(1),
    low_level_cap: z.number().int().min(1),
    low_level_multiplier: z.number().min(1),
    high_level_bonus_divisor: z.number().min(1),
    high_level_flat_bonus: z.number().int().min(0),
  }),
  spending: z.object({
    tiers: z.array(
      z.object({
        threshold: z.number().min(0),
        cost: z.number().int().min(1),
      })
    ).min(1),
    monthly_limit: z.number().int().min(1),
    delay_days: z.number().int().min(0),
  }),
});
