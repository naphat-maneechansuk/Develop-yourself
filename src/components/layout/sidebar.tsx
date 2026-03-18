"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/quests", label: "ภารกิจ" },
  { href: "/log", label: "บันทึกประจำวัน" },
  { href: "/spending", label: "ค่าใช้จ่าย" },
  { href: "/history", label: "ประวัติ" },
  { href: "/settings", label: "ตั้งค่า" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
          Develop Yourself
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mb-1 block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
