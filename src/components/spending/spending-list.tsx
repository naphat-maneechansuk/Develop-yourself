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
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{record.amount_baht} บาท</span>
          <span className="text-sm text-zinc-500">(-{record.minutes_deducted} นาที)</span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            record.is_approved
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          )}>
            {record.is_approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
          </span>
        </div>
        {record.description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{record.description}</p>
        )}
        <p className="mt-1 text-xs text-zinc-400">
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
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
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
