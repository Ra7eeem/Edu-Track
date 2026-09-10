import { cn } from "@/shared/lib/tailwind-cn"
import * as React from "react"

export interface InputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  error?: boolean
}

function Input({ className, type, startIcon, endIcon, error, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {startIcon && (
        <span className="pointer-events-none absolute start-3 flex items-center text-muted-foreground [&_svg]:size-4">
          {startIcon}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "peer flex h-11 w-full rounded-2xl border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200",
          "outline-none",
          "focus:border-primary focus:ring-3 focus:ring-primary/20",
          "hover:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          startIcon && "ps-10",
          endIcon && "pe-10",
          className
        )}
        {...props}
      />
      {endIcon && (
        <span className="absolute end-3 flex items-center text-muted-foreground [&_svg]:size-4">
          {endIcon}
        </span>
      )}
    </div>
  )
}

export { Input }
