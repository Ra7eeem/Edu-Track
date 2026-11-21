"use client";

import { use, useState } from "react";
import { useLesson } from "@/features/courses/hooks/use-courses";
import { LessonVideoPlayer } from "@/features/courses/components/LessonVideoPlayer";
import { LessonCommentsThread } from "@/features/courses/components/LessonCommentsThread";
import { TeacherLessonAnalytics } from "@/features/courses/components/TeacherLessonAnalytics";
import { useSession } from "next-auth/react";
import { TopBar } from "@/shared/components/layout/topbar";
import { resolveId } from "@/shared/types/api";
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  Film,
  Layers,
  Play,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function TeacherLessonPage({ params }: Props) {
  const { id: groupId, lessonId } = use(params);
  const { data, isLoading } = useLesson(lessonId);
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id ?? (session?.user as any)?._id ?? "";

  const [activeTab, setActiveTab] = useState<"analytics" | "comments">("analytics");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">جاري تحميل بيانات الدرس والتحليلات...</p>
        </div>
      </div>
    );
  }

  if (!data?.lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Film className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold text-foreground">الدرس غير متوفر</h2>
        <Link
          href={`/teacher/group/${groupId}`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للمجموعة</span>
        </Link>
      </div>
    );
  }

  const { lesson, courseLessons = [] } = data;

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title={lesson.title}
        notifHref="/teacher/notifications"
        userName={session?.user?.name ?? "معلم"}
        userAvatar={session?.user?.name?.[0] ?? "م"}
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href={`/teacher/group/${groupId}`} className="hover:text-foreground">
              إدارة المجموعة
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">
              {(lesson.course as any)?.title ?? "الكورس"}
            </span>
            <span>/</span>
            <span className="text-primary font-bold">{lesson.title}</span>
          </div>

          <Link
            href={`/teacher/group/${groupId}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للمجموعة</span>
          </Link>
        </div>

        {/* Video Player Preview */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LessonVideoPlayer
              lessonId={lessonId}
              youtubeVideoId={lesson.youtubeVideoId}
              initialPositionSeconds={0}
              isCompleted={false}
            />
          </div>

          {/* Sibling Lessons Playlist */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">دروس الكورس</h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {courseLessons.length}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px]">
                {courseLessons.map((item: any, idx: number) => {
                  const isCurrent = item._id === lessonId;
                  return (
                    <Link
                      key={item._id}
                      href={`/teacher/group/${groupId}/lessons/${item._id}`}
                      className={`flex items-center justify-between gap-2 rounded-xl p-2.5 text-xs font-medium transition ${
                        isCurrent
                          ? "border border-primary/30 bg-primary/10 font-bold text-primary"
                          : "border border-border/60 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="line-clamp-1">{item.title}</span>
                      </div>
                      {isCurrent ? (
                        <span className="shrink-0 text-[10px] font-semibold text-primary">
                          الحالي
                        </span>
                      ) : (
                        <Play className="h-3 w-3 shrink-0 opacity-40" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: [ تحليلات المشاهدة 📊 ] | [ النقاش والاستفسارات 💬 ] */}
        <div className="mb-6 flex items-center rounded-2xl border border-border bg-card p-1.5 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("analytics")}
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>تحليلات المشاهدة 📊</span>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "comments"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>النقاش والاستفسارات 💬</span>
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === "analytics" ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <TeacherLessonAnalytics lessonId={lessonId} />
          </div>
        ) : (
          <LessonCommentsThread
            lessonId={lessonId}
            currentUserId={currentUserId}
            currentUserRole="TEACHER"
          />
        )}
      </main>
    </div>
  );
}
