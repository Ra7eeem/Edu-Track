import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { userLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import {
  createCourseSchema,
  createLessonSchema,
  updateLessonProgressSchema,
  createLessonCommentSchema,
} from "./courses.schemas";
import * as CoursesController from "./courses.controller";

export const courseRouter = Router();
export const lessonRouter = Router();

// Apply auth and user rate limiter across all routes
courseRouter.use(authenticate, userLimiter);
lessonRouter.use(authenticate, userLimiter);

// ── Course routes ──────────────────────────────────────
courseRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createCourseSchema),
  CoursesController.createCourse
);

courseRouter.get("/my-courses", CoursesController.getMyCourses);
courseRouter.get("/classroom/:classroomId", CoursesController.getGroupCourses);

courseRouter.delete(
  "/:courseId",
  authorize(Role.TEACHER, Role.ADMIN),
  CoursesController.deleteCourse
);

courseRouter.post(
  "/:courseId/lessons",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createLessonSchema),
  CoursesController.createLesson
);

// ── Lesson routes ──────────────────────────────────────
lessonRouter.get("/:lessonId", CoursesController.getLesson);

lessonRouter.delete(
  "/:lessonId",
  authorize(Role.TEACHER, Role.ADMIN),
  CoursesController.deleteLesson
);

lessonRouter.patch(
  "/:lessonId/progress",
  authorize(Role.STUDENT),
  validate(updateLessonProgressSchema),
  CoursesController.updateLessonProgress
);

lessonRouter.get(
  "/:lessonId/analytics",
  authorize(Role.TEACHER, Role.ADMIN),
  CoursesController.getLessonAnalytics
);

lessonRouter.post(
  "/:lessonId/remind-pending",
  authorize(Role.TEACHER, Role.ADMIN),
  CoursesController.sendLessonReminder
);

lessonRouter.post(
  "/:lessonId/remind",
  authorize(Role.TEACHER, Role.ADMIN),
  CoursesController.sendLessonReminder
);

// ── Comments routes ────────────────────────────────────
lessonRouter.get("/:lessonId/comments", CoursesController.getLessonComments);

lessonRouter.post(
  "/:lessonId/comments",
  validate(createLessonCommentSchema),
  CoursesController.createLessonComment
);

lessonRouter.delete(
  "/:lessonId/comments/:commentId",
  CoursesController.deleteLessonComment
);

