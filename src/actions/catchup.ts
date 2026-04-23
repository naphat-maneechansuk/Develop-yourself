"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLastActiveDate() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const today = new Date().toISOString().split("T")[0];

  await supabase
    .from("profiles")
    .update({ last_active_date: today, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function skipToDate(targetDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  await supabase
    .from("profiles")
    .update({ last_active_date: targetDate, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  return { success: true };
}
