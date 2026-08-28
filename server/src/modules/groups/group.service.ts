import mongoose from "mongoose";
import { Group } from "../../models/Group";
import { GroupTeacher } from "../../models/GroupTeacher";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../types";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import { CreateGroupDto, UpdateGroupDto } from "./group.schemas";
import { getFileUrl } from "../../middleware/upload";

// ─────────────────────────────────────────
// List groups (public — authenticated)
// ─────────────────────────────────────────

export async function listGroups(req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const search = String(req.query.search ?? "");
  const grade  = req.query.grade as string | undefined;

  const filter: mongoose.FilterQuery<typeof Group> = { isActive: true };
  if (search) filter.$or = [
    { name:        { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
  // Filter by grade: return groups that either have no grade restrictions
  // OR explicitly include the requested grade
  if (grade) {
    filter.$or = [
      { grades: { $size: 0 } },   // open to all
      { grades: grade },           // includes this grade
    ];
  }

  const [data, total] = await Promise.all([
    Group.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Group.countDocuments(filter),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

// ─────────────────────────────────────────
// Get one group (with teachers + member count)
// ─────────────────────────────────────────

export async function getGroup(id: string): Promise<Record<string, unknown>> {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("معرّف غير صالح");
  const group = await Group.findOne({ _id: id, isActive: true }).populate("createdBy", "name email");
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");

  const [teachers, membersCount] = await Promise.all([
    GroupTeacher.find({ group: id }).populate("teacher", "name email avatarUrl"),
    GroupMembership.countDocuments({ group: id, isActive: true }),
  ]);

  return {
    ...group.toJSON(),
    teachers: teachers.map((gt) => gt.teacher),
    membersCount,
  };
}

// ─────────────────────────────────────────
// Create group (teacher or admin)
// ─────────────────────────────────────────

export async function createGroup(
  createdById: string,
  creatorRole: Role,
  dto: CreateGroupDto,
  imageFilename?: string
) {
  const group = await Group.create({
    name:        dto.name,
    description: dto.description,
    imageUrl:    imageFilename ? getFileUrl(imageFilename) : undefined,
    grades:      dto.grades ?? [],
    createdBy:   createdById,
  });

  // Auto-assign creator as teacher if they are a TEACHER
  if (creatorRole === Role.TEACHER) {
    await GroupTeacher.create({ group: group._id, teacher: createdById });
  }

  return group;
}

// ─────────────────────────────────────────
// Update group (owner teacher or admin)
// ─────────────────────────────────────────

export async function updateGroup(
  groupId: string,
  userId: string,
  role: Role,
  dto: UpdateGroupDto,
  imageFilename?: string
) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) throw ApiError.badRequest("معرّف غير صالح");

  // Teachers can only update their own groups
  if (role === Role.TEACHER) {
    const link = await GroupTeacher.findOne({ group: groupId, teacher: userId });
    if (!link) throw ApiError.forbidden("لا تملك صلاحية تعديل هذه المجموعة");
  }

  const update: Record<string, unknown> = { ...dto };
  if (imageFilename) update.imageUrl = getFileUrl(imageFilename);

  const group = await Group.findByIdAndUpdate(groupId, update, {
    new: true,
    runValidators: true,
  });
  if (!group) throw ApiError.notFound("المجموعة غير موجودة");
  return group;
}

// ─────────────────────────────────────────
// Get group members (teacher or admin)
// ─────────────────────────────────────────

export async function getGroupMembers(groupId: string, req: Request) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) throw ApiError.badRequest("معرّف غير صالح");
  const { page, limit, skip } = parsePagination(req);
  const [memberships, total] = await Promise.all([
    GroupMembership.find({ group: groupId, isActive: true })
      .populate("student", "name email phone grade avatarUrl")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit),
    GroupMembership.countDocuments({ group: groupId, isActive: true }),
  ]);
  return {
    data: memberships.map((m) => m.student),
    pagination: buildPaginationMeta(total, page, limit),
  };
}

// ─────────────────────────────────────────
// Get group teachers
// ─────────────────────────────────────────

export async function getGroupTeachers(groupId: string) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) throw ApiError.badRequest("معرّف غير صالح");
  const teachers = await GroupTeacher.find({ group: groupId }).populate(
    "teacher",
    "name email avatarUrl"
  );
  return teachers.map((gt) => gt.teacher);
}
