import { createClient } from "@/lib/supabase/server";
import { ConfigEditor } from "@/components/settings/config-editor";
import { ProfileForm } from "@/components/settings/profile-form";
import type { GameConfig, Profile } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, configRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("game_config").select("config").eq("user_id", user!.id).single(),
  ]);

  const profile = profileRes.data as Profile;
  const config = configRes.data?.config as GameConfig;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ตั้งค่า</h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">โปรไฟล์</h2>
        <ProfileForm displayName={profile.display_name} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">ตั้งค่าเกม</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          ปรับแต่งกฎเกมของคุณ การเปลี่ยนแปลงจะมีผลกับภารกิจใหม่เท่านั้น ภารกิจเก่าไม่เปลี่ยน
        </p>
        <ConfigEditor config={config} />
      </div>
    </div>
  );
}
