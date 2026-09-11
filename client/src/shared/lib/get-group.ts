import { cache } from "react"
import { serverFetch } from "@/shared/lib/api-server"
import { ApiGroup } from "@/shared/types/api"

/**
 * Fetches a group once per server render pass, even when both generateMetadata
 * and the page body need the same data (React cache() dedupes per request).
 *
 * Group detail is auth/role-scoped, so it must never enter the Next Data Cache
 * (no revalidate) — the same URL for different teachers would leak data.
 */
export const getGroup = cache((groupId: string) =>
  serverFetch<ApiGroup>(`/api/groups/${groupId}`)
)