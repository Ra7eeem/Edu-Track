import { TopBar } from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { ApiUser } from "@/shared/types/api"
import { AdminProfileClient } from "./admin-profile-client"

export default async function AdminProfilePage() {
  // User-specific endpoint (one URL for the admin) — must stay out of the Data
  // Cache or a cached profile could be served to a different admin.
  let profile: ApiUser | null = null
  try {
    profile = await serverFetch<ApiUser>("/api/admin/profile")
  } catch {
    // graceful fallback — client shows a default state
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="الحساب"
        subtitle="مدير النظام"
        notifHref="/admin/dashboard"
        userName={profile?.name ?? "مدير"}
        userAvatar={(profile?.name ?? "ا")[0]}
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <AdminProfileClient profile={profile ?? ({
        _id: "", name: "", email: "", role: "ADMIN", avatarUrl: null, grade: null,
        phone: null, isActive: true, createdAt: "", updatedAt: "",
      } as ApiUser)} />
    </div>
  )
}