import mongoose from "mongoose";
import { DailyQuestion, IDailyQuestion } from "../../models/DailyQuestion";
import { DailyAnswer } from "../../models/DailyAnswer";
import { StudentScore } from "../../models/StudentScore";
import { Team } from "../../models/Team";
import { ScoreLog } from "../../models/ScoreLog";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";
import {
  CreateDailyQuestionDto,
  AnswerDailyQuestionDto,
} from "./daily-question.schemas";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ─────────────────────────────────────────
// 1. Teacher creates or updates daily question
// ─────────────────────────────────────────
export async function createOrUpdateDailyQuestion(
  teacherId: string,
  dto: CreateDailyQuestionDto
) {
  await assertTeacherOwnsGroup(teacherId, dto.classroomId);

  const date = dto.date || getTodayString();

  const question = await DailyQuestion.findOneAndUpdate(
    { classroom: dto.classroomId, date },
    {
      $set: {
        teacher: teacherId,
        question: dto.question.trim(),
        options: dto.options.map((o) => o.trim()),
        correctOptionIndex: dto.correctOptionIndex,
        explanation: dto.explanation?.trim(),
        rewardPoints: dto.rewardPoints ?? 0,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  return question;
}

// ─────────────────────────────────────────
// 2. Student fetches today's question (with anti-cheat sanitization)
// ─────────────────────────────────────────
export async function getTodayQuestion(
  studentId: string,
  classroomId: string,
  targetDate?: string
) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }

  // Validate student is a member of this classroom
  const isMember = await GroupMembership.exists({
    group: classroomId,
    student: studentId,
    isActive: true,
  });
  if (!isMember) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  const date = targetDate || getTodayString();

  const question = await DailyQuestion.findOne({
    classroom: classroomId,
    date,
    isActive: true,
  }).lean();

  if (!question) return null;

  // Check if student already answered
  const previousAnswer = await DailyAnswer.findOne({
    dailyQuestion: question._id,
    student: studentId,
  }).lean();

  if (previousAnswer) {
    // Student already answered: send full details including correct option and explanation
    return {
      _id: question._id,
      classroom: question.classroom,
      date: question.date,
      question: question.question,
      options: question.options,
      rewardPoints: question.rewardPoints,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      alreadyAnswered: true,
      previousAnswer: {
        selectedOptionIndex: previousAnswer.selectedOptionIndex,
        isCorrect: previousAnswer.isCorrect,
        pointsEarned: previousAnswer.pointsEarned,
        answeredAt: previousAnswer.answeredAt,
      },
    };
  }

  // 🔒 ANTI-CHEAT: Strip correctOptionIndex and explanation if not answered yet!
  return {
    _id: question._id,
    classroom: question.classroom,
    date: question.date,
    question: question.question,
    options: question.options,
    rewardPoints: question.rewardPoints,
    alreadyAnswered: false,
    previousAnswer: null,
  };
}

// ─────────────────────────────────────────
// 3. Student submits answer to daily question
// ─────────────────────────────────────────
export async function answerDailyQuestion(
  studentId: string,
  questionId: string,
  dto: AnswerDailyQuestionDto
) {
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }

  const question = await DailyQuestion.findById(questionId);
  if (!question || !question.isActive) {
    throw ApiError.notFound("سؤال اليوم غير متاح");
  }

  // Validate student is member of this classroom
  const isMember = await GroupMembership.exists({
    group: question.classroom,
    student: studentId,
    isActive: true,
  });
  if (!isMember) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  // Prevent multiple answers
  const existingAnswer = await DailyAnswer.findOne({
    dailyQuestion: question._id,
    student: studentId,
  });
  if (existingAnswer) {
    throw ApiError.conflict("لقد قمت بالإجابة على سؤال اليوم بالفعل!");
  }

  const isCorrect = dto.selectedOptionIndex === question.correctOptionIndex;
  // Strictly 0 points/grades: السؤال اليومي بدون درجات
  const pointsEarned = 0;

  const answer = await DailyAnswer.create({
    dailyQuestion: question._id,
    student: studentId,
    classroom: question.classroom,
    selectedOptionIndex: dto.selectedOptionIndex,
    isCorrect,
    pointsEarned: 0,
    answeredAt: new Date(),
  });

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    pointsEarned: 0,
    selectedOptionIndex: dto.selectedOptionIndex,
    answerId: answer._id,
  };
}

// ─────────────────────────────────────────
// 4. Teacher lists daily questions for classroom
// ─────────────────────────────────────────
export async function getTeacherDailyQuestions(
  teacherId: string,
  classroomId: string
): Promise<Record<string, unknown>[]> {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) throw ApiError.badRequest("معرّف غير صالح");
  await assertTeacherOwnsGroup(teacherId, classroomId);

  const questions = await DailyQuestion.find({ classroom: classroomId })
    .sort({ date: -1 })
    .limit(30)
    .lean();

  const questionIds = questions.map((q) => q._id);
  const answerStats = await DailyAnswer.aggregate([
    { $match: { dailyQuestion: { $in: questionIds } } },
    {
      $group: {
        _id: "$dailyQuestion",
        totalAnswers: { $sum: 1 },
        correctAnswers: { $sum: { $cond: ["$isCorrect", 1, 0] } },
      },
    },
  ]);

  const statsMap = new Map<string, { totalAnswers: number; correctAnswers: number }>();
  for (const s of answerStats) {
    statsMap.set(String(s._id), {
      totalAnswers: s.totalAnswers,
      correctAnswers: s.correctAnswers,
    });
  }

  return questions.map((q) => ({
    ...q,
    stats: statsMap.get(String(q._id)) || { totalAnswers: 0, correctAnswers: 0 },
  }));
}
