"use client";

import { approveSpending } from "@/actions/spending";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SpendingRecord } from "@/types";
import { useTransition } from "react";

function SpendingItem({ record, canApprove }: { record: SpendingRecord; canApprove: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveSpending(record.id);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#1a1a1a] p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#e8e5e0]">{record.amount_baht} บาท</span>
          <span className="text-sm text-[#737373]">(-{record.minutes_deducted} นาที)</span>
          <span className={cn(
            "rounded-full border px-2 py-0.5 text-xs",
            record.is_approved
              ? "border-emerald-800/40 text-emerald-400/70"
              : "border-yellow-800/40 text-yellow-400/70"
          )}>
            {record.is_approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
          </span>
        </div>
        {record.description && (
          <p className="mt-1 text-sm text-[#737373]">{record.description}</p>
        )}
        <p className="mt-1 text-xs text-[#555]">
          ขอเมื่อ: {new Date(record.requested_at).toLocaleDateString()}
        </p>
      </div>
      {!record.is_approved && canApprove && (
        <Button size="sm" onClick={handleApprove} disabled={isPending}>
          {isPending ? "..." : "อนุมัติ"}
        </Button>
      )}
    </div>
  );
}

export function SpendingList({ records, delayDays }: { records: SpendingRecord[]; delayDays: number }) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#262626] p-8 text-center text-sm text-[#737373]">
        ยังไม่มีรายการค่าใช้จ่าย
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => {
        const requested = new Date(record.requested_at);
        const now = new Date();
        const diffDays = (now.getTime() - requested.getTime()) / (1000 * 60 * 60 * 24);
        const canApprove = diffDays >= delayDays;

        return (
          <SpendingItem key={record.id} record={record} canApprove={canApprove} />
        );
      })}
    </div>
  );
}
