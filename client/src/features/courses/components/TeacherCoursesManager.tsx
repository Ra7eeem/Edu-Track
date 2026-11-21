"use client";

import { useState } from "react";
import {
  useMyCourses,
  useDeleteCourse,
  useDeleteLesson,
} from "../hooks/use-courses";
import { useTeacherGroups } from "@/features/teacher/hooks/use-teacher-groups";
import { CreateCourseModal } from "./CreateCourseModal";
import { CreateLessonModal } from "./CreateLessonModal";
import { TeacherLessonAnalytics } from "./TeacherLessonAnalytics";
import { ApiCourse, ApiLesson, resolveId } from "@/shared/types/api";
import {
  BookOpen,
  Plus,
  Play,
  BarChart3,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Video,
  Film,
  Users,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";

export function TeacherCoursesManager() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [activeCourseForLesson, setActiveCourseForLesson] = useState<{
    id: string;
    title: string;
    classroomId: string;
  } | null>(null);
  const [analyticsLesson, setAnalyticsLesson] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const { data: groups = [] } = useTeacherGroups();
  const { data: courses = [], isLoading } = useMyCourses(selectedGroupId || undefined);
  const deleteCourseMutation = useDeleteCourse();
  const deleteLessonMutation = useDeleteLesson();

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

  const totalCourses = courses.length;
  const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">الكورسات والدروس التعليمية</h1>
            <p className="text-xs text-muted-foreground">
              إدارة المحتوى المرئي وتتبع تحليلات المشاهدة الدقيقة للطلاب
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateCourseOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span>إنشاء كورس جديد</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>إجمالي الكورسات</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalCourses}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Video className="h-4 w-4 text-emerald-600" />
            <span>إجمالي الدروس</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalLessons}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="h-4 w-4 text-amber-600" />
            <span>المجموعات النشطة</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{groups.length}</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        {/* Group Selector */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="">جميع المجموعات ({groups.length})</option>
            {groups.map((g) => {
              const gid = resolveId(g);
              return (
                <option key={gid} value={gid}>
                  {g.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Live Search */}
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الكورس أو الدرس..."
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-3 pr-8 text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">جاري تحميل الكورسات...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-base font-bold text-foreground">لا توجد كورسات متاحة</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            {selectedGroupId
              ? "لم يتم إضافة كورسات لهذه المجموعة بعد. اضغط على الزر أدناه لإنشاء أول كورس."
              : "لم تقم بإنشاء أي كورس حتى الآن. ابدأ بإضافة أول كورس تعليمي وربطه بمجموعتك."}
          </p>
          <button
            onClick={() => setIsCreateCourseOpen(true)}
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء كورس الآن</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredCourses.map((course: ApiCourse) => {
            const courseId = resolveId(course);
            const isExpanded = expandedCourses[courseId] ?? true;
            const lessons = course.lessons ?? [];
            const classroomName =
              typeof course.classroom === "object"
                ? (course.classroom as any)?.name
                : "مجموعة دراسية";
            const classroomId =
              typeof course.classroom === "object"
                ? resolveId(course.classroom)
                : String(course.classroom);

            return (
              <div
                key={courseId}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-border/80"
              >
                {/* Course Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-muted/10 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-12 w-12 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="h-6 w-6" />
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
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActiveCourseForLesson({
                          id: courseId,
                          title: course.title,
                          classroomId,
                        })
                      }
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      <span>إضافة درس</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف كورس "${course.title}" وكافة الدروس الملحقة به؟`)) {
                          deleteCourseMutation.mutate(courseId);
                        }
                      }}
                      disabled={deleteCourseMutation.isPending}
                      type="button"
                      className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      title="حذف الكورس"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => toggleCourse(courseId)}
                      type="button"
                      className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-muted"
                      title={isExpanded ? "طي القائمة" : "عرض الدروس"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lessons List in this Course */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    {lessons.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 py-6 text-center">
                        <Video className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground/40" />
                        <p className="text-xs font-medium text-muted-foreground">
                          لا توجد دروس في هذا الكورس حتى الآن.
                        </p>
                        <button
                          onClick={() =>
                            setActiveCourseForLesson({
                              id: courseId,
                              title: course.title,
                              classroomId,
                            })
                          }
                          type="button"
                          className="mt-2 text-xs font-bold text-primary hover:underline"
                        >
                          + إضافة الدرس الأول
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {lessons.map((lesson: ApiLesson, index: number) => {
                          const lessonId = resolveId(lesson);
                          return (
                            <div
                              key={lessonId}
                              className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background p-3 transition hover:border-primary/30 hover:bg-muted/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                                  {index + 1}
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
                                  </div>
                                </div>
                              </div>

                              {/* Lesson Actions */}
                              <div className="flex items-center gap-2">
                                {/* Analytics Button */}
                                <button
                                  onClick={() =>
                                    setAnalyticsLesson({
                                      id: lessonId,
                                      title: lesson.title,
                                    })
                                  }
                                  type="button"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground shadow-sm"
                                >
                                  <BarChart3 className="h-3.5 w-3.5" />
                                  <span>تحليلات المشاهدة 📊</span>
                                </button>

                                {/* Preview / View comments */}
                                <Link
                                  href={`/teacher/group/${classroomId}/lessons/${lessonId}`}
                                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  title="معاينة الدرس والتعليقات"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>

                                {/* Delete Lesson */}
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف درس "${lesson.title}"؟`)) {
                                      deleteLessonMutation.mutate(lessonId);
                                    }
                                  }}
                                  disabled={deleteLessonMutation.isPending}
                                  type="button"
                                  className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                  title="حذف الدرس"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        classroomId={selectedGroupId || undefined}
      />

      {/* Create Lesson Modal */}
      {activeCourseForLesson && (
        <CreateLessonModal
          isOpen={true}
          onClose={() => setActiveCourseForLesson(null)}
          courseId={activeCourseForLesson.id}
          courseTitle={activeCourseForLesson.title}
          classroomId={activeCourseForLesson.classroomId}
        />
      )}

      {/* Video Watch Analytics Modal */}
      {analyticsLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in"
          onClick={(e) => e.target === e.currentTarget && setAnalyticsLesson(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden font-sans">
            <div className="shrink-0 flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    تحليلات المشاهدة: {analyticsLesson.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    تعرف على من شاهد الدرس، ومن هو قيد المشاهدة، ومن لم يبدأ بعد مع إمكانية إرسال تنبيهات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsLesson(null)}
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <TeacherLessonAnalytics
                lessonId={analyticsLesson.id}
                onClose={() => setAnalyticsLesson(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
