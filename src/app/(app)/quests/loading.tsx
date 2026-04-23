export default function QuestsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-[#1a1a1a]" />
      <div className="h-48 animate-pulse rounded-2xl bg-[#1a1a1a]" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#1a1a1a]" />
        ))}
      </div>
    </div>
  );
}
