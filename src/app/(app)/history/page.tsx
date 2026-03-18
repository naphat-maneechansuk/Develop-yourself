import { createClient } from "@/lib/supabase/server";
import type { ExpTransaction } from "@/types";
import { cn } from "@/lib/utils/cn";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("exp_transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const transactions = (data ?? []) as ExpTransaction[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ประวัติ EXP</h1>

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          ยังไม่มีรายการ
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{tx.reason}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-bold",
                  tx.amount > 0 ? "text-green-600" : tx.amount < 0 ? "text-red-500" : "text-zinc-500"
                )}
              >
                {tx.amount > 0 ? "+" : ""}{tx.amount} EXP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
