import mongoose from "mongoose";
import { ClassTask, IClassTask, TaskType } from "../../models/ClassTask";
import { StudentTaskProgress } from "../../models/StudentTaskProgress";
import { GroupMembership } from "../../models/GroupMembership";
import { GroupTeacher } from "../../models/GroupTeacher";
import { ApiError } from "../../utils/ApiError";
import { Role, NotificationType } from "../../types";
import { assertTeacherOwnsGroup } from "../teachers/teacher.service";
import { notifyUsers } from "../notifications/notification.service";
import {
  CreateClassTaskDto,
  UpdateClassTaskDto,
  SendTaskReminderDto,
} from "./class-task.schemas";

function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

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
  if (!membership) throw ApiError.forbidden("يجب أن تكون عضواً في المجموعة للوصول إلى المهام");
}

// ─────────────────────────────────────────
// Helper: Calculate daily streak for a student on a specific task
// ─────────────────────────────────────────
function calculateDailyStreak(completedDates: Set<string>, todayStr: string): number {
  let streak = 0;
  let checkDate = new Date(todayStr + "T00:00:00Z");

  // If today is not completed, start checking from yesterday
  if (!completedDates.has(todayStr)) {
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    const yestStr = checkDate.toISOString().split("T")[0];
    if (!completedDates.has(yestStr)) {
      return 0;
    }
  }

  // Count consecutive completed days backwards
  while (true) {
    const curStr = checkDate.toISOString().split("T")[0];
    if (completedDates.has(curStr)) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ─────────────────────────────────────────
// 1. Teacher creates a class task (ONCE or DAILY)
// ─────────────────────────────────────────
export async function createClassTask(teacherId: string, dto: CreateClassTaskDto) {
  await assertTeacherOwnsGroup(teacherId, dto.classroomId);

  const taskType = dto.type || TaskType.ONCE;

  const task = await ClassTask.create({
    classroom: dto.classroomId,
    teacher: teacherId,
    title: dto.title.trim(),
    description: dto.description?.trim(),
    type: taskType,
    dueDate: taskType === TaskType.ONCE && dto.dueDate ? new Date(dto.dueDate) : null,
    isActive: true,
  });

  // Notify all students in this classroom
  try {
    const memberships = await GroupMembership.find({
      group: dto.classroomId,
      isActive: true,
    }).select("student");

    const userIds = memberships.map((m) => m.student);
    if (userIds.length > 0) {
      const typeLabel = taskType === TaskType.DAILY ? "مهمة يومية متجددة" : "مهمة دراسية جديدة";
      await notifyUsers({
        userIds,
        type: NotificationType.NEW_POST,
        title: typeLabel,
        message: `أضاف المعلم ${typeLabel}: ${dto.title}`,
        metadata: { taskId: task._id, classroomId: dto.classroomId, type: taskType },
      });
    }
  } catch (err) {
    console.error("Failed to notify students of new class task:", err);
  }

  return task;
}

// ─────────────────────────────────────────
// 2. Get all class tasks with completion stats & streaks
// ─────────────────────────────────────────
export async function getClassTasks(
  userId: string,
  role: Role,
  classroomId: string,
  targetDateStr?: string
) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }
  await assertClassroomAccess(userId, role, classroomId);

  const todayStr = targetDateStr || getTodayDateStr();

  const [tasks, totalStudents] = await Promise.all([
    ClassTask.find({ classroom: classroomId, isActive: true })
      .sort({ createdAt: -1 })
      .lean(),
    GroupMembership.countDocuments({ group: classroomId, isActive: true }),
  ]);

  const taskIds = tasks.map((t) => t._id);

  // Load student-specific progress if role is STUDENT
  let studentProgressList: Array<{
    task: mongoose.Types.ObjectId;
    type: TaskType;
    dateStr?: string;
    isCompleted: boolean;
    completedAt?: Date;
  }> = [];

  if (role === Role.STUDENT) {
    studentProgressList = await StudentTaskProgress.find({
      task: { $in: taskIds },
      student: userId,
    }).lean() as any;
  }

  // Pre-calculate completed dates map for streak calculation per task
  const studentDatesPerTask = new Map<string, Set<string>>();
  const studentTodayStatusMap = new Map<string, { isCompleted: boolean; completedAt?: Date }>();

  for (const sp of studentProgressList) {
    const tid = String(sp.task);
    if (sp.isCompleted && sp.dateStr) {
      if (!studentDatesPerTask.has(tid)) {
        studentDatesPerTask.set(tid, new Set<string>());
      }
      studentDatesPerTask.get(tid)!.add(sp.dateStr);
    }

    if (sp.type === TaskType.ONCE && !sp.dateStr) {
      studentTodayStatusMap.set(tid, {
        isCompleted: sp.isCompleted,
        completedAt: sp.completedAt,
      });
    } else if (sp.type === TaskType.DAILY && sp.dateStr === todayStr) {
      studentTodayStatusMap.set(tid, {
        isCompleted: sp.isCompleted,
        completedAt: sp.completedAt,
      });
    }
  }

  // Aggregate completion counts for each task
  // For ONCE: dateStr does not exist or is null
  // For DAILY: dateStr === todayStr
  const [onceCounts, dailyCounts] = await Promise.all([
    StudentTaskProgress.aggregate([
      {
        $match: {
          task: { $in: taskIds },
          type: TaskType.ONCE,
          isCompleted: true,
          dateStr: { $exists: false },
        },
      },
      { $group: { _id: "$task", count: { $sum: 1 } } },
    ]),
    StudentTaskProgress.aggregate([
      {
        $match: {
          task: { $in: taskIds },
          type: TaskType.DAILY,
          isCompleted: true,
          dateStr: todayStr,
        },
      },
      { $group: { _id: "$task", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>();
  for (const item of onceCounts) countMap.set(String(item._id), item.count);
  for (const item of dailyCounts) countMap.set(String(item._id), item.count);

  const tasksWithStats = tasks.map((task) => {
    const tid = String(task._id);
    const completedCount = countMap.get(tid) ?? 0;
    const percentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
    const studentStatus = studentTodayStatusMap.get(tid);

    let streak: number | undefined;
    if (role === Role.STUDENT && task.type === TaskType.DAILY) {
      const dates = studentDatesPerTask.get(tid) || new Set<string>();
      streak = calculateDailyStreak(dates, todayStr);
    }

    return {
      _id: task._id,
      classroom: task.classroom,
      teacher: task.teacher,
      title: task.title,
      description: task.description,
      type: task.type || TaskType.ONCE,
      dueDate: task.dueDate,
      isActive: task.isActive,
      createdAt: task.createdAt,
      stats: {
        completedCount,
        totalStudents,
        percentage,
      },
      // Student-specific fields
      isCompleted: studentStatus?.isCompleted ?? false,
      completedAt: studentStatus?.completedAt,
      streak,
      targetDate: todayStr,
    };
  });

  return {
    tasks: tasksWithStats,
    totalStudents,
    date: todayStr,
  };
}

// ─────────────────────────────────────────
// 3. Teacher Task Progress Drill-down (Completed vs Pending)
// ─────────────────────────────────────────
export async function getClassTaskProgress(
  teacherId: string,
  taskId: string,
  queryDateStr?: string
) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");
  const task = await ClassTask.findById(taskId);
  if (!task || !task.isActive) throw ApiError.notFound("المهمة غير موجودة");

  await assertTeacherOwnsGroup(teacherId, String(task.classroom));

  const isDaily = task.type === TaskType.DAILY;
  const targetDateStr = isDaily ? (queryDateStr || getTodayDateStr()) : undefined;

  const progressFilter: any = { task: task._id };
  if (isDaily) {
    progressFilter.dateStr = targetDateStr;
  } else {
    progressFilter.dateStr = { $exists: false };
  }

  const [memberships, progressList] = await Promise.all([
    GroupMembership.find({ group: task.classroom, isActive: true })
      .populate("student", "name email phone avatarUrl grade")
      .lean(),
    StudentTaskProgress.find(progressFilter).lean(),
  ]);

  const progressMap = new Map<string, { isCompleted: boolean; completedAt?: Date }>();
  for (const sp of progressList) {
    progressMap.set(String(sp.student), {
      isCompleted: sp.isCompleted,
      completedAt: sp.completedAt,
    });
  }

  const completed: Array<{ student: any; completedAt?: Date }> = [];
  const pending: Array<{ student: any }> = [];

  for (const m of memberships) {
    const student = m.student as any;
    if (!student) continue;
    const sid = String(student._id || student.id);
    const p = progressMap.get(sid);

    if (p && p.isCompleted) {
      completed.push({ student, completedAt: p.completedAt });
    } else {
      pending.push({ student });
    }
  }

  const total = memberships.length;
  const percentage = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return {
    task,
    selectedDate: targetDateStr,
    completed,
    pending,
    stats: {
      total,
      completedCount: completed.length,
      pendingCount: pending.length,
      percentage,
    },
  };
}

// ─────────────────────────────────────────
// 4. Student toggles class task completion
// ─────────────────────────────────────────
export async function toggleStudentTaskProgress(studentId: string, taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");
  const task = await ClassTask.findById(taskId);
  if (!task || !task.isActive) throw ApiError.notFound("المهمة غير موجودة");

  // Validate student is enrolled in classroom
  const isMember = await GroupMembership.exists({
    group: task.classroom,
    student: studentId,
    isActive: true,
  });
  if (!isMember) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  const isDaily = task.type === TaskType.DAILY;
  const todayStr = isDaily ? getTodayDateStr() : undefined;

  const findFilter: any = {
    task: task._id,
    student: studentId,
  };
  if (isDaily) {
    findFilter.dateStr = todayStr;
  } else {
    findFilter.dateStr = { $exists: false };
  }

  const existing = await StudentTaskProgress.findOne(findFilter);
  const nextCompleted = existing ? !existing.isCompleted : true;

  const updateDoc: any = {
    task: task._id,
    student: studentId,
    classroom: task.classroom,
    type: task.type,
    isCompleted: nextCompleted,
    completedAt: nextCompleted ? new Date() : undefined,
  };
  if (isDaily) {
    updateDoc.dateStr = todayStr;
  } else {
    updateDoc.$unset = { dateStr: 1 };
  }

  const progress = await StudentTaskProgress.findOneAndUpdate(
    findFilter,
    updateDoc,
    { upsert: true, new: true }
  );

  return progress;
}

// ─────────────────────────────────────────
// 5. Teacher sends reminder to pending students
// ─────────────────────────────────────────
export async function sendTaskReminder(
  teacherId: string,
  taskId: string,
  dto: SendTaskReminderDto
) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");
  const task = await ClassTask.findById(taskId);
  if (!task || !task.isActive) throw ApiError.notFound("المهمة غير موجودة");

  await assertTeacherOwnsGroup(teacherId, String(task.classroom));

  const isDaily = task.type === TaskType.DAILY;
  const targetDateStr = isDaily ? (dto.dateStr || getTodayDateStr()) : undefined;

  let targetStudentIds: string[] = dto.studentIds || [];

  if (targetStudentIds.length === 0) {
    const progressFilter: any = { task: task._id, isCompleted: true };
    if (isDaily) {
      progressFilter.dateStr = targetDateStr;
    } else {
      progressFilter.dateStr = { $exists: false };
    }

    const [memberships, completedList] = await Promise.all([
      GroupMembership.find({ group: task.classroom, isActive: true }).select("student").lean(),
      StudentTaskProgress.find(progressFilter).select("student").lean(),
    ]);

    const completedSet = new Set(completedList.map((c) => String(c.student)));
    targetStudentIds = memberships
      .map((m) => String(m.student))
      .filter((sid) => !completedSet.has(sid));
  }

  if (targetStudentIds.length > 0) {
    const message = isDaily
      ? `تذكير من المعلم: لم تقم بإنجاز الورد اليومي/المهمة اليومية: "${task.title}".`
      : `تذكير من المعلم: لم تقم بإنجاز المهمة المطلوبة بعد: "${task.title}".`;

    await notifyUsers({
      userIds: targetStudentIds,
      type: NotificationType.NEW_POST,
      title: "تذكير بمهمة دراسية",
      message,
      metadata: { taskId: task._id, classroomId: task.classroom, dateStr: targetDateStr },
    });
  }

  return {
    success: true,
    message: `تم إرسال التنبيه إلى ${targetStudentIds.length} طالب بنجاح`,
    count: targetStudentIds.length,
  };
}
