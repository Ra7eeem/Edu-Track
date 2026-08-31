"use client"

import { useEffect, useState } from "react"
import { Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface Props {
  groupId:   string
  groupName: string
}

// BeforeInstallPromptEvent is not in standard TS types
interface BeforeInstallPromptEvent extends Event {
  prompt():                     Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallButton({ groupId, groupName }: Props) {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    // Already running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
      return
    }

    // Inject the group-specific manifest link
    const existing = document.getElementById("pwa-manifest")
    const link     = (existing ?? document.createElement("link")) as HTMLLinkElement
    link.id   = "pwa-manifest"
    link.rel  = "manifest"
    link.href = `/api/pwa/manifest/${groupId}`
    if (!existing) document.head.appendChild(link)

    // Capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handler)

    // Also show button if prompt never fires (Chrome has already shown it before)
    const timer = setTimeout(() => setVisible(true), 800)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [groupId])

  const handleInstall = async () => {
    if (!prompt) {
      // Fallback: open instructions
      alert("لتثبيت التطبيق:\nChrome: اضغط ⋮ ← 'Install app'\niPhone: Share ↑ ← 'Add to Home Screen'")
      return
    }
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") setInstalled(true)
    setPrompt(null)
  }

  if (installed) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        التطبيق مثبّت
      </div>
    )
  }

  if (!visible) return null

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleInstall}
      className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/20"
    >
      <Download className="size-3.5" />
      <span className="hidden sm:inline">تثبيت</span>
      <span className="sm:hidden">↓</span>
    </Button>
  )
}
