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
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-[#e8e5e0]">ภารกิจ</h1>

      <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-6">
        <h2 className="mb-4 text-base font-semibold text-[#e8e5e0]">ภารกิจใหม่</h2>
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
