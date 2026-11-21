import { cn } from "@/shared/lib/tailwind-cn"
import type React from "react"

interface StarPatternProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  patternId?: string
}

/**
 * Geometric Islamic 8-pointed star pattern (StarPattern)
 * Automatically adapts colors based on CSS variables:
 * --pattern-bg and --pattern-shape
 */
export function StarPattern({ className, patternId = "star-pattern", ...props }: StarPatternProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <pattern id={patternId} width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" style={{ fill: "var(--pattern-bg)" }} />
          <path d="M25 5L45 25 25 45 5 25z" style={{ fill: "var(--pattern-shape)" }} />
          <circle cx="25" cy="25" r="5" fill="none" strokeWidth="2" style={{ stroke: "var(--pattern-bg)" }} />
          <path d="M0 0h7v7H0zM43 0h7v7h-7zM0 43h7v7H0zM43 43h7v7h-7z" style={{ fill: "var(--pattern-shape)" }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

/**
 * Detailed 64x64 geometric pattern with rotating squares
 * from the Mi'raj v2 Landing Page.
 */
export function LandingStarPattern({ className, patternId = "landing-pattern", ...props }: StarPatternProps) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <pattern id={patternId} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect x="12" y="12" width="40" height="40" fill="#1D6A4E" stroke="#E3B84F" strokeWidth="1.6" />
          <rect
            x="12"
            y="12"
            width="40"
            height="40"
            fill="#1D6A4E"
            stroke="#E3B84F"
            strokeWidth="1.6"
            transform="rotate(45 32 32)"
          />
          <circle cx="32" cy="32" r="6" fill="#12503B" stroke="#E3B84F" strokeWidth="1.6" />
          <path
            d="M0 0l7 7-7 7-7-7zM64 0l7 7-7 7-7-7zM0 64l7 7-7 7-7-7zM64 64l7 7-7 7-7-7z"
            fill="#E3B84F"
            transform="translate(0 -7)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

/**
 * Architectural Islamic Mihrab Arch Component
 */
export function Mihrab({
  className,
  caption = "وَقُل رَّبِّ زِدْنِي عِلْمًا",
}: {
  className?: string
  caption?: string
}) {
  return (
    <div
      role="img"
      aria-label="محراب بزخرفة هندسية"
      className={cn(
        "relative mx-auto w-full max-w-[400px] aspect-[4/5.4]",
        "rounded-t-full border-2 border-[var(--gold)] p-2.5",
        className
      )}
    >
      <div className="relative size-full overflow-hidden rounded-t-full bg-[var(--green,#12503B)]">
        <LandingStarPattern />
        {caption && (
          <div className="absolute inset-x-0 bottom-0 border-t-2 border-[var(--gold)] bg-[var(--background)] py-3.5 text-center font-display text-2xl font-bold text-[var(--heading,#12503B)]">
            {caption}
          </div>
        )}
      </div>
    </div>
  )
}
