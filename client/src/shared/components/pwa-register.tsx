"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // SW only works on HTTPS or localhost
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"

    if (!isSecure) return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(reg => {
        // Check for updates on each navigation
        reg.update().catch(() => {})
      })
      .catch(() => {
        // SW registration failed — not critical, app works fine without it
      })
  }, [])

  return null
}
