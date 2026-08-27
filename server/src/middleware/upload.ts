import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { env } from "../config/env";
import { ALLOWED_IMAGE_TYPES } from "../config/constants";
import { ApiError } from "../utils/ApiError";

// ─────────────────────────────────────────
// Ensure upload directory exists
// ─────────────────────────────────────────

const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─────────────────────────────────────────
// Storage — preserve original extension
// ─────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
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
    cb(new ApiError(400, "نوع الملف غير مسموح به، يُقبل فقط: JPEG, PNG, WebP", "INVALID_FILE_TYPE"));
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
