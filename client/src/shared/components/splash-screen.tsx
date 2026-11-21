"use client"

import { useEffect, useState } from "react"

export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show")

  useEffect(() => {
    // Only once per session — prevents double-splash from SW cache
    const shown = sessionStorage.getItem("mearaj-splash")
    if (shown) {
      const t = setTimeout(() => setPhase("gone"), 0)
      return () => clearTimeout(t)
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
        @keyframes sp-logo-in {
          from { opacity: 0; transform: translateY(20px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes sp-dot {
          0%,100% { opacity: 0.2; transform: scaleY(0.65); }
          50%     { opacity: 1;   transform: scaleY(1.5);  }
        }
      `}</style>

      {/* Full-screen navy overlay */}
      <div
        aria-hidden
        style={{
          position:      "fixed",
          inset:          0,
          zIndex:         99999,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          background:     "#12503B",
          transition:     "opacity 0.6s ease",
          opacity:        phase === "fade" ? 0 : 1,
          pointerEvents:  "none",
        }}
      >
        {/* Logo — plain <img> bypasses Next.js image optimisation issues */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/main-logo.svg"
          alt="معراج"
          width={280}
          height={158}
          style={{
            objectFit: "contain",
            display:   "block",
            maxWidth:  "min(280px, 70vw)",
            animation: "sp-logo-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        />

        {/* Gold dots */}
        <div style={{ display: "flex", gap: 10, marginTop: 44 }}>
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              style={{
                display:      "block",
                borderRadius: "9999px",
                background:   "#C9A84C",
                width:        i === 1 || i === 2 ? 11 : 5,
                height:       i === 1 || i === 2 ? 11 : 5,
                animation:    `sp-dot 1.1s ease-in-out ${i * 0.17}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
