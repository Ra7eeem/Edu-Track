"use client";

import { use, useState } from "react";
import { useLesson } from "@/features/courses/hooks/use-courses";
import { LessonVideoPlayer } from "@/features/courses/components/LessonVideoPlayer";
import { LessonCommentsThread } from "@/features/courses/components/LessonCommentsThread";
import { useStudentMe } from "@/features/student/hooks/use-student";
import { TopBar } from "@/shared/components/layout/topbar";
import { resolveId } from "@/shared/types/api";
import {
  ArrowRight,
  BookOpen,
  Film,
  Play,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default function StudentLessonPage({ params }: Props) {
  const { lessonId } = use(params);
  const { data, isLoading } = useLesson(lessonId);
  const { data: profile } = useStudentMe();
  const currentUserId = profile ? resolveId(profile) : "";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">جاري تحميل محتوى الدرس...</p>
        </div>
      </div>
    );
  }

  if (!data?.lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Film className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold text-foreground">الدرس غير متوفر</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          قد يكون الدرس قد تم حذفه أو ليس لديك صلاحية لمشاهدته.
        </p>
        <Link
          href="/student/group"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للمجموعة</span>
        </Link>
      </div>
    );
  }

  const { lesson, courseLessons = [], progress } = data;

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title={lesson.title}
        notifHref="/student/notifications"
        userName={profile?.name ?? "طالب"}
        userAvatar={profile?.name?.[0] ?? "ط"}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Navigation / Breadcrumb */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/student/courses" className="hover:text-foreground">
              الكورسات والدروس
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">
              {(lesson.course as any)?.title ?? "الكورس"}
            </span>
            <span>/</span>
            <span className="text-primary font-bold">{lesson.title}</span>
          </div>

          <Link
            href="/student/courses"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للكورسات</span>
          </Link>
        </div>

        {/* Two-Column Grid: Left/Main = Video + Comments, Right/Side = Sibling Lessons Playlist */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Area: Video Player & Description & Comments */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Embedded Player */}
            <LessonVideoPlayer
              lessonId={lessonId}
              youtubeVideoId={lesson.youtubeVideoId}
              initialPositionSeconds={progress?.lastPositionSeconds ?? 0}
              initialPercentage={progress?.percentage ?? 0}
              isCompleted={progress?.isCompleted ?? false}
            />

            {/* Lesson Title & Info */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                {lesson.title}
              </h1>

              {lesson.description && (
                <div className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-foreground/80">
                  <p className="whitespace-pre-wrap">{lesson.description}</p>
                </div>
              )}
            </div>

            {/* Discussion & Comments */}
            <LessonCommentsThread
              lessonId={lessonId}
              currentUserId={currentUserId}
              currentUserRole="STUDENT"
            />
          </div>

          {/* Sibling Lessons Playlist */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">قائمة دروس الكورس</h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {courseLessons.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-250px)]">
                {courseLessons.map((item: any, idx: number) => {
                  const isCurrent = item._id === lessonId;
                  return (
                    <Link
                      key={item._id}
                      href={`/student/lessons/${item._id}`}
                      className={`flex items-center justify-between gap-3 rounded-xl p-3 text-xs font-medium transition ${
                        isCurrent
                          ? "border border-primary/30 bg-primary/10 font-bold text-primary shadow-sm"
                          : "border border-border/60 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="line-clamp-1">{item.title}</span>
                      </div>

                      {isCurrent ? (
                        <span className="shrink-0 text-[11px] font-semibold text-primary">
                          يُشاهد الآن ▶
                        </span>
                      ) : (
                        <Play className="h-3.5 w-3.5 shrink-0 opacity-40" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
