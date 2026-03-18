"use client";

import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useActionState } from "react";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string; email?: string } | null, formData: FormData) => {
      return await signup(formData);
    },
    null
  );

  // Show confirmation message after signup
  if (state?.success === "confirm_email") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">ตรวจสอบอีเมลของคุณ</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 text-5xl">&#9993;</div>
          <p className="mb-2 text-zinc-700 dark:text-zinc-300">
            เราส่งลิงก์ยืนยันไปที่
          </p>
          <p className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            {state.email}
          </p>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชีของคุณ แล้วกลับมาเข้าสู่ระบบ
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">
              ไปหน้าเข้าสู่ระบบ
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">สมัครสมาชิก</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ชื่อที่แสดง
            </label>
            <Input id="displayName" name="displayName" required />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              อีเมล
            </label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
            </label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
          </Button>
          <p className="text-center text-sm text-zinc-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
