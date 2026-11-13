import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// ─────────────────────────────────────────
// Request timeout middleware
// ─────────────────────────────────────────
// Vercel serverless functions have a hard 30 s limit (configured in
// vercel.json). We respond with a clean 503 at 25 s so the error message
// is ours, not Vercel's default HTML gateway-timeout page.
//
// Usage: app.use(requestTimeout()) — registered once, before routes.

const TIMEOUT_MS = 25_000; // 25 s — 5 s buffer before Vercel cuts us off

export function requestTimeout(ms = TIMEOUT_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip long-lived connections (SSE, WebSocket upgrades, etc.)
    if (req.headers.accept?.includes("text/event-stream")) {
      return next();
    }

    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;

      // Guard: don't send headers twice if the route already responded
      if (!res.headersSent) {
        sendError(
          res,
          503,
          "انتهت مهلة الطلب، حاول مرة أخرى",
          "REQUEST_TIMEOUT"
        );
      }
    }, ms);

    // Clear the timer when the response finishes (success or error)
    res.on("finish", () => clearTimeout(timer));
    res.on("close",  () => clearTimeout(timer));

    // Expose the flag so error handlers can check it if needed
    (req as Request & { timedOut?: boolean }).timedOut = timedOut;

    next();
  };
}
