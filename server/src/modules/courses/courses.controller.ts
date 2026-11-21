import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as CoursesService from "./courses.service";
import {
  CreateCourseDto,
  CreateLessonDto,
  UpdateLessonProgressDto,
  CreateLessonCommentDto,
} from "./courses.schemas";

const p = (v: string | string[]): string => String(v);

// ── Courses ──────────────────────────────────────────

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await CoursesService.createCourse(
    req.user!.userId,
    req.body as CreateCourseDto
  );
  sendSuccess(res, course, 201, "تم إنشاء الكورس بنجاح");
});

export const getGroupCourses = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.user?.role === "STUDENT" ? req.user.userId : undefined;
  const courses = await CoursesService.getGroupCourses(
    p(req.params.classroomId),
    studentId
  );
  sendSuccess(res, courses);
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await CoursesService.deleteCourse(
    req.user!.userId,
    p(req.params.courseId)
  );
  sendSuccess(res, result, 200, "تم حذف الكورس بنجاح");
});

// ── Lessons ──────────────────────────────────────────

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await CoursesService.createLesson(
    req.user!.userId,
    p(req.params.courseId),
    req.body as CreateLessonDto
  );
  sendSuccess(res, lesson, 201, "تم إضافة الدرس بنجاح");
});

export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const data = await CoursesService.getLesson(
    p(req.params.lessonId),
    req.user!.userId
  );
  sendSuccess(res, data);
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const result = await CoursesService.deleteLesson(
    req.user!.userId,
    p(req.params.lessonId)
  );
  sendSuccess(res, result, 200, "تم حذف الدرس بنجاح");
});

export const updateLessonProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await CoursesService.updateLessonProgress(
    req.user!.userId,
    p(req.params.lessonId),
    req.body as UpdateLessonProgressDto
  );
  sendSuccess(res, progress, 200, "تم تحديث مستوى مشاهدة الدرس");
});

export const getLessonAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await CoursesService.getLessonAnalytics(
    req.user!.userId,
    p(req.params.lessonId)
  );
  sendSuccess(res, analytics);
});

export const sendLessonReminder = asyncHandler(async (req: Request, res: Response) => {
  const result = await CoursesService.sendLessonReminder(
    req.user!.userId,
    p(req.params.lessonId)
  );
  sendSuccess(res, result, 200, `تم إرسال التنبيه إلى ${result.notifiedCount} طالب بنجاح`);
});

// ── Comments ──────────────────────────────────────────

export const getLessonComments = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
  const comments = await CoursesService.getLessonComments(
    p(req.params.lessonId),
    limit
  );
  sendSuccess(res, comments);
});

export const createLessonComment = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body as CreateLessonCommentDto;
  const comment = await CoursesService.createLessonComment(
    req.user!.userId,
    p(req.params.lessonId),
    content
  );
  sendSuccess(res, comment, 201, "تم إضافة التعليق بنجاح");
});

export const deleteLessonComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await CoursesService.deleteLessonComment(
    req.user!.userId,
    req.user!.role,
    p(req.params.commentId)
  );
  sendSuccess(res, result, 200, "تم حذف التعليق بنجاح");
});
