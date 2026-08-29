import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { upload } from "../../middleware/upload";
import { Role } from "../../types";
import { updateStudentProfileSchema } from "./student.schemas";
import * as StudentController from "./student.controller";

export const studentRouter = Router();

studentRouter.use(authenticate, authorize(Role.STUDENT));

studentRouter.get("/me", StudentController.getMyProfile);
studentRouter.get("/me/dashboard", StudentController.getDashboard);
studentRouter.patch(
  "/me",
  upload.single("avatar"),
  validate(updateStudentProfileSchema),
  StudentController.updateMyProfile
);
studentRouter.get("/me/groups", StudentController.getMyGroups);
studentRouter.get("/me/join-requests", StudentController.getMyJoinRequests);
studentRouter.get("/me/groups/:groupId/attendance", StudentController.getMyAttendance);
studentRouter.get("/me/scores", StudentController.getMyScores);
