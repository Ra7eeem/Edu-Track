"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { LogOut } from "lucide-react"
import { ComponentProps } from "react"
import { cn } from "@/shared/lib/tailwind-cn"

interface LogoutButtonProps extends ComponentProps<typeof Button> {
  callbackUrl?: string
  showIcon?: boolean
  text?: string
}

/**
 * LogoutButton component
 * Uses NextAuth signOut function for clean, client-side session termination.
 * Follows Rose-App architecture.
 */
export function LogoutButton({
  callbackUrl = "/login",
  showIcon = true,
  text = "تسجيل الخروج",
  className,
  variant = "outline",
  ...props
}: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => signOut({ callbackUrl })}
      className={cn(className)}
      {...props}
    >
      {showIcon && <LogOut className="size-4" />}
      {text}
    </Button>
  )
}

