import mongoose from "mongoose";
import { MonthlyScore } from "../../models/MonthlyScore";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { parseMonthYear } from "../../utils/date";
import { Request } from "express";

// ─────────────────────────────────────────
// Get group ranking for a given month/year
// ─────────────────────────────────────────

export async function getGroupRanking(groupId: string, req: Request) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  // Get all scores for this group+month+year, sorted descending
  const scores = await MonthlyScore.find({ group: groupId, month, year })
    .populate("student", "name email avatarUrl grade")
    .sort({ score: -1, presentCount: -1 })
    .lean();

  // Assign ranks (handle ties — same rank for same score)
  let currentRank = 0;
  let previousScore = -1;
  const ranked = scores.map((s, idx) => {
    if (s.score !== previousScore) {
      currentRank = idx + 1;
      previousScore = s.score;
    }
    return {
      rank: currentRank,
      student: s.student,
      score: s.score,
      presentCount: s.presentCount,
      absentCount: s.absentCount,
    };
  });

  return { month, year, groupId, ranking: ranked };
}

// ─────────────────────────────────────────
// Get a specific student's rank in a group
// ─────────────────────────────────────────

export async function getStudentRank(
  groupId: string,
  studentId: string,
  req: Request
) {
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  )
    throw ApiError.badRequest("معرّف غير صالح");

  // Verify student is a member
  const membership = await GroupMembership.findOne({
    group: groupId,
    student: studentId,
    isActive: true,
  });
  if (!membership)
    throw ApiError.notFound("الطالب غير مسجل في هذه المجموعة");

  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  // Count how many students scored strictly higher
  const studentScore = await MonthlyScore.findOne({
    group: groupId,
    student: studentId,
    month,
    year,
  }).lean();

  const score = studentScore?.score ?? 0;
  const presentCount = studentScore?.presentCount ?? 0;
  const absentCount = studentScore?.absentCount ?? 0;

  const higherCount = await MonthlyScore.countDocuments({
    group: groupId,
    month,
    year,
    score: { $gt: score },
  });

  const totalMembers = await GroupMembership.countDocuments({
    group: groupId,
    isActive: true,
  });

  return {
    month,
    year,
    studentId,
    rank: higherCount + 1,
    score,
    presentCount,
    absentCount,
    totalMembers,
  };
}
