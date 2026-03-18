import type { GameConfig } from "@/types";

export function expToNextLevel(level: number, config: GameConfig): number {
  const { base_exp, low_level_cap, low_level_multiplier, high_level_bonus_divisor, high_level_flat_bonus } = config.leveling;

  if (level <= low_level_cap) {
    return base_exp * low_level_multiplier;
  }
  return Math.floor(base_exp * level / high_level_bonus_divisor) + high_level_flat_bonus;
}

export function processExpGain(
  currentLevel: number,
  currentExp: number,
  expDelta: number,
  config: GameConfig
): { newLevel: number; newExp: number } {
  let level = currentLevel;
  let exp = currentExp + expDelta;

  // Level up
  while (exp >= expToNextLevel(level, config)) {
    exp -= expToNextLevel(level, config);
    level++;
  }

  // Prevent negative exp (from penalties)
  if (exp < 0) {
    exp = 0;
  }

  return { newLevel: level, newExp: exp };
}
