"use client";

import { completeQuest, failQuest } from "@/actions/quests";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Quest } from "@/types";
import { useTransition } from "react";

const typeColors: Record<string, string> = {
  main: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  daily: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  urgent: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

const statusColors: Record<string, string> = {
  active: "",
  completed: "opacity-60",
  failed: "opacity-60",
};

export function QuestCard({ quest }: { quest: Quest }) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeQuest(quest.id);
    });
  }

  function handleFail() {
    startTransition(async () => {
      await failQuest(quest.id);
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900",
        statusColors[quest.status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", typeColors[quest.quest_type])}>
              {quest.quest_type === "main" ? "ภารกิจหลัก" : quest.quest_type === "daily" ? "กิจวัตร" : "เร่งด่วน"}
            </span>
            {quest.status !== "active" && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                quest.status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              )}>
                {quest.status === "completed" ? "สำเร็จ" : "ล้มเหลว"}
              </span>
            )}
            <span className="text-xs text-zinc-400">+{quest.exp_reward} EXP</span>
          </div>
          <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{quest.title}</h4>
          {quest.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{quest.description}</p>
          )}
          {quest.due_date && (
            <p className="mt-1 text-xs text-zinc-400">กำหนดส่ง: {quest.due_date}</p>
          )}
        </div>
        {quest.status === "active" && (
          <div className="flex gap-1">
            <Button size="sm" onClick={handleComplete} disabled={isPending}>
              สำเร็จ
            </Button>
            <Button size="sm" variant="danger" onClick={handleFail} disabled={isPending}>
              ล้มเหลว
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
