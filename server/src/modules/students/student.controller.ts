import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as StudentService from "./student.service";
import { UpdateStudentProfileDto } from "./student.schemas";

const p = (v: string | string[]): string => String(v);
const uid = (req: Request) => req.user!.userId;

export const getMyProfile = asyncHandler(async (req, res: Response) => {
  const student = await StudentService.getMyProfile(uid(req));
  sendSuccess(res, student);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const student = await StudentService.updateMyProfile(
    uid(req),
    req.body as UpdateStudentProfileDto,
    req.file?.filename
  );
  sendSuccess(res, student, 200, "تم تحديث الملف الشخصي");
});

export const getMyGroups = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await StudentService.getMyGroups(uid(req), req);
  sendPaginated(res, data, pagination);
});

export const getMyJoinRequests = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await StudentService.getMyJoinRequests(uid(req), req);
  sendPaginated(res, data, pagination);
});

export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await StudentService.getMyAttendanceInGroup(
    uid(req),
    p(req.params.groupId),
    req
  );
  sendPaginated(res, data, pagination);
});

export const getMyScores = asyncHandler(async (req, res: Response) => {
  const result = await StudentService.getMyScores(uid(req), req);
  sendSuccess(res, result);
});

export const getDashboard = asyncHandler(async (req, res: Response) => {
  const data = await StudentService.getDashboard(uid(req));
  sendSuccess(res, data);
});
