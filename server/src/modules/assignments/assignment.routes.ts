import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { createAssignmentSchema, updateAssignmentSchema } from "./assignment.schemas";
import * as AssignmentController from "./assignment.controller";

// Standalone router — mounted at /api/assignments
export const assignmentRouter = Router();
assignmentRouter.use(authenticate);

// POST  /api/assignments                         — teacher creates
assignmentRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createAssignmentSchema),
  AssignmentController.createAssignment
);

// GET   /api/assignments/group/:groupId          — teacher or student lists
assignmentRouter.get(
  "/group/:groupId",
  AssignmentController.getGroupAssignments
);

// POST  /api/assignments/:assignmentId/submit     — student submits exam
assignmentRouter.post(
  "/:assignmentId/submit",
  authorize(Role.STUDENT),
  AssignmentController.submitExam
);

// GET   /api/assignments/:assignmentId/my-submission  — student checks own submission
assignmentRouter.get(
  "/:assignmentId/my-submission",
  authorize(Role.STUDENT),
  AssignmentController.getMySubmission
);

// GET   /api/assignments/:assignmentId/submissions    — teacher views all
assignmentRouter.get(
  "/:assignmentId/submissions",
  authorize(Role.TEACHER, Role.ADMIN),
  AssignmentController.getExamSubmissions
);

// PATCH /api/assignments/:assignmentId           — teacher updates own
assignmentRouter.patch(
  "/:assignmentId",
  authorize(Role.TEACHER),
  validate(updateAssignmentSchema),
  AssignmentController.updateAssignment
);

// DELETE /api/assignments/:assignmentId          — teacher deletes own
assignmentRouter.delete(
  "/:assignmentId",
  authorize(Role.TEACHER, Role.ADMIN),
  AssignmentController.deleteAssignment
);
