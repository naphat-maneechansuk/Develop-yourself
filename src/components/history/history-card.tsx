"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { DailyLog, Quest } from "@/types";

const typeLabels: Record<string, string> = {
  main: "หลัก",
  daily: "กิจวัตร",
  urgent: "เร่งด่วน",
};

const typeColors: Record<string, string> = {
  main: "border-[#444] text-[#bbb]",
  daily: "border-emerald-800/40 text-emerald-400/70",
  urgent: "border-orange-800/40 text-orange-400/70",
};

interface HistoryCardProps {
  date: string;
  log: DailyLog | null;
  quests: Quest[];
}

export function HistoryCard({ date, log, quests }: HistoryCardProps) {
  const [open, setOpen] = useState(false);

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const completed = quests.filter((q) => q.status === "completed");
  const failed = quests.filter((q) => q.status === "failed");
  const active = quests.filter((q) => q.status === "active");

  const questSummary = [
    completed.length > 0 && `${completed.length} สำเร็จ`,
    failed.length > 0 && `${failed.length} ล้มเหลว`,
    active.length > 0 && `${active.length} ค้าง`,
  ].filter(Boolean).join(", ");

  return (
    <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-[#1e1e1e] transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Chevron */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={cn("text-[#555] transition-transform duration-200 shrink-0", open && "rotate-90")}
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-medium text-[#e8e5e0]">{formattedDate}</p>
          {questSummary && (
            <span className="text-xs text-[#555]">{questSummary}</span>
          )}
        </div>
        {log && (
          <div className="flex gap-3 text-xs shrink-0">
            <span className="text-emerald-400/70">+{log.exp_gained}</span>
            <span className="text-red-400/70">-{log.exp_lost}</span>
            <span className="text-[#e8e5e0] font-medium">
              Net {log.exp_gained - log.exp_lost}
            </span>
          </div>
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[#262626] p-5 pt-4 space-y-4">
          {/* Diary */}
          {log?.diary && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#555] mb-1">ไดอารี่</p>
              <p className="text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed">{log.diary}</p>
            </div>
          )}

          {/* Mistakes */}
          {log?.mistakes && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#555] mb-1">บทเรียน</p>
              <p className="text-sm text-[#999] whitespace-pre-wrap leading-relaxed">{log.mistakes}</p>
            </div>
          )}

          {/* Quests */}
          {quests.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-[#555] mb-2">ภารกิจ</p>
              <div className="space-y-1">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                      quest.status === "completed"
                        ? "text-[#bbb]"
                        : quest.status === "failed"
                          ? "text-[#888]"
                          : "text-[#999]"
                    )}
                  >
                    <span className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full shrink-0",
                      quest.status === "completed"
                        ? "bg-emerald-400/70"
                        : quest.status === "failed"
                          ? "bg-red-400/70"
                          : "bg-[#555]"
                    )} />
                    <span className={cn(
                      "rounded-full border px-1.5 py-0 text-[10px]",
                      typeColors[quest.quest_type]
                    )}>
                      {typeLabels[quest.quest_type]}
                    </span>
                    <span className="flex-1 truncate">{quest.title}</span>
                    <span className="text-xs text-[#555] shrink-0">
                      {quest.status === "completed" ? `+${quest.exp_reward}` : quest.status === "failed" ? "x" : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!log?.diary && !log?.mistakes && quests.length === 0 && (
            <p className="text-sm text-[#555]">ไม่มีบันทึก</p>
          )}
        </div>
      )}
    </div>
  );
}
