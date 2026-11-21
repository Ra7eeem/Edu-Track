"use client";

import { useState } from "react";
import {
  useGroupCourses,
  useDeleteCourse,
  useDeleteLesson,
} from "../hooks/use-courses";
import { CreateCourseModal } from "./CreateCourseModal";
import { CreateLessonModal } from "./CreateLessonModal";
import { TeacherLessonAnalytics } from "./TeacherLessonAnalytics";
import { ApiCourse, ApiLesson, WatchStatus } from "@/shared/types/api";
import {
  BookOpen,
  Plus,
  Play,
  BarChart3,
  Trash2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Video,
  Film,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Props {
  classroomId: string;
  isTeacher?: boolean;
}

export function CoursesTab({ classroomId, isTeacher = false }: Props) {
  const { data: courses = [], isLoading } = useGroupCourses(classroomId);
  const deleteCourseMutation = useDeleteCourse(classroomId);
  const deleteLessonMutation = useDeleteLesson(classroomId);

  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [activeCourseForLesson, setActiveCourseForLesson] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [analyticsLessonId, setAnalyticsLessonId] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">جاري تحميل الكورسات والدروس...</p>
        </div>
      </div>
    );
  }

  // If teacher selected a lesson to view analytics, render the analytics view directly
  if (analyticsLessonId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <TeacherLessonAnalytics
          lessonId={analyticsLessonId}
          onClose={() => setAnalyticsLessonId(null)}
        />
      </div>
    );
  }

  const totalLessonsAll = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);
  const completedLessonsAll = courses.reduce((acc, c) => acc + (c.completedLessons || 0), 0);
  const overallProgressPct =
    totalLessonsAll > 0 ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">الكورسات والدروس التعليمية</h2>
            <p className="text-xs text-muted-foreground">
              {courses.length} كورسات متاحة • {totalLessonsAll} درساً تعليمياً
              {!isTeacher && totalLessonsAll > 0 && ` • أنجزت ${completedLessonsAll} درساً (${overallProgressPct}%)`}
            </p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsCreateCourseOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة كورس جديد</span>
          </button>
        )}
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Film className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-base font-bold text-foreground">لا توجد كورسات مضافة حتى الآن</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isTeacher
              ? "اضغط على زر إضافة كورس جديد بالأعلى لنشر الفيديوهات والدروس التعليمية."
              : "لم يقم المعلم بنشر كورسات أو دروس في هذه المجموعة بعد."}
          </p>
          {isTeacher && (
            <button
              onClick={() => setIsCreateCourseOpen(true)}
              type="button"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة أول كورس الآن</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {courses.map((course: ApiCourse) => {
            const isExpanded = expandedCourses[course._id] ?? true; // expanded by default
            return (
              <div
                key={course._id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/30"
              >
                {/* Course Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-4 sm:p-5">
                  <div
                    onClick={() => toggleCourse(course._id)}
                    className="flex flex-1 cursor-pointer items-center gap-3.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground sm:text-base">
                          {course.title}
                        </h3>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                          {course.lessons.length} دروس
                        </span>
                      </div>
                      {course.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center gap-3">
                    {!isTeacher && course.lessons.length > 0 && (
                      <div className="hidden items-center gap-2 sm:flex">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${course.courseProgressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {course.courseProgressPercentage}%
                        </span>
                      </div>
                    )}

                    {isTeacher && (
                      <>
                        <button
                          onClick={() =>
                            setActiveCourseForLesson({
                              id: course._id,
                              title: course.title,
                            })
                          }
                          type="button"
                          className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>إضافة درس</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف كورس "${course.title}" وكافة دروسه؟`)) {
                              deleteCourseMutation.mutate(course._id);
                            }
                          }}
                          type="button"
                          title="حذف الكورس"
                          className="rounded-xl p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => toggleCourse(course._id)}
                      type="button"
                      className="rounded-xl p-1.5 text-muted-foreground transition hover:bg-muted"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Course Lessons List */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    {course.lessons.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 py-8 text-center">
                        <Video className="mx-auto mb-2 h-7 w-7 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">
                          لا توجد دروس مضافة في هذا الكورس بعد.
                        </p>
                        {isTeacher && (
                          <button
                            onClick={() =>
                              setActiveCourseForLesson({
                                id: course._id,
                                title: course.title,
                              })
                            }
                            type="button"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة الدرس الأول لهذا الكورس</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                        {course.lessons.map((lesson: ApiLesson, index: number) => {
                          const prog = lesson.progress;
                          const isCompleted = prog?.isCompleted ?? false;
                          const percentage = prog?.percentage ?? 0;
                          const lessonHref = isTeacher
                            ? `/teacher/group/${classroomId}/lessons/${lesson._id}`
                            : `/student/lessons/${lesson._id}`;

                          return (
                            <div
                              key={lesson._id}
                              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-background/70 p-3.5 transition hover:border-primary/40 hover:shadow-md"
                            >
                              <div>
                                {/* Video Thumbnail with Overlay */}
                                <Link
                                  href={lessonHref}
                                  className="relative block aspect-video w-full overflow-hidden rounded-lg bg-black/80"
                                >
                                  <img
                                    src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/hqdefault.jpg`}
                                    alt={lesson.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/10">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition group-hover:scale-110">
                                      <Play className="h-5 w-5 fill-current pr-0.5" />
                                    </div>
                                  </div>
                                  {lesson.durationSeconds > 0 && (
                                    <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                      {lesson.formattedDuration}
                                    </span>
                                  )}
                                </Link>

                                {/* Lesson Info */}
                                <div className="mt-3">
                                  <Link
                                    href={lessonHref}
                                    className="line-clamp-2 text-sm font-bold text-foreground transition hover:text-primary"
                                  >
                                    {index + 1}. {lesson.title}
                                  </Link>
                                  {lesson.description && (
                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Progress & Teacher Controls */}
                              <div className="mt-3.5 border-t border-border/60 pt-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  {/* Student Progress Badge */}
                                  {!isTeacher && (
                                    <div className="flex items-center gap-1.5">
                                      {isCompleted ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                          <CheckCircle2 className="h-3 w-3" />
                                          <span>مكتمل</span>
                                        </span>
                                      ) : percentage > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                          <Clock className="h-3 w-3" />
                                          <span>{percentage}%</span>
                                        </span>
                                      ) : (
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                          لم تبدأ
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Teacher Analytics Shortcut & Actions */}
                                  {isTeacher && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setAnalyticsLessonId(lesson._id)}
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                                      >
                                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                                        <span>تحليلات المشاهدة 📊</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`هل أنت متأكد من حذف درس "${lesson.title}"؟`)) {
                                            deleteLessonMutation.mutate(lesson._id);
                                          }
                                        }}
                                        type="button"
                                        title="حذف الدرس"
                                        className="rounded-lg p-1 text-muted-foreground transition hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}

                                  <Link
                                    href={lessonHref}
                                    className="text-xs font-bold text-primary hover:underline"
                                  >
                                    {isTeacher ? "معاينة الدرس" : "مشاهدة الآن"} ←
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        classroomId={classroomId}
      />

      {activeCourseForLesson && (
        <CreateLessonModal
          isOpen={true}
          onClose={() => setActiveCourseForLesson(null)}
          courseId={activeCourseForLesson.id}
          courseTitle={activeCourseForLesson.title}
          classroomId={classroomId}
        />
      )}
    </div>
  );
}
