"use client"

import { signOut } from "next-auth/react"
import { MearajLogo }   from "@/shared/components/mearaj-logo"
import { ThemeToggle }  from "@/shared/components/theme-toggle"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Trophy,
  UserCheck,
  Users,
  Video,
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
  { label: "الرئيسية",         href: "/teacher/dashboard",     icon: LayoutDashboard },
  { label: "الكورسات والدروس", href: "/teacher/courses",       icon: Video           },
  { label: "مجموعاتي",         href: "/teacher/groups",        icon: BookOpen        },
  { label: "طلبات الانضمام",   href: "/teacher/join-requests", icon: UserCheck       },
  { label: "الرسائل المجهولة", href: "/teacher/messages",      icon: MessageCircle   },
  { label: "الإشعارات",        href: "/teacher/notifications", icon: Bell            },
  { label: "الحساب",           href: "/teacher/profile",       icon: Settings        },
]

const studentNav: NavItem[] = [
  { label: "الرئيسية",         href: "/student/dashboard",     icon: LayoutDashboard },
  { label: "الكورسات والدروس", href: "/student/courses",       icon: Video           },
  { label: "مجموعتي",          href: "/student/group",         icon: BookOpen        },
  { label: "الواجبات",         href: "/student/assignments",   icon: ClipboardList   },
  { label: "الترتيب",          href: "/student/ranking",       icon: Trophy          },
  { label: "الرسائل المجهولة", href: "/student/messages",      icon: MessageCircle   },
  { label: "الإشعارات",        href: "/student/notifications", icon: Bell            },
  { label: "الحساب",           href: "/student/profile",       icon: Settings        },
]

const adminNav: NavItem[] = [
  { label: "الرئيسية",          href: "/admin/dashboard",        icon: LayoutDashboard },
  { label: "المدرسون",         href: "/admin/teachers",         icon: Users           },
  { label: "المجموعات",        href: "/admin/groups",           icon: BookOpen        },
  { label: "المراحل الدراسية", href: "/admin/academic-stages",  icon: GraduationCap   },
  { label: "الحساب",           href: "/admin/profile",          icon: Settings        },
]

const navMap: Record<SidebarVariant, NavItem[]> = {
  teacher: teacherNav,
  student: studentNav,
  admin:   adminNav,
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
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-muted text-foreground font-semibold border-s-4 border-accent"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0 text-accent" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded p-2">
          <span className="grid size-9 place-items-center rounded bg-primary text-primary-foreground text-sm font-bold shrink-0">
            {displayAvatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          {/* Logout using NextAuth signOut */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="تسجيل الخروج"
            className="grid size-8 place-items-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
