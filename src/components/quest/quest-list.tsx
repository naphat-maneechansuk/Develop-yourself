import { QuestCard } from "./quest-card";
import type { Quest } from "@/types";

export function QuestList({ quests, title }: { quests: Quest[]; title?: string }) {
  if (quests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#262626] p-8 text-center text-sm text-[#737373]">
        ยังไม่มีภารกิจ
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-[#737373]">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-2">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
}
