"use client"

import { useState } from "react"
import {
  useStudentTasks,
  useCreateStudentTask,
  useToggleStudentTask,
  useDeleteStudentTask,
} from "../hooks/use-student-tasks"
import { useClassTasks, useToggleClassTask } from "@/features/teacher/hooks/use-class-tasks"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId } from "@/shared/types/api"
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ListTodo,
  Sparkles,
  Pin,
  Calendar,
} from "lucide-react"

interface Props {
  classroomId?: string | null
}

export function StudentTaskBar({ classroomId }: Props) {
  const { data: personalData, isLoading: pLoading } = useStudentTasks()
  const { data: classData, isLoading: cLoading } = useClassTasks(classroomId || "")

  const createPersonalMut = useCreateStudentTask()
  const togglePersonalMut = useToggleStudentTask()
  const deletePersonalMut = useDeleteStudentTask()
  const toggleClassMut = useToggleClassTask(classroomId)

  const [newTitle, setNewTitle] = useState("")

  const personalTasks = personalData?.tasks ?? []
  const classTasks = classData?.tasks ?? []

  // Combine items for progress calculation
  const totalTasksCount = personalTasks.length + classTasks.length
  const completedCount =
    personalTasks.filter((t) => t.isCompleted).length +
    classTasks.filter((t) => t.isCompleted).length
  const percentage =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle("")
    await createPersonalMut.mutateAsync({ title })
  }

  const isLoading = pLoading || (!!classroomId && cLoading)

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm space-y-4 font-sans">
      {/* Title & Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-heading">
            <ListTodo className="size-5 text-primary" />
            شريط المهام والمتابعة اليومية
          </h2>
          <span className="text-xs font-bold text-primary">
            {completedCount}/{totalTasksCount} مكتملة ({percentage}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Inline Add Task Form */}
      <form onSubmit={handleCreatePersonal} className="flex items-center gap-2">
        <Input
          placeholder="أضف مهمة شخصية جديدة (مثال: مراجعة درس النحو)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="h-9 rounded-xl text-xs bg-background/80"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newTitle.trim() || createPersonalMut.isPending}
          className="h-9 rounded-xl bg-primary text-primary-foreground font-semibold px-3 shrink-0"
        >
          <Plus className="size-4 me-1" />
          إضافة
        </Button>
      </form>

      {/* Tasks List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : totalTasksCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Sparkles className="size-6 mb-1 text-primary/40" />
            <p className="text-xs font-medium">لا توجد مهام حالياً</p>
            <p className="text-[11px] opacity-75">
              نظم وقتك بإضافة مهامك اليومية أو متابعة التكليفات الموجهة من المعلم.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Teacher-Assigned Class Tasks */}
            {classTasks.map((ct) => {
              const ctid = resolveId(ct)
              return (
                <div
                  key={ctid}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-xs transition-all",
                    ct.isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                      : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleClassMut.mutate(ctid)}
                    className="flex items-center gap-2.5 text-start flex-1 min-w-0"
                  >
                    <span className="shrink-0 text-primary">
                      {ct.isCompleted ? (
                        <CheckCircle2 className="size-4.5 text-emerald-600 fill-emerald-600/20" />
                      ) : (
                        <Circle className="size-4.5 text-amber-600 hover:text-primary transition-colors" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-semibold truncate",
                          ct.isCompleted && "line-through opacity-70"
                        )}
                      >
                        {ct.title}
                      </p>
                      {ct.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Calendar className="size-2.5" />
                          موعد التسليم: {new Date(ct.dueDate).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                  </button>

                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 shrink-0 ms-2">
                    مهمة من المعلم 📌
                  </span>
                </div>
              )
            })}

            {/* 2. Personal Student Tasks */}
            {personalTasks.map((task) => {
              const tid = resolveId(task)
              return (
                <div
                  key={tid}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-xs transition-all",
                    task.isCompleted
                      ? "border-border/40 bg-muted/30 text-muted-foreground"
                      : "border-border/70 bg-card hover:border-primary/40 text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => togglePersonalMut.mutate(tid)}
                    className="flex items-center gap-2.5 text-start flex-1 min-w-0"
                  >
                    <span className="shrink-0 text-primary">
                      {task.isCompleted ? (
                        <CheckCircle2 className="size-4.5 text-primary fill-primary/20" />
                      ) : (
                        <Circle className="size-4.5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "truncate transition-all font-medium",
                        task.isCompleted && "line-through opacity-70"
                      )}
                    >
                      {task.title}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 shrink-0 ms-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      مهمتي الشخصية 📝
                    </span>
                    <button
                      type="button"
                      onClick={() => deletePersonalMut.mutate(tid)}
                      disabled={deletePersonalMut.isPending}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-all"
                      title="حذف المهمة"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
