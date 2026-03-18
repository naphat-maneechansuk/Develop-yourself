"use server";

import { createClient } from "@/lib/supabase/server";
import { gameConfigSchema, DEFAULT_CONFIG } from "@/lib/game/config";
import { revalidatePath } from "next/cache";

export async function updateConfig(configJson: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  let parsed;
  try {
    parsed = JSON.parse(configJson);
  } catch {
    return { error: "JSON ไม่ถูกต้อง" };
  }

  const validated = gameConfigSchema.safeParse(parsed);
  if (!validated.success) {
    return { error: validated.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ") };
  }

  const { error } = await supabase
    .from("game_config")
    .update({
      config: validated.data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function resetConfig() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const { error } = await supabase
    .from("game_config")
    .update({
      config: DEFAULT_CONFIG,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
