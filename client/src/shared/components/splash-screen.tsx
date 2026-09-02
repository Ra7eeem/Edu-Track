"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show")

  useEffect(() => {
    // Only show once per session — prevents double-splash from SW cache
    const shown = sessionStorage.getItem("mearaj-splash")
    if (shown) {
      setPhase("gone")
      return
    }
    sessionStorage.setItem("mearaj-splash", "1")

    const t1 = setTimeout(() => setPhase("fade"),  1600)
    const t2 = setTimeout(() => setPhase("gone"),  2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === "gone") return null

  return (
    <>
      <style>{`
        @keyframes sp-in {
          from { opacity:0; transform:translateY(18px) scale(0.93); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes sp-dot {
          0%,100% { opacity:0.2; transform:scaleY(0.6); }
          50%     { opacity:1;   transform:scaleY(1.5); }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position:       "fixed",
          inset:           0,
          zIndex:          99999,
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          justifyContent:  "center",
          background:      "#1B2A4A",
          transition:      "opacity 0.55s ease",
          opacity:         phase === "fade" ? 0 : 1,
          pointerEvents:   "none",
        }}
      >
        {/* Logo — already has navy background baked in */}
        <div style={{ animation: "sp-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <Image
            src="/main-logo.svg"
            alt="معراج"
            width={240}
            height={135}
            priority
            unoptimized
            style={{ objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Gold loading dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              style={{
                display:      "block",
                borderRadius: "9999px",
                background:   "#C9A84C",
                width:        i === 1 || i === 2 ? 10 : 5,
                height:       i === 1 || i === 2 ? 10 : 5,
                animation:    `sp-dot 1.1s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
