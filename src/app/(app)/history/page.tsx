import { createClient } from "@/lib/supabase/server";
import type { DailyLog, Quest } from "@/types";
import { cn } from "@/lib/utils/cn";

const typeLabels: Record<string, string> = {
  main: "หลัก",
  daily: "กิจวัตร",
  urgent: "เร่งด่วน",
};

const typeColors: Record<string, string> = {
  main: "border-[#444] text-[#bbb]",
  daily: "border-emerald-800/40 text-emerald-400/70",
  urgent: "border-orange-800/40 text-orange-400/70",
};

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

  // Sort by date descending
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
        <div className="space-y-4">
          {days.map(([date, { log, quests }]) => {
            const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("th-TH", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const completed = quests.filter((q) => q.status === "completed");
            const failed = quests.filter((q) => q.status === "failed");
            const active = quests.filter((q) => q.status === "active");

            return (
              <div
                key={date}
                className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-5"
              >
                {/* Date header + EXP */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#737373]">{formattedDate}</p>
                  </div>
                  {log && (
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-400/70">+{log.exp_gained}</span>
                      <span className="text-red-400/70">-{log.exp_lost}</span>
                      <span className="text-[#e8e5e0] font-medium">
                        Net {log.exp_gained - log.exp_lost}
                      </span>
                    </div>
                  )}
                </div>

                {/* Diary */}
                {log?.diary && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest text-[#555] mb-1">ไดอารี่</p>
                    <p className="text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed">{log.diary}</p>
                  </div>
                )}

                {/* Mistakes */}
                {log?.mistakes && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest text-[#555] mb-1">บทเรียน</p>
                    <p className="text-sm text-[#999] whitespace-pre-wrap leading-relaxed">{log.mistakes}</p>
                  </div>
                )}

                {/* Quests */}
                {quests.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#555] mb-2">
                      ภารกิจ ({completed.length} สำเร็จ
                      {failed.length > 0 && `, ${failed.length} ล้มเหลว`}
                      {active.length > 0 && `, ${active.length} ค้าง`})
                    </p>
                    <div className="space-y-1">
                      {quests.map((quest) => (
                        <div
                          key={quest.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                            quest.status === "completed"
                              ? "text-[#bbb]"
                              : quest.status === "failed"
                                ? "text-[#888]"
                                : "text-[#999]"
                          )}
                        >
                          {/* Status indicator */}
                          <span className={cn(
                            "inline-block w-1.5 h-1.5 rounded-full shrink-0",
                            quest.status === "completed"
                              ? "bg-emerald-400/70"
                              : quest.status === "failed"
                                ? "bg-red-400/70"
                                : "bg-[#555]"
                          )} />
                          <span className={cn(
                            "rounded-full border px-1.5 py-0 text-[10px]",
                            typeColors[quest.quest_type]
                          )}>
                            {typeLabels[quest.quest_type]}
                          </span>
                          <span className="flex-1 truncate">{quest.title}</span>
                          <span className="text-xs text-[#555] shrink-0">
                            {quest.status === "completed" ? `+${quest.exp_reward}` : quest.status === "failed" ? "x" : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No content at all */}
                {!log?.diary && !log?.mistakes && quests.length === 0 && (
                  <p className="text-sm text-[#555]">ไม่มีบันทึก</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
