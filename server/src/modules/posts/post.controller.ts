import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as PostService from "./post.service";
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
} from "./post.schemas";

const p = (v: string | string[]): string => String(v);
const uid = (req: Request) => req.user!.userId;
const role = (req: Request) => req.user!.role;

// ── Posts ─────────────────────────────────

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await PostService.getPosts(
    p(req.params.groupId),
    uid(req),
    role(req),
    req
  );
  sendPaginated(res, data, pagination);
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostService.createPost(
    p(req.params.groupId),
    uid(req),
    role(req),
    req.body as CreatePostDto,
    req.file?.filename
  );
  sendSuccess(res, post, 201, "تم نشر المنشور");
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostService.updatePost(
    p(req.params.postId),
    uid(req),
    role(req),
    req.body as UpdatePostDto,
    req.file?.filename
  );
  sendSuccess(res, post, 200, "تم تحديث المنشور");
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await PostService.deletePost(p(req.params.postId), uid(req), role(req));
  sendSuccess(res, null, 200, "تم حذف المنشور");
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const result = await PostService.toggleLike(p(req.params.postId), uid(req));
  sendSuccess(res, result);
});

// ── Comments ──────────────────────────────

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await PostService.getComments(p(req.params.postId), req);
  sendPaginated(res, data, pagination);
});

export const getReplies = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await PostService.getReplies(p(req.params.commentId), req);
  sendPaginated(res, data, pagination);
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await PostService.createComment(
    p(req.params.postId),
    uid(req),
    req.body as CreateCommentDto
  );
  sendSuccess(res, comment, 201, "تم إضافة التعليق");
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await PostService.updateComment(
    p(req.params.commentId),
    uid(req),
    role(req),
    req.body as UpdateCommentDto
  );
  sendSuccess(res, comment, 200, "تم تحديث التعليق");
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await PostService.deleteComment(p(req.params.commentId), uid(req), role(req));
  sendSuccess(res, null, 200, "تم حذف التعليق");
});
