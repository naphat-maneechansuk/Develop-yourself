import { QuestCard } from "./quest-card";
import type { Quest } from "@/types";

export function QuestList({ quests, title }: { quests: Quest[]; title?: string }) {
  if (quests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        ยังไม่มีภารกิจ
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
