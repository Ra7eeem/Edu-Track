import { z } from "zod";
import { AssignmentType } from "../../models/Assignment";

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

const choiceSchema = z.object({
  id:   z.string().min(1).max(10),
  text: z.string().min(1, "نص الخيار مطلوب").max(500).trim(),
});

const questionSchema = z.object({
  text: z.string().min(1, "نص السؤال مطلوب").max(2000).trim(),
  choices: z.array(choiceSchema).min(2, "كل سؤال يحتاج خيارين على الأقل").max(6),
  correctAnswer: z.string().min(1, "الإجابة الصحيحة مطلوبة"),
  points: z.number().int().min(1).max(100).default(1),
});

export const createAssignmentBaseSchema = z.object({
  groupId:         z.string().min(1, "معرّف المجموعة مطلوب"),
  type:            z.nativeEnum(AssignmentType).default(AssignmentType.HOMEWORK),
  title:           z.string().min(1, "العنوان مطلوب").max(300).trim(),
  description:     z.string().max(3000).trim().optional(),
  youtubeUrl:      z.string().regex(youtubeRegex, "رابط يوتيوب غير صالح").optional().or(z.literal("")),
  dueDate:         z.string().datetime({ offset: true }).optional(),
  durationMinutes: z.number().int().min(1).max(600).optional().nullable(),
  availableFrom:   z.union([
                     z.string().datetime({ offset: true }),
                     z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "تاريخ غير صالح"),
                   ]).optional().nullable(),
  availableTo:     z.union([
                     z.string().datetime({ offset: true }),
                     z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "تاريخ غير صالح"),
                   ]).optional().nullable(),
  questions:       z.array(questionSchema).optional().default([]),
});

export const createAssignmentSchema = createAssignmentBaseSchema.refine(
  (d) => d.type !== AssignmentType.EXAM || d.durationMinutes != null || d.questions.length === 0,
  { message: "يُنصح بإضافة مدة للامتحان", path: ["durationMinutes"] }
);

export const updateAssignmentSchema = createAssignmentBaseSchema
  .omit({ groupId: true })
  .partial();

export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentDto = z.infer<typeof updateAssignmentSchema>;
