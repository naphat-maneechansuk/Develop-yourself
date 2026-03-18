"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const dailyLogSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  diary: z.string().max(5000).optional(),
  mistakes: z.string().max(5000).optional(),
});

export async function upsertDailyLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  const parsed = dailyLogSchema.safeParse({
    log_date: formData.get("log_date"),
    diary: formData.get("diary") || "",
    mistakes: formData.get("mistakes") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: user.id,
        log_date: parsed.data.log_date,
        diary: parsed.data.diary || "",
        mistakes: parsed.data.mistakes || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,log_date" }
    );

  if (error) return { error: error.message };

  revalidatePath("/log");
  revalidatePath(`/log/${parsed.data.log_date}`);
  revalidatePath("/dashboard");
  return { success: true };
}
