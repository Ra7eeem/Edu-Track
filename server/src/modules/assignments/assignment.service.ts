import mongoose from "mongoose";
import { Assignment, AssignmentType, IQuestion } from "../../models/Assignment";
import { ExamSubmission } from "../../models/ExamSubmission";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./assignment.schemas";

function resultsAreVisible(showResults: boolean | undefined): boolean {
  // Missing field on older documents should keep the previous default (visible).
  return showResults !== false;
}

function stripCorrectAnswers(questions: IQuestion[]) {
  return questions.map(({ correctAnswer: _correct, ...question }) => question);
}

function toPublicStudentAssignment(
  assignment: Record<string, unknown>,
  options: { includeQuestions: boolean; submission?: { submittedAt: Date; score: number; total: number } | null }
) {
  const rawQuestions = (assignment.questions as IQuestion[] | undefined) ?? []
  const showResults = resultsAreVisible(assignment.showResults as boolean | undefined);
  const questions = options.includeQuestions ? stripCorrectAnswers(rawQuestions) : [];

  const submission = options.submission
    ? showResults
      ? {
          submitted:    true,
          submittedAt:  options.submission.submittedAt,
          score:         options.submission.score,
          total:         options.submission.total,
        }
      : { submitted: true, submittedAt: options.submission.submittedAt }
    : null;

  return {
    ...assignment,
    groupId:     String(assignment.group),
    showResults,
    questions,
    questionCount: rawQuestions.length,
    mySubmission: submission,
  };
}

// ─── Teacher creates assignment ───────────────────────────────────────────────
export async function createAssignment(teacherId: string, dto: CreateAssignmentDto) {
  await assertTeacherOwnsGroup(teacherId, dto.groupId);

  const assignment = await Assignment.create({
    group:           dto.groupId,
    author:          teacherId,
    type:            dto.type,
    title:           dto.title,
    description:     dto.description     ?? null,
    youtubeUrl:      dto.youtubeUrl      || null,
    dueDate:         dto.dueDate         ? new Date(dto.dueDate) : null,
    durationMinutes: dto.durationMinutes ?? null,
    availableFrom:   dto.availableFrom   ? new Date(dto.availableFrom)   : null,
    availableTo:     dto.availableTo     ? new Date(dto.availableTo)     : null,
    questions:       dto.questions       ?? [],
  });

  return assignment.populate("author", "name avatarUrl");
}

// ─── Teacher lists assignments for their group ────────────────────────────────
export async function getGroupAssignments(
  groupId:  string,
  req:      Request,
  viewerId: string,
  role:     string
) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  if (role === "TEACHER") await assertTeacherOwnsGroup(viewerId, groupId);

  if (role === "STUDENT") {
    const membership = await GroupMembership.findOne({
      student: viewerId, group: groupId, isActive: true,
    });
    if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");
  }

  // Students only see non-hidden assignments
  const query = role === "STUDENT"
    ? { group: groupId, isHidden: { $ne: true } }
    : { group: groupId };

  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    Assignment.find(query)
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Assignment.countDocuments(query),
  ]);

  if (role !== "STUDENT") {
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  const examIds = data
    .filter((a) => a.type === AssignmentType.EXAM)
    .map((a) => a._id);

  const submissions = examIds.length
    ? await ExamSubmission.find({
        student:    viewerId,
        assignment: { $in: examIds },
      }).lean()
    : [];

  const submissionByAssignment = new Map(
    submissions.map((sub) => [String(sub.assignment), sub])
  );

  const safeData = data.map((assignment) => {
    const isExam = assignment.type === AssignmentType.EXAM;
    const submission = submissionByAssignment.get(String(assignment._id)) ?? null;
    return toPublicStudentAssignment(assignment as unknown as Record<string, unknown>, {
      includeQuestions: !isExam,
      submission,
    });
  });

  return { data: safeData, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getAssignment(
  assignmentId: string,
  viewerId:     string,
  role:         string
) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findById(assignmentId)
    .populate("author", "name avatarUrl")
    .lean();
  if (!assignment) throw ApiError.notFound("الواجب غير موجود");

  if (role === "TEACHER") {
    await assertTeacherOwnsGroup(viewerId, String(assignment.group));
    return assignment;
  }

  if (role !== "STUDENT") throw ApiError.forbidden("غير مصرح");

  const membership = await GroupMembership.findOne({
    student: viewerId, group: assignment.group, isActive: true,
  });
  if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");
  if (assignment.isHidden) throw ApiError.notFound("الواجب غير موجود");

  const submission = assignment.type === AssignmentType.EXAM
    ? await ExamSubmission.findOne({ assignment: assignmentId, student: viewerId }).lean()
    : null;

  return toPublicStudentAssignment(assignment as unknown as Record<string, unknown>, {
    includeQuestions: true,
    submission,
  });
}

// ─── Teacher updates assignment ───────────────────────────────────────────────
export async function updateAssignment(
  teacherId:    string,
  assignmentId: string,
  dto:          UpdateAssignmentDto
) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findOne({ _id: assignmentId, author: teacherId });
  if (!assignment) throw ApiError.notFound("الواجب غير موجود أو لا تملك صلاحية تعديله");

  Object.assign(assignment, {
    ...(dto.type            !== undefined && { type:            dto.type             }),
    ...(dto.title           !== undefined && { title:           dto.title            }),
    ...(dto.description     !== undefined && { description:     dto.description      }),
    ...(dto.youtubeUrl      !== undefined && { youtubeUrl:      dto.youtubeUrl || null }),
    ...(dto.dueDate         !== undefined && { dueDate:         dto.dueDate ? new Date(dto.dueDate) : null }),
    ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes  }),
    ...(dto.questions       !== undefined && { questions:       dto.questions        }),
  });

  await assignment.save();
  return assignment.populate("author", "name avatarUrl");
}

// ─── Teacher deletes assignment ───────────────────────────────────────────────
export async function deleteAssignment(teacherId: string, assignmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findOneAndDelete({
    _id:    assignmentId,
    author: teacherId,
  });
  if (!assignment) throw ApiError.notFound("الواجب غير موجود أو لا تملك صلاحية حذفه");
}

// ─── Student submits exam answers ─────────────────────────────────────────────
export async function submitExam(
  studentId:    string,
  assignmentId: string,
  answers:      { questionId: string; chosen: string }[]
) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw ApiError.notFound("الامتحان غير موجود");

  // Check availability window
  const now = new Date();
  if (assignment.availableFrom && now < assignment.availableFrom)
    throw ApiError.badRequest("لم يبدأ وقت الامتحان بعد");
  if (assignment.availableTo && now > assignment.availableTo)
    throw ApiError.badRequest("انتهى وقت الامتحان");

  // Verify student is a member of the group
  const membership = await GroupMembership.findOne({
    student: studentId, group: assignment.group, isActive: true,
  });
  if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  // One attempt only
  const existing = await ExamSubmission.findOne({ assignment: assignmentId, student: studentId });
  if (existing) throw ApiError.conflict("لقد سبق وأرسلت إجاباتك لهذا الامتحان — فرصة واحدة فقط");

  // Calculate score
  let score = 0;
  let total = 0;
  for (const q of assignment.questions) {
    const qid    = String(q._id);
    const points = q.points ?? 1;
    total       += points;
    const ans    = answers.find(a => a.questionId === qid);
    if (ans && ans.chosen === q.correctAnswer) score += points;
  }

  const submission = await ExamSubmission.create({
    assignment:  assignmentId,
    student:     studentId,
    group:       assignment.group,
    answers,
    score,
    total,
    submittedAt: new Date(),
  });

  if (!resultsAreVisible(assignment.showResults)) {
    return {
      _id:          submission._id,
      assignment:  assignmentId,
      submittedAt: submission.submittedAt,
      showResults: false,
    };
  }

  return {
    ...submission.toObject(),
    showResults: true,
    answersWithDetails: answers.map(a => {
      const q = assignment.questions.find(q => String(q._id) === a.questionId)
      return {
        questionId:    a.questionId,
        chosen:        a.chosen,
        questionText:  q?.text ?? "",
        correctAnswer: q?.correctAnswer ?? "",
        points:        q?.points ?? 1,
        isCorrect:     a.chosen === q?.correctAnswer,
      }
    }),
  };
}

// ─── Get student's own submission ────────────────────────────────────────────
export async function getMySubmission(studentId: string, assignmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw ApiError.notFound("الامتحان غير موجود");

  const membership = await GroupMembership.findOne({
    student: studentId, group: assignment.group, isActive: true,
  });
  if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  const sub = await ExamSubmission.findOne({ assignment: assignmentId, student: studentId })
    .populate("student", "name email grade")
    .lean();
  if (!sub) return null;

  if (!resultsAreVisible(assignment.showResults)) {
    return {
      _id:          sub._id,
      assignment:  assignmentId,
      submittedAt: sub.submittedAt,
      showResults: false,
    };
  }

  const questionsMap: Record<string, { text: string; correctAnswer: string; points: number }> = {};
  for (const q of assignment.questions) {
    questionsMap[String(q._id)] = {
      text:          q.text,
      correctAnswer: q.correctAnswer,
      points:        q.points ?? 1,
    };
  }

  return {
    ...sub,
    showResults: true,
    answersWithDetails: sub.answers.map((a) => ({
      ...a,
      questionText:  questionsMap[a.questionId]?.text ?? "",
      correctAnswer: questionsMap[a.questionId]?.correctAnswer ?? "",
      points:        questionsMap[a.questionId]?.points ?? 1,
      isCorrect:     a.chosen === questionsMap[a.questionId]?.correctAnswer,
    })),
  };
}

// ─── Teacher views all submissions for an exam ───────────────────────────────
export async function getExamSubmissions(
  teacherId:    string,
  assignmentId: string,
  req:          Request
) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw ApiError.notFound("الامتحان غير موجود");

  // Verify teacher owns this group
  await assertTeacherOwnsGroup(teacherId, String(assignment.group));

  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    ExamSubmission.find({ assignment: assignmentId })
      .populate("student", "name email grade")
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ExamSubmission.countDocuments({ assignment: assignmentId }),
  ]);

  // Attach question texts to each answer for display
  const questionsMap: Record<string, { text: string; correctAnswer: string; points: number }> = {};
  for (const q of assignment.questions) {
    questionsMap[String(q._id)] = { text: q.text, correctAnswer: q.correctAnswer, points: q.points ?? 1 };
  }

  const enriched = data.map(sub => ({
    ...sub,
    answersWithDetails: sub.answers.map(a => ({
      ...a,
      questionText:  questionsMap[a.questionId]?.text    ?? "",
      correctAnswer: questionsMap[a.questionId]?.correctAnswer ?? "",
      points:        questionsMap[a.questionId]?.points  ?? 1,
      isCorrect:     a.chosen === questionsMap[a.questionId]?.correctAnswer,
    })),
  }));

  return { data: enriched, pagination: buildPaginationMeta(total, page, limit) };
}

// ─── Teacher toggles visibility ───────────────────────────────────────────────
export async function toggleVisibility(teacherId: string, assignmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findOne({ _id: assignmentId, author: teacherId });
  if (!assignment) throw ApiError.notFound("الواجب غير موجود أو لا تملك صلاحية تعديله");

  assignment.isHidden = !assignment.isHidden;
  await assignment.save();
  return assignment;
}

// ─── Teacher toggles result visibility ───────────────────────────────────────
export async function toggleResults(teacherId: string, assignmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const assignment = await Assignment.findOne({ _id: assignmentId, author: teacherId });
  if (!assignment) throw ApiError.notFound("الواجب غير موجود أو لا تملك صلاحية تعديله");

  assignment.showResults = !assignment.showResults;
  await assignment.save();
  return assignment;
}
