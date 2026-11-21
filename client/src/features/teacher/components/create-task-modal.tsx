"use client"

import { useState } from "react"
import { useCreateClassTask } from "../hooks/use-class-tasks"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/tailwind-cn"
import { ListTodo, X } from "lucide-react"

interface Props {
  classroomId: string
  isOpen: boolean
  onClose: () => void
}

export function CreateTaskModal({ classroomId, isOpen, onClose }: Props) {
  const [taskType, setTaskType] = useState<"ONCE" | "DAILY">("ONCE")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  const createMut = useCreateClassTask(classroomId)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("عنوان المهمة مطلوب")
      return
    }
    setError(null)

    try {
      await createMut.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type: taskType,
        dueDate: taskType === "ONCE" && dueDate ? dueDate : undefined,
      })
      setTitle("")
      setDescription("")
      setDueDate("")
      setTaskType("ONCE")
      onClose()
    } catch (err: any) {
      setError(err.message || "فشل إنشاء المهمة")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden font-sans">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <h2 className="flex items-center gap-2 text-base font-bold text-heading">
            <ListTodo className="size-5 text-primary" />
            تعيين مهمة جديدة للمجموعة
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Segmented Button / Toggle */}
          <div className="flex rounded-xl border border-border p-1 bg-muted/40 mb-4">
            <button
              type="button"
              onClick={() => setTaskType("ONCE")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                taskType === "ONCE"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>📌</span>
              <span>مهمة لمرة واحدة (واجب/مشروع)</span>
            </button>
            <button
              type="button"
              onClick={() => setTaskType("DAILY")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                taskType === "DAILY"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🔄</span>
              <span>مهمة يومية متجددة (ورد/روتين)</span>
            </button>
          </div>

          <div>
            <Label htmlFor="createTaskTitle" className="text-xs font-bold">
              عنوان المهمة *
            </Label>
            <Input
              id="createTaskTitle"
              placeholder={
                taskType === "ONCE"
                  ? "مثال: مراجعة الدرس الأول، حل تدريبات ص 45..."
                  : "مثال: ورد صفحتين قرآن، أذكار الصباح..."
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 rounded-xl"
              required
            />
          </div>

          <div>
            <Label htmlFor="createTaskDesc" className="text-xs font-bold">
              تفاصيل وتوجيهات (اختياري)
            </Label>
            <textarea
              id="createTaskDesc"
              rows={2}
              placeholder="اكتب أي تعليمات أو توضيحات إضافية للطلاب..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs outline-none focus:border-primary"
            />
          </div>

          {/* Only show dueDate picker if taskType === 'ONCE' */}
          {taskType === "ONCE" && (
            <div className="space-y-1.5">
              <Label htmlFor="createTaskDueDate" className="text-xs font-medium text-muted-foreground">
                تاريخ ووقت التسليم (اختياري)
              </Label>
              <Input
                id="createTaskDueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive text-center">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending}
              className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {createMut.isPending ? "جارٍ النشر..." : "نشر المهمة للطلاب"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
