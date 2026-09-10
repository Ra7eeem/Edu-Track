import { TopBar } from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { ApiUser } from "@/shared/types/api"
import { AdminProfileClient } from "./admin-profile-client"

export default async function AdminProfilePage() {
  let profile: ApiUser | null = null
  try {
    profile = await serverFetch<ApiUser>("/api/admin/profile", {
      revalidate: 5,
      tags: ["admin-profile"],
    })
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