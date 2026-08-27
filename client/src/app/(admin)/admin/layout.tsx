import { MobileNav } from "@/shared/components/layout/mobile-nav"
import { Sidebar } from "@/shared/components/layout/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden shrink-0 md:flex md:flex-col">
        <Sidebar variant="admin" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav variant="admin" />
    </div>
  )
}
