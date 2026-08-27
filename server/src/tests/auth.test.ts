/**
 * Tests: Student Registration & Login
 *
 * Business rules covered:
 *  #3  — Student can register themselves
 *  #4  — Student must choose a group
 *  #5  — Choosing a group creates a PENDING JoinRequest
 *  #6  — Student is NOT yet a member (no GroupMembership until approved)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createTeacher,
  createGroup,
  assignTeacherToGroup,
} from "./helpers/db";
import * as AuthService from "../modules/auth/auth.service";
import { JoinRequest } from "../models/JoinRequest";
import { GroupMembership } from "../models/GroupMembership";
import { JoinRequestStatus } from "../types";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

describe("Student Registration", () => {
  it("creates a student account and a PENDING join request", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    const result = await AuthService.registerStudent({
      name: "طالب جديد",
      email: "new@student.com",
      password: "Student@123",
      phone: "01099999999",
      grade: "GRADE_10" as never,
      groupId: String(group._id),
    });

    expect(result.user.email).toBe("new@student.com");
    expect(result.joinRequest.status).toBe("PENDING");

    // JoinRequest must exist in DB with PENDING status
    const jr = await JoinRequest.findOne({ student: result.user.id });
    expect(jr).toBeTruthy();
    expect(jr!.status).toBe(JoinRequestStatus.PENDING);

    // No GroupMembership must have been created yet
    const membership = await GroupMembership.findOne({ student: result.user.id });
    expect(membership).toBeNull();
  });

  it("rejects registration if group does not exist", async () => {
    await expect(
      AuthService.registerStudent({
        name: "طالب",
        email: "student@test.com",
        password: "Student@123",
        phone: "01099999999",
        grade: "GRADE_10" as never,
        groupId: "000000000000000000000000",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects duplicate email", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    await AuthService.registerStudent({
      name: "طالب",
      email: "dup@student.com",
      password: "Student@123",
      phone: "01099999999",
      grade: "GRADE_10" as never,
      groupId: String(group._id),
    });

    await expect(
      AuthService.registerStudent({
        name: "طالب 2",
        email: "dup@student.com",
        password: "Student@123",
        phone: "01099999998",
        grade: "GRADE_10" as never,
        groupId: String(group._id),
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("Login", () => {
  it("returns a JWT token on valid credentials", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    await AuthService.registerStudent({
      name: "طالب",
      email: "login@student.com",
      password: "Student@123",
      phone: "01099999999",
      grade: "GRADE_10" as never,
      groupId: String(group._id),
    });

    const result = await AuthService.login({
      email: "login@student.com",
      password: "Student@123",
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe("login@student.com");
  });

  it("rejects wrong password", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    await AuthService.registerStudent({
      name: "طالب",
      email: "wrongpw@student.com",
      password: "Student@123",
      phone: "01099999999",
      grade: "GRADE_10" as never,
      groupId: String(group._id),
    });

    await expect(
      AuthService.login({ email: "wrongpw@student.com", password: "WrongPassword" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
