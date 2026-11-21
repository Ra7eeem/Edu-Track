import mongoose from "mongoose";
import { StudentScore } from "../../models/StudentScore";
import { ArchivedScore } from "../../models/ArchivedScore";
import { GroupMembership } from "../../models/GroupMembership";
import { ApiError } from "../../utils/ApiError";
import { Request } from "express";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";

// ─────────────────────────────────────────
// Get group ranking for a given month/year
// ─────────────────────────────────────────

export async function getGroupRanking(groupId: string, req: Request) {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw ApiError.badRequest("معرّف غير صالح");

  // Get all continuous scores and active group memberships in parallel
  const [scores, memberships] = await Promise.all([
    StudentScore.find({ group: groupId })
      .populate("student", "name email avatarUrl grade")
      .lean(),
    GroupMembership.find({ group: groupId, isActive: { $ne: false } })
      .populate("student", "name email avatarUrl grade")
      .lean(),
  ]);

  const scoreMap = new Map<string, any>();
  for (const s of scores) {
    if (s.student && (s.student as any)._id) {
      scoreMap.set(String((s.student as any)._id), s);
    }
  }

  const allEntries: Array<{
    student: any;
    score: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    bonusPoints: number;
  }> = [];

  const seenIds = new Set<string>();

  // Add all active members from memberships
  for (const m of memberships) {
    if (m.student && (m.student as any)._id) {
      const sid = String((m.student as any)._id);
      seenIds.add(sid);
      const sc = scoreMap.get(sid);
      allEntries.push({
        student: m.student,
        score: sc?.score ?? 0,
        presentCount: sc?.presentCount ?? 0,
        lateCount: (sc as any)?.lateCount ?? 0,
        absentCount: sc?.absentCount ?? 0,
        bonusPoints: (sc as any)?.bonusPoints ?? 0,
      });
    }
  }

  // Fallback: add any students in StudentScore not found in active memberships
  for (const s of scores) {
    if (s.student && (s.student as any)._id) {
      const sid = String((s.student as any)._id);
      if (!seenIds.has(sid)) {
        seenIds.add(sid);
        allEntries.push({
          student: s.student,
          score: s.score ?? 0,
          presentCount: s.presentCount ?? 0,
          lateCount: (s as any)?.lateCount ?? 0,
          absentCount: s.absentCount ?? 0,
          bonusPoints: (s as any)?.bonusPoints ?? 0,
        });
      }
    }
  }

  // Sort descending by score, then presentCount
  allEntries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.presentCount - a.presentCount;
  });

  // Assign ranks (handle ties)
  let currentRank = 0;
  let previousScore = -1;
  const ranked = allEntries.map((s, idx) => {
    if (s.score !== previousScore) {
      currentRank = idx + 1;
      previousScore = s.score;
    }
    return {
      rank:         currentRank,
      student:      s.student,
      score:        s.score,
      presentCount: s.presentCount,
      lateCount:    s.lateCount,
      absentCount:  s.absentCount,
      bonusPoints:  s.bonusPoints,
    };
  });

  return { groupId, ranking: ranked };
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

  // Count how many students scored strictly higher
  const studentScore = await StudentScore.findOne({
    group: groupId,
    student: studentId,
  }).lean();

  const score = studentScore?.score ?? 0;
  const presentCount = studentScore?.presentCount ?? 0;
  const absentCount = studentScore?.absentCount ?? 0;

  const higherCount = await StudentScore.countDocuments({
    group: groupId,
    score: { $gt: score },
  });

  const totalMembers = await GroupMembership.countDocuments({
    group: groupId,
    isActive: true,
  });

  return {
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

  const archiveName = String(req.body.archiveName || `تصفير الرنك بتاريخ ${new Date().toLocaleDateString('ar-EG')}`);

  // Fetch current scores
  const currentScores = await StudentScore.find({ group: groupId }).lean();

  if (currentScores.length > 0) {
    // Create archive records
    const archiveDocs = currentScores.map(s => ({
      student: s.student,
      group: s.group,
      archiveName,
      archivedAt: new Date(),
      score: s.score,
      presentCount: s.presentCount,
      lateCount: s.lateCount,
      absentCount: s.absentCount,
      bonusPoints: s.bonusPoints,
    }));

    await ArchivedScore.insertMany(archiveDocs);
  }

  const result = await StudentScore.updateMany(
    { group: groupId },
    { $set: { score: 0, presentCount: 0, lateCount: 0, absentCount: 0, bonusPoints: 0 } }
  );

  return { groupId, archiveName, updated: result.modifiedCount };
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

  const bonus = Number(req.body?.bonus);
  if (!Number.isFinite(bonus) || bonus <= 0)
    throw ApiError.badRequest("يجب أن تكون نقاط المكافأة رقماً موجباً");

  // Ensure the record exists first (upsert)
  const doc = await StudentScore.findOneAndUpdate(
    { student: studentId, group: groupId },
    {
      $setOnInsert: {
        student: studentId,
        group: groupId,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
      },
    },
    { upsert: true, new: true }
  );

  // Increment bonus and score atomically
  const updated = await StudentScore.findByIdAndUpdate(
    doc._id,
    { $inc: { bonusPoints: bonus, score: bonus } },
    { new: true }
  ).populate("student", "name email avatarUrl");

  return updated;
}
