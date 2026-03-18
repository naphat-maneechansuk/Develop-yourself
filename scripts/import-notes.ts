/**
 * Import script: อ่านไฟล์ .txt จาก D:/โน๊ต/ แล้วลงข้อมูลใน Supabase
 *
 * Usage: npx tsx scripts/import-notes.ts <USER_ID>
 *
 * ต้องตั้ง environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (ใช้ service role เพื่อ bypass RLS)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const NOTES_DIR = "D:/โน๊ต";

// --- Types ---
interface ParsedNote {
  date: string; // YYYY-MM-DD
  diary: string;
  mistakes: string;
  quests: ParsedQuest[];
  routines: ParsedQuest[];
  expLines: number[];
  level: number | null;
  currentExp: number | null;
  maxExp: number | null;
  minutesBalance: number | null;
}

interface ParsedQuest {
  title: string;
  questType: "main" | "daily" | "urgent";
  status: "active" | "completed" | "failed";
  expReward: number;
}

// --- Date conversion ---
function thaiToGregorian(day: number, month: number, thaiYear: number): string {
  const ceYear = thaiYear - 543;
  const d = String(day).padStart(2, "0");
  const m = String(month).padStart(2, "0");
  return `${ceYear}-${m}-${d}`;
}

function parseDateFromFilename(filename: string): string | null {
  // DD_MM_YYYY.txt
  const match = filename.match(/^(\d{1,2})_(\d{1,2})_(\d{4})\.txt$/);
  if (!match) return null;
  return thaiToGregorian(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
}

// --- Section parsing ---
function parseNote(content: string, dateStr: string): ParsedNote {
  const lines = content.split(/\r?\n/);

  let diary = "";
  let mistakes = "";
  const quests: ParsedQuest[] = [];
  const routines: ParsedQuest[] = [];
  const expLines: number[] = [];
  let level: number | null = null;
  let currentExp: number | null = null;
  let maxExp: number | null = null;
  let minutesBalance: number | null = null;

  type Section = "header" | "diary" | "quests" | "urgent" | "routines" | "mistakes" | "legend" | "tally";
  let section: Section = "header";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Section detection
    if (line.startsWith("เนื้อหา")) {
      section = "diary";
      continue;
    }
    if (line.startsWith("สิ่งที่ต้องทำ")) {
      section = "quests";
      continue;
    }
    if (line.startsWith("เควสด่วน")) {
      section = "urgent";
      // Parse urgent quest EXP from header: เควสด่วน(+2)
      const urgentMatch = line.match(/\+(\d+)/);
      const urgentExp = urgentMatch ? parseInt(urgentMatch[1]) : 2;
      // Check if there are sub-items after this
      continue;
    }
    if (line.startsWith("กิจวัตร")) {
      section = "routines";
      continue;
    }
    if (line.startsWith("วันนี้ผมทำพลาดอะไรบ้าง")) {
      section = "mistakes";
      continue;
    }
    if (line.startsWith("หมายเหตุ")) {
      section = "legend";
      continue;
    }

    // Level line
    const levelMatch = line.match(/เลเวล\s*(\d+)\s*\((\d+)\/(\d+)\)/);
    if (levelMatch) {
      level = parseInt(levelMatch[1]);
      currentExp = parseInt(levelMatch[2]);
      maxExp = parseInt(levelMatch[3]);
      section = "tally";
      continue;
    }

    // Minutes line
    const minutesMatch = line.match(/^(\d+)\s*นาที/);
    if (minutesMatch) {
      minutesBalance = parseInt(minutesMatch[1]);
      continue;
    }
    // Bare number that could be minutes (only in tally section after level)
    if (section === "tally" && /^\d+$/.test(line) && parseInt(line) > 20) {
      minutesBalance = parseInt(line);
      continue;
    }

    // EXP tally lines (after legend section)
    if (section === "legend" || section === "tally") {
      const expMatch = line.match(/^([+-]\d+)$/);
      if (expMatch) {
        expLines.push(parseInt(expMatch[1]));
        section = "tally";
        continue;
      }
    }

    // Skip empty lines and legend content
    if (line === "" || section === "legend") continue;
    if (line.startsWith('"')) continue; // legend quotes

    // Parse sections
    switch (section) {
      case "diary":
        if (diary) diary += "\n" + line;
        else diary = line;
        break;

      case "quests": {
        const quest = parseQuestLine(line, "main");
        if (quest) quests.push(quest);
        break;
      }

      case "urgent": {
        const quest = parseQuestLine(line, "urgent");
        if (quest) quests.push(quest);
        break;
      }

      case "routines": {
        const routine = parseRoutineLine(line);
        if (routine) routines.push(routine);
        break;
      }

      case "mistakes":
        if (line !== "--" && line !== "-") {
          if (mistakes) mistakes += "\n" + line;
          else mistakes = line;
        }
        break;
    }
  }

  return { date: dateStr, diary, mistakes, quests, routines, expLines, level, currentExp, maxExp, minutesBalance };
}

function parseQuestLine(line: string, defaultType: "main" | "urgent"): ParsedQuest | null {
  // Remove leading number: "1." or "1)"
  const cleaned = line.replace(/^\d+[\.\)]\s*/, "").trim();
  if (!cleaned || cleaned.length < 2) return null;

  // Detect status
  let status: "active" | "completed" | "failed" = "active";
  let title = cleaned;

  if (title.includes("--*")) {
    status = "completed";
    title = title.replace(/\s*--\*\s*/g, " ").trim();
  } else if (title.match(/\s*!\s*$/)) {
    status = "failed";
    title = title.replace(/\s*!\s*$/, "").trim();
  } else if (title.match(/\s+-\s*$/)) {
    // "-" at the end = in progress, keep as active
    title = title.replace(/\s+-\s*$/, "").trim();
  }

  // Extract custom EXP: +10, +6 etc
  let expReward = defaultType === "main" ? 3 : 2;
  const expMatch = title.match(/\+(\d+)/);
  if (expMatch) {
    expReward = parseInt(expMatch[1]);
    title = title.replace(/\s*\+\d+\s*/g, " ").trim();
  }

  // Clean up
  title = title.replace(/\s+/g, " ").trim();
  if (title.length < 2) return null;

  return { title, questType: defaultType, status, expReward };
}

function parseRoutineLine(line: string): ParsedQuest | null {
  let cleaned = line.replace(/^-\s*/, "").trim();
  if (!cleaned || cleaned.length < 2) return null;

  let status: "active" | "completed" | "failed" = "active";

  if (cleaned.includes("--*")) {
    status = "completed";
    cleaned = cleaned.replace(/\s*--\*\s*/g, " ").trim();
  } else if (cleaned.match(/\s*!\s*$/)) {
    status = "failed";
    cleaned = cleaned.replace(/\s*!\s*$/, "").trim();
  } else if (cleaned.match(/\s+-\s*$/)) {
    cleaned = cleaned.replace(/\s+-\s*$/, "").trim();
  }

  return { title: cleaned, questType: "daily", status, expReward: 1 };
}

// --- File collection ---
function collectAllFiles(): { filepath: string; date: string }[] {
  const results: { filepath: string; date: string }[] = [];

  // Root .txt files (March 2569)
  const rootFiles = fs.readdirSync(NOTES_DIR);
  for (const f of rootFiles) {
    if (f.endsWith(".txt") && f !== "กฎเกณฑ์.txt") {
      const date = parseDateFromFilename(f);
      if (date) results.push({ filepath: path.join(NOTES_DIR, f), date });
    }
  }

  // Monthly folders: 01_2569, 02_2569
  for (const folder of rootFiles) {
    const folderPath = path.join(NOTES_DIR, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    if (folder.startsWith("Obsidian")) continue;

    // Handle 2568 year structure
    if (folder.startsWith("2568")) {
      const subFolders = fs.readdirSync(folderPath);
      for (const sub of subFolders) {
        const subPath = path.join(folderPath, sub);
        if (!fs.statSync(subPath).isDirectory()) continue;
        const monthFiles = fs.readdirSync(subPath);
        for (const f of monthFiles) {
          if (f.endsWith(".txt")) {
            const date = parseDateFromFilename(f);
            if (date) results.push({ filepath: path.join(subPath, f), date });
          }
        }
      }
      continue;
    }

    // Handle 2569 monthly folders: 01_2569, 02_2569
    const monthMatch = folder.match(/^(\d{2})_(\d{4})$/);
    if (monthMatch) {
      const monthFiles = fs.readdirSync(folderPath);
      for (const f of monthFiles) {
        if (f.endsWith(".txt")) {
          const date = parseDateFromFilename(f);
          if (date) results.push({ filepath: path.join(folderPath, f), date });
        }
      }
    }
  }

  // Sort by date
  results.sort((a, b) => a.date.localeCompare(b.date));
  return results;
}

// --- Main import ---
async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npx tsx scripts/import-notes.ts <USER_ID>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    console.error("Add SUPABASE_SERVICE_ROLE_KEY to your .env file (find it in Supabase > Settings > API)");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Collect files
  const files = collectAllFiles();
  console.log(`Found ${files.length} note files to import`);

  let totalQuests = 0;
  let totalLogs = 0;
  let totalExpTx = 0;
  let lastNote: ParsedNote | null = null;

  for (const { filepath, date } of files) {
    try {
      const content = fs.readFileSync(filepath, "utf-8");
      const note = parseNote(content, date);
      lastNote = note;

      // 1. Upsert daily log
      const expGained = note.expLines.filter((e) => e > 0).reduce((a, b) => a + b, 0);
      const expLost = Math.abs(note.expLines.filter((e) => e < 0).reduce((a, b) => a + b, 0));

      const { error: logError } = await supabase.from("daily_logs").upsert(
        {
          user_id: userId,
          log_date: date,
          diary: note.diary || "",
          mistakes: note.mistakes || "",
          exp_gained: expGained,
          exp_lost: expLost,
        },
        { onConflict: "user_id,log_date" }
      );
      if (logError) {
        console.error(`  Log error (${date}):`, logError.message);
      } else {
        totalLogs++;
      }

      // 2. Insert quests
      const allQuests = [...note.quests, ...note.routines];
      for (const q of allQuests) {
        const { error: questError, data: questData } = await supabase
          .from("quests")
          .insert({
            user_id: userId,
            quest_type: q.questType,
            title: q.title,
            exp_reward: q.expReward,
            status: q.status,
            assigned_date: date,
            completed_at: q.status === "completed" ? `${date}T23:59:59Z` : null,
          })
          .select("id")
          .single();

        if (questError) {
          console.error(`  Quest error (${date}):`, questError.message);
          continue;
        }
        totalQuests++;

        // 3. Insert EXP transaction for completed/failed quests
        if (q.status === "completed") {
          await supabase.from("exp_transactions").insert({
            user_id: userId,
            quest_id: questData.id,
            amount: q.expReward,
            reason: `[นำเข้า] สำเร็จภารกิจ: ${q.title}`,
          });
          totalExpTx++;
        } else if (q.status === "failed") {
          await supabase.from("exp_transactions").insert({
            user_id: userId,
            quest_id: questData.id,
            amount: -1,
            reason: `[นำเข้า] ล้มเหลวภารกิจ: ${q.title}`,
          });
          totalExpTx++;
        }
      }

      process.stdout.write(`\r  Imported: ${date} (${allQuests.length} quests)`);
    } catch (err) {
      console.error(`\n  Error processing ${filepath}:`, err);
    }
  }

  // 4. Update profile to match latest note state
  if (lastNote && lastNote.level) {
    // Calculate total EXP earned from all transactions
    const { count: totalEarned } = await supabase
      .from("exp_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("amount", 0);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        current_level: lastNote.level,
        current_exp: lastNote.currentExp ?? 0,
        total_exp_earned: totalEarned ?? 0,
        minutes_balance: lastNote.minutesBalance ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("\n  Profile update error:", profileError.message);
    } else {
      console.log(`\n  Profile updated: Level ${lastNote.level} (${lastNote.currentExp}/${lastNote.maxExp}), ${lastNote.minutesBalance ?? 0} นาที`);
    }
  }

  console.log(`\nImport complete!`);
  console.log(`  Daily logs: ${totalLogs}`);
  console.log(`  Quests: ${totalQuests}`);
  console.log(`  EXP transactions: ${totalExpTx}`);
}

main().catch(console.error);
