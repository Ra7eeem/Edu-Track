import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as TeamService from "./team.service";
import { CreateTeamDto, UpdateTeamDto, AdjustPointsDto } from "./team.schemas";
import { Role } from "../../types";

const p = (v: string | string[]): string => String(v);

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await TeamService.createTeam(req.user!.userId, req.body as CreateTeamDto);
  sendSuccess(res, team, 201, "تم إنشاء الفريق بنجاح");
});

export const getClassroomTeams = asyncHandler(async (req: Request, res: Response) => {
  const data = await TeamService.getClassroomTeams(
    req.user!.userId,
    req.user!.role,
    p(req.params.classroomId)
  );
  sendSuccess(res, data);
});

export const getStudentTeam = asyncHandler(async (req: Request, res: Response) => {
  const data = await TeamService.getStudentTeam(
    req.user!.userId,
    p(req.params.classroomId)
  );
  sendSuccess(res, data);
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await TeamService.updateTeam(
    req.user!.userId,
    p(req.params.teamId),
    req.body as UpdateTeamDto
  );
  sendSuccess(res, team, 200, "تم تحديث بيانات الفريق بنجاح");
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const result = await TeamService.deleteTeam(req.user!.userId, p(req.params.teamId));
  sendSuccess(res, result);
});

export const adjustPoints = asyncHandler(async (req: Request, res: Response) => {
  const result = await TeamService.adjustPoints(
    req.user!.userId,
    p(req.params.teamId),
    req.body as AdjustPointsDto
  );
  sendSuccess(res, result, 200, "تم تعديل النقاط بنجاح");
});

export const resetLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const result = await TeamService.resetLeaderboard(
    req.user!.userId,
    p(req.params.classroomId)
  );
  sendSuccess(res, result);
});

export const getArchivedLeaderboards = asyncHandler(async (req: Request, res: Response) => {
  const data = await TeamService.getArchivedLeaderboards(p(req.params.classroomId));
  sendSuccess(res, data);
});
