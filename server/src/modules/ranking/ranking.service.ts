import mongoose from "mongoose";
import { MonthlyScore } from "../../models/MonthlyScore";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { parseMonthYear } from "../../utils/date";
import { Request } from "express";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";

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
      rank:         currentRank,
      student:      s.student,
      score:        s.score,
      presentCount: s.presentCount,
      lateCount:    (s as { lateCount?: number }).lateCount ?? 0,
      absentCount:  s.absentCount,
      bonusPoints:  (s as { bonusPoints?: number }).bonusPoints ?? 0,
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

// ─────────────────────────────────────────
// Reset ranking — zero out all monthly scores for a group+month+year
// Only the teacher who owns the group (or admin) may do this.
// ─────────────────────────────────────────

export async function resetRanking(
  groupId: string,
  teacherId: string,
  req: Request
) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  await assertTeacherOwnsGroup(teacherId, groupId);

  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  const result = await MonthlyScore.updateMany(
    { group: groupId, month, year },
    { $set: { score: 0, presentCount: 0, lateCount: 0, absentCount: 0, bonusPoints: 0 } }
  );

  return { month, year, groupId, updated: result.modifiedCount };
}

// ─────────────────────────────────────────
// Add bonus points to a specific student
// Teacher who owns the group may call this.
// ─────────────────────────────────────────

export async function addBonusPoints(
  groupId: string,
  studentId: string,
  teacherId: string,
  req: Request
) {
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  )
    throw ApiError.badRequest("معرّف غير صالح");

  await assertTeacherOwnsGroup(teacherId, groupId);

  const { month, year } = parseMonthYear(
    String(req.query.month ?? ""),
    String(req.query.year ?? "")
  );

  const bonus = Number(req.body?.bonus);
  if (!Number.isFinite(bonus) || bonus <= 0)
    throw ApiError.badRequest("يجب أن تكون نقاط المكافأة رقماً موجباً");

  // Ensure the record exists first (upsert)
  const doc = await MonthlyScore.findOneAndUpdate(
    { student: studentId, group: groupId, month, year },
    {
      $setOnInsert: {
        student: studentId,
        group: groupId,
        month,
        year,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
      },
    },
    { upsert: true, new: true }
  );

  // Increment bonus and score atomically
  const updated = await MonthlyScore.findByIdAndUpdate(
    doc._id,
    { $inc: { bonusPoints: bonus, score: bonus } },
    { new: true }
  ).populate("student", "name email avatarUrl");

  return updated;
}
