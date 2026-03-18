import { createClient } from "@/lib/supabase/server";
import { LogPageClient } from "@/components/log/log-page-client";
import type { DailyLog } from "@/types";

export default async function LogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const [logRes, recentRes] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user!.id)
      .eq("log_date", today)
      .single(),
    supabase
      .from("daily_logs")
      .select("log_date, exp_gained, exp_lost")
      .eq("user_id", user!.id)
      .order("log_date", { ascending: false })
      .limit(7),
  ]);

  const todayLog = logRes.data as DailyLog | null;
  const recentLogs = (recentRes.data ?? []) as Pick<DailyLog, "log_date" | "exp_gained" | "exp_lost">[];

  return (
    <LogPageClient
      today={today}
      initialLog={todayLog}
      recentLogs={recentLogs}
    />
  );
}
