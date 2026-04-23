"use client";

import { updateDisplayName } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateDisplayName(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Input
          name="display_name"
          defaultValue={displayName}
          placeholder="ชื่อที่แสดง"
          className="max-w-xs"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังอัพเดท..." : "อัพเดท"}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-red-400/70">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400/70">อัพเดทแล้ว!</p>}
    </form>
  );
}
