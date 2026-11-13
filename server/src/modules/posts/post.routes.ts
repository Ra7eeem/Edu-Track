import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
} from "./post.schemas";
import * as PostController from "./post.controller";

// Mounted at /api/groups/:groupId/posts
export const postRouter = Router({ mergeParams: true });
postRouter.use(authenticate, userLimiter);

postRouter.use(authenticate);

// Posts
postRouter.get("/", PostController.getPosts);
postRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  upload.single("image"),
  validate(createPostSchema),
  PostController.createPost
);
postRouter.patch(
  "/:postId",
  authorize(Role.TEACHER, Role.ADMIN),
  upload.single("image"),
  validate(updatePostSchema),
  PostController.updatePost
);
postRouter.delete(
  "/:postId",
  authorize(Role.TEACHER, Role.ADMIN),
  PostController.deletePost
);

// Likes
postRouter.post("/:postId/like", PostController.toggleLike);

// Comments
postRouter.get("/:postId/comments", PostController.getComments);
postRouter.post(
  "/:postId/comments",
  validate(createCommentSchema),
  PostController.createComment
);
postRouter.get(
  "/:postId/comments/:commentId/replies",
  PostController.getReplies
);
postRouter.patch(
  "/:postId/comments/:commentId",
  validate(updateCommentSchema),
  PostController.updateComment
);
postRouter.delete("/:postId/comments/:commentId", PostController.deleteComment);
