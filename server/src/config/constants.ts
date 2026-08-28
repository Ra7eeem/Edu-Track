import { Grade } from "../types";

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.GRADE_7]: "الصف الأول الإعدادي",
  [Grade.GRADE_8]: "الصف الثاني الإعدادي",
  [Grade.GRADE_9]: "الصف الثالث الإعدادي",
  [Grade.GRADE_10]: "الصف الأول الثانوي",
  [Grade.GRADE_11]: "الصف الثاني الثانوي",
  [Grade.GRADE_12]: "الصف الثالث الثانوي",
};

export const ATTENDANCE_SCORE = {
  PRESENT: 2,
  LATE:    1,
  ABSENT:  0,
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
