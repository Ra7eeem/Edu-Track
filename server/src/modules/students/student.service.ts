import mongoose from "mongoose";
import { User } from "../../models/User";
import { GroupMembership } from "../../models/GroupMembership";
import { JoinRequest } from "../../models/JoinRequest";
import { MonthlyScore } from "../../models/MonthlyScore";
import { ApiError } from "../../utils/ApiError";
import { getFileUrl } from "../../middleware/upload";
import { Request } from "express";
import { UpdateStudentProfileDto } from "./student.schemas";
import { getMyAttendance } from "../attendance/attendance.service";
import { parseMonthYear } from "../../utils/date";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";

export async function getMyProfile(studentId: string) {
  const student = await User.findById(studentId);
  if (!student) throw ApiError.notFound("المستخدم غير موجود");
  return student;
}

export async function updateMyProfile(
  studentId: string,
  dto: UpdateStudentProfileDto,
  avatarFilename?: string
) {
  const update: Record<string, unknown> = { ...dto };
  if (avatarFilename) update.avatarUrl = getFileUrl(avatarFilename);

  const student = await User.findByIdAndUpdate(studentId, update, {
    new: true,
    runValidators: true,
  });
  if (!student) throw ApiError.notFound("المستخدم غير موجود");
  return student;
}

export async function getMyGroups(studentId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [memberships, total] = await Promise.all([
    GroupMembership.find({ student: studentId, isActive: true })
      .populate("group", "name description imageUrl createdAt")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit),
    GroupMembership.countDocuments({ student: studentId, isActive: true }),
  ]);
  return {
    data: memberships.map((m) => m.group),
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getMyJoinRequests(studentId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    JoinRequest.find({ student: studentId })
      .populate("group", "name imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JoinRequest.countDocuments({ student: studentId }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getMyAttendanceInGroup(
  studentId: string,
  groupId: string,
  req: Request
) {
  return getMyAttendance(studentId, groupId, req);
}

export async function getMyScores(studentId: string, req: Request) {
  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  const scores = await MonthlyScore.find({ student: studentId, month, year })
    .populate("group", "name imageUrl")
    .lean();

  return { month, year, scores };
}
