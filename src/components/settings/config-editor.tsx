"use client";

import { updateConfig, resetConfig } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GameConfig } from "@/types";
import { useState, useTransition } from "react";

function NumberField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 text-center"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
        {title}
      </h3>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</div>
    </div>
  );
}

export function ConfigEditor({ config }: { config: GameConfig }) {
  const [cfg, setCfg] = useState<GameConfig>(config);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof GameConfig>(
    section: K,
    key: string,
    value: number
  ) {
    setCfg((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateConfig(JSON.stringify(cfg));
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "บันทึกการตั้งค่าแล้ว!" });
      }
    });
  }

  function handleReset() {
    startTransition(async () => {
      const result = await resetConfig();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "รีเซ็ตเป็นค่าเริ่มต้นแล้ว!" });
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      <Section title="EXP ภารกิจ">
        <NumberField
          label="ภารกิจหลัก (EXP)"
          description="EXP ที่ได้เมื่อทำภารกิจหลักสำเร็จ"
          value={cfg.exp.main_quest_default}
          onChange={(v) => update("exp", "main_quest_default", v)}
        />
        <NumberField
          label="กิจวัตรประจำวัน (EXP)"
          description="EXP ที่ได้เมื่อทำกิจวัตรสำเร็จ"
          value={cfg.exp.daily_routine}
          onChange={(v) => update("exp", "daily_routine", v)}
        />
        <NumberField
          label="ภารกิจเร่งด่วน (EXP)"
          description="EXP ที่ได้เมื่อทำภารกิจเร่งด่วนสำเร็จ"
          value={cfg.exp.urgent_quest}
          onChange={(v) => update("exp", "urgent_quest", v)}
        />
        <NumberField
          label="EXP ที่เสียเมื่อล้มเหลว"
          description="EXP ที่ถูกหักเมื่อภารกิจล้มเหลว (ค่าติดลบ)"
          value={cfg.exp.fail_penalty}
          onChange={(v) => update("exp", "fail_penalty", v)}
        />
        <NumberField
          label="เกณฑ์ล้มเหลวต่อวัน (ครั้ง)"
          description="ล้มเหลวกี่ครั้งต่อวันถึงโดนลงโทษเพิ่ม"
          value={cfg.exp.fail_threshold}
          onChange={(v) => update("exp", "fail_threshold", v)}
        />
        <NumberField
          label="โทษ EXP เมื่อถึงเกณฑ์"
          description="EXP ที่ถูกหักเพิ่มเมื่อล้มเหลวถึงเกณฑ์"
          value={cfg.exp.fail_threshold_penalty_exp}
          onChange={(v) => update("exp", "fail_threshold_penalty_exp", v)}
        />
        <NumberField
          label="โทษนาทีเมื่อถึงเกณฑ์"
          description="นาทีที่ถูกหักเมื่อล้มเหลวถึงเกณฑ์"
          value={cfg.exp.fail_threshold_penalty_minutes}
          onChange={(v) => update("exp", "fail_threshold_penalty_minutes", v)}
        />
      </Section>

      <Section title="ระบบเลเวล">
        <NumberField
          label="EXP พื้นฐาน"
          description="ค่า EXP ฐานที่ใช้คำนวณ EXP ที่ต้องการต่อเลเวล"
          value={cfg.leveling.base_exp}
          onChange={(v) => update("leveling", "base_exp", v)}
        />
        <NumberField
          label="เลเวลต่ำสุด (ง่าย)"
          description="เลเวลที่ต่ำกว่านี้จะใช้สูตรง่าย"
          value={cfg.leveling.low_level_cap}
          onChange={(v) => update("leveling", "low_level_cap", v)}
        />
        <NumberField
          label="ตัวคูณเลเวลต่ำ"
          description="ตัวคูณ EXP สำหรับเลเวลต่ำ"
          value={cfg.leveling.low_level_multiplier}
          onChange={(v) => update("leveling", "low_level_multiplier", v)}
        />
        <NumberField
          label="ตัวหารเลเวลสูง"
          description="ตัวหารสำหรับคำนวณ EXP เลเวลสูง"
          value={cfg.leveling.high_level_bonus_divisor}
          onChange={(v) => update("leveling", "high_level_bonus_divisor", v)}
        />
        <NumberField
          label="โบนัส EXP เลเวลสูง"
          description="EXP โบนัสเพิ่มสำหรับเลเวลสูง"
          value={cfg.leveling.high_level_flat_bonus}
          onChange={(v) => update("leveling", "high_level_flat_bonus", v)}
        />
      </Section>

      <Section title="ระบบค่าใช้จ่าย">
        <NumberField
          label="จำกัดต่อเดือน (ครั้ง)"
          description="จำนวนครั้งที่อนุมัติค่าใช้จ่ายได้ต่อเดือน"
          value={cfg.spending.monthly_limit}
          onChange={(v) => update("spending", "monthly_limit", v)}
        />
        <NumberField
          label="ระยะรอก่อนอนุมัติ (วัน)"
          description="ต้องรอกี่วันก่อนจะอนุมัติค่าใช้จ่ายได้"
          value={cfg.spending.delay_days}
          onChange={(v) => update("spending", "delay_days", v)}
        />
      </Section>

      <Section title="อัตราค่าใช้จ่าย (นาที)">
        <div className="space-y-2 py-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            กำหนดจำนวนนาทีที่ต้องจ่ายตามช่วงราคา
          </p>
          {cfg.spending.tiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-8">{i + 1}.</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 w-16">ไม่เกิน</span>
              <Input
                type="number"
                value={tier.threshold}
                onChange={(e) => {
                  const newTiers = [...cfg.spending.tiers];
                  newTiers[i] = { ...newTiers[i], threshold: Number(e.target.value) };
                  setCfg((prev) => ({
                    ...prev,
                    spending: { ...prev.spending, tiers: newTiers },
                  }));
                }}
                className="w-24 text-center"
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">บาท →</span>
              <Input
                type="number"
                value={tier.cost}
                onChange={(e) => {
                  const newTiers = [...cfg.spending.tiers];
                  newTiers[i] = { ...newTiers[i], cost: Number(e.target.value) };
                  setCfg((prev) => ({
                    ...prev,
                    spending: { ...prev.spending, tiers: newTiers },
                  }));
                }}
                className="w-20 text-center"
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">นาที</span>
              {cfg.spending.tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = cfg.spending.tiers.filter((_, j) => j !== i);
                    setCfg((prev) => ({
                      ...prev,
                      spending: { ...prev.spending, tiers: newTiers },
                    }));
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ลบ
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setCfg((prev) => ({
                ...prev,
                spending: {
                  ...prev.spending,
                  tiers: [...prev.spending.tiers, { threshold: 0, cost: 10 }],
                },
              }));
            }}
            className="text-xs text-indigo-600 hover:underline"
          >
            + เพิ่มช่วงราคา
          </button>
        </div>
      </Section>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {message.text}
        </p>
      )}

      <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
        <Button variant="secondary" onClick={handleReset} disabled={isPending}>
          รีเซ็ตเป็นค่าเริ่มต้น
        </Button>
      </div>
    </div>
  );
}
