/**
 * Tests: Join Request Flow
 *
 * Business rules covered:
 *  #6  — Student cannot access group before APPROVAL
 *  #7  — Teacher can only approve/reject requests for their own groups
 *  Teacher approval creates GroupMembership
 *  Teacher rejection does not create GroupMembership
 *  Duplicate approval is rejected (CONFLICT)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createTeacher,
  createStudent,
  createGroup,
  assignTeacherToGroup,
  createPendingRequest,
} from "./helpers/db";
import * as TeacherService from "../modules/teachers/teacher.service";
import { JoinRequest } from "../models/JoinRequest";
import { GroupMembership } from "../models/GroupMembership";
import { Notification } from "../models/Notification";
import { JoinRequestStatus } from "../types";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

describe("Teacher approves join request", () => {
  it("creates GroupMembership, sets status APPROVED, sends notification", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const request = await createPendingRequest(String(group._id), String(student._id));

    await TeacherService.approveJoinRequest(
      String(teacher._id),
      String(request._id)
    );

    const updatedReq = await JoinRequest.findById(request._id);
    expect(updatedReq!.status).toBe(JoinRequestStatus.APPROVED);
    expect(updatedReq!.reviewedAt).toBeTruthy();

    const membership = await GroupMembership.findOne({
      student: student._id,
      group: group._id,
    });
    expect(membership).toBeTruthy();

    const notification = await Notification.findOne({ user: student._id });
    expect(notification).toBeTruthy();
    expect(notification!.type).toBe("JOIN_REQUEST_APPROVED");
  });

  it("throws CONFLICT if request already processed", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const request = await createPendingRequest(String(group._id), String(student._id));

    await TeacherService.approveJoinRequest(String(teacher._id), String(request._id));

    await expect(
      TeacherService.approveJoinRequest(String(teacher._id), String(request._id))
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("Teacher rejects join request", () => {
  it("sets status REJECTED and does NOT create membership", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const request = await createPendingRequest(String(group._id), String(student._id));

    await TeacherService.rejectJoinRequest(
      String(teacher._id),
      String(request._id)
    );

    const updatedReq = await JoinRequest.findById(request._id);
    expect(updatedReq!.status).toBe(JoinRequestStatus.REJECTED);

    const membership = await GroupMembership.findOne({ student: student._id });
    expect(membership).toBeNull();

    const notification = await Notification.findOne({ user: student._id });
    expect(notification!.type).toBe("JOIN_REQUEST_REJECTED");
  });
});

describe("Teacher RBAC on join requests", () => {
  it("forbids teacher from approving a request in a group they do NOT manage", async () => {
    const teacher1 = await createTeacher("1");
    const teacher2 = await createTeacher("2");
    const student = await createStudent();
    const group = await createGroup(String(teacher1._id));
    // Only teacher1 is assigned
    await assignTeacherToGroup(String(group._id), String(teacher1._id));
    const request = await createPendingRequest(String(group._id), String(student._id));

    // teacher2 tries to approve — must be FORBIDDEN
    await expect(
      TeacherService.approveJoinRequest(String(teacher2._id), String(request._id))
    ).rejects.toMatchObject({ statusCode: 403 });

    // Request must still be PENDING
    const jr = await JoinRequest.findById(request._id);
    expect(jr!.status).toBe(JoinRequestStatus.PENDING);
  });

  it("forbids teacher from rejecting a request in a group they do NOT manage", async () => {
    const teacher1 = await createTeacher("1");
    const teacher2 = await createTeacher("2");
    const student = await createStudent();
    const group = await createGroup(String(teacher1._id));
    await assignTeacherToGroup(String(group._id), String(teacher1._id));
    const request = await createPendingRequest(String(group._id), String(student._id));

    await expect(
      TeacherService.rejectJoinRequest(String(teacher2._id), String(request._id))
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
