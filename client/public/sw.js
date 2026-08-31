// EduTrack Service Worker — caches attendance + register pages for offline use
const CACHE_NAME  = "edutrack-v1"
const RUNTIME     = "edutrack-runtime"

// App shell: pages that should always work offline
const PRECACHE = [
  "/",
  "/teacher/groups",
]

// Install — cache the shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// Activate — clean old caches
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

// Fetch strategy:
// - Navigation requests (HTML pages): Network-first, fallback to cache
// - API requests:                      Network-only (never cache tokens/auth)
// - Static assets:                     Cache-first
self.addEventListener("fetch", event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  // API calls — always network only (contains auth tokens)
  if (url.pathname.startsWith("/api/")) return

  // Navigation (HTML) — network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(res => {
          // Cache attendance + register pages specifically
          if (
            url.pathname.includes("/attendance") ||
            url.pathname.includes("/register")
          ) {
            const clone = res.clone()
            caches.open(RUNTIME).then(c => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request).then(r => r ?? caches.match("/")))
    )
    return
  }

  // Static assets (JS, CSS, fonts, images) — cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(RUNTIME).then(c => c.put(request, clone))
        }
        return res
      })
    })
  )
})
