import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as AttendanceService from "./attendance.service";
import { RecordAttendanceDto } from "./attendance.schemas";

const p = (v: string | string[]): string => String(v);

export const recordAttendance = asyncHandler(async (req: Request, res: Response) => {
  const session = await AttendanceService.recordAttendance(
    req.user!.userId,
    p(req.params.groupId),
    req.body as RecordAttendanceDto
  );
  sendSuccess(res, session, 200, "تم تسجيل الحضور بنجاح");
});

export const getAttendanceHistory = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AttendanceService.getAttendanceHistory(
    p(req.params.groupId),
    req,
    req.user!.userId,
    req.user!.role
  );
  sendPaginated(res, data, pagination);
});
