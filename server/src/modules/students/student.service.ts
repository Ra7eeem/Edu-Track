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

// ─────────────────────────────────────────
// Dashboard — all data in one roundtrip
// ─────────────────────────────────────────

export async function getDashboard(studentId: string) {
  const now   = new Date();
  const month = now.getUTCMonth() + 1;
  const year  = now.getUTCFullYear();

  // Step 1: profile + groups + notifications in parallel
  const { Notification } = await import("../../models/Notification");
  const { Post }         = await import("../../models/Post");

  const [student, memberships, recentNotifs] = await Promise.all([
    User.findById(studentId).select("-passwordHash").lean(),
    GroupMembership.find({ student: studentId, isActive: true })
      .populate("group", "name description imageUrl grades createdAt updatedAt")
      .sort({ joinedAt: -1 })
      .limit(3)
      .lean(),
    Notification.find({ recipient: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  if (!student) throw ApiError.notFound("المستخدم غير موجود");

  const firstGroupRaw = memberships[0]?.group;
  const firstGroup    = firstGroupRaw as unknown as (Record<string, unknown> & { _id: unknown }) | undefined;
  const groupId       = firstGroup ? String(firstGroup._id) : null;

  // Step 2: if group exists, fetch posts + ranking in parallel
  let posts:   unknown[] = [];
  let rankData: unknown  = null;

  if (groupId) {
    const { MonthlyScore: MS } = await import("../../models/MonthlyScore");
    const [postsRaw, scores] = await Promise.all([
      Post.find({ group: groupId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("author", "name avatarUrl")
        .lean(),
      MS.find({ student: studentId, group: groupId, month, year }).lean(),
    ]);

    posts = postsRaw;

    // Compute rank among group members for this month
    const allScores = await MS.find({ group: groupId, month, year })
      .sort({ score: -1 })
      .lean();

    const myScore  = scores[0];
    const rankIdx  = allScores.findIndex(s => String(s.student) === studentId);

    rankData = myScore ? {
      rank:         rankIdx + 1,
      score:        myScore.score,
      presentCount: myScore.presentCount,
      absentCount:  myScore.absentCount,
      totalMembers: allScores.length,
    } : null;
  }

  const unreadCount = await (await import("../../models/Notification"))
    .Notification.countDocuments({ recipient: studentId, isRead: false });

  return {
    student,
    groups:       memberships.map(m => m.group),
    notifications: recentNotifs,
    unreadCount,
    firstGroup,
    posts,
    rank: rankData,
  };
}
