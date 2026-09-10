"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const replySchema = z.object({
  reply: z.string().min(1, "الرد لا يمكن أن يكون فارغاً").max(2000),
})

export type MessageActionState = { error?: string; success?: boolean }

export async function replyAnonymousMessageAction(
  messageId: string,
  reply: string
): Promise<MessageActionState> {
  const parsed = replySchema.safeParse({ reply })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  try {
    await serverFetch(`/api/anonymous/${messageId}/reply`, {
      method: "POST",
      body:   parsed.data,
    })
    revalidatePath("/teacher/messages")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إرسال الرد" }
  }
}