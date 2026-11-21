"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroupCoursesApi,
  createCourseApi,
  deleteCourseApi,
  createLessonApi,
  getLessonApi,
  deleteLessonApi,
  updateLessonProgressApi,
  getLessonAnalyticsApi,
  sendLessonReminderApi,
  getLessonCommentsApi,
  createLessonCommentApi,
  deleteLessonCommentApi,
} from "../apis/courses.api";

export const courseKeys = {
  all: ["courses"] as const,
  byGroup: (groupId: string) => [...courseKeys.all, "group", groupId] as const,
  lesson: (lessonId: string) => ["lesson", lessonId] as const,
  analytics: (lessonId: string) => ["lesson-analytics", lessonId] as const,
  comments: (lessonId: string) => ["lesson-comments", lessonId] as const,
};

export function useGroupCourses(classroomId: string) {
  return useQuery({
    queryKey: courseKeys.byGroup(classroomId),
    queryFn: () => getGroupCoursesApi(classroomId),
    enabled: Boolean(classroomId),
    staleTime: 30 * 1000,
  });
}

export function useCreateCourse(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      thumbnailUrl?: string | null;
      order?: number;
    }) => createCourseApi({ ...data, classroomId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.byGroup(classroomId) });
    },
  });
}

export function useDeleteCourse(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => deleteCourseApi(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.byGroup(classroomId) });
    },
  });
}

export function useCreateLesson(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: {
        title: string;
        description?: string;
        youtubeUrl: string;
        durationSeconds?: number;
        order?: number;
      };
    }) => createLessonApi(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.byGroup(classroomId) });
    },
  });
}

export function useDeleteLesson(classroomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => deleteLessonApi(lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.byGroup(classroomId) });
    },
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: courseKeys.lesson(lessonId),
    queryFn: () => getLessonApi(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateLessonProgress(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      currentPositionSeconds: number;
      durationSeconds: number;
      isEnded?: boolean;
    }) => updateLessonProgressApi(lessonId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.lesson(lessonId) });
      qc.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useLessonAnalytics(lessonId: string) {
  return useQuery({
    queryKey: courseKeys.analytics(lessonId),
    queryFn: () => getLessonAnalyticsApi(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 10 * 1000,
  });
}

export function useSendLessonReminder(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sendLessonReminderApi(lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.analytics(lessonId) });
    },
  });
}

export function useLessonComments(lessonId: string) {
  return useQuery({
    queryKey: courseKeys.comments(lessonId),
    queryFn: () => getLessonCommentsApi(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 15 * 1000,
  });
}

export function useCreateLessonComment(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createLessonCommentApi(lessonId, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.comments(lessonId) });
    },
  });
}

export function useDeleteLessonComment(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteLessonCommentApi(lessonId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: courseKeys.comments(lessonId) });
    },
  });
}
