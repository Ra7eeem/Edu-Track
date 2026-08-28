"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import {
  useAdminGroups,
  useAdminTeachers,
  useCreateGroup,
  useDeleteGroup,
} from "@/features/admin/hooks/use-admin"
import { resolveId } from "@/shared/types/api"
import { useState, useRef } from "react"
import { Plus, Search, Trash2, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/shared/lib/tailwind-cn"

const COLORS = [
  "from-violet-500 to-violet-600", "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",   "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { data: allTeachersRaw } = useAdminTeachers("", 1)
  const allTeachers = allTeachersRaw ?? []

  const createMut = useCreateGroup()

  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [teacherIds,  setTeacherIds]  = useState<string[]>([])
  const [error,       setError]       = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const toggleTeacher = (id: string) =>
    setTeacherIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )

  const handleSubmit = async () => {
    if (!name.trim()) { setError("اسم المجموعة مطلوب"); return }
    setError(null)
    try {
      await createMut.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        teacherIds: teacherIds.length > 0 ? teacherIds : undefined,
      })
      onClose()
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err?.message ?? "حدث خطأ")
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">إنشاء مجموعة جديدة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اسم المجموعة *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: مجموعة الرياضيات — الصف العاشر"
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف مختصر عن المجموعة..."
              rows={2}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Teachers */}
          {allTeachers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">إسناد مدرسين (اختياري)</label>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-2xl border border-input bg-card p-2">
                {allTeachers.map(t => {
                  const tid = resolveId(t)
                  const selected = teacherIds.includes(tid)
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => toggleTeacher(tid)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all text-start",
                        selected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className={cn(
                        "grid size-5 place-items-center rounded-md border text-[10px] font-bold shrink-0 transition-all",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      )}>
                        {selected ? "✓" : ""}
                      </span>
                      <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {t.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{t.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{t.email}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {teacherIds.length > 0 && (
                <p className="text-[10px] text-primary">تم اختيار {teacherIds.length} مدرس</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={createMut.isPending}
          >
            <Plus className="size-4" />
            {createMut.isPending ? "جارٍ الإنشاء..." : "إنشاء المجموعة"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminGroupsPage() {
  const [search,      setSearch]      = useState("")
  const [showCreate,  setShowCreate]  = useState(false)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)

  const { data, isLoading } = useAdminGroups(search)
  const deleteMut = useDeleteGroup()
  const groups = data ?? []

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <p className="font-bold">حذف المجموعة؟</p>
            <p className="text-sm text-muted-foreground">هذا الإجراء لا يمكن التراجع عنه</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>إلغاء</Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteId)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
          {/* Search + Create */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث عن مجموعة..."
                className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">إنشاء مجموعة</span>
            </Button>
          </div>

          <p className="mb-4 text-xs text-muted-foreground">{groups.length} مجموعة</p>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g, i) => (
                <div
                  key={resolveId(g)}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                  <div className="p-4">
                    <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
                    {g.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{new Date(g.createdAt).toLocaleDateString("ar-EG")}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDeleteId(resolveId(g))}
                          className="grid size-6 place-items-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20"
                          aria-label="حذف المجموعة"
                        >
                          <Trash2 className="size-3" />
                        </button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                          <Link href={`/admin/group/${resolveId(g)}`}>تفاصيل</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {groups.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <p className="text-3xl mb-3">📚</p>
                  <p className="text-sm text-muted-foreground">لا توجد مجموعات بعد</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus className="size-4" />إنشاء أول مجموعة
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
