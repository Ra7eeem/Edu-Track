import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import {
  createTeacherSchema,
  updateTeacherSchema,
  updateGroupSchema,
  createGroupSchema,
  addTeacherToGroupSchema,
} from "./admin.schemas";
import * as AdminController from "./admin.controller";

export const adminRouter = Router();

// All admin routes require ADMIN role
adminRouter.use(authenticate, authorize(Role.ADMIN));

// ── Dashboard ─────────────────────────────
adminRouter.get("/dashboard", AdminController.getDashboard);

// ── Teachers ──────────────────────────────
adminRouter.get("/teachers", AdminController.getTeachers);
adminRouter.get("/teachers/:id", AdminController.getTeacherById);
adminRouter.post("/teachers", validate(createTeacherSchema), AdminController.createTeacher);
adminRouter.patch("/teachers/:id", validate(updateTeacherSchema), AdminController.updateTeacher);
adminRouter.delete("/teachers/:id", AdminController.deleteTeacher);

// ── Groups ────────────────────────────────
adminRouter.get("/groups", AdminController.getGroups);
adminRouter.get("/groups/:id", AdminController.getGroupById);
adminRouter.post("/groups", validate(createGroupSchema), AdminController.createGroup);
adminRouter.patch("/groups/:id", validate(updateGroupSchema), AdminController.updateGroup);
adminRouter.delete("/groups/:id", AdminController.deleteGroup);

// ── Group ↔ Teacher assignment ────────────
adminRouter.post(
  "/groups/:groupId/teachers",
  validate(addTeacherToGroupSchema),
  AdminController.addTeacherToGroup
);
adminRouter.delete(
  "/groups/:groupId/teachers/:teacherId",
  AdminController.removeTeacherFromGroup
);

// ── Students ──────────────────────────────
adminRouter.get("/students", AdminController.getStudents);
adminRouter.get("/students/:id", AdminController.getStudentById);

// ── Attendance (admin view any group) ─────
import { getAttendanceHistory } from "../attendance/attendance.controller";
adminRouter.get("/groups/:groupId/attendance", getAttendanceHistory);

// ── Ranking (admin view any group) ────────
import { getGroupRanking } from "../ranking/ranking.controller";
adminRouter.get("/groups/:groupId/ranking", getGroupRanking);

// ── Posts (admin view) ────────────────────
import { getPosts } from "../posts/post.controller";
adminRouter.get("/groups/:groupId/posts", getPosts);
