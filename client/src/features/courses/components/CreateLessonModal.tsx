"use client";

import { useState } from "react";
import { useCreateLesson } from "../hooks/use-courses";
import { X, Video, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  classroomId: string;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function CreateLessonModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  classroomId,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateLesson(classroomId);

  if (!isOpen) return null;

  const extractedId = extractYouTubeId(youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("يرجى إدخال عنوان الدرس");
      return;
    }
    if (!extractedId) {
      setError("يرجى إدخال رابط يوتيوب صحيح (مثال: https://www.youtube.com/watch?v=...)");
      return;
    }
    setError(null);

    try {
      await createMutation.mutateAsync({
        courseId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          youtubeUrl: youtubeUrl.trim(),
        },
      });
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء إضافة الدرس");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
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
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">إضافة درس جديد</h3>
            <p className="text-xs text-muted-foreground">
              ضمن كورس: <span className="font-semibold text-foreground">{courseTitle}</span>
            </p>
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
              عنوان الدرس <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الدرس الأول - الحركة في خط مستقيم"
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              رابط فيديو اليوتيوب <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Video className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-3.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {extractedId ? (
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>تم التعرف على الفيديو بنجاح (المعرف: {extractedId})</span>
              </div>
            ) : youtubeUrl.length > 5 ? (
              <p className="mt-1 text-xs text-amber-600">
                يرجى التأكد من كتابة رابط يوتيوب صالح
              </p>
            ) : null}
          </div>

          {/* Video Preview thumbnail if ID extracted */}
          {extractedId && (
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src={`https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`}
                alt="Preview"
                className="aspect-video w-full object-cover"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              وصف أو ملاحظات حول الدرس (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب ملاحظات للطالب أو ملخص لما سيتم شرحه في هذا الفيديو..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
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
              disabled={createMutation.isPending || !title.trim() || !extractedId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{createMutation.isPending ? "جاري الإضافة..." : "إضافة الدرس"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
