import { TopBar } from "@/shared/components/layout/topbar"
import { getAdminProfileApi } from "@/features/admin/apis/admin.api"
import { ApiUser } from "@/shared/types/api"
import { AdminProfileClient } from "./admin-profile-client"

export default async function AdminProfilePage() {
  let profile: ApiUser | null = null
  try {
    profile = await getAdminProfileApi()
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