import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as GroupService from "./group.service";
import { CreateGroupDto, UpdateGroupDto } from "./group.schemas";

const p = (v: string | string[]): string => String(v);

export const listGroups = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await GroupService.listGroups(req);
  sendPaginated(res, data, pagination);
});

export const getGroup = asyncHandler(async (req, res: Response) => {
  const result = await GroupService.getGroup(p(req.params.id));
  sendSuccess(res, result);
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await GroupService.createGroup(
    req.user!.userId,
    req.user!.role,
    req.body as CreateGroupDto,
    req.file?.filename
  );
  sendSuccess(res, group, 201, "تم إنشاء المجموعة بنجاح");
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await GroupService.updateGroup(
    p(req.params.id),
    req.user!.userId,
    req.user!.role,
    req.body as UpdateGroupDto,
    req.file?.filename
  );
  sendSuccess(res, group, 200, "تم تحديث المجموعة");
});

export const getGroupMembers = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await GroupService.getGroupMembers(p(req.params.id), req);
  sendPaginated(res, data, pagination);
});

export const getGroupTeachers = asyncHandler(async (req, res: Response) => {
  const teachers = await GroupService.getGroupTeachers(p(req.params.id));
  sendSuccess(res, teachers);
});
