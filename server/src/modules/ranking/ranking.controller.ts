import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as RankingService from "./ranking.service";

const p = (v: string | string[]): string => String(v);

export const getGroupRanking = asyncHandler(async (req: Request, res: Response) => {
  const result = await RankingService.getGroupRanking(p(req.params.groupId), req);
  sendSuccess(res, result);
});

export const getStudentRank = asyncHandler(async (req: Request, res: Response) => {
  const result = await RankingService.getStudentRank(
    p(req.params.groupId),
    p(req.params.studentId),
    req
  );
  sendSuccess(res, result);
});

// POST /api/groups/:groupId/ranking/reset?month=&year=
export const resetRanking = asyncHandler(async (req: Request, res: Response) => {
  const result = await RankingService.resetRanking(
    p(req.params.groupId),
    req.user!.userId,
    req
  );
  sendSuccess(res, result, 200, "تم تصفير الترتيب بنجاح");
});

// POST /api/groups/:groupId/ranking/students/:studentId/bonus?month=&year=
export const addBonusPoints = asyncHandler(async (req: Request, res: Response) => {
  const result = await RankingService.addBonusPoints(
    p(req.params.groupId),
    p(req.params.studentId),
    req.user!.userId,
    req
  );
  sendSuccess(res, result, 200, "تمت إضافة نقاط المكافأة بنجاح");
});
