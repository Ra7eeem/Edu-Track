import { z } from "zod";
import { AttendanceStatus } from "../../types";

export const recordAttendanceSchema = z.object({
  date: z
    .string({ required_error: "التاريخ مطلوب" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ يجب أن تكون YYYY-MM-DD"),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1, "معرّف الطالب مطلوب"),
        status: z.nativeEnum(AttendanceStatus, {
          required_error: "حالة الحضور مطلوبة",
        }),
      })
    )
    .min(1, "يجب إدخال سجل حضور واحد على الأقل"),
});

export type RecordAttendanceDto = z.infer<typeof recordAttendanceSchema>;
