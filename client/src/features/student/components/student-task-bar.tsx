"use client"

import { useState } from "react"
import {
  useStudentTasks,
  useCreateStudentTask,
  useToggleStudentTask,
  useDeleteStudentTask,
} from "../hooks/use-student-tasks"
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
} from "lucide-react"

export function StudentTaskBar() {
  const { data, isLoading } = useStudentTasks()
  const createMut = useCreateStudentTask()
  const toggleMut = useToggleStudentTask()
  const deleteMut = useDeleteStudentTask()

  const [newTitle, setNewTitle] = useState("")

  const tasks = data?.tasks ?? []
  const stats = data?.stats ?? { total: 0, completed: 0, pending: 0, percentage: 0 }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle("")
    await createMut.mutateAsync({ title })
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm space-y-4 font-sans">
      {/* Title & Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-heading">
            <ListTodo className="size-5 text-primary" />
            شريط مهام الطالب (خاص بك)
          </h2>
          <span className="text-xs font-bold text-primary">
            {stats.completed}/{stats.total} مكتملة ({stats.percentage}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Inline Add Task Form */}
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          placeholder="أضف مهمة شخصية جديدة (مثال: مراجعة درس النحو)..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="h-9 rounded-xl text-xs bg-background/80"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newTitle.trim() || createMut.isPending}
          className="h-9 rounded-xl bg-primary text-primary-foreground font-semibold px-3 shrink-0"
        >
          <Plus className="size-4 me-1" />
          إضافة
        </Button>
      </form>

      {/* Tasks List */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 rounded-xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Sparkles className="size-6 mb-1 text-primary/40" />
            <p className="text-xs font-medium">لا توجد مهام حالياً</p>
            <p className="text-[11px] opacity-75">
              نظم وقتك بإضافة مهامك اليومية والأسبوعية هنا ومتابعة نسبة إنجازك.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const tid = resolveId(task)
            return (
              <div
                key={tid}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border px-3 py-2 text-xs transition-all",
                  task.isCompleted
                    ? "border-border/40 bg-muted/30 text-muted-foreground"
                    : "border-border/70 bg-card hover:border-primary/40 text-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleMut.mutate(tid)}
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
                      "truncate transition-all",
                      task.isCompleted && "line-through opacity-70"
                    )}
                  >
                    {task.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteMut.mutate(tid)}
                  disabled={deleteMut.isPending}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-all shrink-0 ms-2"
                  title="حذف المهمة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
