import type { GameConfig, QuestType } from "@/types";

export function getExpReward(questType: QuestType, config: GameConfig, customExp?: number): number {
  switch (questType) {
    case "main":
      return customExp ?? config.exp.main_quest_default;
    case "daily":
      return config.exp.daily_routine;
    case "urgent":
      return config.exp.urgent_quest;
  }
}

export function getFailPenalty(config: GameConfig): number {
  return config.exp.fail_penalty;
}
