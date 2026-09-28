import argon2 from "argon2";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import { GroupTeacher } from "../../models/GroupTeacher";
import { GroupMembership } from "../../models/GroupMembership";
import { JoinRequest } from "../../models/JoinRequest";
import { Notification } from "../../models/Notification";
import { ApiError } from "../../utils/ApiError";
import { Role, JoinRequestStatus, NotificationType } from "../../types";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import { AddStudentDto, UpdateProfileDto } from "./teacher.schemas";

// ─────────────────────────────────────────
// Guard — teacher must own the group
// ─────────────────────────────────────────

export async function assertTeacherOwnsGroup(
  teacherId: string,
  groupId: string
): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف المجموعة غير صالح");
  const link = await GroupTeacher.findOne({ group: groupId, teacher: teacherId });
  if (!link) throw ApiError.forbidden("لا تملك صلاحية الوصول لهذه المجموعة");
}

// ─────────────────────────────────────────
// My groups
// ─────────────────────────────────────────

export async function getMyGroups(teacherId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const links = await GroupTeacher.find({ teacher: teacherId })
    .populate({
      path: "group",
      match: { isActive: true },
    })
    .skip(skip)
    .limit(limit);

  const groups = links.map((l) => l.group).filter(Boolean);
  const total = await GroupTeacher.countDocuments({ teacher: teacherId });
  return { data: groups, pagination: buildPaginationMeta(total, page, limit) };
}

// ─────────────────────────────────────────
// Join requests (for my groups)
// ─────────────────────────────────────────

export async function getJoinRequests(teacherId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const status = req.query.status as JoinRequestStatus | undefined;

  // Find groups this teacher manages
  const teacherGroups = await GroupTeacher.find({ teacher: teacherId }).select("group");
  const groupIds = teacherGroups.map((g) => g.group);

  const filter: mongoose.FilterQuery<typeof JoinRequest> = { group: { $in: groupIds } };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    JoinRequest.find(filter)
      .populate("student", "name email phone grade avatarUrl")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JoinRequest.countDocuments(filter),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function approveJoinRequest(teacherId: string, requestId: string) {
  if (!mongoose.Types.ObjectId.isValid(requestId))
    throw ApiError.badRequest("معرّف غير صالح");

  const request = await JoinRequest.findById(requestId).populate("group");
  if (!request) throw ApiError.notFound("الطلب غير موجود");
  if (request.status !== JoinRequestStatus.PENDING)
    throw ApiError.conflict("تم البت في هذا الطلب مسبقاً");

  // Teacher must own this group
  await assertTeacherOwnsGroup(teacherId, String(request.group._id));

  // Approve
  request.status = JoinRequestStatus.APPROVED;
  request.reviewedAt = new Date();
  request.reviewedBy = new mongoose.Types.ObjectId(teacherId);
  await request.save();

  // Create membership
  await GroupMembership.create({
    student: request.student,
    group: request.group._id,
  });

  // Notify student
  const group = request.group as unknown as { name: string };
  await Notification.create({
    user: request.student,
    type: NotificationType.JOIN_REQUEST_APPROVED,
    title: "تمت الموافقة على طلب الانضمام",
    message: `تمت الموافقة على طلب انضمامك إلى مجموعة "${group.name}"`,
    metadata: { groupId: request.group._id, requestId: request._id },
  });

  return request;
}

export async function rejectJoinRequest(teacherId: string, requestId: string) {
  if (!mongoose.Types.ObjectId.isValid(requestId))
    throw ApiError.badRequest("معرّف غير صالح");

  const request = await JoinRequest.findById(requestId).populate("group");
  if (!request) throw ApiError.notFound("الطلب غير موجود");
  if (request.status !== JoinRequestStatus.PENDING)
    throw ApiError.conflict("تم البت في هذا الطلب مسبقاً");

  await assertTeacherOwnsGroup(teacherId, String(request.group._id));

  request.status = JoinRequestStatus.REJECTED;
  request.reviewedAt = new Date();
  request.reviewedBy = new mongoose.Types.ObjectId(teacherId);
  await request.save();

  const group = request.group as unknown as { name: string };
  await Notification.create({
    user: request.student,
    type: NotificationType.JOIN_REQUEST_REJECTED,
    title: "تم رفض طلب الانضمام",
    message: `تم رفض طلب انضمامك إلى مجموعة "${group.name}"`,
    metadata: { groupId: request.group._id, requestId: request._id },
  });

  return request;
}

// ─────────────────────────────────────────
// Students in my group
// ─────────────────────────────────────────

export async function getStudentsInGroup(
  teacherId: string,
  groupId: string,
  req: Request
) {
  await assertTeacherOwnsGroup(teacherId, groupId);
  const { page, limit, skip } = parsePagination(req);
  const search = String(req.query.search ?? "");
  const filter: mongoose.FilterQuery<typeof GroupMembership> = {
    group: groupId,
    isActive: true,
  };
  const memberships = await GroupMembership.find(filter)
    .populate({
      path: "student",
      match: search
        ? { name: { $regex: search, $options: "i" } }
        : undefined,
      select: "name email phone grade avatarUrl",
    })
    .sort({ joinedAt: -1 })
    .skip(skip)
    .limit(limit);

  const data = memberships.map((m) => m.student).filter(Boolean);
  const total = await GroupMembership.countDocuments(filter);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

// ─────────────────────────────────────────
// Teacher adds student directly
// ─────────────────────────────────────────

export async function addStudent(teacherId: string, dto: AddStudentDto) {
  await assertTeacherOwnsGroup(teacherId, dto.groupId);

  let student = await User.findOne({ email: dto.email });

  if (student) {
    // Student already exists — just create membership if not already a member
    if (student.role !== Role.STUDENT)
      throw ApiError.conflict("هذا البريد الإلكتروني مستخدم لحساب غير طالب");

    const existing = await GroupMembership.findOne({
      student: student._id,
      group: dto.groupId,
    });
    if (existing) throw ApiError.conflict("الطالب مضاف بالفعل إلى هذه المجموعة");
  } else {
    // Create new student account
    const passwordHash = await argon2.hash(dto.password);
    student = await User.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.STUDENT,
      phone: dto.phone,
      grade: dto.grade,
    });
  }

  const membership = await GroupMembership.create({
    student: student._id,
    group: dto.groupId,
  });

  // Also resolve any PENDING join request for this student+group
  await JoinRequest.findOneAndUpdate(
    { student: student._id, group: dto.groupId, status: JoinRequestStatus.PENDING },
    { status: JoinRequestStatus.APPROVED, reviewedAt: new Date(), reviewedBy: teacherId }
  );

  const group = await Group.findById(dto.groupId).select("name");
  await Notification.create({
    user: student._id,
    type: NotificationType.ADDED_TO_GROUP,
    title: "تمت إضافتك إلى مجموعة",
    message: `تمت إضافتك إلى مجموعة "${group?.name}"`,
    metadata: { groupId: dto.groupId },
  });

  return { student, membership };
}

// ─────────────────────────────────────────
// Remove student from group
// ─────────────────────────────────────────

export async function removeStudentFromGroup(
  teacherId: string,
  groupId: string,
  studentId: string
) {
  await assertTeacherOwnsGroup(teacherId, groupId);
  const membership = await GroupMembership.findOneAndDelete({
    student: studentId,
    group: groupId,
  });
  if (!membership) throw ApiError.notFound("الطالب غير موجود في هذه المجموعة");

  // Clean up the student's scores + attendance records for this group
  const { StudentScore } = await import("../../models/StudentScore");
  const { Attendance }   = await import("../../models/Attendance");

  await StudentScore.deleteMany({ student: studentId, group: groupId });

  // Remove this student's records from all attendance sessions of this group
  await Attendance.updateMany(
    { group: groupId },
    { $pull: { records: { student: studentId } } }
  );
}

// ─────────────────────────────────────────
// Teacher profile
// ─────────────────────────────────────────

export async function getProfile(teacherId: string) {
  const teacher = await User.findById(teacherId);
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  return teacher;
}

export async function updateProfile(teacherId: string, dto: UpdateProfileDto) {
  const teacher = await User.findByIdAndUpdate(teacherId, dto, {
    new: true,
    runValidators: true,
  });
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  return teacher;
}

// ─────────────────────────────────────────
// Dashboard — all data in one roundtrip
// ─────────────────────────────────────────

export async function getDashboard(teacherId: string) {
  const { Notification } = await import("../../models/Notification");
  const { Attendance }   = await import("../../models/Attendance");

  // Today date (UTC midnight)
  const now   = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // All data fetched in parallel
  // Group ids computed once (distinct) — reused by both the populated display list
  // and the attendance $in query, removing a duplicate GroupTeacher query.
  // Note: Notification field is `user` (not `recipient`) — wrong key made them empty.
  const [groupLinks, groupIds, recentNotifs, unreadCount] = await Promise.all([
    GroupTeacher.find({ teacher: teacherId })
      .populate({ path: "group", match: { isActive: true } })
      .limit(10),
    GroupTeacher.distinct("group", { teacher: teacherId }),
    Notification.find({ user: teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Notification.countDocuments({ user: teacherId, isRead: false }),
  ]);

  // Only `records` are needed for the aggregate → lighter transfer
  const todayAttendanceSessions = await Attendance.find({
    date: today,
    group: { $in: groupIds },
  })
    .select("records")
    .lean();

  const groups = groupLinks.map((l) => l.group).filter(Boolean);

  // Aggregate today's attendance across all teacher's groups
  let todayPresent = 0;
  let todayAbsent  = 0;
  for (const session of todayAttendanceSessions) {
    for (const rec of session.records) {
      if (rec.status === "PRESENT" || rec.status === "LATE") todayPresent++;
      else if (rec.status === "ABSENT") todayAbsent++;
    }
  }

  return {
    groups,
    notifications: recentNotifs,
    unreadCount,
    todayPresent,
    todayAbsent,
  };
}

// ─────────────────────────────────────────
// Student Profile (teacher view)
// ─────────────────────────────────────────

export async function getStudentProfile(
  teacherId: string,
  groupId:   string,
  studentId: string
) {
  await assertTeacherOwnsGroup(teacherId, groupId);

  const { User }          = await import("../../models/User");
  const { StudentScore }  = await import("../../models/StudentScore");
  const { Attendance }    = await import("../../models/Attendance");
  const { StudentNote }   = await import("../../models/StudentNote");

  const [student, scores, notes] = await Promise.all([
    User.findById(studentId).select("-passwordHash").lean(),
    StudentScore.find({ student: studentId, group: groupId })
      .sort({ year: -1, month: -1 })
      .lean(),
    StudentNote.find({ teacher: teacherId, student: studentId, group: groupId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!student) throw ApiError.notFound("الطالب غير موجود");

  // Attendance for the last 3 months
  const now      = new Date();
  const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
  const sessions = await Attendance.find({
    group:  groupId,
    date:   { $gte: fromDate },
  }).sort({ date: 1 }).lean();

  const attendanceRecords = sessions
    .map(s => {
      const rec = s.records.find(r => String(r.student) === studentId);
      return rec ? { date: s.date, status: rec.status } : null;
    })
    .filter(Boolean);

  return { student, scores, notes, attendanceRecords };
}

// ─────────────────────────────────────────
// Attendance Register (كشاف) — all students × all days
// ─────────────────────────────────────────

export async function getAttendanceRegister(
  teacherId: string,
  groupId:   string,
  month:     number,
  year:      number
) {
  await assertTeacherOwnsGroup(teacherId, groupId);

  const { Attendance }     = await import("../../models/Attendance");
  const { GroupMembership } = await import("../../models/GroupMembership");

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate   = new Date(Date.UTC(year, month, 1));

  const [sessions, memberships] = await Promise.all([
    Attendance.find({ group: groupId, date: { $gte: startDate, $lt: endDate } })
      .sort({ date: 1 })
      .lean(),
    GroupMembership.find({ group: groupId, isActive: true })
      .populate("student", "name")
      .lean(),
  ]);

  // All unique dates in this month that have sessions
  const dates = sessions.map(s => s.date.toISOString().split("T")[0]);

  // Build matrix: studentId → { date → status }
  const matrix: Record<string, Record<string, string>> = {};
  for (const session of sessions) {
    const dateKey = session.date.toISOString().split("T")[0];
    for (const rec of session.records) {
      const sid = String(rec.student);
      if (!matrix[sid]) matrix[sid] = {};
      matrix[sid][dateKey] = rec.status;
    }
  }

  const students = memberships.map(m => {
    const s   = m.student as unknown as { _id: unknown; name?: string };
    const sid = String(s._id);
    return {
      id:      sid,
      name:    s.name ?? "—",
      records: dates.map(d => ({ date: d, status: matrix[sid]?.[d] ?? "ABSENT" })),
    };
  });

  return { dates, students, month, year };
}

// ─────────────────────────────────────────
// Student Notes CRUD
// ─────────────────────────────────────────

export async function getNotes(teacherId: string, groupId: string, studentId: string) {
  await assertTeacherOwnsGroup(teacherId, groupId);
  const { StudentNote } = await import("../../models/StudentNote");
  return StudentNote.find({ teacher: teacherId, student: studentId, group: groupId })
    .sort({ createdAt: -1 })
    .lean();
}

export async function createNote(
  teacherId: string,
  groupId:   string,
  studentId: string,
  content:   string
) {
  await assertTeacherOwnsGroup(teacherId, groupId);
  const { StudentNote } = await import("../../models/StudentNote");
  return StudentNote.create({ teacher: teacherId, student: studentId, group: groupId, content });
}

export async function updateNote(
  teacherId: string,
  noteId:    string,
  content:   string
) {
  const { StudentNote } = await import("../../models/StudentNote");
  const note = await StudentNote.findOneAndUpdate(
    { _id: noteId, teacher: teacherId },
    { content },
    { new: true, runValidators: true }
  );
  if (!note) throw ApiError.notFound("الملاحظة غير موجودة");
  return note;
}

export async function deleteNote(teacherId: string, noteId: string) {
  const { StudentNote } = await import("../../models/StudentNote");
  const note = await StudentNote.findOneAndDelete({ _id: noteId, teacher: teacherId });
  if (!note) throw ApiError.notFound("الملاحظة غير موجودة");
}
