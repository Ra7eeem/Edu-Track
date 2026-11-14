"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
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

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/anonymous/${messageId}/reply`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء إرسال الرد" }

    revalidatePath("/teacher/messages")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إرسال الرد" }
  }
}
