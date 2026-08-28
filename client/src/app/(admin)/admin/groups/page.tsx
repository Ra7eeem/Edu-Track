"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { useAdminGroups } from "@/features/admin/hooks/use-admin"
import { useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"

const COLORS = [
  "from-violet-500 to-violet-600", "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",   "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

export default function AdminGroupsPage() {
  const [search, setSearch] = useState("")
  const { data } = useAdminGroups(search)
  const groups   = data ?? []

  return (
    <div className="flex flex-col">
      <TopBar
        title="المجموعات"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن مجموعة..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>

        <p className="mb-4 text-xs text-muted-foreground">{groups.length} مجموعة</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <div key={g.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{new Date(g.createdAt).toLocaleDateString("ar-EG")}</span>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                    <Link href={`/admin/group/${g.id}`}>تفاصيل</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              لا توجد مجموعات
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
