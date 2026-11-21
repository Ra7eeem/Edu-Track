import { describe, it, expect } from "vitest";
import { extractYouTubeId } from "../utils/youtube";
import { WatchStatus } from "../models";

describe("Courses & Lessons Domain Engine", () => {
  describe("YouTube URL Extraction", () => {
    it("extracts ID from standard watch URL", () => {
      const id = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(id).toBe("dQw4w9WgXcQ");
    });

    it("extracts ID from short URL (youtu.be)", () => {
      const id = extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=42");
      expect(id).toBe("dQw4w9WgXcQ");
    });

    it("extracts ID from embed URL", () => {
      const id = extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ");
      expect(id).toBe("dQw4w9WgXcQ");
    });

    it("extracts ID from YouTube Shorts URL", () => {
      const id = extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ");
      expect(id).toBe("dQw4w9WgXcQ");
    });

    it("returns null for non-YouTube or invalid URLs", () => {
      expect(extractYouTubeId("https://vimeo.com/123456")).toBeNull();
      expect(extractYouTubeId("invalid-url")).toBeNull();
      expect(extractYouTubeId("")).toBeNull();
    });
  });

  describe("Watch Progress & Completion Formula", () => {
    function computeWatchMetrics(
      currentPositionSeconds: number,
      durationSeconds: number,
      isEnded = false
    ) {
      const percentage =
        durationSeconds > 0
          ? Math.min(100, Math.round((currentPositionSeconds / durationSeconds) * 100))
          : isEnded
          ? 100
          : 0;

      const isCompleted = Boolean(isEnded || percentage >= 85);
      const status = isCompleted
        ? WatchStatus.COMPLETED
        : percentage > 0
        ? WatchStatus.IN_PROGRESS
        : WatchStatus.NOT_STARTED;

      return { percentage, isCompleted, status };
    }

    it("evaluates NOT_STARTED when position is 0", () => {
      const result = computeWatchMetrics(0, 1200);
      expect(result.percentage).toBe(0);
      expect(result.isCompleted).toBe(false);
      expect(result.status).toBe(WatchStatus.NOT_STARTED);
    });

    it("evaluates IN_PROGRESS when watched partially (< 85%)", () => {
      // 10 minutes out of 20 minutes (50%)
      const result = computeWatchMetrics(600, 1200);
      expect(result.percentage).toBe(50);
      expect(result.isCompleted).toBe(false);
      expect(result.status).toBe(WatchStatus.IN_PROGRESS);
    });

    it("evaluates COMPLETED when reaching 85%", () => {
      // 17 minutes out of 20 minutes (85%)
      const result = computeWatchMetrics(1020, 1200);
      expect(result.percentage).toBe(85);
      expect(result.isCompleted).toBe(true);
      expect(result.status).toBe(WatchStatus.COMPLETED);
    });

    it("evaluates COMPLETED when player fires isEnded even if under 85%", () => {
      const result = computeWatchMetrics(500, 1200, true);
      expect(result.isCompleted).toBe(true);
      expect(result.status).toBe(WatchStatus.COMPLETED);
    });

    it("caps percentage at 100%", () => {
      const result = computeWatchMetrics(1500, 1200);
      expect(result.percentage).toBe(100);
      expect(result.isCompleted).toBe(true);
      expect(result.status).toBe(WatchStatus.COMPLETED);
    });
  });

  describe("Teacher Analytics Aggregation", () => {
    it("correctly calculates completion rate and average percentage", () => {
      const mockStudents = [
        { percentage: 100, status: WatchStatus.COMPLETED },
        { percentage: 90, status: WatchStatus.COMPLETED },
        { percentage: 50, status: WatchStatus.IN_PROGRESS },
        { percentage: 0, status: WatchStatus.NOT_STARTED },
      ];

      const totalStudents = mockStudents.length;
      const completedCount = mockStudents.filter((s) => s.status === WatchStatus.COMPLETED).length;
      const inProgressCount = mockStudents.filter((s) => s.status === WatchStatus.IN_PROGRESS).length;
      const notStartedCount = mockStudents.filter((s) => s.status === WatchStatus.NOT_STARTED).length;

      const completionRate = Math.round((completedCount / totalStudents) * 100);
      const totalPercentage = mockStudents.reduce((acc, s) => acc + s.percentage, 0);
      const averageWatchProgress = Math.round(totalPercentage / totalStudents);

      expect(totalStudents).toBe(4);
      expect(completedCount).toBe(2);
      expect(inProgressCount).toBe(1);
      expect(notStartedCount).toBe(1);
      expect(completionRate).toBe(50); // 2/4 = 50%
      expect(averageWatchProgress).toBe(60); // (100 + 90 + 50 + 0) / 4 = 60%
    });
  });
});
