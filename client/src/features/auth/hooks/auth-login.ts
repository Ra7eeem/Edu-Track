"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, getSession } from "next-auth/react"
import { LoginFormValues, loginSchema } from "../schemas/login.schema"
import { Role } from "@/shared/types/api"

/**
 * useLogin custom hook
 * Follows Rose-App architecture: uses React Hook Form + zodResolver + NextAuth signIn.
 */
export function useLogin(callbackUrl?: string) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      const loginResponse = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (!loginResponse?.ok) {
        setError("root", {
          type: "server",
          message: loginResponse?.error ?? "بيانات الدخول غير صحيحة",
        })
        return
      }

      // Read session to get user role
      const session = await getSession()
      const role = session?.user?.role

      const defaultDest =
        role === Role.ADMIN
          ? "/admin/dashboard"
          : role === Role.TEACHER
          ? "/teacher/dashboard"
          : "/student/dashboard"

      const destination = callbackUrl || defaultDest
      window.location.href = destination
    } catch {
      setError("root", {
        type: "server",
        message: "حدث خطأ غير متوقع أثناء تسجيل الدخول",
      })
    }
  }

  return {
    handleSubmit,
    control,
    errors,
    isSubmitting,
    onSubmit,
  }
}

