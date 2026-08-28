import { z } from "zod";

export const sendMessageSchema = z.object({
  groupId:   z.string().min(1, "معرّف المجموعة مطلوب"),
  teacherId: z.string().min(1, "معرّف المدرس مطلوب"),
  content:   z.string().min(1, "محتوى الرسالة مطلوب").max(2000),
});

export const replyMessageSchema = z.object({
  reply: z.string().min(1, "الرد مطلوب").max(2000),
});

export type SendMessageDto  = z.infer<typeof sendMessageSchema>;
export type ReplyMessageDto = z.infer<typeof replyMessageSchema>;
