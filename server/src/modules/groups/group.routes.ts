import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import { Role } from "../../types";
import { createGroupSchema, updateGroupSchema } from "./group.schemas";
import * as GroupController from "./group.controller";

// Attendance & ranking sub-routers
import { attendanceRouter } from "../attendance/attendance.routes";
import { rankingRouter } from "../ranking/ranking.routes";
import { postRouter } from "../posts/post.routes";

export const groupRouter = Router();

// List & get (any authenticated user)
groupRouter.get("/", authenticate, GroupController.listGroups);
groupRouter.get("/:id", authenticate, GroupController.getGroup);
groupRouter.get("/:id/members", authenticate, GroupController.getGroupMembers);
groupRouter.get("/:id/teachers", authenticate, GroupController.getGroupTeachers);

// Create — teacher or admin
groupRouter.post(
  "/",
  authenticate,
  authorize(Role.TEACHER, Role.ADMIN),
  upload.single("image"),
  validate(createGroupSchema),
  GroupController.createGroup
);

// Update — teacher (own group) or admin
groupRouter.patch(
  "/:id",
  authenticate,
  authorize(Role.TEACHER, Role.ADMIN),
  upload.single("image"),
  validate(updateGroupSchema),
  GroupController.updateGroup
);

// Nested sub-routes
groupRouter.use("/:groupId/attendance", attendanceRouter);
groupRouter.use("/:groupId/ranking", rankingRouter);
groupRouter.use("/:groupId/posts", postRouter);
