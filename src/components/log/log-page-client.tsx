"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LogEditor } from "@/components/log/log-editor";
import type { DailyLog } from "@/types";
import Link from "next/link";

interface LogPageClientProps {
  today: string;
  initialLog: DailyLog | null;
  recentLogs: Pick<DailyLog, "log_date" | "exp_gained" | "exp_lost">[];
}

export function LogPageClient({ today, initialLog, recentLogs }: LogPageClientProps) {
  const [selectedDate, setSelectedDate] = useState(today);

  const isToday = selectedDate === today;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#e8e5e0]">บันทึกประจำวัน</h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[#999]">วันที่:</label>
        <Input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-44"
        />
        {!isToday && (
          <button
            onClick={() => setSelectedDate(today)}
            className="text-sm text-[#737373] hover:text-[#e8e5e0] transition-colors"
          >
            กลับวันนี้
          </button>
        )}
      </div>

      {isToday ? (
        <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-6">
          <LogEditor date={today} existingLog={initialLog} />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#262626] bg-[#1a1a1a] p-6">
          <LogEditorForDate date={selectedDate} />
        </div>
      )}

      {recentLogs.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-[#e8e5e0]">บันทึกล่าสุด</h2>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <button
                key={log.log_date}
                onClick={() => setSelectedDate(log.log_date)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#262626] bg-[#1a1a1a] p-3 text-left hover:border-[#333] transition-colors"
              >
                <span className="text-sm font-medium text-[#e8e5e0]">{log.log_date}</span>
                <span className="text-sm text-[#737373]">
                  +{log.exp_gained} / -{log.exp_lost}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LogEditorForDate({ date }: { date: string }) {
  return (
    <div className="text-center py-4">
      <p className="mb-3 text-sm text-[#737373]">
        กำลังดูบันทึกวันที่ {date}
      </p>
      <Link
        href={`/log/${date}`}
        className="inline-flex items-center justify-center rounded-full border border-[#e8e5e0]/20 px-5 py-2 text-sm text-[#e8e5e0] hover:bg-[#e8e5e0]/5 transition-colors"
      >
        เปิดบันทึกวันนี้
      </Link>
    </div>
  );
}
