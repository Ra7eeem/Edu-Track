import { describe, it, expect } from "vitest";
import { calculatePointsFormula } from "../modules/teams/team.service";
import { NotificationType } from "../types";

describe("Gamified Teams: Attendance Points Formula", () => {
  it("Scenario 1: Full Attendance Bonus gives +3 points when all 5 members are PRESENT", () => {
    // 5 total members, 5 present, 0 absent
    const points = calculatePointsFormula(5, 5, 0);
    expect(points).toBe(3);
  });

  it("Scenario 2: Partial Attendance (1 Absent) gives +2 points when 5 present and 1 absent out of 6", () => {
    // 6 total members, 5 present, 1 absent
    const points = calculatePointsFormula(6, 5, 1);
    expect(points).toBe(2);
  });

  it("Partial Attendance (2 Absent) gives +2 points when 3 present and 2 absent out of 5", () => {
    // 5 total members, 3 present, 2 absent
    const points = calculatePointsFormula(5, 3, 2);
    expect(points).toBe(2);
  });

  it("Scenario 3: Single Member Attended gives +1 point when strictly 1 member attended out of 5", () => {
    // 5 total members, 1 present, 4 absent
    const points = calculatePointsFormula(5, 1, 4);
    expect(points).toBe(1);
  });

  it("Zero Attended gives 0 points when 0 members attended", () => {
    // 5 total members, 0 present, 5 absent
    const points = calculatePointsFormula(5, 0, 5);
    expect(points).toBe(0);
  });

  it("Empty team or 0 members returns 0 points", () => {
    const points = calculatePointsFormula(0, 0, 0);
    expect(points).toBe(0);
  });
});

describe("Notification Types & Dispatcher", () => {
  it("has all required notification types defined", () => {
    expect(NotificationType.NEW_EXAM).toBe("NEW_EXAM");
    expect(NotificationType.ATTENDANCE_RECORDED).toBe("ATTENDANCE_RECORDED");
    expect(NotificationType.NEW_POST).toBe("NEW_POST");
    expect(NotificationType.QUESTION_REPLIED).toBe("QUESTION_REPLIED");
  });
});
