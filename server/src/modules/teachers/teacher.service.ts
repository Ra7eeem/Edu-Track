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
