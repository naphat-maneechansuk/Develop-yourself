"use server";

import { createClient } from "@/lib/supabase/server";
import { getExpReward, getFailPenalty } from "@/lib/game/exp";
import { processExpGain } from "@/lib/game/leveling";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { GameConfig, QuestType } from "@/types";

const createQuestSchema = z.object({
  quest_type: z.enum(["main", "daily", "urgent"]),
  title: z.string().min(1, "กรุณาระบุหัวข้อ").max(200),
  description: z.string().max(1000).optional(),
  exp_reward: z.number().int().optional(),
  due_date: z.string().optional(),
  is_recurring: z.boolean().optional(),
});

async function getUserConfig(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<GameConfig> {
  const { data } = await supabase
    .from("game_config")
    .select("config")
    .eq("user_id", userId)
    .single();

  return data?.config as GameConfig;
}

async function updateProfileExp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  expDelta: number,
  config: GameConfig
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_level, current_exp, total_exp_earned")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const { newLevel, newExp } = processExpGain(
    profile.current_level,
    profile.current_exp,
    expDelta,
    config
  );

  await supabase
    .from("profiles")
    .update({
      current_level: newLevel,
      current_exp: newExp,
      total_exp_earned: profile.total_exp_earned + Math.max(0, expDelta),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function createQuest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const config = await getUserConfig(supabase, user.id);

  const parsed = createQuestSchema.safeParse({
    quest_type: formData.get("quest_type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    exp_reward: formData.get("exp_reward") ? Number(formData.get("exp_reward")) : undefined,
    due_date: formData.get("due_date") || undefined,
    is_recurring: formData.get("is_recurring") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const expReward = getExpReward(parsed.data.quest_type as QuestType, config, parsed.data.exp_reward);

  const { error } = await supabase.from("quests").insert({
    user_id: user.id,
    quest_type: parsed.data.quest_type,
    title: parsed.data.title,
    description: parsed.data.description || null,
    exp_reward: expReward,
    due_date: parsed.data.due_date || null,
    is_recurring: parsed.data.is_recurring || false,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/quests");
  return { success: true };
}

export async function completeQuest(questId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!quest) return { error: "ไม่พบภารกิจ" };

  const config = await getUserConfig(supabase, user.id);

  // Update quest status
  await supabase
    .from("quests")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", questId);

  // Add EXP
  await updateProfileExp(supabase, user.id, quest.exp_reward, config);

  // Add minutes reward (EXP earned = minutes earned)
  {
    const { data: profile } = await supabase
      .from("profiles")
      .select("minutes_balance")
      .eq("id", user.id)
      .single();
    if (profile) {
      await supabase
        .from("profiles")
        .update({ minutes_balance: profile.minutes_balance + quest.exp_reward })
        .eq("id", user.id);
    }
  }

  // Log transaction
  await supabase.from("exp_transactions").insert({
    user_id: user.id,
    quest_id: questId,
    amount: quest.exp_reward,
    reason: `สำเร็จภารกิจ${quest.quest_type === "main" ? "หลัก" : quest.quest_type === "daily" ? "กิจวัตร" : "เร่งด่วน"}: ${quest.title}`,
  });

  // Update daily log exp
  const today = new Date().toISOString().split("T")[0];
  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .single();

  if (log) {
    await supabase
      .from("daily_logs")
      .update({ exp_gained: log.exp_gained + quest.exp_reward })
      .eq("id", log.id);
  } else {
    await supabase.from("daily_logs").insert({
      user_id: user.id,
      log_date: today,
      exp_gained: quest.exp_reward,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/quests");
  revalidatePath("/history");
  return { success: true };
}

export async function failQuest(questId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!quest) return { error: "ไม่พบภารกิจ" };

  const config = await getUserConfig(supabase, user.id);
  const penalty = getFailPenalty(config);

  // Update quest status
  await supabase
    .from("quests")
    .update({ status: "failed" })
    .eq("id", questId);

  // Apply penalty
  await updateProfileExp(supabase, user.id, penalty, config);

  // Log transaction
  await supabase.from("exp_transactions").insert({
    user_id: user.id,
    quest_id: questId,
    amount: penalty,
    reason: `ล้มเหลวภารกิจ${quest.quest_type === "main" ? "หลัก" : quest.quest_type === "daily" ? "กิจวัตร" : "เร่งด่วน"}: ${quest.title}`,
  });

  // Check fail threshold
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("quests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "failed")
    .eq("assigned_date", today);

  if (count && count >= config.exp.fail_threshold) {
    // Apply threshold penalty
    await updateProfileExp(supabase, user.id, config.exp.fail_threshold_penalty_exp, config);

    const { data: profile } = await supabase
      .from("profiles")
      .select("minutes_balance")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          minutes_balance: Math.max(0, profile.minutes_balance + config.exp.fail_threshold_penalty_minutes),
        })
        .eq("id", user.id);
    }

    await supabase.from("exp_transactions").insert({
      user_id: user.id,
      quest_id: questId,
      amount: config.exp.fail_threshold_penalty_exp,
      reason: `ถึงเกณฑ์ล้มเหลว (ล้มเหลว ${count} ครั้งวันนี้)`,
    });
  }

  // Update daily log exp_lost
  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .single();

  const totalLost = Math.abs(penalty);
  if (log) {
    await supabase
      .from("daily_logs")
      .update({ exp_lost: log.exp_lost + totalLost })
      .eq("id", log.id);
  } else {
    await supabase.from("daily_logs").insert({
      user_id: user.id,
      log_date: today,
      exp_lost: totalLost,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/quests");
  revalidatePath("/history");
  return { success: true };
}
