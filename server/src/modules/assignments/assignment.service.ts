import mongoose from "mongoose";
import { Assignment } from "../../models/Assignment";
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

  return { data, pagination: buildPaginationMeta(total, page, limit) };
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
