"use client";

import { useState } from "react";
import { useCreateCourse } from "../hooks/use-courses";
import { X, BookOpen, Image as ImageIcon, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
}

export function CreateCourseModal({ isOpen, onClose, classroomId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateCourse(classroomId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("يرجى إدخال عنوان الكورس");
      return;
    }
    setError(null);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute left-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">إضافة كورس جديد</h3>
            <p className="text-xs text-muted-foreground">أنشئ كورساً جديداً لإضافة الدروس التعليمية داخله</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="وصف مختصر لمحتوى وأهداف الكورس..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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

          <div className="mt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              type="button"
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground transition hover:bg-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim()}
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
