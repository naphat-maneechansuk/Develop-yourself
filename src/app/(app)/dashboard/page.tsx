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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-[#737373]">
          {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-2xl font-semibold text-[#e8e5e0]">
          ยินดีต้อนรับ, {profile.display_name || "นักผจญภัย"}
        </h1>
      </div>

      <LevelDisplay profile={profile} config={config} />

      {dailyLog && (
        <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-4">
          <div className="flex gap-6 text-sm">
            <span className="text-emerald-400/70">+{dailyLog.exp_gained} EXP ที่ได้</span>
            <span className="text-red-400/70">-{dailyLog.exp_lost} EXP ที่เสีย</span>
            <span className="font-medium text-[#e8e5e0]">
              Net: {dailyLog.exp_gained - dailyLog.exp_lost} EXP
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#e8e5e0]">ภารกิจวันนี้</h2>
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
