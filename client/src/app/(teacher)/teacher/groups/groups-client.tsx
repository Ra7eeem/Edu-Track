"use client"

import { TopBar }               from "@/shared/components/layout/topbar"
import { Button }               from "@/shared/components/ui/button"
import { GradesSelector }       from "@/features/teacher/components/grades-selector"
import { useTeacherGroups, useTeacherCreateGroup } from "@/features/teacher/hooks/use-teacher-groups"
import { useJoinRequestCounts } from "@/features/teacher/hooks/use-join-requests"
import { ApiGroup, Grade, GRADE_LABELS, resolveId } from "@/shared/types/api"
import { BookOpen, Plus, TrendingUp, Users, X } from "lucide-react"
import Link                     from "next/link"
import { useRef, useState }     from "react"

const COLORS = [
  "from-primary to-accent",
  "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

// ─── Create Group Modal ────────────────────────────────────────────────────────
function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const createMut  = useTeacherCreateGroup()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [grades,      setGrades]      = useState<Grade[]>([])
  const [error,       setError]       = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) { setError("اسم المجموعة مطلوب"); return }
    setError(null)
    try {
      await createMut.mutateAsync({
        name:        name.trim(),
        description: description.trim() || undefined,
        grades:      grades.length > 0 ? grades : undefined,
      })
      onClose()
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ")
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 sm:items-center"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">إنشاء مجموعة جديدة</h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اسم المجموعة *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="مثال: مجموعة الرياضيات — الصف العاشر"
              autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف مختصر عن المجموعة..."
              rows={2}
              className="flex w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <GradesSelector selected={grades} onChange={setGrades} />
        </div>

        <div className="flex shrink-0 gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
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

// ─── Groups Client ─────────────────────────────────────────────────────────────
interface GroupsClientProps {
  initialGroups:  ApiGroup[]
  initialPending: number
  userName:       string
}

export function GroupsClient({
  initialGroups,
  initialPending,
  userName,
}: GroupsClientProps) {
  const [showCreate, setShowCreate] = useState(false)

  // Seed React Query cache with SSR data so first render is instant
  const { data: groupsData } = useTeacherGroups({ initialData: initialGroups })
  const { data: pending = initialPending } = useJoinRequestCounts({ initialData: initialPending })

  const groups = groupsData ?? initialGroups

  return (
    <>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      <div className="flex flex-col">
        <TopBar
          title="مجموعاتي"
          notifHref="/teacher/notifications"
          unreadCount={pending}
          userName={userName}
          userAvatar={userName ? userName[0] : "م"}
          userAvatarColor="bg-primary"
          profileHref="/teacher/profile"
        />

        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{groups.length} مجموعة</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">إنشاء مجموعة</span>
            </Button>
          </div>

          {/* Empty */}
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
              <BookOpen className="mb-3 size-10 text-muted-foreground/40" />
              <p className="font-medium">لا توجد مجموعات بعد</p>
              <p className="mt-1 text-sm text-muted-foreground">أنشئ مجموعتك الأولى الآن</p>
              <Button
                className="mt-4 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="size-4" />إنشاء مجموعة
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map((g, i) => (
                <div
                  key={resolveId(g)}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                  <div className="p-5">
                    <h3 className="text-base font-bold">{g.name}</h3>
                    {g.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {g.description}
                      </p>
                    )}
                    {(g.grades ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {g.grades.map(gr => (
                          <span
                            key={gr}
                            className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-foreground"
                          >
                            {GRADE_LABELS[gr as Grade]}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-xs text-muted-foreground">
                      آخر تحديث: {new Date(g.updatedAt).toLocaleDateString("ar-EG")}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teacher/group/${resolveId(g)}/attendance`}>
                          <Users className="size-3.5" />تسجيل الحضور
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
                        asChild
                      >
                        <Link href={`/teacher/group/${resolveId(g)}`}>
                          <TrendingUp className="size-3.5" />إدارة المجموعة
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

