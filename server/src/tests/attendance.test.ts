/**
 * Tests: Attendance Recording
 *
 * Business rules covered:
 *  Attendance is idempotent — same group+date upserts, not duplicates
 *  Monthly scores are recalculated on each upsert
 *  Teacher cannot record attendance for groups they don't manage
 *  Students not in the group are rejected
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
  enrollStudent,
} from "./helpers/db";
import * as AttendanceService from "../modules/attendance/attendance.service";
import { Attendance } from "../models/Attendance";
import { MonthlyScore } from "../models/MonthlyScore";
import { AttendanceStatus } from "../types";
import { toDateOnly } from "../utils/date";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

const TODAY = toDateOnly(new Date()).toISOString().split("T")[0];

describe("Record attendance", () => {
  it("creates a session and updates monthly scores", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: TODAY,
        records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
      }
    );

    const session = await Attendance.findOne({ group: group._id });
    expect(session).toBeTruthy();
    expect(session!.records).toHaveLength(1);
    expect(session!.records[0].status).toBe(AttendanceStatus.PRESENT);

    const score = await MonthlyScore.findOne({ student: student._id, group: group._id });
    expect(score).toBeTruthy();
    expect(score!.presentCount).toBe(1);
    expect(score!.score).toBe(1);
  });

  it("is idempotent — recording same date twice does NOT duplicate", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    // First submission
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: TODAY,
        records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
      }
    );

    // Second submission (same date, same group) — should upsert not duplicate
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: TODAY,
        records: [{ studentId: String(student._id), status: AttendanceStatus.ABSENT }],
      }
    );

    const sessions = await Attendance.find({ group: group._id });
    expect(sessions).toHaveLength(1); // still one session

    // Score must reflect the latest submission (ABSENT = 0)
    const score = await MonthlyScore.findOne({ student: student._id, group: group._id });
    expect(score!.presentCount).toBe(0);
    expect(score!.absentCount).toBe(1);
    expect(score!.score).toBe(0);
  });

  it("forbids teacher from recording attendance in a group they don't manage", async () => {
    const teacher1 = await createTeacher("1");
    const teacher2 = await createTeacher("2");
    const student = await createStudent();
    const group = await createGroup(String(teacher1._id));
    await assignTeacherToGroup(String(group._id), String(teacher1._id));
    await enrollStudent(String(group._id), String(student._id));

    await expect(
      AttendanceService.recordAttendance(
        String(teacher2._id),
        String(group._id),
        {
          date: TODAY,
          records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
        }
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects if a student is not a member of the group", async () => {
    const teacher = await createTeacher();
    const student = await createStudent(); // not enrolled
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    await expect(
      AttendanceService.recordAttendance(
        String(teacher._id),
        String(group._id),
        {
          date: TODAY,
          records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
        }
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("Monthly score accumulation", () => {
  it("accumulates PRESENT scores across multiple days", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    // Record attendance for 3 different days
    const dates = ["2026-08-01", "2026-08-02", "2026-08-03"];
    for (const date of dates) {
      await AttendanceService.recordAttendance(
        String(teacher._id),
        String(group._id),
        {
          date,
          records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
        }
      );
    }

    const score = await MonthlyScore.findOne({
      student: student._id,
      group: group._id,
      month: 8,
      year: 2026,
    });

    expect(score!.presentCount).toBe(3);
    expect(score!.score).toBe(3);
    expect(score!.absentCount).toBe(0);
  });

  it("keeps separate monthly score records per month", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-07-15",
        records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
      }
    );

    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-08-15",
        records: [{ studentId: String(student._id), status: AttendanceStatus.ABSENT }],
      }
    );

    const scores = await MonthlyScore.find({ student: student._id, group: group._id });
    expect(scores).toHaveLength(2); // separate records for July and August

    const julyScore = scores.find((s) => s.month === 7);
    const augustScore = scores.find((s) => s.month === 8);

    expect(julyScore!.presentCount).toBe(1);
    expect(augustScore!.absentCount).toBe(1);
  });
});
