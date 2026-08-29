import mongoose from "mongoose";
import { AnonymousMessage } from "../../models/AnonymousMessage";
import { GroupMembership } from "../../models/GroupMembership";
import { GroupTeacher } from "../../models/GroupTeacher";
import { ApiError } from "../../utils/ApiError";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { Request } from "express";
import { SendMessageDto, ReplyMessageDto } from "./anonymous.schemas";

// ─── Student sends an anonymous message ──────────────────────────────────────
export async function sendMessage(studentId: string, dto: SendMessageDto) {
  if (
    !mongoose.Types.ObjectId.isValid(dto.groupId) ||
    !mongoose.Types.ObjectId.isValid(dto.teacherId)
  ) throw ApiError.badRequest("معرّف غير صالح");

  // Student must be a member of the group
  const membership = await GroupMembership.findOne({
    student: studentId,
    group:   dto.groupId,
    isActive: true,
  });
  if (!membership) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  // Teacher must be assigned to the group
  const teacherLink = await GroupTeacher.findOne({
    group:   dto.groupId,
    teacher: dto.teacherId,
  });
  if (!teacherLink) throw ApiError.badRequest("المدرس غير مرتبط بهذه المجموعة");

  const msg = await AnonymousMessage.create({
    group:   dto.groupId,
    sender:  studentId,
    teacher: dto.teacherId,
    content: dto.content,
  });

  // Return WITHOUT revealing the sender
  return {
    _id:       msg._id,
    groupId:   msg.group,
    content:   msg.content,
    reply:     msg.reply,
    createdAt: msg.createdAt,
  };
}

// ─── Student views their own messages (with teacher replies) ─────────────────
export async function getMyMessages(studentId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    AnonymousMessage.find({ sender: studentId })
      .select("-sender")              // never expose sender field in list
      .populate("teacher", "name avatarUrl")
      .populate("group",   "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AnonymousMessage.countDocuments({ sender: studentId }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

// ─── Teacher views messages addressed to them (sender hidden) ────────────────
export async function getTeacherMessages(teacherId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    AnonymousMessage.find({ teacher: teacherId })
      .select("-sender")              // hide sender from teacher
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AnonymousMessage.countDocuments({ teacher: teacherId }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

// ─── Teacher replies ──────────────────────────────────────────────────────────
export async function replyToMessage(
  teacherId: string,
  messageId: string,
  dto:       ReplyMessageDto
) {
  if (!mongoose.Types.ObjectId.isValid(messageId))
    throw ApiError.badRequest("معرّف غير صالح");

  const msg = await AnonymousMessage.findOne({
    _id:     messageId,
    teacher: teacherId,
  });
  if (!msg) throw ApiError.notFound("الرسالة غير موجودة");

  msg.reply     = dto.reply;
  msg.repliedAt = new Date();
  msg.repliedBy = new mongoose.Types.ObjectId(teacherId);
  await msg.save();

  // Return WITHOUT exposing sender
  return {
    _id:       msg._id,
    content:   msg.content,
    reply:     msg.reply,
    repliedAt: msg.repliedAt,
  };
}

// ─── Student deletes their own message (only if no reply yet) ────────────────
export async function deleteMyMessage(studentId: string, messageId: string) {
  if (!mongoose.Types.ObjectId.isValid(messageId))
    throw ApiError.badRequest("معرّف غير صالح");

  const msg = await AnonymousMessage.findOne({ _id: messageId, sender: studentId });
  if (!msg) throw ApiError.notFound("الرسالة غير موجودة");
  if (msg.reply) throw ApiError.conflict("لا يمكن حذف رسالة تم الرد عليها");

  await msg.deleteOne();
}

// ─── Admin views all messages (with sender revealed) ─────────────────────────
export async function getAllMessages(req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    AnonymousMessage.find()
      .populate("sender",  "name email")   // admin sees sender
      .populate("teacher", "name email")
      .populate("group",   "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AnonymousMessage.countDocuments(),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}
