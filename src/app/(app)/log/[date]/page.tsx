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
        <Link href="/log" className="text-sm text-indigo-600 hover:underline">
          &larr; กลับ
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">บันทึก: {date}</h1>
      </div>

      {log && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex gap-6 text-sm">
            <span className="text-green-600">+{log.exp_gained} EXP ที่ได้</span>
            <span className="text-red-500">-{log.exp_lost} EXP ที่เสีย</span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <LogEditor date={date} existingLog={log} />
      </div>
    </div>
  );
}
