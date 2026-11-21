import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import {
  createTeamSchema,
  updateTeamSchema,
  adjustPointsSchema,
} from "./team.schemas";
import * as TeamController from "./team.controller";

export const teamRouter = Router();

// All routes require authentication and user rate limiting
teamRouter.use(authenticate, userLimiter);

// ── Teacher-only management routes ───────────────────────
teamRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createTeamSchema),
  TeamController.createTeam
);

teamRouter.patch(
  "/:teamId/adjust-points",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(adjustPointsSchema),
  TeamController.adjustPoints
);

teamRouter.post(
  "/classroom/:classroomId/reset-scores",
  authorize(Role.TEACHER, Role.ADMIN),
  TeamController.resetLeaderboard
);

teamRouter.put(
  "/:teamId",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(updateTeamSchema),
  TeamController.updateTeam
);

teamRouter.delete(
  "/:teamId",
  authorize(Role.TEACHER, Role.ADMIN),
  TeamController.deleteTeam
);

// ── Shared / Student routes ──────────────────────────────
teamRouter.get("/classroom/:classroomId", TeamController.getClassroomTeams);
teamRouter.get("/classroom/:classroomId/my-team", TeamController.getStudentTeam);
teamRouter.get("/classroom/:classroomId/history", TeamController.getArchivedLeaderboards);
