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
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#737373]">เลเวล</p>
            <p className="text-3xl font-semibold text-[#e8e5e0]">{profile.current_level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-[#737373]">EXP รวม</p>
            <p className="text-lg font-medium text-[#e8e5e0]">{profile.total_exp_earned}</p>
          </div>
        </div>
        <ProgressBar
          value={profile.current_exp}
          max={expNeeded}
          label="EXP ถึงเลเวลถัดไป"
        />
        <div className="mt-3 flex justify-between text-sm text-[#737373]">
          <span>นาที: {profile.minutes_balance}</span>
        </div>
      </CardContent>
    </Card>
  );
}
