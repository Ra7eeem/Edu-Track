import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { addStudentSchema, updateProfileSchema } from "./teacher.schemas";
import * as TeacherController from "./teacher.controller";

export const teacherRouter = Router();

teacherRouter.use(authenticate, authorize(Role.TEACHER));

// Profile
teacherRouter.get("/profile", TeacherController.getProfile);
teacherRouter.patch("/profile", validate(updateProfileSchema), TeacherController.updateProfile);

// My groups
teacherRouter.get("/groups", TeacherController.getMyGroups);
teacherRouter.get("/dashboard", TeacherController.getDashboard);

// Join requests
teacherRouter.get("/join-requests", TeacherController.getJoinRequests);
teacherRouter.post("/join-requests/:requestId/approve", TeacherController.approveJoinRequest);
teacherRouter.post("/join-requests/:requestId/reject", TeacherController.rejectJoinRequest);

// Students per group
teacherRouter.get("/groups/:groupId/students", TeacherController.getStudentsInGroup);
teacherRouter.post("/students", validate(addStudentSchema), TeacherController.addStudent);
teacherRouter.delete(
  "/groups/:groupId/students/:studentId",
  TeacherController.removeStudentFromGroup
);

// Student profile (teacher view)
teacherRouter.get("/groups/:groupId/students/:studentId/profile", TeacherController.getStudentProfile);

// Student Notes CRUD
teacherRouter.get(   "/groups/:groupId/students/:studentId/notes",      TeacherController.getNotes);
teacherRouter.post(  "/groups/:groupId/students/:studentId/notes",      TeacherController.createNote);
teacherRouter.patch( "/groups/:groupId/students/:studentId/notes/:noteId", TeacherController.updateNote);
teacherRouter.delete("/groups/:groupId/students/:studentId/notes/:noteId", TeacherController.deleteNote);

// Attendance Register (كشاف)
teacherRouter.get("/groups/:groupId/attendance/register", TeacherController.getAttendanceRegister);
