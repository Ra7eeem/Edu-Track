"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { addStudentAction, removeStudentAction } from "@/features/teacher/actions/student.action"
import { useGroupStudents, type GroupStudent } from "@/features/teacher/hooks/use-group-students"
import { Grade, GRADE_LABELS, resolveId } from "@/shared/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, CheckCircle2, ChevronDown, Search, Trash2, UserPlus, X } from "lucide-react"
import { useEffect, useActionState, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

const addSchema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:    z.string().email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone:    z.string().min(7, "رقم الهاتف غير صالح"),
  grade:    z.nativeEnum(Grade, { required_error: "الصف مطلوب" }),
})
type AddFormValues = z.infer<typeof addSchema>

interface Props {
  groupId:         string
  initialStudents: GroupStudent[]
}

// Debounce keystrokes so each character doesn't fire a server search request.
function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({
  student,
  onConfirm,
  onClose,
  isPending,
  error,
}: {
  student:   { id: string; name: string }
  onConfirm: () => void
  onClose:   () => void
  isPending: boolean
  error:     string | null
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-rose-600">
            <Trash2 className="size-4" />حذف الطالب
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Warning icon */}
          <div className="flex justify-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold">هل تريد حذف هذا الطالب؟</p>
            <p className="text-sm text-muted-foreground">
              سيتم إزالة{" "}
              <span className="font-bold text-foreground">{student.name}</span>{" "}
              من المجموعة نهائياً
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90"
            onClick={onConfirm}
            disabled={isPending}
          >
            <Trash2 className="size-3.5" />
            {isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function StudentsClient({ groupId, initialStudents }: Props) {
  const qc = useQueryClient()
  const [search,       setSearch]       = useState("")
  const [showAdd,      setShowAdd]      = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [removing,     setRemoving]     = useState(false)
  const [removeErr,    setRemoveErr]    = useState<string | null>(null)
  const [isPending,    startTransition] = useTransition()

  const debouncedSearch = useDebouncedValue(search, 350)

  // Seed the query with the server-rendered list; searching re-fetches server-side
  const { data } = useGroupStudents(groupId, debouncedSearch, { initialData: initialStudents })
  const students: GroupStudent[] = data ?? initialStudents

  const [state, formAction] = useActionState(addStudentAction, {})

  useEffect(() => {
    if (state.success) {
      qc.invalidateQueries({ queryKey: ["teacher", "groups", groupId, "students"], exact: false, refetchType: "active" })
    }
  }, [state.success, groupId, qc])

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", grade: undefined },
  })

  const onSubmit = (values: AddFormValues) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.set(k, v))
    fd.set("groupId", groupId)
    startTransition(() => formAction(fd))
  }

  const confirmRemove = () => {
    if (!deleteTarget) return
    setRemoving(true)
    setRemoveErr(null)
    startTransition(async () => {
      const res = await removeStudentAction(groupId, deleteTarget.id)
      if (res.error) {
        setRemoveErr(res.error)
        setRemoving(false)
      } else {
        qc.invalidateQueries({ queryKey: ["teacher", "groups", groupId, "students"], exact: false, refetchType: "active" })
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"], exact: false, refetchType: "active" })
        setDeleteTarget(null)
        setRemoving(false)
      }
    })
  }

  const fieldErr = (f: keyof AddFormValues) =>
    errors[f]?.message ?? state.fieldErrors?.[f]?.[0]

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          student={deleteTarget}
          onConfirm={confirmRemove}
          onClose={() => { setDeleteTarget(null); setRemoveErr(null) }}
          isPending={removing}
          error={removeErr}
        />
      )}

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
          onClick={() => setShowAdd(true)}
        >
          <UserPlus className="size-3.5" />إضافة طالب
        </Button>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">{students.length} طالب</p>

      {/* List */}
      <div className="space-y-2">
        {students.map((s: GroupStudent, i: number) => {
          const sid    = resolveId(s)
          const name   = s.name ?? "طالب"
          const email  = s.email ?? ""
          return (
            <div
              key={sid || i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm transition-all hover:border-border"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                {name[0] ?? "؟"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
              <button
                onClick={() => setDeleteTarget({ id: sid, name })}
                disabled={isPending}
                className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-40 dark:border-rose-800 dark:hover:bg-rose-950/20"
                aria-label="حذف الطالب"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )
        })}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium">لا يوجد طلاب</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-card border border-border/60 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <UserPlus className="size-4 text-violet-500" />إضافة طالب جديد
              </h2>
              <button onClick={() => setShowAdd(false)} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {state.success ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
                <p className="font-bold">تم إنشاء حساب الطالب بنجاح!</p>
                <Button className="mt-4 w-full" onClick={() => { setShowAdd(false); reset() }}>
                  إغلاق
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                {state.error && <p className="text-xs text-destructive">{state.error}</p>}

                <div className="space-y-1">
                  <Label htmlFor="st-name">الاسم الكامل</Label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input {...field} id="st-name" placeholder="محمد أحمد" error={!!fieldErr("name")} />
                  )} />
                  {fieldErr("name") && <p className="text-xs text-destructive">{fieldErr("name")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-email">البريد الإلكتروني</Label>
                  <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} id="st-email" type="email" placeholder="student@example.com" error={!!fieldErr("email")} />
                  )} />
                  {fieldErr("email") && <p className="text-xs text-destructive">{fieldErr("email")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-phone">رقم الهاتف</Label>
                  <Controller name="phone" control={control} render={({ field }) => (
                    <Input {...field} id="st-phone" type="tel" placeholder="01012345678" error={!!fieldErr("phone")} />
                  )} />
                  {fieldErr("phone") && <p className="text-xs text-destructive">{fieldErr("phone")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-grade">الصف الدراسي</Label>
                  <Controller name="grade" control={control} render={({ field }) => (
                    <div className="relative">
                      <select {...field} id="st-grade"
                        className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all">
                        <option value="">-- اختر الصف --</option>
                        {Object.entries(GRADE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  )} />
                  {fieldErr("grade") && <p className="text-xs text-destructive">{fieldErr("grade")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-pass">كلمة مرور مؤقتة</Label>
                  <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} id="st-pass" type="text" placeholder="Edu@2026" error={!!fieldErr("password")} />
                  )} />
                  {fieldErr("password") && <p className="text-xs text-destructive">{fieldErr("password")}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>إلغاء</Button>
                  <Button type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                    disabled={isPending}>
                    {isPending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
