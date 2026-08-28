import { RegisterStudentForm } from "@/features/auth/components/register-student-form"
import { serverFetch } from "@/shared/lib/api-server"
import { ApiGroup, PaginatedResponse } from "@/shared/types/api"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

async function getGroups() {
  try {
    const raw = await serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
      "/api/groups?limit=100",
      { token: "", revalidate: 300 }
    )
    // Handle both shapes: PaginatedResponse OR plain array
    if (Array.isArray(raw)) return raw
    if (raw && "data" in raw && Array.isArray(raw.data)) return raw.data
    return []
  } catch {
    return []
  }
}

export default async function RegisterPage() {
  const groups = await getGroups()

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -start-32 size-[450px] rounded-full bg-violet-500/12 blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-20 -end-20 size-[350px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-7 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/30">
                <GraduationCap className="size-5" />
              </span>
              <span className="text-lg font-bold"><span className="text-gradient">Edu</span>Track</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-lg">
            <h1 className="text-xl font-extrabold tracking-tight">إنشاء حساب طالب</h1>
            <p className="mt-1 text-sm text-muted-foreground">انضم لمجموعتك وابدأ رحلتك التعليمية</p>

            <div className="mt-5">
              <RegisterStudentForm
                groups={groups.map(g => ({
                  id:   g._id ?? g.id ?? "",
                  name: g.name,
                }))}
              />
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            لديك حساب؟{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">سجّل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
