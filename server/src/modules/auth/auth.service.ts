import argon2 from "argon2";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import { JoinRequest } from "../../models/JoinRequest";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";
import { Role, JwtPayload } from "../../types";
import { LoginDto, RegisterStudentDto } from "./auth.schemas";

// ─────────────────────────────────────────
// Token helper
// ─────────────────────────────────────────

function signToken(userId: string, role: Role): string {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────

export async function login(dto: LoginDto) {
  // Explicitly select passwordHash (select: false on schema)
  const user = await User.findOne({ email: dto.email }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("الحساب معطّل، تواصل مع المشرف");
  }

  const valid = await argon2.verify(user.passwordHash, dto.password);
  if (!valid) {
    throw ApiError.unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const token = signToken(String(user._id), user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      grade: user.grade,
      phone: user.phone,
    },
  };
}

// ─────────────────────────────────────────
// Register Student
// ─────────────────────────────────────────

export async function registerStudent(dto: RegisterStudentDto) {
  // Validate group exists
  if (!mongoose.Types.ObjectId.isValid(dto.groupId)) {
    throw ApiError.badRequest("معرّف المجموعة غير صالح");
  }

  const group = await Group.findById(dto.groupId);
  if (!group || !group.isActive) {
    throw ApiError.notFound("المجموعة غير موجودة");
  }

  // Check email uniqueness
  const existing = await User.findOne({ email: dto.email });
  if (existing) {
    throw ApiError.conflict("البريد الإلكتروني مستخدم مسبقاً");
  }

  const passwordHash = await argon2.hash(dto.password);

  const user = await User.create({
    name: dto.name,
    email: dto.email,
    passwordHash,
    role: Role.STUDENT,
    phone: dto.phone,
    grade: dto.grade,
  });

  // Create PENDING join request
  await JoinRequest.create({
    student: user._id,
    group: dto.groupId,
  });

  const token = signToken(String(user._id), Role.STUDENT);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade,
      phone: user.phone,
    },
    joinRequest: {
      groupId: dto.groupId,
      groupName: group.name,
      status: "PENDING",
      message: "تم إرسال طلب الانضمام، في انتظار موافقة المدرس",
    },
  };
}
