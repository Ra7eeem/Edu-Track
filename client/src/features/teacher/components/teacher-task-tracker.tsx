"use client"

import { useState } from "react"
import {
  useClassTasks,
  useClassTaskProgress,
  useSendTaskReminder,
  useTeacherDailyQuestions,
  useCreateDailyQuestion,
} from "../hooks/use-class-tasks"
import { CreateTaskModal } from "./create-task-modal"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId } from "@/shared/types/api"
import {
  ListTodo,
  Plus,
  BellRing,
  CheckCircle2,
  Clock,
  Users,
  X,
  Calendar,
  Sparkles,
  ChevronLeft,
  RotateCw,
  Search,
} from "lucide-react"

interface Props {
  groupId: string
}

export function TeacherTaskTracker({ groupId }: Props) {
  const { data, isLoading } = useClassTasks(groupId)
  const reminderMut = useSendTaskReminder(groupId)
  const createDailyQMut = useCreateDailyQuestion(groupId)
  const { data: dailyQuestions = [] } = useTeacherDailyQuestions(groupId)

  const tasks = data?.tasks ?? []
  const totalStudents = data?.totalStudents ?? 0

  // Create Task Modal state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  // Drilldown progress modal state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [modalTab, setModalTab] = useState<"pending" | "completed">("pending")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [drillSearch, setDrillSearch] = useState("")

  const selectedTaskObj = tasks.find((t) => resolveId(t) === selectedTaskId)
  const isSelectedDaily = selectedTaskObj?.type === "DAILY"

  const { data: progressData, isLoading: progressLoading } = useClassTaskProgress(
    selectedTaskId,
    isSelectedDaily ? selectedDate : undefined
  )

  // Daily Question Modal state
  const [showDailyQModal, setShowDailyQModal] = useState(false)
  const [dqQuestion, setDqQuestion] = useState("")
  const [dqOptions, setDqOptions] = useState(["", "", "", ""])
  const [dqCorrectIndex, setDqCorrectIndex] = useState(0)
  const [dqExplanation, setDqExplanation] = useState("")
  const [dqErr, setDqErr] = useState<string | null>(null)

  const [reminderToast, setReminderToast] = useState<string | null>(null)

  const handleSendReminder = async (taskId: string, studentIds?: string[]) => {
    try {
      const res = await reminderMut.mutateAsync({
        taskId,
        studentIds,
        dateStr: isSelectedDaily ? selectedDate : undefined,
      })
      setReminderToast(res.message || "تم إرسال التنبيه بنجاح")
      setTimeout(() => setReminderToast(null), 3500)
    } catch (err: any) {
      alert(err.message || "فشل إرسال التنبيه")
    }
  }

  const handleCreateDailyQ = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dqQuestion.trim()) {
      setDqErr("نص السؤال مطلوب")
      return
    }
    if (dqOptions.some((o) => !o.trim())) {
      setDqErr("يجب ملء الخيارات الأربعة جميعها")
      return
    }
    setDqErr(null)

    try {
      await createDailyQMut.mutateAsync({
        question: dqQuestion.trim(),
        options: dqOptions.map((o) => o.trim()),
        correctOptionIndex: dqCorrectIndex,
        explanation: dqExplanation.trim() || undefined,
        rewardPoints: 0,
      })
      setShowDailyQModal(false)
      setDqQuestion("")
      setDqOptions(["", "", "", ""])
      setDqExplanation("")
      setReminderToast("تم نشر سؤال اليوم بنجاح!")
      setTimeout(() => setReminderToast(null), 3500)
    } catch (err: any) {
      setDqErr(err.message || "فشل حفظ سؤال اليوم")
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
            <ListTodo className="size-5 text-primary" />
            متابعة المهام والتكليفات الإلزامية ({tasks.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            تعيين مهام موحدة لجميع طلاب المجموعة (يومية متجددة أو لمرة واحدة) ومتابعة نسبة إنجاز كل طالب لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowDailyQModal(true)}
            variant="outline"
            className="border-accent text-heading font-semibold"
          >
            <Sparkles className="size-3.5 me-1 text-accent" />
            إضافة سؤال اليوم
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateTaskModal(true)}
            className="bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90"
          >
            <Plus className="size-4 me-1" />
            مهمة جديدة للمجموعة
          </Button>
        </div>
      </div>

      {reminderToast && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="size-4.5" />
          {reminderToast}
        </div>
      )}

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 py-12 text-center">
          <ListTodo className="size-10 text-muted-foreground/30 mb-2" />
          <p className="font-semibold text-foreground text-sm">لا توجد مهام معينة للمجموعة بعد</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            أضف مهاماً مثل مراجعة الدروس أو أوراد يومية لتظهر في شريط مهام الطلاب وتتبع نسبة إنجازهم بدقة.
          </p>
          <Button
            size="sm"
            onClick={() => setShowCreateTaskModal(true)}
            className="mt-4 bg-primary text-primary-foreground"
          >
            <Plus className="size-4 me-1" />
            إنشاء أول مهمة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const tid = resolveId(task)
            const completedCount = task.stats?.completedCount ?? 0
            const percentage = task.stats?.percentage ?? 0
            const isDaily = task.type === "DAILY"

            return (
              <div
                key={tid}
                className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-foreground">
                          {task.title}
                        </h3>
                        {isDaily ? (
                          <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                            <RotateCw className="size-2.5" />
                            🔄 يومية متجددة
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            📌 لمرة واحدة
                          </span>
                        )}
                      </div>
                      {isDaily && (
                        <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-medium">
                          إنجاز اليوم: {new Date().toLocaleDateString("ar-EG")}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary shrink-0">
                      {completedCount}/{totalStudents} ({percentage}%)
                    </span>
                  </div>

                  {task.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {!isDaily && task.dueDate && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      موعد التسليم: {new Date(task.dueDate).toLocaleDateString("ar-EG")}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTaskId(tid)
                        setModalTab("pending")
                        setSelectedDate(new Date().toISOString().split("T")[0])
                      }}
                      className="h-8 rounded-xl text-xs font-semibold"
                    >
                      عرض المتابعة
                      <ChevronLeft className="size-3 ms-1" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSendReminder(tid)}
                      disabled={reminderMut.isPending}
                      className="h-8 rounded-xl text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold"
                    >
                      <BellRing className="size-3.5 me-1" />
                      تذكير المتأخرين
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Drill-down Progress Modal / Drawer ───────────────────── */}
      {selectedTaskId && progressData && (() => {
        const filteredPending = progressData.pending.filter((p: any) =>
          !drillSearch.trim() ||
          p.student?.name?.toLowerCase().includes(drillSearch.toLowerCase().trim()) ||
          p.student?.email?.toLowerCase().includes(drillSearch.toLowerCase().trim())
        )
        const filteredCompleted = progressData.completed.filter((c: any) =>
          !drillSearch.trim() ||
          c.student?.name?.toLowerCase().includes(drillSearch.toLowerCase().trim()) ||
          c.student?.email?.toLowerCase().includes(drillSearch.toLowerCase().trim())
        )

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedTaskId(null)
                setDrillSearch("")
              }
            }}
          >
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl overflow-hidden font-sans">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-heading">
                      متابعة إنجاز: {progressData.task.title}
                    </h2>
                    {isSelectedDaily ? (
                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                        🔄 مهمة يومية
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        📌 لمرة واحدة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {progressData.stats.completedCount} أنجزوا • {progressData.stats.pendingCount} لم ينجزوا بعد ({progressData.stats.percentage}%)
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedTaskId(null)
                    setDrillSearch("")
                  }}
                  className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
                {/* If Daily: Show Date Picker to inspect historical completion */}
                {isSelectedDaily && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-cyan-600" />
                      <span className="text-xs font-bold text-cyan-950 dark:text-cyan-200">
                        تاريخ المتابعة:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-xl border border-input bg-card px-2.5 py-1 text-xs outline-none focus:border-primary"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                        className="h-7 text-[11px] px-2 rounded-lg"
                      >
                        اليوم
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Summary bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressData.stats.percentage}%` }}
                  />
                </div>

                {/* Search Bar for 50+ students */}
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ابحث باسم الطالب أو بريده الإلكتروني..."
                    value={drillSearch}
                    onChange={(e) => setDrillSearch(e.target.value)}
                    className="ps-9 rounded-xl text-xs"
                  />
                </div>

                {/* Segmented Tabs: Pending vs Completed */}
                <div className="flex rounded-xl border border-border p-1 bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setModalTab("pending")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                      modalTab === "pending"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock className="size-3.5 text-amber-600" />
                    <span>لم ينجزوا ({progressData.pending.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab("completed")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                      modalTab === "completed"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>تم الإنجاز ({progressData.completed.length})</span>
                  </button>
                </div>

                {/* Tab 1: Pending Students */}
                {modalTab === "pending" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        قائمة الطلاب المتأخرين عن تسليم المهمة ({filteredPending.length})
                      </span>

                      {progressData.pending.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendReminder(selectedTaskId)}
                          disabled={reminderMut.isPending}
                          className="h-7 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
                        >
                          <BellRing className="size-3 me-1" />
                          تذكير الجميع 🔔
                        </Button>
                      )}
                    </div>

                    {progressData.pending.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-semibold p-6 rounded-2xl bg-emerald-500/10 text-center">
                        رائع! جميع طلاب المجموعة أتموا هذه المهمة {isSelectedDaily ? "لهذا اليوم" : ""} 🎉
                      </p>
                    ) : filteredPending.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-4 text-center rounded-2xl border border-dashed">
                        لا يوجد طلاب يطابقون كلمة البحث
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[48vh] sm:max-h-[55vh] overflow-y-auto pr-1">
                        {filteredPending.map((p: any) => {
                          const sid = resolveId(p.student)
                          return (
                            <div
                              key={sid}
                              className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-xs hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-[11px] font-bold text-amber-700 shrink-0">
                                  {p.student.name?.[0] || "؟"}
                                </span>
                                <div className="min-w-0 truncate">
                                  <span className="font-semibold block truncate">{p.student.name}</span>
                                  {p.student.email && (
                                    <span className="text-[10px] text-muted-foreground block truncate">{p.student.email}</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSendReminder(selectedTaskId, [sid])}
                                className="h-7 px-2.5 text-[11px] text-amber-600 hover:bg-amber-50 shrink-0 font-medium"
                              >
                                تذكير 🔔
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Completed Students */}
                {modalTab === "completed" && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">
                      الطلاب الذين قاموا بوضع علامة الإنجاز للمهمة ({filteredCompleted.length})
                    </span>

                    {progressData.completed.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-6 text-center rounded-2xl border border-dashed">
                        لم يقم أي طالب بإنهاء هذه المهمة بعد
                      </p>
                    ) : filteredCompleted.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-4 text-center rounded-2xl border border-dashed">
                        لا يوجد طلاب يطابقون كلمة البحث
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[48vh] sm:max-h-[55vh] overflow-y-auto pr-1">
                        {filteredCompleted.map((c: any) => {
                          const sid = resolveId(c.student)
                          return (
                            <div
                              key={sid}
                              className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/15 text-[11px] font-bold text-emerald-700 shrink-0">
                                  {c.student.name?.[0] || "؟"}
                                </span>
                                <div className="min-w-0 truncate">
                                  <span className="font-semibold text-emerald-950 dark:text-emerald-200 block truncate">
                                    {c.student.name}
                                  </span>
                                  {c.student.email && (
                                    <span className="text-[10px] text-muted-foreground block truncate">{c.student.email}</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                                {c.completedAt
                                  ? new Date(c.completedAt).toLocaleTimeString("ar-EG", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "منجز ✅"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 p-4 border-t border-border/60 text-end bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTaskId(null)
                    setDrillSearch("")
                  }}
                  className="rounded-xl px-5"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ─── Create Class Task Modal (Reusable Component) ─────────── */}
      <CreateTaskModal
        classroomId={groupId}
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
      />

      {/* ─── Create Daily Question Modal ──────────────────────────── */}
      {showDailyQModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowDailyQModal(false)}
        >
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl overflow-hidden font-sans">
            <div className="shrink-0 flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
              <h2 className="flex items-center gap-2 text-base font-bold text-heading">
                <Sparkles className="size-5 text-accent" />
                إضافة / تعديل سؤال اليوم المعرفي
              </h2>
              <button
                onClick={() => setShowDailyQModal(false)}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDailyQ} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <Label htmlFor="dqQuestion" className="text-xs font-bold">
                  نص السؤال *
                </Label>
                <Input
                  id="dqQuestion"
                  placeholder="مثال: ما هو إعراب كلمة 'العلم' في الجملة التالية؟"
                  value={dqQuestion}
                  onChange={(e) => setDqQuestion(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">الخيارات الأربعة (حدد الخيار الصحيح) *</Label>
                {dqOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={dqCorrectIndex === i}
                      onChange={() => setDqCorrectIndex(i)}
                      className="size-4 text-primary"
                    />
                    <Input
                      placeholder={`الخيار ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...dqOptions]
                        next[i] = e.target.value
                        setDqOptions(next)
                      }}
                      className="rounded-xl text-xs"
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="dqExplanation" className="text-xs font-bold">
                  توضيح المعلم (يظهر للطالب بعد إجابته)
                </Label>
                <textarea
                  id="dqExplanation"
                  rows={2}
                  placeholder="اكتب التبرير أو القاعدة النحوية/العلمية هنا..."
                  value={dqExplanation}
                  onChange={(e) => setDqExplanation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary"
                />
              </div>

              {dqErr && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive text-center">
                  {dqErr}
                </p>
              )}

              <div className="shrink-0 flex gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setShowDailyQModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createDailyQMut.isPending}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
                >
                  {createDailyQMut.isPending ? "جارٍ النشر..." : "نشر سؤال اليوم"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
