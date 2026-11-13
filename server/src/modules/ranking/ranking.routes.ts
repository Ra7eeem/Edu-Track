import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import * as RankingController from "./ranking.controller";

// Mounted at /api/groups/:groupId/ranking
export const rankingRouter = Router({ mergeParams: true });

rankingRouter.use(authenticate, userLimiter);

// GET  /api/groups/:groupId/ranking                              — any auth user
rankingRouter.get("/", RankingController.getGroupRanking);

// GET  /api/groups/:groupId/ranking/students/:studentId         — any auth user
rankingRouter.get("/students/:studentId", RankingController.getStudentRank);

// POST /api/groups/:groupId/ranking/reset?month=&year=          — teacher only
rankingRouter.post(
  "/reset",
  authorize(Role.TEACHER, Role.ADMIN),
  RankingController.resetRanking
);

// POST /api/groups/:groupId/ranking/students/:studentId/bonus   — teacher only
// body: { bonus: number }   query: ?month=&year=
rankingRouter.post(
  "/students/:studentId/bonus",
  authorize(Role.TEACHER, Role.ADMIN),
  RankingController.addBonusPoints
);
