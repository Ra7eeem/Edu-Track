"use client"

import { cn } from "@/shared/lib/tailwind-cn"
import {
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { SidebarVariant } from "./sidebar"

const teacherItems = [
  { label: "الرئيسية",  href: "/teacher/dashboard",    icon: LayoutDashboard },
  { label: "مجموعاتي", href: "/teacher/groups",         icon: BookOpen        },
  { label: "طلبات",    href: "/teacher/join-requests",  icon: UserCheck       },
  { label: "رسائل",    href: "/teacher/messages",       icon: MessageCircle   },
  { label: "إشعارات",  href: "/teacher/notifications",  icon: Bell            },
]

const studentItems = [
  { label: "الرئيسية", href: "/student/dashboard",    icon: LayoutDashboard },
  { label: "مجموعتي", href: "/student/group",          icon: BookOpen        },
  { label: "الواجبات", href: "/student/assignments",   icon: ClipboardList   },
  { label: "الترتيب", href: "/student/ranking",        icon: Trophy          },
  { label: "رسائل",   href: "/student/messages",       icon: MessageCircle   },
]

const adminItems = [
  { label: "الرئيسية",  href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "المدرسون", href: "/admin/teachers",   icon: Users           },
  { label: "المجموعات",href: "/admin/groups",     icon: BookOpen        },
  { label: "حسابي",    href: "/admin/profile",    icon: Settings        },
]

const itemsMap = { teacher: teacherItems, student: studentItems, admin: adminItems }

export function MobileNav({ variant }: { variant: SidebarVariant }) {
  const pathname = usePathname()
  const items = itemsMap[variant]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card pb-safe md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("size-5", active && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
