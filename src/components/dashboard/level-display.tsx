import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Profile, GameConfig } from "@/types";
import { expToNextLevel } from "@/lib/game/leveling";

interface LevelDisplayProps {
  profile: Profile;
  config: GameConfig;
}

export function LevelDisplay({ profile, config }: LevelDisplayProps) {
  const expNeeded = expToNextLevel(profile.current_level, config);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">เลเวล</p>
            <p className="text-3xl font-bold text-indigo-600">{profile.current_level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">EXP รวม</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{profile.total_exp_earned}</p>
          </div>
        </div>
        <ProgressBar
          value={profile.current_exp}
          max={expNeeded}
          label="EXP ถึงเลเวลถัดไป"
        />
        <div className="mt-3 flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>นาที: {profile.minutes_balance}</span>
        </div>
      </CardContent>
    </Card>
  );
}
