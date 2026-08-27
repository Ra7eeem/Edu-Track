import mongoose from "mongoose";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import { GroupTeacher } from "../../models/GroupTeacher";
import { GroupMembership } from "../../models/GroupMembership";
import { JoinRequest } from "../../models/JoinRequest";
import { Attendance } from "../../models/Attendance";
import { MonthlyScore } from "../../models/MonthlyScore";
import { Post } from "../../models/Post";
import { Comment } from "../../models/Comment";
import { PostLike } from "../../models/PostLike";
import { Notification } from "../../models/Notification";
import { Role, Grade, JoinRequestStatus } from "../../types";

// ─────────────────────────────────────────
// DB lifecycle
// ─────────────────────────────────────────

export async function connectTestDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function clearCollections(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    GroupTeacher.deleteMany({}),
    GroupMembership.deleteMany({}),
    JoinRequest.deleteMany({}),
    Attendance.deleteMany({}),
    MonthlyScore.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    PostLike.deleteMany({}),
    Notification.deleteMany({}),
  ]);
}

// ─────────────────────────────────────────
// Fixture factories
// ─────────────────────────────────────────

export async function createAdmin() {
  return User.create({
    name: "مدير النظام",
    email: "admin@test.com",
    passwordHash: await argon2.hash("Admin@123"),
    role: Role.ADMIN,
  });
}

export async function createTeacher(suffix = "1") {
  return User.create({
    name: `مدرس ${suffix}`,
    email: `teacher${suffix}@test.com`,
    passwordHash: await argon2.hash("Teacher@123"),
    role: Role.TEACHER,
    phone: `0100000000${suffix}`,
  });
}

export async function createStudent(suffix = "1") {
  return User.create({
    name: `طالب ${suffix}`,
    email: `student${suffix}@test.com`,
    passwordHash: await argon2.hash("Student@123"),
    role: Role.STUDENT,
    phone: `0110000000${suffix}`,
    grade: Grade.GRADE_10,
  });
}

export async function createGroup(createdById: string) {
  return Group.create({
    name: "مجموعة تجريبية",
    description: "وصف تجريبي",
    createdBy: createdById,
  });
}

export async function assignTeacherToGroup(groupId: string, teacherId: string) {
  return GroupTeacher.create({ group: groupId, teacher: teacherId });
}

export async function enrollStudent(groupId: string, studentId: string) {
  return GroupMembership.create({ student: studentId, group: groupId });
}

export async function createPendingRequest(groupId: string, studentId: string) {
  return JoinRequest.create({ student: studentId, group: groupId });
}

// ─────────────────────────────────────────
// JWT helper
// ─────────────────────────────────────────

export function makeToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: "1h" });
}
