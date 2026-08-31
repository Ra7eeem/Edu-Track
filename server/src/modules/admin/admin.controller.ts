import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as AdminService from "./admin.service";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  UpdateGroupDto,
  AddTeacherToGroupDto,
  CreateGroupAdminDto,
  UpdateAdminProfileDto,
} from "./admin.schemas";

const p = (v: string | string[]): string => String(v);

// ── Dashboard ─────────────────────────────

export const getDashboard = asyncHandler(async (_req, res: Response) => {
  const stats = await AdminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const getDashboardFull = asyncHandler(async (_req, res: Response) => {
  const data = await AdminService.getDashboardFull();
  sendSuccess(res, data);
});

// ── Teachers ──────────────────────────────

export const getTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AdminService.getTeachers(req);
  sendPaginated(res, data, pagination);
});

export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await AdminService.getTeacherById(p(req.params.id));
  sendSuccess(res, teacher);
});

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await AdminService.createTeacher(req.body as CreateTeacherDto);
  sendSuccess(res, teacher, 201, "تم إنشاء حساب المدرس بنجاح");
});

export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await AdminService.updateTeacher(p(req.params.id), req.body as UpdateTeacherDto);
  sendSuccess(res, teacher, 200, "تم تحديث بيانات المدرس");
});

export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deleteTeacher(p(req.params.id));
  sendSuccess(res, null, 200, "تم حذف المدرس");
});

// ── Groups ────────────────────────────────

export const getGroups = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AdminService.getGroups(req);
  sendPaginated(res, data, pagination);
});

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await AdminService.createGroup(
    req.body as CreateGroupAdminDto,
    req.user!.userId
  );
  sendSuccess(res, group, 201, "تم إنشاء المجموعة بنجاح");
});

export const getGroupById = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getGroupById(p(req.params.id));
  sendSuccess(res, result);
});

export const updateGroup = asyncHandler(async (req: Request, res: Response) => {
  const group = await AdminService.updateGroup(p(req.params.id), req.body as UpdateGroupDto);
  sendSuccess(res, group, 200, "تم تحديث المجموعة");
});

export const deleteGroup = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deleteGroup(p(req.params.id));
  sendSuccess(res, null, 200, "تم حذف المجموعة");
});

export const addTeacherToGroup = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.addTeacherToGroup(
    p(req.params.groupId),
    (req.body as AddTeacherToGroupDto).teacherId
  );
  sendSuccess(res, result, 201, "تم إضافة المدرس إلى المجموعة");
});

export const removeTeacherFromGroup = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.removeTeacherFromGroup(p(req.params.groupId), p(req.params.teacherId));
  sendSuccess(res, null, 200, "تم إزالة المدرس من المجموعة");
});

// ── Students ──────────────────────────────

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AdminService.getStudents(req);
  sendPaginated(res, data, pagination);
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getStudentById(p(req.params.id));
  sendSuccess(res, result);
});

// ── Admin Profile ─────────────────────────

export const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminService.getAdminProfile(req.user!.userId);
  sendSuccess(res, admin);
});

export const updateAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminService.updateAdminProfile(req.user!.userId, req.body as UpdateAdminProfileDto);
  sendSuccess(res, admin, 200, "تم تحديث البيانات بنجاح");
});

// ── Group Students ────────────────────────

export const getGroupStudents = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AdminService.getGroupStudents(p(req.params.id), req);
  sendPaginated(res, data, pagination);
});

export const removeStudentFromGroup = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.removeStudentFromGroup(p(req.params.id), p(req.params.studentId));
  sendSuccess(res, null, 200, "تم حذف الطالب من المجموعة بنجاح");
});

// ── Attendance Register ────────────────────

export const getAttendanceRegister = asyncHandler(async (req: Request, res: Response) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year  = Number(req.query.year)  || new Date().getFullYear();
  const data  = await AdminService.getAttendanceRegister(p(req.params.groupId), month, year);
  sendSuccess(res, data);
});
