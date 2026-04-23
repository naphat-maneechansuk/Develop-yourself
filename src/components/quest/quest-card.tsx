"use client";

import { completeQuest, failQuest, deleteQuest } from "@/actions/quests";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Quest } from "@/types";
import { useTransition } from "react";

const typeColors: Record<string, string> = {
  main: "border-[#444] text-[#bbb]",
  daily: "border-emerald-800/40 text-emerald-400/70",
  urgent: "border-orange-800/40 text-orange-400/70",
};

const statusColors: Record<string, string> = {
  active: "",
  completed: "opacity-50",
  failed: "opacity-50",
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

  function handleDelete() {
    startTransition(async () => {
      await deleteQuest(quest.id);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#262626] bg-[#1a1a1a] p-4",
        statusColors[quest.status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs", typeColors[quest.quest_type])}>
              {quest.quest_type === "main" ? "ภารกิจหลัก" : quest.quest_type === "daily" ? "กิจวัตร" : "เร่งด่วน"}
            </span>
            {quest.status !== "active" && (
              <span className={cn(
                "rounded-full border px-2 py-0.5 text-xs",
                quest.status === "completed"
                  ? "border-emerald-800/40 text-emerald-400/70"
                  : "border-red-800/40 text-red-400/70"
              )}>
                {quest.status === "completed" ? "สำเร็จ" : "ล้มเหลว"}
              </span>
            )}
            <span className="text-xs text-[#555]">+{quest.exp_reward} EXP</span>
          </div>
          <h4 className="font-medium text-[#e8e5e0]">{quest.title}</h4>
          {quest.description && (
            <p className="mt-1 text-sm text-[#737373]">{quest.description}</p>
          )}
          {quest.due_date && (
            <p className="mt-1 text-xs text-[#555]">กำหนดส่ง: {quest.due_date}</p>
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
            <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending} title="ลบภารกิจ">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M11 3.5l-.5 8a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5L3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
