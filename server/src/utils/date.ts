// ─────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────

/**
 * Normalise a date to midnight UTC (date-only, no time component).
 * Used to ensure one attendance session per group per calendar day.
 */
export function toDateOnly(date: Date | string): Date {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

/** Return current month (1–12) and year in UTC */
export function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

/** Parse month/year from query params, fallback to current */
export function parseMonthYear(
  month?: string,
  year?: string
): { month: number; year: number } {
  const current = currentMonthYear();
  const m = parseInt(month ?? "", 10);
  const y = parseInt(year ?? "", 10);
  return {
    month: m >= 1 && m <= 12 ? m : current.month,
    year: y > 2000 ? y : current.year,
  };
}
