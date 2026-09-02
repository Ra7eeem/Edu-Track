import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as AssignmentService from "./assignment.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./assignment.schemas";

const p = (v: string | string[]): string => String(v);

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await AssignmentService.createAssignment(
    req.user!.userId,
    req.body as CreateAssignmentDto
  );
  sendSuccess(res, result, 201, "تم إضافة الواجب بنجاح");
});

export const getGroupAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AssignmentService.getGroupAssignments(
    p(req.params.groupId),
    req,
    req.user!.userId,
    req.user!.role
  );
  sendPaginated(res, data, pagination);
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await AssignmentService.updateAssignment(
    req.user!.userId,
    p(req.params.assignmentId),
    req.body as UpdateAssignmentDto
  );
  sendSuccess(res, result, 200, "تم تحديث الواجب");
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  await AssignmentService.deleteAssignment(
    req.user!.userId,
    p(req.params.assignmentId)
  );
  sendSuccess(res, null, 200, "تم حذف الواجب");
});

export const submitExam = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params
  const { answers } = req.body as { answers: { questionId: string; chosen: string }[] }
  const result = await AssignmentService.submitExam(
    req.user!.userId,
    p(assignmentId),
    answers ?? []
  );
  sendSuccess(res, result, 201, "تم إرسال إجاباتك بنجاح");
});

export const getMySubmission = asyncHandler(async (req: Request, res: Response) => {
  const result = await AssignmentService.getMySubmission(
    req.user!.userId,
    p(req.params.assignmentId)
  );
  sendSuccess(res, result);
});

export const getExamSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AssignmentService.getExamSubmissions(
    req.user!.userId,
    p(req.params.assignmentId),
    req
  );
  sendPaginated(res, data, pagination);
});
