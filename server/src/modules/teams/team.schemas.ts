import { z } from "zod";
import mongoose from "mongoose";

const objectIdRef = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "معرّف غير صالح");

export const createTeamSchema = z.object({
  name: z.string().min(1, "اسم الفريق مطلوب").max(100, "اسم الفريق طويل جداً"),
  classroomId: objectIdRef,
  memberIds: z.array(objectIdRef).default([]),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, "اسم الفريق مطلوب").max(100, "اسم الفريق طويل جداً").optional(),
  memberIds: z.array(objectIdRef).optional(),
});

export const adjustPointsSchema = z.object({
  points: z.number().int().refine((val) => val !== 0, "النقاط يجب أن لا تكون صفراً"),
  reason: z.string().min(1, "سبب التعديل مطلوب").max(300, "سبب التعديل طويل جداً"),
  studentId: objectIdRef.optional(),
});

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export type UpdateTeamDto = z.infer<typeof updateTeamSchema>;
export type AdjustPointsDto = z.infer<typeof adjustPointsSchema>;
