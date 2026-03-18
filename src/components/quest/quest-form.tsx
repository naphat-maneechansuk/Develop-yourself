"use client";

import { createQuest } from "@/actions/quests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";

export function QuestForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await createQuest(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input name="title" placeholder="หัวข้อภารกิจ" required />
        </div>
        <select
          name="quest_type"
          className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          defaultValue="main"
        >
          <option value="main">ภารกิจหลัก</option>
          <option value="daily">กิจวัตร</option>
          <option value="urgent">เร่งด่วน</option>
        </select>
      </div>
      <Textarea name="description" placeholder="รายละเอียด (ไม่บังคับ)" rows={2} />
      <div className="flex gap-3">
        <Input name="exp_reward" type="number" placeholder="EXP กำหนดเอง (ไม่บังคับ)" className="w-40" />
        <Input name="due_date" type="date" className="w-40" />
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" name="is_recurring" value="true" />
          ทำซ้ำ
        </label>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-500">สร้างภารกิจแล้ว!</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "กำลังสร้าง..." : "สร้างภารกิจ"}
      </Button>
    </form>
  );
}
