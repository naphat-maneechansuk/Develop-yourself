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

  // ถ้าเลือกวันอื่นที่ไม่ใช่วันนี้ ให้ไปหน้า /log/[date] แทน
  // แต่ถ้าเป็นวันนี้ ใช้ data ที่ server fetch มาแล้ว
  const isToday = selectedDate === today;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">บันทึกประจำวัน</h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">วันที่:</label>
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
            className="text-sm text-indigo-600 hover:underline"
          >
            กลับวันนี้
          </button>
        )}
      </div>

      {isToday ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <LogEditor date={today} existingLog={initialLog} />
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <LogEditorForDate date={selectedDate} />
        </div>
      )}

      {recentLogs.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">บันทึกล่าสุด</h2>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <button
                key={log.log_date}
                onClick={() => setSelectedDate(log.log_date)}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{log.log_date}</span>
                <span className="text-sm text-zinc-500">
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
  // สำหรับวันอื่นที่ไม่ใช่วันนี้ ใช้ Link ไปหน้า /log/[date] เพื่อ fetch data จาก server
  return (
    <div className="text-center py-4">
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        กำลังดูบันทึกวันที่ {date}
      </p>
      <Link
        href={`/log/${date}`}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        เปิดบันทึกวันนี้
      </Link>
    </div>
  );
}
