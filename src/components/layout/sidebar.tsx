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
    <aside className="flex h-screen w-56 flex-col border-r border-[#1e1e1e] bg-[#141414]">
      <div className="border-b border-[#1e1e1e] p-5">
        <Link href="/dashboard" className="text-base font-semibold tracking-tight text-[#e8e5e0]">
          develop yourself.
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mb-0.5 block rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-[#1e1e1e] text-[#e8e5e0] font-medium"
                : "text-[#737373] hover:text-[#e8e5e0]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-[#1e1e1e] p-3">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#737373] hover:text-[#e8e5e0] transition-colors"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
