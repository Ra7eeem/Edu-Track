import { MobileNav } from "@/shared/components/layout/mobile-nav"
import { Sidebar } from "@/shared/components/layout/sidebar"
import { NotificationBannerListener } from "@/shared/components/notification-banner-listener"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NotificationBannerListener />
      <div className="hidden shrink-0 md:flex md:flex-col">
        <Sidebar variant="student" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav variant="student" />
    </div>
  )
}
