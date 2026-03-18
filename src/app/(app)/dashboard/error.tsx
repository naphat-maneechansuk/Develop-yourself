"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h2 className="mb-2 text-lg font-semibold text-red-600">เกิดข้อผิดพลาด</h2>
      <p className="mb-4 text-sm text-zinc-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        ลองใหม่
      </button>
    </div>
  );
}
