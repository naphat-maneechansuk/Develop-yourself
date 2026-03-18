import { createClient } from "@/lib/supabase/server";
import { SpendingForm } from "@/components/spending/spending-form";
import { SpendingList } from "@/components/spending/spending-list";
import type { GameConfig, Profile, SpendingRecord } from "@/types";

export default async function SpendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, configRes, recordsRes] = await Promise.all([
    supabase.from("profiles").select("minutes_balance").eq("id", user!.id).single(),
    supabase.from("game_config").select("config").eq("user_id", user!.id).single(),
    supabase
      .from("spending_records")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRes.data as Pick<Profile, "minutes_balance">;
  const config = configRes.data?.config as GameConfig;
  const records = (recordsRes.data ?? []) as SpendingRecord[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ค่าใช้จ่าย</h1>
        <div className="rounded-lg bg-indigo-50 px-4 py-2 dark:bg-indigo-950">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">ยอดคงเหลือ: </span>
          <span className="font-bold text-indigo-600">{profile.minutes_balance} นาที</span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">ขอใช้จ่าย</h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          ระยะรอ: {config.spending.delay_days} วัน | จำกัดต่อเดือน: {config.spending.monthly_limit}
        </p>
        <SpendingForm />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">รายการ</h2>
        <SpendingList records={records} delayDays={config.spending.delay_days} />
      </div>
    </div>
  );
}
