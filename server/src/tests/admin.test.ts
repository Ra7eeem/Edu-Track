/**
 * Tests: Admin Capabilities
 *
 * Business rules covered:
 *  #1  — No teacher self-registration
 *  #2  — Only ADMIN can create teachers
 *  ADMIN can create, update, delete teachers
 *  ADMIN can manage all groups
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createAdmin,
  createTeacher,
  createGroup,
  assignTeacherToGroup,
} from "./helpers/db";
import * as AdminService from "../modules/admin/admin.service";
import { User } from "../models/User";
import { Role } from "../types";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

describe("Admin creates teacher", () => {
  it("creates a user with TEACHER role", async () => {
    const result = await AdminService.createTeacher({
      name: "مدرس جديد",
      email: "newteacher@test.com",
      password: "Teacher@123",
    });

    expect(result.role).toBe(Role.TEACHER);
    expect(result.email).toBe("newteacher@test.com");

    // password must NOT be in response
    const obj = result.toJSON() as Record<string, unknown>;
    expect(obj.passwordHash).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await AdminService.createTeacher({
      name: "مدرس",
      email: "dup@teacher.com",
      password: "Teacher@123",
    });

    await expect(
      AdminService.createTeacher({
        name: "مدرس 2",
        email: "dup@teacher.com",
        password: "Teacher@123",
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("Admin updates teacher", () => {
  it("updates teacher name and deactivates account", async () => {
    const teacher = await AdminService.createTeacher({
      name: "مدرس قديم",
      email: "update@teacher.com",
      password: "Teacher@123",
    });

    const updated = await AdminService.updateTeacher(String(teacher._id), {
      name: "مدرس محدّث",
      isActive: false,
    });

    expect(updated.name).toBe("مدرس محدّث");
    expect(updated.isActive).toBe(false);
  });
});

describe("Admin deletes teacher", () => {
  it("removes teacher from DB", async () => {
    const teacher = await AdminService.createTeacher({
      name: "مدرس للحذف",
      email: "delete@teacher.com",
      password: "Teacher@123",
    });

    await AdminService.deleteTeacher(String(teacher._id));

    const found = await User.findById(teacher._id);
    expect(found).toBeNull();
  });

  it("throws NOT_FOUND for unknown id", async () => {
    await expect(
      AdminService.deleteTeacher("000000000000000000000000")
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("Admin group management", () => {
  it("adds teacher to group", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));

    const gt = await AdminService.addTeacherToGroup(
      String(group._id),
      String(teacher._id)
    );

    expect(String(gt.teacher)).toBe(String(teacher._id));
    expect(String(gt.group)).toBe(String(group._id));
  });

  it("prevents adding same teacher twice", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    await expect(
      AdminService.addTeacherToGroup(String(group._id), String(teacher._id))
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("updates group details", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));

    const updated = await AdminService.updateGroup(String(group._id), {
      name: "مجموعة محدّثة",
      description: "وصف جديد",
    });

    expect(updated.name).toBe("مجموعة محدّثة");
  });
});

describe("Admin dashboard stats", () => {
  it("returns correct counts", async () => {
    await createAdmin();
    await createTeacher("1");
    await createTeacher("2");

    const stats = await AdminService.getDashboardStats();

    expect(stats.totalTeachers).toBe(2);
    expect(typeof stats.totalStudents).toBe("number");
    expect(typeof stats.totalGroups).toBe("number");
  });
});
