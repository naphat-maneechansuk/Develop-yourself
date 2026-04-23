"use client";

import { createSpendingRequest } from "@/actions/spending";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export function SpendingForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await createSpendingRequest(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#999]">
            จำนวน (บาท)
          </label>
          <Input name="amount_baht" type="number" min="1" required className="w-32" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[#999]">
            รายละเอียด
          </label>
          <Input name="description" placeholder="ใช้จ่ายเพื่ออะไร?" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-400/70">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400/70">สร้างคำขอแล้ว! กรุณารอตามระยะเวลาที่กำหนด</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "กำลังส่งคำขอ..." : "ขอใช้จ่าย"}
      </Button>
    </form>
  );
}
