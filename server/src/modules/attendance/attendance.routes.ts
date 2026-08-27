import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { recordAttendanceSchema } from "./attendance.schemas";
import * as AttendanceController from "./attendance.controller";

// Note: this router is mounted at /api/groups/:groupId/attendance
export const attendanceRouter = Router({ mergeParams: true });

attendanceRouter.use(authenticate);

// Get history — teacher (own group) or admin
attendanceRouter.get(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  AttendanceController.getAttendanceHistory
);

// Record — teacher only
attendanceRouter.post(
  "/",
  authorize(Role.TEACHER),
  validate(recordAttendanceSchema),
  AttendanceController.recordAttendance
);
