"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h2 className="mb-2 text-lg font-semibold text-red-400/70">เกิดข้อผิดพลาด</h2>
      <p className="mb-4 text-sm text-[#737373]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full border border-[#e8e5e0]/20 px-5 py-2 text-sm text-[#e8e5e0] hover:bg-[#e8e5e0]/5 transition-colors"
      >
        ลองใหม่
      </button>
    </div>
  );
}
