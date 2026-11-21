"use client";

import { useState } from "react";
import {
  useLessonComments,
  useCreateLessonComment,
  useDeleteLessonComment,
} from "../hooks/use-courses";
import { ApiLessonComment, Role } from "@/shared/types/api";
import { MessageSquare, Send, Trash2, Award, Clock } from "lucide-react";

interface Props {
  lessonId: string;
  currentUserId?: string;
  currentUserRole?: string;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 172800) return "أمس";
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  } catch {
    return "";
  }
}

export function LessonCommentsThread({
  lessonId,
  currentUserId,
  currentUserRole,
}: Props) {
  const [content, setContent] = useState("");
  const { data: comments = [], isLoading } = useLessonComments(lessonId);
  const createMutation = useCreateLessonComment(lessonId);
  const deleteMutation = useDeleteLessonComment(lessonId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || createMutation.isPending) return;

    await createMutation.mutateAsync(content.trim());
    setContent("");
  };

  const isTeacherOrAdmin =
    currentUserRole === Role.TEACHER ||
    currentUserRole === Role.ADMIN ||
    currentUserRole === "TEACHER" ||
    currentUserRole === "ADMIN";

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">النقاش والاستفسارات حول الدرس</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب استفسارك أو تعليقك حول محتوى الدرس..."
          maxLength={1000}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!content.trim() || createMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4 rtl:rotate-180" />
          <span>{createMutation.isPending ? "جاري الإرسال..." : "إرسال"}</span>
        </button>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            جاري تحميل التعليقات...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 py-8 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              لا توجد تعليقات حتى الآن. كن أول من يشارك أو يسأل سؤالاً!
            </p>
          </div>
        ) : (
          comments.map((comment: ApiLessonComment) => {
            const isAuthor = currentUserId && comment.author?._id === currentUserId;
            const canDelete = isAuthor || isTeacherOrAdmin;
            const isTeacher =
              comment.author?.role === Role.TEACHER ||
              comment.author?.role === "TEACHER" ||
              comment.author?.role === Role.ADMIN ||
              comment.author?.role === "ADMIN";

            return (
              <div
                key={comment._id}
                className={`group flex items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                  isTeacher
                    ? "border-amber-500/30 bg-amber-500/[0.03]"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {comment.author?.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      comment.author?.name?.slice(0, 2) ?? "طالب"
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {comment.author?.name}
                      </span>

                      {/* Role Badge */}
                      {isTeacher ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                          <Award className="h-3 w-3" />
                          <span>معلم المادة ⭐</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          طالب
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-foreground/90">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                {canDelete && (
                  <button
                    onClick={() => deleteMutation.mutate(comment._id)}
                    disabled={deleteMutation.isPending}
                    title="حذف التعليق"
                    className="opacity-0 transition group-hover:opacity-100 hover:text-destructive text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
