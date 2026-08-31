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

// ── Student Profile ───────────────────────
export const getStudentProfile = asyncHandler(async (req, res: Response) => {
  const data = await TeacherService.getStudentProfile(
    uid(req), p(req.params.groupId), p(req.params.studentId)
  );
  sendSuccess(res, data);
});

// ── Attendance Register ───────────────────
export const getAttendanceRegister = asyncHandler(async (req, res: Response) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year  = Number(req.query.year)  || new Date().getFullYear();
  const data  = await TeacherService.getAttendanceRegister(
    uid(req), p(req.params.groupId), month, year
  );
  sendSuccess(res, data);
});

// ── Notes CRUD ────────────────────────────
export const getNotes = asyncHandler(async (req, res: Response) => {
  const notes = await TeacherService.getNotes(
    uid(req), p(req.params.groupId), p(req.params.studentId)
  );
  sendSuccess(res, notes);
});

export const createNote = asyncHandler(async (req, res: Response) => {
  const { content } = req.body as { content: string };
  if (!content?.trim()) {
    const { ApiError } = await import("../../utils/ApiError");
    throw ApiError.badRequest("محتوى الملاحظة مطلوب");
  }
  const note = await TeacherService.createNote(
    uid(req), p(req.params.groupId), p(req.params.studentId), content.trim()
  );
  sendSuccess(res, note, 201, "تمت إضافة الملاحظة");
});

export const updateNote = asyncHandler(async (req, res: Response) => {
  const { content } = req.body as { content: string };
  if (!content?.trim()) {
    const { ApiError } = await import("../../utils/ApiError");
    throw ApiError.badRequest("محتوى الملاحظة مطلوب");
  }
  const note = await TeacherService.updateNote(uid(req), p(req.params.noteId), content.trim());
  sendSuccess(res, note, 200, "تم تحديث الملاحظة");
});

export const deleteNote = asyncHandler(async (req, res: Response) => {
  await TeacherService.deleteNote(uid(req), p(req.params.noteId));
  sendSuccess(res, null, 200, "تم حذف الملاحظة");
});
