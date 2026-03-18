import type { GameConfig } from "@/types";

export function getMinutesCost(amountBaht: number, config: GameConfig): number {
  const sortedTiers = [...config.spending.tiers].sort((a, b) => a.threshold - b.threshold);

  for (const tier of sortedTiers) {
    if (amountBaht <= tier.threshold) {
      return tier.cost;
    }
  }

  // Fallback to last tier
  return sortedTiers[sortedTiers.length - 1].cost;
}

export function canApproveSpending(requestedAt: string, config: GameConfig): boolean {
  const requested = new Date(requestedAt);
  const now = new Date();
  const diffMs = now.getTime() - requested.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= config.spending.delay_days;
}
