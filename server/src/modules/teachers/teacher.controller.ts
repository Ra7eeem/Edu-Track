import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as TeacherService from "./teacher.service";
import { AddStudentDto, UpdateProfileDto } from "./teacher.schemas";

const p = (v: string | string[]): string => String(v);
const uid = (req: Request) => req.user!.userId;

export const getMyGroups = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await TeacherService.getMyGroups(uid(req), req);
  sendPaginated(res, data, pagination);
});

export const getJoinRequests = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await TeacherService.getJoinRequests(uid(req), req);
  sendPaginated(res, data, pagination);
});

export const approveJoinRequest = asyncHandler(async (req, res: Response) => {
  const result = await TeacherService.approveJoinRequest(uid(req), p(req.params.requestId));
  sendSuccess(res, result, 200, "تمت الموافقة على طلب الانضمام");
});

export const rejectJoinRequest = asyncHandler(async (req, res: Response) => {
  const result = await TeacherService.rejectJoinRequest(uid(req), p(req.params.requestId));
  sendSuccess(res, result, 200, "تم رفض طلب الانضمام");
});

export const getStudentsInGroup = asyncHandler(async (req, res: Response) => {
  const { data, pagination } = await TeacherService.getStudentsInGroup(
    uid(req),
    p(req.params.groupId),
    req
  );
  sendPaginated(res, data, pagination);
});

export const addStudent = asyncHandler(async (req, res: Response) => {
  const result = await TeacherService.addStudent(uid(req), req.body as AddStudentDto);
  sendSuccess(res, result, 201, "تم إضافة الطالب بنجاح");
});

export const removeStudentFromGroup = asyncHandler(async (req, res: Response) => {
  await TeacherService.removeStudentFromGroup(
    uid(req),
    p(req.params.groupId),
    p(req.params.studentId)
  );
  sendSuccess(res, null, 200, "تم إزالة الطالب من المجموعة");
});

export const getProfile = asyncHandler(async (req, res: Response) => {
  const teacher = await TeacherService.getProfile(uid(req));
  sendSuccess(res, teacher);
});

export const updateProfile = asyncHandler(async (req, res: Response) => {
  const teacher = await TeacherService.updateProfile(uid(req), req.body as UpdateProfileDto);
  sendSuccess(res, teacher, 200, "تم تحديث الملف الشخصي");
});

export const getDashboard = asyncHandler(async (req, res: Response) => {
  const data = await TeacherService.getDashboard(uid(req));
  sendSuccess(res, data);
});
