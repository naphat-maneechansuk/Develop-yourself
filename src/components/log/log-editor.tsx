"use client";

import { upsertDailyLog } from "@/actions/daily-log";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DailyLog } from "@/types";
import { useActionState } from "react";

interface LogEditorProps {
  date: string;
  existingLog: DailyLog | null;
}

export function LogEditor({ date, existingLog }: LogEditorProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await upsertDailyLog(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="log_date" value={date} />
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ไดอารี่
        </label>
        <Textarea
          name="diary"
          placeholder="วันนี้คุณทำอะไรบ้าง?"
          rows={6}
          defaultValue={existingLog?.diary ?? ""}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ข้อผิดพลาด / บทเรียน
        </label>
        <Textarea
          name="mistakes"
          placeholder="มีอะไรผิดพลาด? ได้เรียนรู้อะไรบ้าง?"
          rows={4}
          defaultValue={existingLog?.mistakes ?? ""}
        />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500">บันทึกแล้ว!</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก..." : "บันทึก"}
      </Button>
    </form>
  );
}
