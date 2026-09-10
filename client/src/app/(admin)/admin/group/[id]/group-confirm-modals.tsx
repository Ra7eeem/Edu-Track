"use client"

import {
  removeStudentFromGroupAction,
  removeTeacherFromGroupAction,
} from "@/features/admin/actions/group.action"
import { Button } from "@/shared/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useState, useTransition } from "react"

interface ConfirmProps {
  open: boolean
  icon: React.ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

function ConfirmModal(props: ConfirmProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    setError(null)
    startTransition(async () => {
      try {
        await props.onConfirm()
        props.onClose()
      } catch (e: unknown) {
        setError((e as { message?: string })?.message ?? "حدث خطأ")
      }
    })
  }

  if (!props.open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && !isPending && props.onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
        <p className="text-4xl">{props.icon}</p>
        <p className="font-bold">{props.title}</p>
        <p className="text-sm text-muted-foreground">{props.description}</p>
        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={props.onClose} disabled={isPending}>إلغاء</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "جارٍ التنفيذ..." : props.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RemoveTeacherConfirm({
  groupId, teacherId, teacherName, open, onClose,
}: {
  groupId: string
  teacherId: string
  teacherName: string
  open: boolean
  onClose: () => void
}) {
  return (
    <ConfirmModal
      open={open}
      icon={<span>👨‍🏫</span>}
      title={`إزالة ${teacherName}؟`}
      description="سيتم إزالة المدرس من هذه المجموعة فقط"
      confirmLabel="تأكيد الإزالة"
      onConfirm={() => {
        const result = removeTeacherFromGroupAction(groupId, teacherId)
        // Errors surface via ConfirmModal catch (result won't throw; handle below)
        return asyncResult(result)
      }}
      onClose={onClose}
    />
  )
}

export function DeleteStudentConfirm({
  groupId, studentId, studentName, open, onClose,
}: {
  groupId: string
  studentId: string
  studentName: string
  open: boolean
  onClose: () => void
}) {
  return (
    <ConfirmModal
      open={open}
      icon={<AlertTriangle className="mx-auto size-8 text-rose-500" />}
      title={`حذف ${studentName}؟`}
      description="سيتم إزالة الطالب من المجموعة ومسح نقاطه نهائياً"
      confirmLabel="تأكيد الحذف"
      onConfirm={() => {
        const result = removeStudentFromGroupAction(groupId, studentId)
        return asyncResult(result)
      }}
      onClose={onClose}
    />
  )
}

async function asyncResult(p: Promise<{ error?: string }>): Promise<void> {
  const result = await p
  if (result.error) throw new Error(result.error)
}