import { clientFetch } from "@/shared/lib/api-client";
import {
  ApiCourse,
  ApiLesson,
  ApiLessonProgress,
  ApiLessonAnalytics,
  ApiLessonComment,
} from "@/shared/types/api";

export async function getGroupCoursesApi(classroomId: string): Promise<ApiCourse[]> {
  const res = await clientFetch<ApiCourse[]>(`/api/v1/courses/classroom/${classroomId}`);
  return Array.isArray(res) ? res : ((res as any)?.data ?? []);
}

export async function getMyCoursesApi(classroomId?: string): Promise<ApiCourse[]> {
  const query = classroomId ? `?classroomId=${classroomId}` : "";
  const res = await clientFetch<ApiCourse[]>(`/api/v1/courses/my-courses${query}`);
  return Array.isArray(res) ? res : ((res as any)?.data ?? []);
}

export async function createCourseApi(data: {
  classroomId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  order?: number;
}): Promise<ApiCourse> {
  const res = await clientFetch<ApiCourse>("/api/v1/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return (res as any)?.data ?? res;
}

export async function deleteCourseApi(courseId: string): Promise<{ deleted: boolean }> {
  const res = await clientFetch<{ deleted: boolean }>(`/api/v1/courses/${courseId}`, {
    method: "DELETE",
  });
  return (res as any)?.data ?? res;
}

export async function createLessonApi(
  courseId: string,
  data: {
    title: string;
    description?: string;
    youtubeUrl: string;
    durationSeconds?: number;
    order?: number;
  }
): Promise<ApiLesson> {
  const res = await clientFetch<ApiLesson>(`/api/v1/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return (res as any)?.data ?? res;
}

export async function getLessonApi(lessonId: string): Promise<{
  lesson: ApiLesson;
  courseLessons: Array<{ _id: string; title: string; durationSeconds: number; order: number }>;
  progress: ApiLessonProgress;
}> {
  const res = await clientFetch<{
    lesson: ApiLesson;
    courseLessons: Array<{ _id: string; title: string; durationSeconds: number; order: number }>;
    progress: ApiLessonProgress;
  }>(`/api/v1/lessons/${lessonId}`);
  return (res as any)?.data ?? res;
}

export async function deleteLessonApi(lessonId: string): Promise<{ deleted: boolean }> {
  const res = await clientFetch<{ deleted: boolean }>(`/api/v1/lessons/${lessonId}`, {
    method: "DELETE",
  });
  return (res as any)?.data ?? res;
}

export async function updateLessonProgressApi(
  lessonId: string,
  data: {
    currentPositionSeconds: number;
    durationSeconds: number;
    isEnded?: boolean;
  }
): Promise<ApiLessonProgress> {
  const res = await clientFetch<ApiLessonProgress>(`/api/v1/lessons/${lessonId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return (res as any)?.data ?? res;
}

export async function getLessonAnalyticsApi(lessonId: string): Promise<ApiLessonAnalytics> {
  const res = await clientFetch<ApiLessonAnalytics>(`/api/v1/lessons/${lessonId}/analytics`);
  return (res as any)?.data ?? res;
}

export async function updateStudentProgressByTeacherApi(
  lessonId: string,
  studentId: string,
  isCompleted: boolean
): Promise<ApiLessonProgress> {
  const res = await clientFetch<ApiLessonProgress>(
    `/api/v1/lessons/${lessonId}/students/${studentId}/progress`,
    {
      method: "PATCH",
      body: JSON.stringify({ isCompleted }),
    }
  );
  return (res as any)?.data ?? res;
}

export async function sendLessonReminderApi(
  lessonId: string
): Promise<{ notifiedCount: number }> {
  const res = await clientFetch<{ notifiedCount: number }>(
    `/api/v1/lessons/${lessonId}/remind-pending`,
    {
      method: "POST",
    }
  );
  return (res as any)?.data ?? res;
}

export async function getLessonCommentsApi(
  lessonId: string,
  limit = 50
): Promise<ApiLessonComment[]> {
  const res = await clientFetch<ApiLessonComment[]>(
    `/api/v1/lessons/${lessonId}/comments?limit=${limit}`
  );
  return Array.isArray(res) ? res : ((res as any)?.data ?? []);
}

export async function createLessonCommentApi(
  lessonId: string,
  data: { content: string; parentId?: string | null }
): Promise<ApiLessonComment> {
  const res = await clientFetch<ApiLessonComment>(`/api/v1/lessons/${lessonId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return (res as any)?.data ?? res;
}

export async function deleteLessonCommentApi(
  lessonId: string,
  commentId: string
): Promise<{ deleted: boolean }> {
  const res = await clientFetch<{ deleted: boolean }>(
    `/api/v1/lessons/${lessonId}/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );
  return (res as any)?.data ?? res;
}
