"use server";

import { createClient } from "@/lib/supabase/server";
import { getMinutesCost, canApproveSpending } from "@/lib/game/spending";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { GameConfig } from "@/types";

const spendingSchema = z.object({
  amount_baht: z.number().int().min(1),
  description: z.string().max(500).optional(),
});

export async function createSpendingRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const parsed = spendingSchema.safeParse({
    amount_baht: Number(formData.get("amount_baht")),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: configRow } = await supabase
    .from("game_config")
    .select("config")
    .eq("user_id", user.id)
    .single();

  const config = configRow?.config as GameConfig;
  const minutesCost = getMinutesCost(parsed.data.amount_baht, config);

  // Check balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("minutes_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.minutes_balance < minutesCost) {
    return { error: `นาทีไม่เพียงพอ ต้องการ ${minutesCost} มี ${profile?.minutes_balance ?? 0}` };
  }

  // Check monthly limit
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("spending_records")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_approved", true)
    .gte("approved_at", startOfMonth.toISOString());

  if (count !== null && count >= config.spending.monthly_limit) {
    return { error: `ถึงจำนวนจำกัดการใช้จ่ายต่อเดือนแล้ว (${config.spending.monthly_limit})` };
  }

  const { error } = await supabase.from("spending_records").insert({
    user_id: user.id,
    amount_baht: parsed.data.amount_baht,
    minutes_deducted: minutesCost,
    description: parsed.data.description || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/spending");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approveSpending(spendingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: record } = await supabase
    .from("spending_records")
    .select("*")
    .eq("id", spendingId)
    .eq("user_id", user.id)
    .eq("is_approved", false)
    .single();

  if (!record) return { error: "ไม่พบรายการ" };

  const { data: configRow } = await supabase
    .from("game_config")
    .select("config")
    .eq("user_id", user.id)
    .single();

  const config = configRow?.config as GameConfig;

  if (!canApproveSpending(record.requested_at, config)) {
    return { error: `ต้องรอ ${config.spending.delay_days} วันก่อนอนุมัติ` };
  }

  // Deduct minutes
  const { data: profile } = await supabase
    .from("profiles")
    .select("minutes_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.minutes_balance < record.minutes_deducted) {
    return { error: "ยอดนาทีคงเหลือไม่เพียงพอ" };
  }

  await supabase
    .from("profiles")
    .update({
      minutes_balance: profile.minutes_balance - record.minutes_deducted,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await supabase
    .from("spending_records")
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
    })
    .eq("id", spendingId);

  // Log the deduction
  await supabase.from("exp_transactions").insert({
    user_id: user.id,
    spending_id: spendingId,
    amount: 0,
    reason: `อนุมัติค่าใช้จ่าย: ${record.amount_baht} บาท, -${record.minutes_deducted} นาที`,
  });

  revalidatePath("/spending");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { success: true };
}
