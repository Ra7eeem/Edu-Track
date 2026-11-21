// Mi'raj Service Worker — caches attendance + register pages for offline use
const CACHE_NAME = "mearaj-v1"
const RUNTIME    = "mearaj-runtime-v1"

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener("install", () => {
  self.skipWaiting()
})

// ── Activate — clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch strategy ─────────────────────────────────────────────────────────────
self.addEventListener("fetch", event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET from same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  // API calls — always network (auth tokens, fresh data)
  if (url.pathname.startsWith("/api/")) return

  // Attendance & register pages — Network first, cache fallback
  const isAttendancePage =
    url.pathname.includes("/attendance") ||
    url.pathname.includes("/register")

  if (request.mode === "navigate" && isAttendancePage) {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(RUNTIME).then(c => c.put(request, clone))
          }
          return res
        })
        .catch(() =>
          caches.match(request).then(cached => {
            if (cached) return cached
            // Offline fallback page
            return new Response(
              `<!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <title>EduTrack — بدون اتصال</title>
                <style>
                  body{margin:0;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;color:#333;text-align:center;padding:1rem}
                  .icon{font-size:4rem;margin-bottom:1rem}
                  h1{font-size:1.25rem;margin-bottom:.5rem}
                  p{color:#666;font-size:.9rem;max-width:280px}
                  button{margin-top:1.5rem;padding:.75rem 2rem;background:#7c3aed;color:#fff;border:none;border-radius:12px;font-size:1rem;cursor:pointer}
                </style>
              </head>
              <body>
                <div class="icon">📡</div>
                <h1>لا يوجد اتصال بالإنترنت</h1>
                <p>لم يتم تحميل هذه الصفحة بعد. اتصل بالإنترنت وأعد المحاولة.</p>
                <button onclick="location.reload()">إعادة المحاولة</button>
              </body>
              </html>`,
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
          })
        )
    )
    return
  }

  // Other navigations — network only (don't cache teacher dashboard etc.)
  if (request.mode === "navigate") return

  // Static assets (JS, CSS, fonts, images, icons) — cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok && (
          url.pathname.startsWith("/_next/static/") ||
          url.pathname.startsWith("/icon-") ||
          url.pathname.endsWith(".svg") ||
          url.pathname.endsWith(".png") ||
          url.pathname.endsWith(".woff2")
        )) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone))
        }
        return res
      })
    })
  )
})

// ── Web Push Event: Receives notification even if website is closed ──────────
self.addEventListener("push", event => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const title = data.title || "EduTrack — تنبيه جديد"
    const options = {
      body: data.body || data.message || "",
      icon: data.icon || "/logo.png",
      badge: "/favicon.ico",
      data: {
        url: data.data?.url || "/student/notifications",
      },
      vibrate: [200, 100, 200],
      dir: "rtl",
      lang: "ar",
      tag: data.tag || "edutrack-notification",
      renotify: true,
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (err) {
    console.error("Push notification display error:", err)
  }
})

// ── Notification Click Event: Opens the relevant page ─────────────────────────
self.addEventListener("notificationclick", event => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || "/student/notifications"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
