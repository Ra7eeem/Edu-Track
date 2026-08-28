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
  GRADE_7 = "GRADE_7",   // الصف الأول الإعدادي
  GRADE_8 = "GRADE_8",   // الصف الثاني الإعدادي
  GRADE_9 = "GRADE_9",   // الصف الثالث الإعدادي
  GRADE_10 = "GRADE_10", // الصف الأول الثانوي
  GRADE_11 = "GRADE_11", // الصف الثاني الثانوي
  GRADE_12 = "GRADE_12", // الصف الثالث الثانوي
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
  [Grade.GRADE_7]: "الصف الأول الإعدادي",
  [Grade.GRADE_8]: "الصف الثاني الإعدادي",
  [Grade.GRADE_9]: "الصف الثالث الإعدادي",
  [Grade.GRADE_10]: "الصف الأول الثانوي",
  [Grade.GRADE_11]: "الصف الثاني الثانوي",
  [Grade.GRADE_12]: "الصف الثالث الثانوي",
};
