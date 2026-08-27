"use client"

import { cn } from "@/shared/lib/tailwind-cn"
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Trophy,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type SidebarVariant = "teacher" | "student" | "admin"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const teacherNav: NavItem[] = [
  { label: "الرئيسية",    href: "/teacher/dashboard",      icon: LayoutDashboard },
  { label: "مجموعاتي",   href: "/teacher/groups",          icon: BookOpen        },
  { label: "الإشعارات",  href: "/teacher/notifications",   icon: Bell            },
  { label: "الحساب",     href: "/teacher/profile",         icon: Settings        },
]

const studentNav: NavItem[] = [
  { label: "الرئيسية",    href: "/student/dashboard",     icon: LayoutDashboard },
  { label: "مجموعتي",    href: "/student/group",          icon: BookOpen        },
  { label: "الترتيب",    href: "/student/ranking",        icon: Trophy          },
  { label: "الإشعارات",  href: "/student/notifications",  icon: Bell            },
  { label: "الحساب",     href: "/student/profile",        icon: Settings        },
]

const adminNav: NavItem[] = [
  { label: "الرئيسية",    href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "المدرسون",   href: "/admin/teachers",    icon: Users           },
  { label: "المجموعات",  href: "/admin/groups",      icon: BookOpen        },
  { label: "التقارير",   href: "/admin/reports",     icon: BarChart3       },
]

const navMap: Record<SidebarVariant, NavItem[]> = {
  teacher: teacherNav,
  student: studentNav,
  admin: adminNav,
}

const userMap = {
  teacher: { name: "أ. محمد السيد",   role: "مدرس رياضيات",     avatar: "م", color: "bg-violet-500" },
  student: { name: "أحمد محمد علي",   role: "طالب — رياضيات أ", avatar: "أ", color: "bg-cyan-500"   },
  admin:   { name: "مدير النظام",     role: "Admin",             avatar: "ا", color: "bg-rose-500"   },
}

interface SidebarProps {
  variant: SidebarVariant
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname()
  const nav = navMap[variant]
  const user = userMap[variant]

  return (
    <aside className="flex h-full w-64 flex-col border-e border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-sm">
          <GraduationCap className="size-5" />
        </span>
        <span className="text-base font-bold">
          <span className="text-primary">Edu</span>Track
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span className={cn("grid size-9 place-items-center rounded-xl text-sm font-bold text-white shrink-0", user.color)}>
            {user.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.role}</p>
          </div>
          <button
            aria-label="تسجيل الخروج"
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
