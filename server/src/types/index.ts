import { Types } from "mongoose";

// ─────────────────────────────────────────
// Enums
// ─────────────────────────────────────────

export enum Role {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum Grade {
  GRADE_1  = "GRADE_1",   // الصف الأول الابتدائي
  GRADE_2  = "GRADE_2",   // الصف الثاني الابتدائي
  GRADE_3  = "GRADE_3",   // الصف الثالث الابتدائي
  GRADE_4  = "GRADE_4",   // الصف الرابع الابتدائي
  GRADE_5  = "GRADE_5",   // الصف الخامس الابتدائي
  GRADE_6  = "GRADE_6",   // الصف السادس الابتدائي
  GRADE_7  = "GRADE_7",   // الصف الأول الإعدادي
  GRADE_8  = "GRADE_8",   // الصف الثاني الإعدادي
  GRADE_9  = "GRADE_9",   // الصف الثالث الإعدادي
  GRADE_10 = "GRADE_10",  // الصف الأول الثانوي
  GRADE_11 = "GRADE_11",  // الصف الثاني الثانوي
  GRADE_12 = "GRADE_12",  // الصف الثالث الثانوي
  GRADE_13 = "GRADE_13",  // خريجو الطلائع (طلاب جامعيون)
}

export enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT  = "ABSENT",
  LATE    = "LATE",
}

export enum NotificationType {
  JOIN_REQUEST_APPROVED = "JOIN_REQUEST_APPROVED",
  JOIN_REQUEST_REJECTED = "JOIN_REQUEST_REJECTED",
  NEW_POST = "NEW_POST",
  NEW_COMMENT = "NEW_COMMENT",
  NEW_REPLY = "NEW_REPLY",
  ADDED_TO_GROUP = "ADDED_TO_GROUP",
  NEW_EXAM = "NEW_EXAM",
  ATTENDANCE_RECORDED = "ATTENDANCE_RECORDED",
  QUESTION_REPLIED = "QUESTION_REPLIED",
  LESSON_REMINDER = "LESSON_REMINDER",
  TASK_REMINDER = "TASK_REMINDER",
}

// ─────────────────────────────────────────
// JWT Payload
// ─────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────
// Express Request augmentation
// ─────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────
// Grade Labels
// ─────────────────────────────────────────

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.GRADE_1]:  "الصف الأول الابتدائي",
  [Grade.GRADE_2]:  "الصف الثاني الابتدائي",
  [Grade.GRADE_3]:  "الصف الثالث الابتدائي",
  [Grade.GRADE_4]:  "الصف الرابع الابتدائي",
  [Grade.GRADE_5]:  "الصف الخامس الابتدائي",
  [Grade.GRADE_6]:  "الصف السادس الابتدائي",
  [Grade.GRADE_7]:  "الصف الأول الإعدادي",
  [Grade.GRADE_8]:  "الصف الثاني الإعدادي",
  [Grade.GRADE_9]:  "الصف الثالث الإعدادي",
  [Grade.GRADE_10]: "الصف الأول الثانوي",
  [Grade.GRADE_11]: "الصف الثاني الثانوي",
  [Grade.GRADE_12]: "الصف الثالث الثانوي",
  [Grade.GRADE_13]: "خريجو الطلائع",
};
