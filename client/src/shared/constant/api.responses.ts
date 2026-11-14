/**
 * Standardized API Responses
 * Follows Rose-App architecture for predictable error handling
 */

export const RESPONSES = {
  unauthorized: {
    success: false as const,
    code: "UNAUTHORIZED",
    message: "غير مصرح لك بالوصول، يرجى تسجيل الدخول",
  },
  forbidden: {
    success: false as const,
    code: "FORBIDDEN",
    message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
  },
  notFound: {
    success: false as const,
    code: "NOT_FOUND",
    message: "العنصر المطلوب غير موجود",
  },
  badRequest: (message = "بيانات غير صالحة") => ({
    success: false as const,
    code: "BAD_REQUEST",
    message,
  }),
  serverError: (message = "حدث خطأ غير متوقع في الخادم") => ({
    success: false as const,
    code: "INTERNAL_SERVER_ERROR",
    message,
  }),
} as const

