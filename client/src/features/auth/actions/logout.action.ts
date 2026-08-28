"use server"

import { getSession } from "@/shared/lib/session"
import { redirect } from "next/navigation"

export async function logoutAction() {
  const session = await getSession()
  session.destroy()
  redirect("/login")
}
