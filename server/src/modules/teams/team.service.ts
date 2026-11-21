import mongoose from "mongoose";
import { Team, ITeam } from "../../models/Team";
import { ScoreLog } from "../../models/ScoreLog";
import { StudentScore } from "../../models/StudentScore";
import { ArchivedLeaderboard } from "../../models/ArchivedLeaderboard";
import { GroupMembership } from "../../models/GroupMembership";
import { GroupTeacher } from "../../models/GroupTeacher";
import { ApiError } from "../../utils/ApiError";
import { Role, AttendanceStatus } from "../../types";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";
import { CreateTeamDto, UpdateTeamDto, AdjustPointsDto } from "./team.schemas";

// ─────────────────────────────────────────
// Guard: User has access to classroom
// ─────────────────────────────────────────
async function assertClassroomAccess(userId: string, role: Role, classroomId: string) {
  if (role === Role.ADMIN) return;
  if (role === Role.TEACHER) {
    const link = await GroupTeacher.findOne({ group: classroomId, teacher: userId });
    if (!link) throw ApiError.forbidden("لا تملك صلاحية الوصول لهذه المجموعة");
    return;
  }
  const membership = await GroupMembership.findOne({
    group: classroomId,
    student: userId,
    isActive: true,
  });
  if (!membership) throw ApiError.forbidden("يجب أن تكون عضواً في المجموعة للوصول إلى الفرق");
}

// ─────────────────────────────────────────
// Formula: Team Attendance Points Calculation
// Full: all PRESENT -> +3
// 1 or 2 Absent: -> +2
// Only 1 Attended: -> +1
// Zero Attended: -> 0
// ─────────────────────────────────────────
export function calculatePointsFormula(
  totalMembers: number,
  presentCount: number,
  absentCount: number
): number {
  if (presentCount === 0 || totalMembers === 0) return 0;
  if (absentCount === 0 && presentCount === totalMembers) return 3;
  if (absentCount === 1 || absentCount === 2) return 2;
  if (presentCount === 1) return 1;
  return 1;
}

// ─────────────────────────────────────────
// 1. Create a Team
// ─────────────────────────────────────────
export async function createTeam(teacherId: string, dto: CreateTeamDto) {
  await assertTeacherOwnsGroup(teacherId, dto.classroomId);

  const existingName = await Team.findOne({
    classroom: dto.classroomId,
    name: dto.name.trim(),
    isActive: true,
  });
  if (existingName) {
    throw ApiError.conflict("يوجد فريق آخر بنفس هذا الاسم في هذه المجموعة");
  }

  if (dto.memberIds && dto.memberIds.length > 0) {
    const conflictingTeam = await Team.findOne({
      classroom: dto.classroomId,
      members: { $in: dto.memberIds },
      isActive: true,
    });
    if (conflictingTeam) {
      throw ApiError.conflict(
        `بعض الطلاب ينتمون بالفعل لفريق آخر (${conflictingTeam.name}) في هذه المجموعة`
      );
    }
  }

  const team = await Team.create({
    name: dto.name.trim(),
    classroom: dto.classroomId,
    teacher: teacherId,
    members: dto.memberIds || [],
    totalScore: 0,
    currentCycleScore: 0,
    isActive: true,
  });

  return team.populate("members", "name email avatarUrl grade phone");
}

// ─────────────────────────────────────────
// 2. Get All Teams in a Classroom (Dual-Level Leaderboard)
// ─────────────────────────────────────────
export async function getClassroomTeams(
  userId: string,
  role: Role,
  classroomId: string
) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }
  await assertClassroomAccess(userId, role, classroomId);

  const teams = await Team.find({ classroom: classroomId, isActive: true })
    .populate("members", "name email avatarUrl grade phone")
    .sort({ currentCycleScore: -1, totalScore: -1 })
    .lean();

  // Load individual student scores for this classroom
  const studentScores = await StudentScore.find({ group: classroomId }).lean();
  const scoreMap = new Map<string, { score: number; presentCount: number }>();
  for (const s of studentScores) {
    scoreMap.set(String(s.student), {
      score: s.score ?? 0,
      presentCount: s.presentCount ?? 0,
    });
  }

  let currentTeamRank = 0;
  let prevTeamScore = -1;

  const rankedTeams = teams.map((team, tIdx) => {
    if (team.currentCycleScore !== prevTeamScore) {
      currentTeamRank = tIdx + 1;
      prevTeamScore = team.currentCycleScore;
    }

    const membersWithScores = ((team.members as unknown[]) || []).map((m: any) => {
      const mid = String(m._id || m.id);
      const s = scoreMap.get(mid) || { score: 0, presentCount: 0 };
      return {
        ...m,
        individualScore: s.score,
        presentCount: s.presentCount,
      };
    });

    // Sort internal group leaderboard
    membersWithScores.sort((a, b) => b.individualScore - a.individualScore);

    let currentMemberRank = 0;
    let prevMemberScore = -1;
    const rankedMembers = membersWithScores.map((mem, mIdx) => {
      if (mem.individualScore !== prevMemberScore) {
        currentMemberRank = mIdx + 1;
        prevMemberScore = mem.individualScore;
      }
      return {
        ...mem,
        internalRank: currentMemberRank,
      };
    });

    return {
      _id: team._id,
      name: team.name,
      classroom: team.classroom,
      teacher: team.teacher,
      totalScore: team.totalScore,
      currentCycleScore: team.currentCycleScore,
      teamRank: currentTeamRank,
      membersCount: rankedMembers.length,
      members: rankedMembers,
      createdAt: team.createdAt,
    };
  });

  return {
    teams: rankedTeams,
    totalTeams: rankedTeams.length,
  };
}

// ─────────────────────────────────────────
// 3. Get Student's Specific Team & Ranks
// ─────────────────────────────────────────
export async function getStudentTeam(studentId: string, classroomId: string) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }

  const allTeamsData = await getClassroomTeams(studentId, Role.STUDENT, classroomId);
  const myTeam = allTeamsData.teams.find((t) =>
    t.members.some((m: any) => String(m._id || m.id) === studentId)
  );

  if (!myTeam) return null;

  const myMember = myTeam.members.find((m: any) => String(m._id || m.id) === studentId);

  return {
    team: {
      _id: myTeam._id,
      name: myTeam.name,
      totalScore: myTeam.totalScore,
      currentCycleScore: myTeam.currentCycleScore,
      teamRank: myTeam.teamRank,
      totalTeams: allTeamsData.totalTeams,
    },
    studentRankInTeam: myMember?.internalRank ?? 1,
    studentScoreInTeam: myMember?.individualScore ?? 0,
    totalMembersInTeam: myTeam.membersCount,
  };
}

// ─────────────────────────────────────────
// 4. Update Team (Name or Members)
// ─────────────────────────────────────────
export async function updateTeam(
  teacherId: string,
  teamId: string,
  dto: UpdateTeamDto
) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) throw ApiError.badRequest("معرّف غير صالح");
  const team = await Team.findById(teamId);
  if (!team || !team.isActive) throw ApiError.notFound("الفريق غير موجود");

  await assertTeacherOwnsGroup(teacherId, String(team.classroom));

  if (dto.name && dto.name.trim() !== team.name) {
    const existingName = await Team.findOne({
      classroom: team.classroom,
      name: dto.name.trim(),
      _id: { $ne: team._id },
      isActive: true,
    });
    if (existingName) {
      throw ApiError.conflict("يوجد فريق آخر بنفس هذا الاسم في هذه المجموعة");
    }
    team.name = dto.name.trim();
  }

  if (dto.memberIds) {
    if (dto.memberIds.length > 0) {
      const conflictingTeam = await Team.findOne({
        classroom: team.classroom,
        _id: { $ne: team._id },
        members: { $in: dto.memberIds },
        isActive: true,
      });
      if (conflictingTeam) {
        throw ApiError.conflict(
          `بعض الطلاب ينتمون بالفعل لفريق آخر (${conflictingTeam.name}) في هذه المجموعة`
        );
      }
    }
    team.members = dto.memberIds.map((id) => new mongoose.Types.ObjectId(id));
  }

  await team.save();
  return team.populate("members", "name email avatarUrl grade phone");
}

// ─────────────────────────────────────────
// 5. Delete Team (Soft delete)
// ─────────────────────────────────────────
export async function deleteTeam(teacherId: string, teamId: string) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) throw ApiError.badRequest("معرّف غير صالح");
  const team = await Team.findById(teamId);
  if (!team || !team.isActive) throw ApiError.notFound("الفريق غير موجود");

  await assertTeacherOwnsGroup(teacherId, String(team.classroom));

  team.isActive = false;
  await team.save();
  return { success: true, message: "تم حذف الفريق بنجاح" };
}

// ─────────────────────────────────────────
// 6. Manual Points Adjustment (Bonus / Penalty)
// ─────────────────────────────────────────
export async function adjustPoints(
  teacherId: string,
  teamId: string,
  dto: AdjustPointsDto
) {
  if (!mongoose.Types.ObjectId.isValid(teamId)) throw ApiError.badRequest("معرّف غير صالح");
  const team = await Team.findById(teamId);
  if (!team || !team.isActive) throw ApiError.notFound("الفريق غير موجود");

  await assertTeacherOwnsGroup(teacherId, String(team.classroom));

  team.totalScore += dto.points;
  team.currentCycleScore += dto.points;
  await team.save();

  if (dto.studentId) {
    await StudentScore.findOneAndUpdate(
      { group: team.classroom, student: dto.studentId },
      { $inc: { score: dto.points, bonusPoints: dto.points } },
      { upsert: true }
    );
  }

  const log = await ScoreLog.create({
    team: team._id,
    student: dto.studentId ? new mongoose.Types.ObjectId(dto.studentId) : undefined,
    classroom: team.classroom,
    points: dto.points,
    reason: dto.reason,
    actionType: dto.points >= 0 ? "MANUAL_BONUS" : "MANUAL_PENALTY",
    awardedBy: teacherId,
  });

  return { team, log };
}

// ─────────────────────────────────────────
// 7. Reset Leaderboard Cycle & Archive
// ─────────────────────────────────────────
export async function resetLeaderboard(teacherId: string, classroomId: string) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) throw ApiError.badRequest("معرّف غير صالح");
  await assertTeacherOwnsGroup(teacherId, classroomId);

  const teams = await Team.find({ classroom: classroomId, isActive: true })
    .sort({ currentCycleScore: -1 })
    .lean();

  const cycleDate = new Date().toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
  const cycleName = `دورة ${cycleDate}`;

  const winnerTeam =
    teams.length > 0 && teams[0].currentCycleScore > 0
      ? {
          id: teams[0]._id,
          name: teams[0].name,
          score: teams[0].currentCycleScore,
        }
      : undefined;

  const teamSnapshots = teams.map((t) => ({
    teamId: t._id,
    name: t.name,
    score: t.currentCycleScore,
    memberCount: (t.members || []).length,
  }));

  const archive = await ArchivedLeaderboard.create({
    classroom: classroomId,
    cycleName,
    winnerTeam,
    teamSnapshots,
    resetBy: teacherId,
    archivedAt: new Date(),
  });

  await Team.updateMany(
    { classroom: classroomId, isActive: true },
    { $set: { currentCycleScore: 0 } }
  );

  await ScoreLog.create({
    classroom: classroomId,
    points: 0,
    reason: `تصفير دورة التنافس وبدء دورة جديدة (${cycleName})`,
    actionType: "CYCLE_RESET",
    awardedBy: teacherId,
  });

  return {
    success: true,
    message: "تم أرشفة نتائج الدورة وتصفير النقاط بنجاح",
    archive,
  };
}

// ─────────────────────────────────────────
// 8. Get Archived Leaderboards
// ─────────────────────────────────────────
export async function getArchivedLeaderboards(classroomId: string) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) throw ApiError.badRequest("معرّف غير صالح");
  return ArchivedLeaderboard.find({ classroom: classroomId })
    .populate("winnerTeam.id", "name")
    .sort({ archivedAt: -1 })
    .lean();
}

// ─────────────────────────────────────────
// 9. Automated Attendance Points Hook
// ─────────────────────────────────────────
export async function calculateTeamAttendancePoints(
  classroomId: string,
  records: Array<{ studentId: string; status: AttendanceStatus }>,
  teacherId: string,
  sessionDate: string
) {
  const teams = await Team.find({ classroom: classroomId, isActive: true });
  if (!teams || teams.length === 0) return;

  const recordMap = new Map<string, AttendanceStatus>();
  for (const r of records) {
    recordMap.set(String(r.studentId), r.status);
  }

  for (const team of teams) {
    const memberIds = (team.members || []).map((m) => String(m));
    if (memberIds.length === 0) continue;

    let presentCount = 0;
    let absentCount = 0;
    const attendingMemberIds: string[] = [];

    for (const memberId of memberIds) {
      const status = recordMap.get(memberId);
      if (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) {
        presentCount++;
        attendingMemberIds.push(memberId);
      } else {
        absentCount++;
      }
    }

    const teamPoints = calculatePointsFormula(memberIds.length, presentCount, absentCount);

    if (teamPoints > 0) {
      team.totalScore += teamPoints;
      team.currentCycleScore += teamPoints;
      await team.save();

      const reasonDesc =
        teamPoints === 3
          ? "حضور كامل لجميع أعضاء الفريق (+3)"
          : teamPoints === 2
          ? "حضور متميز مع غياب عضو أو عضوين (+2)"
          : "حضور عضو واحد من الفريق (+1)";

      await ScoreLog.create({
        team: team._id,
        classroom: team.classroom,
        points: teamPoints,
        reason: `${reasonDesc} - جلسة ${sessionDate}`,
        actionType: "ATTENDANCE",
        awardedBy: teacherId,
      });

      // Award individual points to attending members
      for (const memberId of attendingMemberIds) {
        await StudentScore.findOneAndUpdate(
          { group: classroomId, student: memberId },
          { $inc: { score: teamPoints, bonusPoints: teamPoints } },
          { upsert: true }
        );

        await ScoreLog.create({
          team: team._id,
          student: new mongoose.Types.ObjectId(memberId),
          classroom: team.classroom,
          points: teamPoints,
          reason: `نقاط الحضور مع فريق ${team.name}`,
          actionType: "ATTENDANCE",
          awardedBy: teacherId,
        });
      }
    }
  }
}
