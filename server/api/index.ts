/**
 * Vercel Serverless Entry Point
 *
 * Vercel looks for a default export from files inside /api.
 * We simply re-export the Express app — Vercel wraps it in
 * a serverless handler automatically.
 */
import app from "../src/app";

export default app;
