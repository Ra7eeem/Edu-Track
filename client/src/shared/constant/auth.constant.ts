// 60 days (2 months) in seconds: 60 * 24 * 60 * 60 = 5,184,000s
export const sessionMaxAge =
  Number(process.env.NEXTAUTH_SESSION_MAX_AGE) || 60 * 60 * 24 * 60
