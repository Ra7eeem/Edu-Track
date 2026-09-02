import Image from "next/image"
import { cn }  from "@/shared/lib/tailwind-cn"

interface MearajLogoProps {
  /** Controls rendered size */
  size?:      "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const SIZES = {
  xs:  { w: 70,  h: 39  },
  sm:  { w: 110, h: 62  },
  md:  { w: 150, h: 84  },
  lg:  { w: 200, h: 113 },
  xl:  { w: 280, h: 158 },
}

/**
 * Renders the official معراج / MI'RAJ logo (main-logo.svg).
 *
 * The SVG contains the navy background embedded, so it looks great on
 * any background. On light backgrounds use a wrapper with rounded corners
 * if a "badge" look is desired.
 */
export function MearajLogo({ size = "sm", className }: MearajLogoProps) {
  const { w, h } = SIZES[size]

  return (
    <span className={cn("inline-flex shrink-0 select-none", className)}>
      <Image
        src="/main-logo.svg"
        alt="معراج — MI'RAJ Educational Platform"
        width={w}
        height={h}
        priority
        unoptimized
        style={{ width: w, height: h, objectFit: "contain" }}
      />
    </span>
  )
}

/**
 * Compact icon-only version — a 4-point gold star on navy circle.
 * Used as a favicon/avatar substitute in tight spaces.
 */
export function MearajIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      className={cn("shrink-0", className)}
      aria-label="معراج"
    >
      <defs>
        <linearGradient id="mi-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F5D98A"/>
          <stop offset="100%" stopColor="#C9A84C"/>
        </linearGradient>
      </defs>
      <circle cx="23" cy="23" r="23" fill="#1B2A4A"/>
      <path d="M23 9 L26.5 19.5 L37 23 L26.5 26.5 L23 37 L19.5 26.5 L9 23 L19.5 19.5 Z"
            fill="url(#mi-g)"/>
      <path d="M23 15 L25 21 L31 23 L25 25 L23 31 L21 25 L15 23 L21 21 Z"
            fill="#1B2A4A"/>
    </svg>
  )
}
