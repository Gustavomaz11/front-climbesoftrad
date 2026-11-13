
import { cn } from "@/lib/utils"

type ColoredProgressProps = {
  value: number
  className?: string
  indicatorClassName?: string
}

export function ColoredProgress({
  value,
  className,
  indicatorClassName,
}: ColoredProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          indicatorClassName ?? "bg-primary"
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
