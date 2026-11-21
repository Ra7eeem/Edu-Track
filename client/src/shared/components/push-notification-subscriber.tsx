"use client"

import { useEffect, useState } from "react"
import { clientFetch } from "@/shared/lib/api-client"
import { Bell, Check, Loader2 } from "lucide-react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationSubscriber() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)

      // Register SW if not already registered
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription()
          if (sub) {
            setIsSubscribed(true)
          } else if (Notification.permission === "default") {
            // Show prompt banner after 3 seconds on first visit
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => clearTimeout(timer)
          }
        })
        .catch(() => {})
    }
  }, [])

  const subscribeToPush = async () => {
    if (!isSupported) return
    setIsSubscribing(true)
    try {
      // 1. Request browser notification permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== "granted") {
        setIsSubscribing(false)
        setShowPrompt(false)
        return
      }

      // 2. Fetch VAPID public key from backend
      const res = await clientFetch<{ success: boolean; data: { publicKey: string } }>(
        "/api/notifications/vapid-key"
      )
      const publicKey = res?.data?.publicKey
      if (!publicKey) throw new Error("VAPID public key not found")

      // 3. Subscribe with the service worker
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      // 4. Send subscription endpoint to backend
      const subJson = sub.toJSON()
      await clientFetch("/api/notifications/subscribe", {
        method: "POST",
        data: {
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
          },
        },
      })

      setIsSubscribed(true)
      setShowPrompt(false)
    } catch (err) {
      console.warn("Could not subscribe to push notifications:", err)
    } finally {
      setIsSubscribing(false)
    }
  }

  // If already subscribed or denied or unsupported, hide floating prompt
  if (!isSupported || !showPrompt || isSubscribed || permission === "denied") {
    return null
  }

  return (
    <aside
      aria-label="تفعيل الإشعارات"
      className="fixed bottom-4 end-4 z-50 max-w-sm rounded-xl border border-primary/20 bg-card p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Bell className="size-5" />
        </div>
        <div className="flex-1 space-y-1 text-xs">
          <p className="font-semibold text-foreground">تفعيل إشعارات الهاتف والمتصفح</p>
          <p className="text-muted-foreground leading-relaxed">
            استلم تنبيهات الامتحانات والغياب والردود حتى والموقع مغلق.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={subscribeToPush}
              disabled={isSubscribing}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              {isSubscribing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              تفعيل الآن
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
