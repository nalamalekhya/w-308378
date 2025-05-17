
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  min?: number
  max?: number
  showThumb?: boolean
  thumbColor?: string
  progressColor?: string
  trackColor?: string
}

const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressBarProps
>(({ className, value = 0, min = 0, max = 100, showThumb = true, progressColor, trackColor, thumbColor, ...props }, ref) => {
  // Ratio between 0 and 1
  const ratio = ((value - min) / ((max - min) || 1))
  return (
    <div className={cn("relative w-full h-5 flex items-center", className)}>
      {/* Track (background) */}
      <div
        className={cn(
          "absolute top-1/2 left-0 w-full h-3 rounded-full",
          trackColor || "bg-echo-accent/50 dark:bg-echo-dark-accent/60",
          "transform -translate-y-1/2"
        )}
      />
      {/* Foreground (progressed part) */}
      <div
        className={cn(
          "absolute top-1/2 left-0 h-3 rounded-full transition-all duration-300",
          progressColor || "bg-echo-present dark:bg-echo-dark-primary"
        )}
        style={{
          width: `${ratio * 100}%`,
          transform: "translateY(-50%)"
        }}
      />
      {/* Progress Thumb */}
      {showThumb && (
        <div
          className={cn(
            "absolute z-10",
            "transition-transform duration-200 ease-in",
          )}
          style={{
            left: `calc(${ratio * 100}% - 11px)`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className={cn(
            "w-5 h-5 rounded-full border-2 border-white shadow bg-blue-500",
            thumbColor
          )} />
        </div>
      )}
      {/* For accessibility & screen readers */}
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        min={min}
        max={max}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        className="sr-only"
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="hidden"
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
