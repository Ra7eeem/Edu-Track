import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as DailyQuestionService from "./daily-question.service";
import {
  CreateDailyQuestionDto,
  AnswerDailyQuestionDto,
} from "./daily-question.schemas";

const p = (v: string | string[]): string => String(v);

export const createOrUpdateDailyQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const question = await DailyQuestionService.createOrUpdateDailyQuestion(
      req.user!.userId,
      req.body as CreateDailyQuestionDto
    );
    sendSuccess(res, question, 201, "تم حفظ سؤال اليوم بنجاح");
  }
);

export const getTodayQuestion = asyncHandler(async (req: Request, res: Response) => {
  const classroomId = p(req.query.classroomId as string);
  const date = req.query.date as string | undefined;
  const question = await DailyQuestionService.getTodayQuestion(
    req.user!.userId,
    classroomId,
    date
  );
  sendSuccess(res, question);
});

export const answerDailyQuestion = asyncHandler(async (req: Request, res: Response) => {
  const result = await DailyQuestionService.answerDailyQuestion(
    req.user!.userId,
    p(req.params.id),
    req.body as AnswerDailyQuestionDto
  );
  sendSuccess(res, result, 200, result.isCorrect ? "إجابة صحيحة! أحسنت 🎉" : "إجابة خاطئة");
});

export const getTeacherDailyQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const questions = await DailyQuestionService.getTeacherDailyQuestions(
      req.user!.userId,
      p(req.params.classroomId)
    );
    sendSuccess(res, questions);
  }
);
