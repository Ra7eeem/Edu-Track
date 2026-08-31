import { NextRequest, NextResponse } from "next/server"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup } from "@/shared/types/api"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const session     = await getSessionData()

  let groupName   = "المجموعة"
  let teacherName = session?.name ?? "المدرس"

  try {
    const group = await serverFetch<ApiGroup>(`/api/groups/${groupId}`, { revalidate: 300 })
    if (group?.name) groupName = group.name
  } catch {
    // graceful — use defaults
  }

  const appName  = `${groupName} — ${teacherName}`
  const shortName = groupName.length > 12 ? groupName.slice(0, 12) + "…" : groupName

  const manifest = {
    name:             appName,
    short_name:       shortName,
    description:      `حضور وكشف غياب ${groupName}`,
    start_url:        `/teacher/group/${groupId}/attendance?pwa=1`,
    scope:            `/teacher/group/${groupId}/`,
    display:          "standalone",
    orientation:      "portrait",
    background_color: "#ffffff",
    theme_color:      "#7c3aed",
    lang:             "ar",
    dir:              "rtl",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any"      },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any"      },
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name:   "تسجيل الحضور",
        url:    `/teacher/group/${groupId}/attendance?pwa=1`,
        icons:  [{ src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name:   "كشف الغياب",
        url:    `/teacher/group/${groupId}/register?pwa=1`,
        icons:  [{ src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type":  "application/manifest+json",
      "Cache-Control": "public, max-age=300",
    },
  })
}
