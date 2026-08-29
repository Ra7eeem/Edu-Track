import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as AnonymousService from "./anonymous.service";
import { SendMessageDto, ReplyMessageDto } from "./anonymous.schemas";

const p = (v: string | string[]): string => String(v);

// Student: send message
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const result = await AnonymousService.sendMessage(
    req.user!.userId,
    req.body as SendMessageDto
  );
  sendSuccess(res, result, 201, "تم إرسال الرسالة");
});

// Student: my messages
export const getMyMessages = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AnonymousService.getMyMessages(req.user!.userId, req);
  sendPaginated(res, data, pagination);
});

// Teacher: messages to me
export const getTeacherMessages = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AnonymousService.getTeacherMessages(req.user!.userId, req);
  sendPaginated(res, data, pagination);
});

// Teacher: reply
export const replyToMessage = asyncHandler(async (req: Request, res: Response) => {
  const result = await AnonymousService.replyToMessage(
    req.user!.userId,
    p(req.params.messageId),
    req.body as ReplyMessageDto
  );
  sendSuccess(res, result, 200, "تم إرسال الرد");
});

// Admin: all messages
export const getAllMessages = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await AnonymousService.getAllMessages(req);
  sendPaginated(res, data, pagination);
});

// Student: delete own message
export const deleteMyMessage = asyncHandler(async (req: Request, res: Response) => {
  await AnonymousService.deleteMyMessage(req.user!.userId, p(req.params.messageId));
  sendSuccess(res, null, 200, "تم حذف الرسالة");
});
