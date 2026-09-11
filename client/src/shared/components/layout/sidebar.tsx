"use client"

import { logoutAction } from "@/features/auth/actions/logout.action"
import { MearajLogo }   from "@/shared/components/mearaj-logo"
import { ThemeToggle }  from "@/shared/components/theme-toggle"
import { clearTokenCache } from "@/shared/lib/api-client"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type SidebarVariant = "teacher" | "student" | "admin"

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
}

const teacherNav: NavItem[] = [
  { label: "الرئيسية",         href: "/teacher/dashboard",    icon: LayoutDashboard },
  { label: "مجموعاتي",         href: "/teacher/groups",        icon: BookOpen        },
  { label: "طلبات الانضمام",   href: "/teacher/join-requests", icon: UserCheck       },
  { label: "الرسائل المجهولة", href: "/teacher/messages",      icon: MessageCircle   },
  { label: "الإشعارات",        href: "/teacher/notifications", icon: Bell            },
  { label: "الحساب",           href: "/teacher/profile",       icon: Settings        },
]

const studentNav: NavItem[] = [
  { label: "الرئيسية",         href: "/student/dashboard",    icon: LayoutDashboard },
  { label: "مجموعتي",          href: "/student/group",         icon: BookOpen        },
  { label: "الواجبات",         href: "/student/assignments",   icon: ClipboardList   },
  { label: "الترتيب",          href: "/student/ranking",       icon: Trophy          },
  { label: "الرسائل المجهولة", href: "/student/messages",      icon: MessageCircle   },
  { label: "الإشعارات",        href: "/student/notifications", icon: Bell            },
  { label: "الحساب",           href: "/student/profile",       icon: Settings        },
]

const adminNav: NavItem[] = [
  { label: "الرئيسية",   href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "المدرسون",  href: "/admin/teachers",   icon: Users           },
  { label: "المجموعات", href: "/admin/groups",     icon: BookOpen        },
  { label: "الحساب",    href: "/admin/profile",    icon: Settings        },
]

const navMap: Record<SidebarVariant, NavItem[]> = {
  teacher: teacherNav,
  student: studentNav,
  admin:   adminNav,
}

const avatarColors: Record<SidebarVariant, string> = {
  teacher: "bg-teal-600",
  student: "bg-cyan-500",
  admin:   "bg-rose-500",
}

const roleLabels: Record<SidebarVariant, string> = {
  teacher: "مدرس",
  student: "طالب",
  admin:   "مدير النظام",
}

interface SidebarProps {
  variant:  SidebarVariant
  userName?: string
  userAvatar?: string
}

export function Sidebar({ variant, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname()
  const nav      = navMap[variant]
  const color    = avatarColors[variant]
  const roleLabel = roleLabels[variant]

  const displayName   = userName   || roleLabels[variant]
  const displayAvatar = userAvatar || displayName[0] || "؟"

  return (
    <aside className="flex h-full w-64 flex-col border-e border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 flex-1">
          <MearajLogo size="sm" />
        </Link>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")
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

      {/* User + Logout */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl text-sm font-bold text-white shrink-0",
              color
            )}
          >
            {displayAvatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          {/* Logout — form triggers Server Action; bust client token cache first */}
          <form action={logoutAction} onSubmit={() => clearTokenCache()}>
            <button
              type="submit"
              aria-label="تسجيل الخروج"
              className="grid size-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
