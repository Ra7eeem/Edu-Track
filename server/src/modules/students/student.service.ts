import mongoose from "mongoose";
import { User } from "../../models/User";
import { GroupMembership } from "../../models/GroupMembership";
import { JoinRequest } from "../../models/JoinRequest";
import { StudentScore } from "../../models/StudentScore";
import { ApiError } from "../../utils/ApiError";
import { getFileUrl } from "../../middleware/upload";
import { Request } from "express";
import { UpdateStudentProfileDto } from "./student.schemas";
import { getMyAttendance } from "../attendance/attendance.service";
import { parseMonthYear } from "../../utils/date";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";

export async function getMyProfile(studentId: string) {
  const student = await User.findById(studentId);
  if (!student) throw ApiError.notFound("المستخدم غير موجود");
  return student;
}

export async function updateMyProfile(
  studentId: string,
  dto: UpdateStudentProfileDto,
  avatarFilename?: string
) {
  const update: Record<string, unknown> = { ...dto };
  if (avatarFilename) update.avatarUrl = getFileUrl(avatarFilename);

  const student = await User.findByIdAndUpdate(studentId, update, {
    new: true,
    runValidators: true,
  });
  if (!student) throw ApiError.notFound("المستخدم غير موجود");
  return student;
}

export async function getMyGroups(studentId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [memberships, total] = await Promise.all([
    GroupMembership.find({ student: studentId, isActive: true })
      .populate("group", "name description imageUrl createdAt")
      .sort({ joinedAt: -1 })
      .skip(skip)
      .limit(limit),
    GroupMembership.countDocuments({ student: studentId, isActive: true }),
  ]);
  return {
    data: memberships.map((m) => m.group),
    pagination: buildPaginationMeta(total, page, limit),
  };
}

export async function getMyJoinRequests(studentId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const [data, total] = await Promise.all([
    JoinRequest.find({ student: studentId })
      .populate("group", "name imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JoinRequest.countDocuments({ student: studentId }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getMyAttendanceInGroup(
  studentId: string,
  groupId: string,
  req: Request
) {
  return getMyAttendance(studentId, groupId, req);
}

export async function getMyScores(studentId: string, req: Request) {
  const scores = await StudentScore.find({ student: studentId })
    .populate("group", "name imageUrl")
    .lean();

  return { scores };
}

// ─────────────────────────────────────────
// Dashboard — all data in one roundtrip
// ─────────────────────────────────────────

export async function getDashboard(studentId: string) {

  // Step 1: profile + groups + notifications in parallel
  const { Notification } = await import("../../models/Notification");
  const { Post }         = await import("../../models/Post");

  const [student, memberships, recentNotifs] = await Promise.all([
    User.findById(studentId).select("-passwordHash").lean(),
    GroupMembership.find({ student: studentId, isActive: true })
      .populate("group", "name description imageUrl grades createdAt updatedAt")
      .sort({ joinedAt: -1 })
      .limit(3)
      .lean(),
    // Model field is `user`, NOT `recipient` — wrong key made notifications empty
    Notification.find({ user: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  if (!student) throw ApiError.notFound("المستخدم غير موجود");

  const firstGroupRaw = memberships[0]?.group;
  const firstGroup    = firstGroupRaw as unknown as (Record<string, unknown> & { _id: unknown }) | undefined;
  const groupId       = firstGroup ? String(firstGroup._id) : null;

  // Step 2: if group exists, fetch posts + ranking in parallel
  let posts:   unknown[] = [];
  let rankData: unknown  = null;
  let top3:    unknown[] = [];
  let myTeam:  unknown   = null;
  let todayQuestionStatus: unknown = null;

  if (groupId) {
    const { StudentScore: MS } = await import("../../models/StudentScore");
    const { Team }             = await import("../../models/Team");
    const { DailyQuestion }    = await import("../../models/DailyQuestion");
    const { DailyAnswer }      = await import("../../models/DailyAnswer");

    const todayDate = new Date().toISOString().split("T")[0];

    const [postsRaw, allScores, myTeamDoc, allTeams, dq] = await Promise.all([
      Post.find({ group: groupId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("author", "name avatarUrl")
        .lean(),
      MS.find({ group: groupId })
        .populate("student", "name avatarUrl grade")
        .sort({ score: -1 })
        .lean(),
      Team.findOne({ classroom: groupId, members: studentId, isActive: true }).lean(),
      Team.find({ classroom: groupId, isActive: true }).sort({ currentCycleScore: -1 }).lean(),
      DailyQuestion.findOne({ classroom: groupId, date: todayDate, isActive: true }).lean(),
    ]);

    posts = postsRaw;

    const rankIdx = allScores.findIndex(s => {
      const sId = (s.student as any)?._id || s.student;
      return String(sId) === studentId;
    });
    const myScore = rankIdx >= 0 ? allScores[rankIdx] : undefined;

    rankData = myScore ? {
      rank:         rankIdx + 1,
      score:        myScore.score,
      presentCount: myScore.presentCount,
      absentCount:  myScore.absentCount,
      totalMembers: allScores.length,
      pointsToNextRank:
        rankIdx > 0
          ? Math.max((allScores[rankIdx - 1]?.score ?? myScore.score) - myScore.score + 1, 1)
          : 0,
    } : null;

    top3 = allScores.slice(0, 3).map((s, idx) => {
      const studentObj = s.student as any;
      return {
        rank: idx + 1,
        studentId: String(studentObj?._id || studentObj?.id || s.student),
        name: studentObj?.name || "طالب",
        avatarUrl: studentObj?.avatarUrl,
        grade: studentObj?.grade,
        score: s.score,
      };
    });

    if (myTeamDoc) {
      const teamRank = allTeams.findIndex(t => String(t._id) === String(myTeamDoc._id)) + 1;
      myTeam = {
        _id: myTeamDoc._id,
        name: myTeamDoc.name,
        currentCycleScore: myTeamDoc.currentCycleScore,
        totalScore: myTeamDoc.totalScore,
        teamRank: teamRank || 1,
        totalTeams: allTeams.length,
      };
    }

    if (dq) {
      const ans = await DailyAnswer.findOne({ dailyQuestion: dq._id, student: studentId }).lean();
      todayQuestionStatus = {
        questionId: dq._id,
        rewardPoints: dq.rewardPoints,
        alreadyAnswered: !!ans,
        isCorrect: ans?.isCorrect ?? null,
      };
    }
  }

  const unreadCount = await (await import("../../models/Notification"))
    .Notification.countDocuments({ user: studentId, isRead: false });

  return {
    student,
    groups:       memberships.map(m => m.group),
    notifications: recentNotifs,
    unreadCount,
    firstGroup,
    posts,
    rank: rankData,
    top3,
    myTeam,
    todayQuestion: todayQuestionStatus,
  };
}
