import argon2 from "argon2";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import { GroupTeacher } from "../../models/GroupTeacher";
import { GroupMembership } from "../../models/GroupMembership";
import { Attendance } from "../../models/Attendance";
import { Post } from "../../models/Post";
import { Comment } from "../../models/Comment";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../types";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  UpdateGroupDto,
  CreateGroupAdminDto,
} from "./admin.schemas";

// ─────────────────────────────────────────
// Teachers
// ─────────────────────────────────────────

export async function getTeachers(req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const search = String(req.query.search ?? "");
  const filter: mongoose.FilterQuery<typeof User> = { role: Role.TEACHER };
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getTeacherById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const teacher = await User.findOne({ _id: id, role: Role.TEACHER });
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  return teacher;
}

export async function createTeacher(dto: CreateTeacherDto) {
  const exists = await User.findOne({ email: dto.email });
  if (exists) throw ApiError.conflict("البريد الإلكتروني مستخدم مسبقاً");
  const passwordHash = await argon2.hash(dto.password);
  return User.create({ name: dto.name, email: dto.email, passwordHash, role: Role.TEACHER });
}

export async function updateTeacher(id: string, dto: UpdateTeacherDto) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const teacher = await User.findOne({ _id: id, role: Role.TEACHER });
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  if (dto.email && dto.email !== teacher.email) {
    const dup = await User.findOne({ email: dto.email });
    if (dup) throw ApiError.conflict("البريد الإلكتروني مستخدم مسبقاً");
    teacher.email = dto.email;
  }
  if (dto.name) teacher.name = dto.name;
  if (typeof dto.isActive === "boolean") teacher.isActive = dto.isActive;
  if (dto.password) teacher.passwordHash = await argon2.hash(dto.password);
  await teacher.save();
  return teacher;
}

export async function deleteTeacher(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const teacher = await User.findOneAndDelete({ _id: id, role: Role.TEACHER });
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  await GroupTeacher.deleteMany({ teacher: id });
}

// ─────────────────────────────────────────
// Groups (admin)
// ─────────────────────────────────────────

export async function createGroup(dto: CreateGroupAdminDto, adminId: string) {
  const group = await Group.create({
    name:        dto.name,
    description: dto.description,
    grades:      dto.grades ?? [],
    createdBy:   adminId,
  });

  // Optionally assign teachers on creation
  if (dto.teacherIds && dto.teacherIds.length > 0) {
    const validIds = dto.teacherIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    await Promise.all(
      validIds.map(tid => GroupTeacher.create({ group: group._id, teacher: tid }))
    );
  }

  return group;
}

export async function getGroups(req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const search = String(req.query.search ?? "");
  const filter: mongoose.FilterQuery<typeof Group> = {};
  if (search) filter.$text = { $search: search };
  const [data, total] = await Promise.all([
    Group.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Group.countDocuments(filter),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getGroupById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const group = await Group.findById(id).populate("createdBy", "name email");
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");
  const [teachers, studentsCount] = await Promise.all([
    GroupTeacher.find({ group: id }).populate("teacher", "name email avatarUrl"),
    GroupMembership.countDocuments({ group: id, isActive: true }),
  ]);
  return { group, teachers: teachers.map((gt) => gt.teacher), studentsCount };
}

export async function updateGroup(id: string, dto: UpdateGroupDto) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const group = await Group.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");
  return group;
}

export async function deleteGroup(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const group = await Group.findByIdAndDelete(id);
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");
}

export async function addTeacherToGroup(groupId: string, teacherId: string) {
  if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(teacherId))
    throw ApiError.badRequest("معرّف غير صالح");
  const [group, teacher] = await Promise.all([
    Group.findById(groupId),
    User.findOne({ _id: teacherId, role: Role.TEACHER }),
  ]);
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");
  if (!teacher) throw ApiError.notFound("المدرس غير موجود");
  const existing = await GroupTeacher.findOne({ group: groupId, teacher: teacherId });
  if (existing) throw ApiError.conflict("المدرس مضاف بالفعل إلى هذه المجموعة");
  return GroupTeacher.create({ group: groupId, teacher: teacherId });
}

export async function removeTeacherFromGroup(groupId: string, teacherId: string) {
  if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(teacherId))
    throw ApiError.badRequest("معرّف غير صالح");
  const result = await GroupTeacher.findOneAndDelete({ group: groupId, teacher: teacherId });
  if (!result) throw ApiError.notFound("المدرس غير مرتبط بهذه المجموعة");
}

// ─────────────────────────────────────────
// Students (admin)
// ─────────────────────────────────────────

export async function getStudents(req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const search = String(req.query.search ?? "");
  const grade = req.query.grade as string | undefined;
  const filter: mongoose.FilterQuery<typeof User> = { role: Role.STUDENT };
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  if (grade) filter.grade = grade;
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getStudentById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const student = await User.findOne({ _id: id, role: Role.STUDENT });
  if (!student) throw ApiError.notFound("الطالب غير موجود");
  const memberships = await GroupMembership.find({ student: id, isActive: true })
    .populate("group", "name imageUrl");
  return { student, groups: memberships.map((m) => m.group) };
}

// ─────────────────────────────────────────
// Dashboard — full page data in one query
// ─────────────────────────────────────────

export async function getDashboardFull() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [
    totalTeachers,
    totalStudents,
    totalGroups,
    totalPosts,
    totalComments,
    todaySessions,
    recentTeachers,
    recentGroups,
  ] = await Promise.all([
    User.countDocuments({ role: Role.TEACHER }),
    User.countDocuments({ role: Role.STUDENT }),
    Group.countDocuments({ isActive: true }),
    Post.countDocuments(),
    Comment.countDocuments(),
    Attendance.find({ date: today }).lean(),
    User.find({ role: Role.TEACHER }).sort({ createdAt: -1 }).limit(5).select("-passwordHash").lean(),
    Group.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  let todayPresent = 0;
  let todayAbsent  = 0;
  for (const session of todaySessions) {
    for (const rec of session.records) {
      if (rec.status === "PRESENT") todayPresent++;
      else todayAbsent++;
    }
  }

  return {
    stats: { totalTeachers, totalStudents, totalGroups, totalPosts, totalComments, todayPresent, todayAbsent },
    teachers: recentTeachers,
    groups:   recentGroups,
  };
}

// ─────────────────────────────────────────
// Dashboard statistics
// ─────────────────────────────────────────

export async function getDashboardStats() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [
    totalTeachers,
    totalStudents,
    totalGroups,
    totalPosts,
    totalComments,
    todayAttendance,
  ] = await Promise.all([
    User.countDocuments({ role: Role.TEACHER }),
    User.countDocuments({ role: Role.STUDENT }),
    Group.countDocuments({ isActive: true }),
    Post.countDocuments(),
    Comment.countDocuments(),
    Attendance.findOne({ date: today }).lean(),
  ]);

  let todayPresent = 0;
  let todayAbsent = 0;
  // If there are multiple groups today we aggregate all sessions
  const todaySessions = await Attendance.find({ date: today }).lean();
  for (const session of todaySessions) {
    for (const rec of session.records) {
      if (rec.status === "PRESENT") todayPresent++;
      else todayAbsent++;
    }
  }

  return {
    totalTeachers,
    totalStudents,
    totalGroups,
    totalPosts,
    totalComments,
    todayPresent,
    todayAbsent,
  };
}

// ─────────────────────────────────────────
// Admin Profile
// ─────────────────────────────────────────

export async function getAdminProfile(adminId: string) {
  const admin = await User.findById(adminId).select("-passwordHash");
  if (!admin) throw ApiError.notFound("المدير غير موجود");
  return admin;
}

export async function updateAdminProfile(
  adminId: string,
  dto: import("./admin.schemas").UpdateAdminProfileDto
) {
  const admin = await User.findById(adminId);
  if (!admin) throw ApiError.notFound("المدير غير موجود");

  // Handle password change
  if (dto.newPassword) {
    if (!dto.oldPassword) throw ApiError.badRequest("يجب إدخال كلمة المرور القديمة");
    const valid = await argon2.verify(admin.passwordHash as string, dto.oldPassword);
    if (!valid) throw ApiError.badRequest("كلمة المرور القديمة غير صحيحة");
    admin.passwordHash = await argon2.hash(dto.newPassword);
  }

  if (dto.name)  admin.name  = dto.name;
  if (dto.phone !== undefined) (admin as unknown as { phone: string }).phone = dto.phone;

  await admin.save();
  return admin;
}
