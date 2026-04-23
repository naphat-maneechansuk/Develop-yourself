import { createClient } from "@/lib/supabase/server";
import { HistoryCard } from "@/components/history/history-card";
import type { DailyLog, Quest } from "@/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent daily logs
  const { data: logsData } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user!.id)
    .order("log_date", { ascending: false })
    .limit(30);

  const logs = (logsData ?? []) as DailyLog[];

  // Get date range for quests
  const dates = logs.map((l) => l.log_date);

  // Also include recent dates that may have quests but no log
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (!dates.includes(dateStr)) dates.push(dateStr);
  }

  // Fetch quests for all these dates
  const { data: questsData } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user!.id)
    .in("assigned_date", dates)
    .order("created_at", { ascending: false });

  const allQuests = (questsData ?? []) as Quest[];

  // Build day cards — combine logs and quests
  const dayMap = new Map<string, { log: DailyLog | null; quests: Quest[] }>();

  for (const log of logs) {
    dayMap.set(log.log_date, { log, quests: [] });
  }

  for (const quest of allQuests) {
    const existing = dayMap.get(quest.assigned_date);
    if (existing) {
      existing.quests.push(quest);
    } else {
      dayMap.set(quest.assigned_date, { log: null, quests: [quest] });
    }
  }

  // Sort by date descending, filter empty
  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .filter(([, data]) => data.log || data.quests.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-[#e8e5e0]">ประวัติ</h1>

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#262626] p-8 text-center text-sm text-[#737373]">
          ยังไม่มีบันทึก
        </div>
      ) : (
        <div className="space-y-2">
          {days.map(([date, { log, quests }]) => (
            <HistoryCard key={date} date={date} log={log} quests={quests} />
          ))}
        </div>
      )}
    </div>
  );
}
