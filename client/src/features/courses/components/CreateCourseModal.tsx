"use client";

import { useEffect, useState } from "react";
import { useCreateCourse } from "../hooks/use-courses";
import { useTeacherGroups } from "@/features/teacher/hooks/use-teacher-groups";
import { resolveId } from "@/shared/types/api";
import { X, BookOpen, Image as ImageIcon, Loader2, Users } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classroomId?: string;
}

export function CreateCourseModal({ isOpen, onClose, classroomId }: Props) {
  const [selectedClassroomId, setSelectedClassroomId] = useState(classroomId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: groups = [], isLoading: isLoadingGroups } = useTeacherGroups();
  const createMutation = useCreateCourse(selectedClassroomId || classroomId);

  useEffect(() => {
    if (classroomId) {
      setSelectedClassroomId(classroomId);
    } else if (groups.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(resolveId(groups[0]));
    }
  }, [classroomId, groups, selectedClassroomId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("يرجى إدخال عنوان الكورس");
      return;
    }
    if (!selectedClassroomId) {
      setError("يرجى اختيار المجموعة التي سيظهر لها الكورس");
      return;
    }
    setError(null);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        classroomId: selectedClassroomId,
      });
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء إنشاء الكورس");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">إضافة كورس جديد</h3>
              <p className="text-xs text-muted-foreground">أنشئ كورساً جديداً وحدد المجموعة الموجه إليها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Classroom Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              المجموعة المستهدفة <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                required
                disabled={isLoadingGroups}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {isLoadingGroups ? (
                  <option>جاري تحميل المجموعات...</option>
                ) : groups.length === 0 ? (
                  <option value="">لا توجد مجموعات متاحة</option>
                ) : (
                  <>
                    <option value="" disabled>-- اختر المجموعة --</option>
                    {groups.map((group) => {
                      const gid = resolveId(group);
                      const stageName = (group.academicStage as any)?.name;
                      return (
                        <option key={gid} value={gid}>
                          {group.name} {stageName ? `(${stageName})` : ""}
                        </option>
                      );
                    })}
                  </>
                )}
              </select>
              <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              سيتمكن طلاب هذه المجموعة فقط من الوصول إلى الكورس والدروس المضافة بداخله.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              عنوان الكورس <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح منهج الفيزياء - الترم الأول"
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              وصف الكورس (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن موضوعات هذا الكورس..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              رابط صورة الغلاف (اختياري)
            </label>
            <div className="relative">
              <ImageIcon className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-3.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="shrink-0 mt-2 flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <button
              onClick={onClose}
              type="button"
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground transition hover:bg-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !selectedClassroomId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{createMutation.isPending ? "جاري الحفظ..." : "إنشاء الكورس"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
