import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import {
  createDailyQuestionSchema,
  answerDailyQuestionSchema,
} from "./daily-question.schemas";
import * as DailyQuestionController from "./daily-question.controller";

export const dailyQuestionRouter = Router();

dailyQuestionRouter.use(authenticate, userLimiter);

// Teacher creates/updates daily question
dailyQuestionRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createDailyQuestionSchema),
  DailyQuestionController.createOrUpdateDailyQuestion
);

// Teacher lists past questions
dailyQuestionRouter.get(
  "/classroom/:classroomId",
  authorize(Role.TEACHER, Role.ADMIN),
  DailyQuestionController.getTeacherDailyQuestions
);

// Student fetches today's question
dailyQuestionRouter.get("/today", DailyQuestionController.getTodayQuestion);

// Student submits answer
dailyQuestionRouter.post(
  "/:id/answer",
  authorize(Role.STUDENT),
  validate(answerDailyQuestionSchema),
  DailyQuestionController.answerDailyQuestion
);
