"use client";

import { useState, useTransition } from "react";
import { completeQuest, failQuest } from "@/actions/quests";
import { skipToDate, updateLastActiveDate } from "@/actions/catchup";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Quest } from "@/types";

interface CatchUpDay {
  date: string;
  quests: Quest[];
}

interface CatchUpModalProps {
  missedDays: CatchUpDay[];
}

export function CatchUpModal({ missedDays }: CatchUpModalProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  if (dismissed || missedDays.length === 0) return null;

  const currentDay = missedDays[currentDayIndex];
  const isLastDay = currentDayIndex >= missedDays.length - 1;

  function handleComplete(questId: string) {
    startTransition(async () => {
      await completeQuest(questId);
      setCompletedIds((prev) => new Set(prev).add(questId));
    });
  }

  function handleFail(questId: string) {
    startTransition(async () => {
      await failQuest(questId);
      setCompletedIds((prev) => new Set(prev).add(questId));
    });
  }

  function handleSkipDay() {
    startTransition(async () => {
      if (isLastDay) {
        await updateLastActiveDate();
        setDismissed(true);
      } else {
        // Move last_active_date forward to next day
        const nextDay = missedDays[currentDayIndex + 1];
        await skipToDate(nextDay.date);
        setCurrentDayIndex((prev) => prev + 1);
        setCompletedIds(new Set());
      }
    });
  }

  function handleNextDay() {
    startTransition(async () => {
      if (isLastDay) {
        await updateLastActiveDate();
        setDismissed(true);
      } else {
        const nextDay = missedDays[currentDayIndex + 1];
        await skipToDate(nextDay.date);
        setCurrentDayIndex((prev) => prev + 1);
        setCompletedIds(new Set());
      }
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      await updateLastActiveDate();
      setDismissed(true);
    });
  }

  const remainingQuests = currentDay.quests.filter(
    (q) => !completedIds.has(q.id) && q.status === "active"
  );
  const allDone = remainingQuests.length === 0;

  const formattedDate = new Date(currentDay.date + "T00:00:00").toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-[#262626] bg-[#141414] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          disabled={isPending}
          className="absolute right-4 top-4 text-[#737373] hover:text-[#e8e5e0] transition-colors"
          title="ข้ามทั้งหมด เริ่มนับจากวันนี้"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[#737373] mb-1">
            ย้อนหลัง — วันที่ {currentDayIndex + 1} / {missedDays.length}
          </p>
          <h2 className="text-lg font-semibold text-[#e8e5e0]">{formattedDate}</h2>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex gap-1.5">
          {missedDays.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < currentDayIndex
                  ? "bg-[#e8e5e0]/30"
                  : i === currentDayIndex
                    ? "bg-[#e8e5e0]"
                    : "bg-[#262626]"
              )}
            />
          ))}
        </div>

        {/* Quests */}
        {currentDay.quests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#262626] p-6 text-center text-sm text-[#737373] mb-6">
            ไม่มีภารกิจในวันนี้
          </div>
        ) : (
          <div className="mb-6 max-h-[40vh] space-y-2 overflow-y-auto pr-1">
            {currentDay.quests.map((quest) => {
              const isDone = completedIds.has(quest.id) || quest.status !== "active";
              return (
                <div
                  key={quest.id}
                  className={cn(
                    "rounded-xl border border-[#262626] bg-[#1a1a1a] p-3 transition-opacity",
                    isDone && "opacity-40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px]",
                          quest.quest_type === "main" ? "border-[#444] text-[#bbb]"
                          : quest.quest_type === "daily" ? "border-emerald-800/40 text-emerald-400/70"
                          : "border-orange-800/40 text-orange-400/70"
                        )}>
                          {quest.quest_type === "main" ? "หลัก" : quest.quest_type === "daily" ? "กิจวัตร" : "เร่งด่วน"}
                        </span>
                        <span className="text-[10px] text-[#555]">+{quest.exp_reward} EXP</span>
                      </div>
                      <p className="text-sm font-medium text-[#e8e5e0] truncate">{quest.title}</p>
                    </div>
                    {!isDone && (
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" onClick={() => handleComplete(quest.id)} disabled={isPending}>
                          สำเร็จ
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleFail(quest.id)} disabled={isPending}>
                          ล้มเหลว
                        </Button>
                      </div>
                    )}
                    {isDone && (
                      <span className={cn(
                        "text-xs shrink-0",
                        quest.status === "completed" || (completedIds.has(quest.id) && quest.status !== "failed")
                          ? "text-emerald-400/70"
                          : "text-red-400/70"
                      )}>
                        {quest.status === "failed" ? "ล้มเหลว" : "สำเร็จ"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleSkipDay}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "..." : "ข้ามวันนี้"}
          </Button>
          {(allDone || currentDay.quests.length === 0) && (
            <Button
              onClick={handleNextDay}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "..." : isLastDay ? "เสร็จสิ้น" : "วันถัดไป →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
