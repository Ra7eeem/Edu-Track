import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { env } from "../config/env";
import { ALLOWED_IMAGE_TYPES } from "../config/constants";
import { ApiError } from "../utils/ApiError";

// ─────────────────────────────────────────
// Lazy upload directory creation
// ─────────────────────────────────────────
// Do NOT call fs.mkdirSync at module load time — on Vercel the filesystem
// is read-only except for /tmp, and the directory may not be reachable
// until a request actually arrives.

function ensureUploadDir(): string {
  const dir = path.resolve(env.UPLOAD_DIR);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // /tmp is the only writable location on Vercel; fall back silently.
    // Upload errors will surface via multer's own error handling.
  }
  return dir;
}

// ─────────────────────────────────────────
// Storage — resolve dest lazily per request
// ─────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ─────────────────────────────────────────
// File type filter
// ─────────────────────────────────────────

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "نوع الملف غير مسموح به، يُقبل فقط: JPEG, PNG, WebP",
        "INVALID_FILE_TYPE"
      )
    );
  }
};

// ─────────────────────────────────────────
// Multer instance
// ─────────────────────────────────────────

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

// ─────────────────────────────────────────
// Build public URL from filename
// ─────────────────────────────────────────

export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
