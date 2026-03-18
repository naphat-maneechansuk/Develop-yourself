import { createClient } from "@/lib/supabase/server";
import { QuestForm } from "@/components/quest/quest-form";
import { QuestList } from "@/components/quest/quest-list";
import type { Quest } from "@/types";

export default async function QuestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: quests } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const allQuests = (quests ?? []) as Quest[];
  const active = allQuests.filter((q) => q.status === "active");
  const completed = allQuests.filter((q) => q.status === "completed");
  const failed = allQuests.filter((q) => q.status === "failed");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ภารกิจ</h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">ภารกิจใหม่</h2>
        <QuestForm />
      </div>

      <div className="space-y-4">
        <QuestList quests={active} title={`กำลังทำ (${active.length})`} />
        {completed.length > 0 && <QuestList quests={completed} title={`สำเร็จ (${completed.length})`} />}
        {failed.length > 0 && <QuestList quests={failed} title={`ล้มเหลว (${failed.length})`} />}
      </div>
    </div>
  );
}
