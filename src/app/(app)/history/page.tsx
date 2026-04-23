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
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-[#e8e5e0]">ประวัติ EXP</h1>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#262626] p-8 text-center text-sm text-[#737373]">
          ยังไม่มีรายการ
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#1a1a1a] p-4"
            >
              <div>
                <p className="text-sm font-medium text-[#e8e5e0]">{tx.reason}</p>
                <p className="text-xs text-[#555]">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  tx.amount > 0 ? "text-emerald-400/70" : tx.amount < 0 ? "text-red-400/70" : "text-[#737373]"
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
