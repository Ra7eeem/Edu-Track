"use client"

import { TopBar }     from "@/shared/components/layout/topbar"
import { Button }     from "@/shared/components/ui/button"
import {
  useStudentProfileForTeacher,
  useStudentNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/features/teacher/hooks/use-student-profile"
import { AttendanceStatus, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  ArrowLeft, CalendarCheck, CheckCircle2,
  KeyRound, Pencil, Plus, StickyNote, Trash2,
} from "lucide-react"
import Link from "next/link"
import { use, useState } from "react"
import { UpdateStudentPasswordModal } from "@/features/teacher/components/update-student-password-modal"

// ─── Arabic months ────────────────────────────────────────────────────────────
const AR_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]

const STATUS_STYLES: Record<string, string> = {
  [AttendanceStatus.PRESENT]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  [AttendanceStatus.LATE]:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [AttendanceStatus.ABSENT]:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
}

const STATUS_LABEL: Record<string, string> = {
  [AttendanceStatus.PRESENT]: "✓",
  [AttendanceStatus.LATE]:    "م",
  [AttendanceStatus.ABSENT]:  "✗",
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>
}) {
  const { id: groupId, studentId } = use(params)

  const { data, isLoading } = useStudentProfileForTeacher(groupId, studentId)
  // Use separate notes query so it updates optimistically independent of profile
  const { data: notesData } = useStudentNotes(groupId, studentId)

  const createNote = useCreateNote(groupId, studentId)
  const updateNote = useUpdateNote(groupId, studentId)
  const deleteNote = useDeleteNote(groupId, studentId)

  const [noteInput,          setNoteInput]          = useState("")
  const [editingNote,        setEditingNote]        = useState<{ id: string; content: string } | null>(null)
  const [editContent,        setEditContent]        = useState("")
  const [deleteNoteId,       setDeleteNoteId]       = useState<string | null>(null)
  const [showPasswordModal,  setShowPasswordModal]  = useState(false)

  const student  = data?.student
  const scores   = data?.scores   ?? []
  // Prefer live notes query; fall back to profile data
  const notes    = notesData ?? data?.notes ?? []
  const records  = data?.attendanceRecords ?? []

  // Group attendance by month
  const byMonth: Record<string, { date: string; status: string }[]> = {}
  for (const r of records) {
    const d   = new Date(r.date)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(r)
  }

  const handleAddNote = () => {
    if (!noteInput.trim()) return
    createNote.mutate(noteInput.trim(), { onSuccess: () => setNoteInput("") })
  }

  const handleUpdateNote = () => {
    if (!editingNote || !editContent.trim()) return
    updateNote.mutate(
      { noteId: editingNote.id, content: editContent.trim() },
      { onSuccess: () => setEditingNote(null) }
    )
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote.mutate(noteId, { onSuccess: () => setDeleteNoteId(null) })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar title="ملف الطالب" subtitle="" notifHref="/teacher/notifications" userName="" userAvatar="م" userAvatarColor="bg-primary" profileHref="/teacher/profile"/>
        <div className="mx-auto w-full max-w-2xl p-4 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted"/>)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title={student?.name ?? "ملف الطالب"}
        subtitle="ملف الطالب"
        notifHref="/teacher/notifications"
        unreadCount={0}
        userName=""
        userAvatar="م"
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />

      {/* Delete note modal */}
      {deleteNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && setDeleteNoteId(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-3xl">🗒️</p>
            <p className="font-bold">حذف الملاحظة؟</p>
            <p className="text-sm text-muted-foreground">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteNoteId(null)}>إلغاء</Button>
              <Button className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90"
                onClick={() => handleDeleteNote(deleteNoteId)} disabled={deleteNote.isPending}>
                <Trash2 className="size-3.5"/>{deleteNote.isPending ? "جارٍ..." : "تأكيد"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && student && (
        <UpdateStudentPasswordModal
          student={{ id: studentId, name: student.name }}
          groupId={groupId}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-5">

        {/* Back button */}
        <Link href={`/teacher/group/${groupId}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3.5"/>العودة للمجموعة
        </Link>

        {/* Profile card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-extrabold text-white shadow-md">
              {(student?.name ?? "؟")[0]}
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold">{student?.name}</p>
              <p className="text-sm text-muted-foreground">{student?.email}</p>
              {student?.phone && <p className="text-xs text-muted-foreground">{student.phone}</p>}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="rounded-xl border-primary text-primary hover:bg-primary/10 shrink-0 font-bold"
          >
            <KeyRound className="size-3.5" />
            <span className="hidden sm:inline">تغيير كلمة المرور</span>
            <span className="sm:hidden">كلمة المرور</span>
          </Button>
        </div>

        {/* Monthly scores */}
        {scores.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="size-3.5 text-accent"/>النقاط الشهرية
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {scores.slice(0, 6).map((s, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">{AR_MONTHS[s.month]} {s.year}</p>
                  <p className="text-lg font-bold text-primary">{s.score}</p>
                  <div className="mt-1 flex gap-1.5 text-[9px]">
                    <span className="text-emerald-600">{s.presentCount}✓</span>
                    {s.lateCount > 0 && <span className="text-amber-600">{s.lateCount}م</span>}
                    {s.absentCount > 0 && <span className="text-rose-600">{s.absentCount}✗</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance calendar */}
        {Object.keys(byMonth).length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <CalendarCheck className="size-3.5 text-accent"/>سجل الحضور
            </h3>
            <div className="space-y-4">
              {Object.entries(byMonth).map(([key, recs]) => {
                const [y, m] = key.split("-")
                return (
                  <div key={key}>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      {AR_MONTHS[Number(m)]} {y}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recs.map((r, i) => {
                        const day = new Date(r.date).getUTCDate()
                        return (
                          <div key={i} title={r.date}
                            className={cn(
                              "flex size-9 flex-col items-center justify-center rounded-xl text-[10px] font-bold",
                              STATUS_STYLES[r.status] ?? "bg-muted text-muted-foreground"
                            )}>
                            <span>{day}</span>
                            <span className="text-[8px]">{STATUS_LABEL[r.status] ?? "—"}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <StickyNote className="size-3.5 text-accent"/>ملاحظاتي عن الطالب
          </h3>
          <p className="text-[10px] text-muted-foreground">الطالب لا يرى هذه الملاحظات</p>

          {/* Add note */}
          {editingNote ? null : (
            <div className="space-y-2">
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="أضف ملاحظة..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-input bg-muted/30 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button size="sm"
                className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground w-full"
                onClick={handleAddNote}
                disabled={!noteInput.trim() || createNote.isPending}>
                <Plus className="size-3.5"/>
                {createNote.isPending ? "جارٍ الإضافة..." : "إضافة ملاحظة"}
              </Button>
            </div>
          )}

          {/* Notes list */}
          <div className="space-y-2">
            {notes.map(n => {
              const nid = resolveId(n)
              const isEditing = editingNote?.id === nid
              return (
                <div key={nid} className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1"
                          onClick={() => setEditingNote(null)}>إلغاء</Button>
                        <Button size="sm"
                          className="flex-1 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
                          onClick={handleUpdateNote} disabled={updateNote.isPending}>
                          {updateNote.isPending ? "جارٍ..." : "حفظ"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{n.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingNote({ id: nid, content: n.content }); setEditContent(n.content) }}
                            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Pencil className="size-3"/>
                          </button>
                          <button
                            onClick={() => setDeleteNoteId(nid)}
                            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors dark:hover:bg-rose-950/20">
                            <Trash2 className="size-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {notes.length === 0 && !createNote.isPending && (
              <p className="text-center text-xs text-muted-foreground py-4">لا توجد ملاحظات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
