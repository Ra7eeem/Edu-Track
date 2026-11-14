"use client"

import { signOut } from "next-auth/react"

/**
 * useLogout hook
 * Uses NextAuth signOut function with configurable callback URL.
 */
export function useLogout() {
  const logout = async (callbackUrl = "/login") => {
    await signOut({ callbackUrl })
  }

  return { logout }
}

