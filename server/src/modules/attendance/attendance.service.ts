import mongoose from "mongoose";
import { Attendance } from "../../models/Attendance";
import { StudentScore } from "../../models/StudentScore";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { AttendanceStatus } from "../../types";
import { toDateOnly, parseMonthYear } from "../../utils/date";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { ATTENDANCE_SCORE } from "../../config/constants";
import { Request } from "express";
import { RecordAttendanceDto } from "./attendance.schemas";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";

// ─────────────────────────────────────────
// Record / upsert attendance (idempotent)
// ─────────────────────────────────────────

export async function recordAttendance(
  teacherId: string,
  groupId: string,
  dto: RecordAttendanceDto
) {
  await assertTeacherOwnsGroup(teacherId, groupId);

  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف المجموعة غير صالح");

  const date = toDateOnly(dto.date);
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  // Validate all students are members of the group
  const studentIds = dto.records.map((r) => r.studentId);
  const memberships = await GroupMembership.find({
    group: groupId,
    student: { $in: studentIds },
    isActive: true,
  }).select("student");
  const memberSet = new Set(memberships.map((m) => String(m.student)));

  const invalidStudents = studentIds.filter((id) => !memberSet.has(id));
  if (invalidStudents.length > 0) {
    throw ApiError.badRequest(
      `الطلاب التالية معرّفاتهم غير مسجلين في المجموعة: ${invalidStudents.join(", ")}`
    );
  }

  // Build records array
  const records = dto.records.map((r) => ({
    student: new mongoose.Types.ObjectId(r.studentId),
    status: r.status,
  }));

  // Find old session to compute diffs
  const oldSession = await Attendance.findOne({ group: groupId, date }).lean();

  // Upsert session — idempotent: replace records for this date
  const session = await Attendance.findOneAndUpdate(
    { group: groupId, date },
    { $set: { records, createdBy: teacherId } },
    { upsert: true, new: true }
  );

  // Compute diffs and update StudentScore continuously
  const scoreOps = dto.records.map((r) => {
    const newStatus = r.status;
    const oldRecord = oldSession?.records.find((old) => String(old.student) === r.studentId);
    const oldStatus = oldRecord?.status;

    let incScore = ATTENDANCE_SCORE[newStatus] ?? 0;
    let incPresent = newStatus === AttendanceStatus.PRESENT ? 1 : 0;
    let incLate = newStatus === AttendanceStatus.LATE ? 1 : 0;
    let incAbsent = newStatus === AttendanceStatus.ABSENT ? 1 : 0;

    if (oldStatus) {
      incScore -= ATTENDANCE_SCORE[oldStatus] ?? 0;
      incPresent -= oldStatus === AttendanceStatus.PRESENT ? 1 : 0;
      incLate -= oldStatus === AttendanceStatus.LATE ? 1 : 0;
      incAbsent -= oldStatus === AttendanceStatus.ABSENT ? 1 : 0;
    }

    return StudentScore.findOneAndUpdate(
      { student: r.studentId, group: groupId },
      {
        $setOnInsert: { student: r.studentId, group: groupId, bonusPoints: 0 },
        $inc: {
          score: incScore,
          presentCount: incPresent,
          lateCount: incLate,
          absentCount: incAbsent,
        }
      },
      { upsert: true, new: true }
    );
  });

  await Promise.all(scoreOps);
}

// ─────────────────────────────────────────
// Get attendance history for a group
// ─────────────────────────────────────────

export async function getAttendanceHistory(
  groupId: string,
  req: Request,
  viewerId: string,
  viewerRole: string
) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  // Teacher must own the group, admin can see all
  if (viewerRole === "TEACHER") {
    await assertTeacherOwnsGroup(viewerId, groupId);
  }

  const { page, limit, skip } = parsePagination(req);
  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );
  const studentId = req.query.studentId as string | undefined;

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const filter: mongoose.FilterQuery<typeof Attendance> = {
    group: groupId,
    date: { $gte: startDate, $lt: endDate },
  };

  const [sessions, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(filter),
  ]);

  // If filtering by student, narrow down records
  const data = studentId
    ? sessions.map((s) => ({
        ...s,
        records: s.records.filter(
          (r) => String(r.student) === studentId
        ),
      }))
    : sessions;

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

// ─────────────────────────────────────────
// Student views their own attendance
// ─────────────────────────────────────────

export async function getMyAttendance(
  studentId: string,
  groupId: string,
  req: Request
) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  const membership = await GroupMembership.findOne({
    student: studentId,
    group: groupId,
    isActive: true,
  });
  if (!membership)
    throw ApiError.forbidden("أنت لست عضواً في هذه المجموعة");

  const { page, limit, skip } = parsePagination(req);
  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const sessions = await Attendance.find({
    group: groupId,
    date: { $gte: startDate, $lt: endDate },
  })
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const data = sessions.map((s) => ({
    date: s.date,
    record: s.records.find((r) => String(r.student) === studentId) ?? null,
  }));

  const total = await Attendance.countDocuments({
    group: groupId,
    date: { $gte: startDate, $lt: endDate },
  });

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}
