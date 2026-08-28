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
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { Group } from "../../models/Group";

export const authRouter = Router();

authRouter.post("/login",  authLimiter, validate(loginSchema),           loginController);
authRouter.post("/register/student", authLimiter, validate(registerStudentSchema), registerStudentController);
authRouter.get("/me", authenticate, getMeController);

// ── Public: list groups for registration (name + _id + grades only) ────────────
// No JWT required — used by the register form to filter groups by grade
authRouter.get(
  "/groups",
  asyncHandler(async (req, res) => {
    const grade = req.query.grade as string | undefined;

    const filter: Record<string, unknown> = { isActive: true };

    if (grade) {
      filter.$and = [
        {
          $or: [
            { grades: { $exists: false } },
            { grades: null },
            { grades: { $size: 0 } },
            { grades: { $elemMatch: { $eq: grade } } },
          ],
        },
      ];
    }

    const groups = await Group.find(filter as never)
      .select("_id name grades")
      .sort({ name: 1 })
      .limit(200)
      .lean();

    sendSuccess(res, groups);
  })
);
