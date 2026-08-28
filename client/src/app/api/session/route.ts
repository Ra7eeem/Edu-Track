/**
 * Route Handler — exposes session token to client-side code.
 * Only returns the token (not user data) so the client can
 * attach it to API requests.
 */
import { getSessionData } from "@/shared/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSessionData()
  if (!session) {
    return NextResponse.json({ token: null }, { status: 200 })
  }
  return NextResponse.json({
    token:  session.token,
    userId: session.userId,
    role:   session.role,
    name:   session.name,
    email:  session.email,
  })
}
