"use client";

import { useState } from "react";
import { useMyCourses } from "../hooks/use-courses";
import { ApiCourse, ApiLesson, resolveId, WatchStatus } from "@/shared/types/api";
import {
  Film,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Award,
  Video,
} from "lucide-react";
import Link from "next/link";

export function StudentCoursesViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const { data: courses = [], isLoading } = useMyCourses();

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = course.title?.toLowerCase().includes(q);
    const descMatch = course.description?.toLowerCase().includes(q);
    const classroomName =
      typeof course.classroom === "object"
        ? (course.classroom as any)?.name?.toLowerCase()
        : "";
    return titleMatch || descMatch || classroomName?.includes(q);
  });

  const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);
  const completedLessons = courses.reduce((acc, c) => acc + (c.completedLessons || 0), 0);
  const overallProgressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-sm">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">دوراتي وكورساتي التعليمية</h1>
              <p className="text-xs text-muted-foreground">
                شاهد شروحات دروسك واستكمل مسيرتك التعليمية بكل تميز
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-background/80 px-4 py-2 backdrop-blur-sm shadow-sm">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              أنجزت {completedLessons} من {totalLessons} درساً
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {overallProgressPercentage}%
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative z-10 mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>معدل إنجاز المشاهدة العام</span>
            <span className="font-bold text-foreground">{overallProgressPercentage}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الكورس أو محتوى الدرس..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">جاري تحميل كورساتك...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center">
          <Video className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-base font-bold text-foreground">لا توجد كورسات متاحة حالياً</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            لم يقم معلموك برفع دروس أو كورسات جديدة لمجموعتك الدراسية حتى الآن. ستظهر هنا فور نشرها.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredCourses.map((course: ApiCourse) => {
            const courseId = resolveId(course);
            const isExpanded = expandedCourses[courseId] ?? true;
            const lessons = course.lessons ?? [];
            const classroomName =
              typeof course.classroom === "object"
                ? (course.classroom as any)?.name
                : "المجموعة الدراسية";
            const progressPct = course.courseProgressPercentage ?? 0;
            const completedCount = course.completedLessons ?? 0;
            const totalCount = course.totalLessons ?? lessons.length;

            return (
              <div
                key={courseId}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                {/* Course Header */}
                <div
                  onClick={() => toggleCourse(courseId)}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-4 p-5 bg-muted/15 border-b border-border/40 hover:bg-muted/25 transition"
                >
                  <div className="flex items-center gap-3.5">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-14 w-14 rounded-xl object-cover border border-border shadow-sm"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                        <BookOpen className="h-7 w-7" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{course.title}</h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          {classroomName}
                        </span>
                      </div>
                      {course.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1 max-w-lg">
                          {course.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{totalCount} دروس</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          {completedCount} مكتملة ({progressPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Accordion Toggle */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end gap-1 w-28">
                      <span className="text-xs font-bold text-foreground">{progressPct}%</span>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-muted"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lessons in Course */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                    {lessons.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">
                        لا توجد دروس مضافة في هذا الكورس بعد.
                      </p>
                    ) : (
                      lessons.map((lesson: ApiLesson, index: number) => {
                        const lessonId = resolveId(lesson);
                        const prog = lesson.progress;
                        const isCompleted = prog?.isCompleted ?? false;
                        const percentage = prog?.percentage ?? 0;
                        const inProgress = percentage > 0 && !isCompleted;

                        return (
                          <div
                            key={lessonId}
                            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                              isCompleted
                                ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                                : inProgress
                                ? "border-amber-500/20 bg-amber-500/[0.02]"
                                : "border-border/60 bg-background hover:bg-muted/15"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Order indicator */}
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                                  isCompleted
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : inProgress
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-foreground">
                                  {lesson.title}
                                </h4>
                                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                                  {lesson.formattedDuration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {lesson.formattedDuration}
                                    </span>
                                  )}
                                  {prog?.formattedPosition && prog.lastPositionSeconds > 0 && (
                                    <span>
                                      المشاهدة: {prog.formattedPosition} ({percentage}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status & CTA */}
                            <div className="flex items-center gap-2.5">
                              {/* Status Badge */}
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>مكتمل 🎉</span>
                                </span>
                              ) : inProgress ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>قيد المشاهدة ({percentage}%)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                  <span>لم تبدأ بعد</span>
                                </span>
                              )}

                              {/* Watch Button */}
                              <Link
                                href={`/student/lessons/${lessonId}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>{isCompleted ? "إعادة المشاهدة" : inProgress ? "متابعة" : "مشاهدة الدرس"}</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
