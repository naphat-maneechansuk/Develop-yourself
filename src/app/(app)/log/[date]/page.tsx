import { createClient } from "@/lib/supabase/server";
import { LogEditor } from "@/components/log/log-editor";
import { notFound } from "next/navigation";
import type { DailyLog } from "@/types";
import Link from "next/link";

export default async function LogDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user!.id)
    .eq("log_date", date)
    .single();

  const log = data as DailyLog | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/log" className="text-sm text-[#737373] hover:text-[#e8e5e0] transition-colors">
          &larr; กลับ
        </Link>
        <h1 className="text-2xl font-semibold text-[#e8e5e0]">บันทึก: {date}</h1>
      </div>

      {log && (
        <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-4">
          <div className="flex gap-6 text-sm">
            <span className="text-emerald-400/70">+{log.exp_gained} EXP ที่ได้</span>
            <span className="text-red-400/70">-{log.exp_lost} EXP ที่เสีย</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-6">
        <LogEditor date={date} existingLog={log} />
      </div>
    </div>
  );
}
