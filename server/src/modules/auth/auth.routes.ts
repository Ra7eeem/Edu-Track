import { Router } from "express";
import { authLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { loginSchema, registerStudentSchema } from "./auth.schemas";
import {
  loginController,
  registerStudentController,
  getMeController,
} from "./auth.controller";

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: تسجيل الدخول لجميع المستخدمين
 */
authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  loginController
);

/**
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     tags: [Auth]
 *     summary: تسجيل طالب جديد
 */
authRouter.post(
  "/register/student",
  authLimiter,
  validate(registerStudentSchema),
  registerStudentController
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: بيانات المستخدم الحالي
 *     security:
 *       - bearerAuth: []
 */
authRouter.get("/me", authenticate, getMeController);
