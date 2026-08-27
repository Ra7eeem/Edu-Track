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
