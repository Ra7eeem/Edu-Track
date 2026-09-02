import mongoose from "mongoose";
import { Assignment } from "../../models/Assignment";
import { ExamSubmission } from "../../models/ExamSubmission";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./assignment.schemas";

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

  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    Assignment.find({ group: groupId })
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Assignment.countDocuments({ group: groupId }),
  ]);

  // Strip correctAnswer from questions when the viewer is a student
  const safeData = role === "STUDENT"
    ? data.map(a => {
        const obj = a.toObject()
        obj.questions = obj.questions.map(({ correctAnswer: _, ...q }) => q)
        return obj
      })
    : data

  return { data: safeData, pagination: buildPaginationMeta(total, page, limit) };
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

  // Verify student is a member of the group
  const membership = await GroupMembership.findOne({
    student: studentId, group: assignment.group, isActive: true,
  });
  if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  // Prevent duplicate submission
  const existing = await ExamSubmission.findOne({ assignment: assignmentId, student: studentId });
  if (existing) throw ApiError.conflict("لقد سبق وأرسلت إجاباتك لهذا الامتحان");

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

  return submission;
}

// ─── Get student's own submission ────────────────────────────────────────────
export async function getMySubmission(studentId: string, assignmentId: string) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    throw ApiError.badRequest("معرّف غير صالح");

  const sub = await ExamSubmission.findOne({ assignment: assignmentId, student: studentId })
    .populate("student", "name email grade")
    .lean();
  return sub;
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
