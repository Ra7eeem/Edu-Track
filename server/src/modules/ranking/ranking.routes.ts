import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import * as RankingController from "./ranking.controller";

// Mounted at /api/groups/:groupId/ranking
export const rankingRouter = Router({ mergeParams: true });

rankingRouter.use(authenticate);

rankingRouter.get("/", RankingController.getGroupRanking);
rankingRouter.get("/students/:studentId", RankingController.getStudentRank);
