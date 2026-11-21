"use client";

import { useState } from "react";
import {
  useLessonAnalytics,
  useSendLessonReminder,
} from "../hooks/use-courses";
import { WatchStatus, ApiLessonAnalyticsStudent } from "@/shared/types/api";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Bell,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface Props {
  lessonId: string;
  onClose?: () => void;
}

export function TeacherLessonAnalytics({ lessonId, onClose }: Props) {
  const { data: analytics, isLoading } = useLessonAnalytics(lessonId);
  const remindMutation = useSendLessonReminder(lessonId);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED">("ALL");
  const [search, setSearch] = useState("");
  const [remindSuccessMsg, setRemindSuccessMsg] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">جاري تحميل بيانات تحليلات المشاهدة...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لم يتم العثور على بيانات الدرس أو الطلاب.
      </div>
    );
  }

  const {
    lesson,
    totalStudents,
    completedCount,
    inProgressCount,
    notStartedCount,
    completionRate,
    averageWatchProgress,
    students,
  } = analytics;

  const filteredStudents = students.filter((s: ApiLessonAnalyticsStudent) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "COMPLETED" && s.status === WatchStatus.COMPLETED) ||
      (filter === "IN_PROGRESS" && s.status === WatchStatus.IN_PROGRESS) ||
      (filter === "NOT_STARTED" && s.status === WatchStatus.NOT_STARTED);

    const matchesSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleRemindClick = async () => {
    try {
      const res = await remindMutation.mutateAsync();
      setRemindSuccessMsg(`تم إرسال إشعار تذكير إلى ${res.notifiedCount} طالب بنجاح! 🔔`);
      setTimeout(() => setRemindSuccessMsg(null), 5000);
    } catch {
      // Capture error
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                title="رجوع"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-foreground">تحليلات مشاهدة الدرس</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {lesson.title} ({lesson.formattedDuration} دقيقة)
          </p>
        </div>

        <button
          onClick={handleRemindClick}
          disabled={remindMutation.isPending || (inProgressCount === 0 && notStartedCount === 0)}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Bell className="h-4 w-4" />
          <span>
            {remindMutation.isPending
              ? "جاري إرسال التنبيه..."
              : `تذكير غير المكتملين 🔔 (${inProgressCount + notStartedCount})`}
          </span>
        </button>
      </div>

      {remindSuccessMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-600 animate-in fade-in">
          {remindSuccessMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Completed */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">أكملوا المشاهدة</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{completedCount}</span>
              <span className="text-xs font-medium text-emerald-600">
                من {totalStudents} ({completionRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">يشاهدون حالياً</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{inProgressCount}</span>
              <span className="text-xs font-medium text-amber-600">
                من {totalStudents} ({totalStudents > 0 ? Math.round((inProgressCount / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Not Started */}
        <div className="flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">لم يشاهدوا إطلاقاً</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{notStartedCount}</span>
              <span className="text-xs font-medium text-red-600">
                من {totalStudents} ({totalStudents > 0 ? Math.round((notStartedCount / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Average Progress */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">متوسط الإنجاز العام</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{averageWatchProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
          <button
            onClick={() => setFilter("ALL")}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            الكل ({totalStudents})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            المكتملون ✅ ({completedCount})
          </button>
          <button
            onClick={() => setFilter("IN_PROGRESS")}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            قيد المشاهدة ⏳ ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter("NOT_STARTED")}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === "NOT_STARTED" ? "bg-red-500/10 text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            لم يبدأوا ❌ ({notStartedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الطالب..."
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-3 pr-9 text-xs outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {/* Students Progress Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 backdrop-blur-sm text-xs font-bold text-muted-foreground shadow-sm">
              <tr>
                <th className="px-4 py-3">الطالب</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">نسبة المشاهدة</th>
                <th className="px-4 py-3">مدة المشاهدة</th>
                <th className="px-4 py-3">آخر نشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    لا يوجد طلاب مطابقين للفلتر الحالي.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s: ApiLessonAnalyticsStudent) => (
                  <tr key={s.studentId} className="transition hover:bg-muted/20">
                    {/* Student Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {s.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt={s.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            s.name.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      {s.status === WatchStatus.COMPLETED ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>مكتمل</span>
                        </span>
                      ) : s.status === WatchStatus.IN_PROGRESS ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>جاري المشاهدة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>لم يبدأ</span>
                        </span>
                      )}
                    </td>

                    {/* Progress Bar & Percentage */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              s.percentage >= 85
                                ? "bg-emerald-500"
                                : s.percentage > 0
                                ? "bg-amber-500"
                                : "bg-muted-foreground/30"
                            }`}
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {s.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Exact Position */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {s.formattedPosition}
                    </td>

                    {/* Last Watched At */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {s.lastWatchedAt
                        ? new Date(s.lastWatchedAt).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
