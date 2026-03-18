import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, max, className, label }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
