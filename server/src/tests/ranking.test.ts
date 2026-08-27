/**
 * Tests: Monthly Ranking
 *
 * Business rules covered:
 *  #11 — Old monthly data is never deleted
 *  #12 — Ranking is per-group per-month
 *  Tie-handling: same score = same rank
 *  getStudentRank returns correct rank number
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
import * as RankingService from "../modules/ranking/ranking.service";
import { MonthlyScore } from "../models/MonthlyScore";
import { AttendanceStatus } from "../types";
import { createMockRequest } from "./helpers/mock";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

describe("Group ranking", () => {
  it("ranks students by score descending", async () => {
    const teacher = await createTeacher();
    const s1 = await createStudent("1");
    const s2 = await createStudent("2");
    const s3 = await createStudent("3");
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(s1._id));
    await enrollStudent(String(group._id), String(s2._id));
    await enrollStudent(String(group._id), String(s3._id));

    // s1: 3 present, s2: 2 present, s3: 1 present
    const dates = ["2026-08-01", "2026-08-02", "2026-08-03"];
    for (let i = 0; i < dates.length; i++) {
      await AttendanceService.recordAttendance(
        String(teacher._id),
        String(group._id),
        {
          date: dates[i],
          records: [
            { studentId: String(s1._id), status: AttendanceStatus.PRESENT },
            {
              studentId: String(s2._id),
              status: i < 2 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            },
            {
              studentId: String(s3._id),
              status: i < 1 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            },
          ],
        }
      );
    }

    const req = createMockRequest({ month: "8", year: "2026" });
    const result = await RankingService.getGroupRanking(String(group._id), req as never);

    expect(result.ranking[0].rank).toBe(1);
    expect(String((result.ranking[0].student as { _id: unknown })._id)).toBe(String(s1._id));
    expect(result.ranking[0].score).toBe(3);

    expect(result.ranking[1].rank).toBe(2);
    expect(result.ranking[1].score).toBe(2);

    expect(result.ranking[2].rank).toBe(3);
    expect(result.ranking[2].score).toBe(1);
  });

  it("assigns the same rank to students with equal scores (tie)", async () => {
    const teacher = await createTeacher();
    const s1 = await createStudent("1");
    const s2 = await createStudent("2");
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(s1._id));
    await enrollStudent(String(group._id), String(s2._id));

    // Both present on same day → same score
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-08-01",
        records: [
          { studentId: String(s1._id), status: AttendanceStatus.PRESENT },
          { studentId: String(s2._id), status: AttendanceStatus.PRESENT },
        ],
      }
    );

    const req = createMockRequest({ month: "8", year: "2026" });
    const result = await RankingService.getGroupRanking(String(group._id), req as never);

    expect(result.ranking[0].rank).toBe(1);
    expect(result.ranking[1].rank).toBe(1); // tie
  });

  it("preserves old monthly scores when a new month begins (rule #11)", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    // July score
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-07-10",
        records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
      }
    );

    // August score
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-08-10",
        records: [{ studentId: String(student._id), status: AttendanceStatus.PRESENT }],
      }
    );

    // Both months must exist
    const julyScore = await MonthlyScore.findOne({
      student: student._id,
      group: group._id,
      month: 7,
      year: 2026,
    });
    const augustScore = await MonthlyScore.findOne({
      student: student._id,
      group: group._id,
      month: 8,
      year: 2026,
    });

    expect(julyScore).toBeTruthy();
    expect(augustScore).toBeTruthy();
    expect(julyScore!.score).toBe(1);
    expect(augustScore!.score).toBe(1);
  });
});

describe("Student rank", () => {
  it("returns correct rank for a student in a group", async () => {
    const teacher = await createTeacher();
    const s1 = await createStudent("1");
    const s2 = await createStudent("2");
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(s1._id));
    await enrollStudent(String(group._id), String(s2._id));

    // s1 present, s2 absent
    await AttendanceService.recordAttendance(
      String(teacher._id),
      String(group._id),
      {
        date: "2026-08-05",
        records: [
          { studentId: String(s1._id), status: AttendanceStatus.PRESENT },
          { studentId: String(s2._id), status: AttendanceStatus.ABSENT },
        ],
      }
    );

    const req = createMockRequest({ month: "8", year: "2026" });
    const s1Rank = await RankingService.getStudentRank(
      String(group._id),
      String(s1._id),
      req as never
    );
    const s2Rank = await RankingService.getStudentRank(
      String(group._id),
      String(s2._id),
      req as never
    );

    expect(s1Rank.rank).toBe(1);
    expect(s2Rank.rank).toBe(2);
  });
});
