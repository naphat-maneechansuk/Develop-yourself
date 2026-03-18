import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LevelDisplay } from "@/components/dashboard/level-display";
import { QuestList } from "@/components/quest/quest-list";
import type { GameConfig, Profile, Quest, DailyLog } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, configRes, questsRes, logRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("game_config").select("config").eq("user_id", user!.id).single(),
    supabase
      .from("quests")
      .select("*")
      .eq("user_id", user!.id)
      .eq("assigned_date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user!.id)
      .eq("log_date", new Date().toISOString().split("T")[0])
      .single(),
  ]);

  const profile = profileRes.data as Profile;
  const config = configRes.data?.config as GameConfig;
  const quests = (questsRes.data ?? []) as Quest[];
  const dailyLog = logRes.data as DailyLog | null;

  const activeQuests = quests.filter((q) => q.status === "active");
  const completedQuests = quests.filter((q) => q.status === "completed");
  const failedQuests = quests.filter((q) => q.status === "failed");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ยินดีต้อนรับ, {profile.display_name || "นักผจญภัย"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <LevelDisplay profile={profile} config={config} />

      {dailyLog && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex gap-6 text-sm">
            <span className="text-green-600">+{dailyLog.exp_gained} EXP ที่ได้</span>
            <span className="text-red-500">-{dailyLog.exp_lost} EXP ที่เสีย</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Net: {dailyLog.exp_gained - dailyLog.exp_lost} EXP
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">ภารกิจวันนี้</h2>
        <QuestList quests={activeQuests} title={`กำลังทำ (${activeQuests.length})`} />
        {completedQuests.length > 0 && (
          <QuestList quests={completedQuests} title={`สำเร็จ (${completedQuests.length})`} />
        )}
        {failedQuests.length > 0 && (
          <QuestList quests={failedQuests} title={`ล้มเหลว (${failedQuests.length})`} />
        )}
      </div>
    </div>
  );
}
