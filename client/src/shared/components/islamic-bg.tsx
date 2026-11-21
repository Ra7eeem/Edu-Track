/**
 * IslamicBg — purely decorative background layer.
 * Renders animated stars, a subtle arabesque ring, and soft glow blobs.
 * Meant to be placed inside a `relative overflow-hidden` container.
 */
export function IslamicBg({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark"

  const starOpacity = isDark ? "opacity-60" : "opacity-30"
  const blobClass   = isDark
    ? "bg-teal-500/10 blur-[100px]"
    : "bg-teal-400/12 blur-[100px]"
  const goldBlob    = isDark
    ? "bg-amber-400/10 blur-[80px]"
    : "bg-amber-300/12 blur-[80px]"

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft glow blobs */}
      <div className={`absolute -top-40 -start-20 size-[500px] rounded-full ${blobClass} animate-pulse-slow`} />
      <div
        className={`absolute top-1/2 -end-20 size-[350px] rounded-full ${goldBlob} animate-pulse-slow`}
        style={{ animationDelay: "2s" }}
      />
      <div
        className={`absolute bottom-0 start-1/3 size-[300px] rounded-full ${blobClass} animate-pulse-slow`}
        style={{ animationDelay: "4s" }}
      />

      {/* Scattered 8-pointed stars */}
      {STAR_POSITIONS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className={`absolute ${starOpacity} animate-star-twinkle`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        >
          <polygon
            points="12,2 14.2,9.8 22,12 14.2,14.2 12,22 9.8,14.2 2,12 9.8,9.8"
            fill="var(--gold)"
          />
        </svg>
      ))}

      {/* Subtle arabesque ring (top-right corner) */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-10 -end-10 size-52 opacity-[0.06] animate-arabesque"
        style={{ animationDuration: "60s" }}
      >
        <g fill="none" stroke="var(--gold)" strokeWidth="1.5">
          <polygon points="100,10 118,67 175,67 130,103 148,160 100,125 52,160 70,103 25,67 82,67" />
          <polygon points="100,25 114,60 150,60 122,81 133,116 100,95 67,116 78,81 50,60 86,60"  />
          <polygon points="100,40 110,53 125,53 114,63 118,78 100,68 82,78 86,63 75,53 90,53" />
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="70" />
        </g>
      </svg>
    </div>
  )
}

const STAR_POSITIONS = [
  { top: "8%",  left: "5%",  size: "14px", delay: "0s",    duration: "3.5s"  },
  { top: "15%", left: "88%", size: "10px", delay: "0.8s",  duration: "4s"    },
  { top: "40%", left: "92%", size: "8px",  delay: "1.6s",  duration: "3s"    },
  { top: "65%", left: "3%",  size: "12px", delay: "2.4s",  duration: "4.5s"  },
  { top: "80%", left: "80%", size: "10px", delay: "0.4s",  duration: "3.8s"  },
  { top: "30%", left: "50%", size: "7px",  delay: "3.2s",  duration: "5s"    },
  { top: "55%", left: "25%", size: "9px",  delay: "1s",    duration: "3.2s"  },
  { top: "72%", left: "60%", size: "11px", delay: "2s",    duration: "4.2s"  },
  { top: "92%", left: "45%", size: "8px",  delay: "0.6s",  duration: "3.6s"  },
  { top: "22%", left: "30%", size: "6px",  delay: "3.8s",  duration: "4.8s"  },
]
