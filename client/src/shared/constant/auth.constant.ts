export const sessionMaxAge =
  Number(process.env.NEXTAUTH_SESSION_MAX_AGE) || 60 * 60 * 24 * 7 // 7 days

