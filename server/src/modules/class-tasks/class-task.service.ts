import mongoose from "mongoose";
import { ClassTask, IClassTask } from "../../models/ClassTask";
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
// 1. Teacher creates a class-wide task
// ─────────────────────────────────────────
export async function createClassTask(teacherId: string, dto: CreateClassTaskDto) {
  await assertTeacherOwnsGroup(teacherId, dto.classroomId);

  const task = await ClassTask.create({
    classroom: dto.classroomId,
    teacher: teacherId,
    title: dto.title.trim(),
    description: dto.description?.trim(),
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
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
      await notifyUsers({
        userIds,
        type: NotificationType.NEW_POST,
        title: "مهمة دراسية جديدة",
        message: `أضاف المعلم مهمة دراسية جديدة: ${dto.title}`,
        metadata: { taskId: task._id, classroomId: dto.classroomId },
      });
    }
  } catch (err) {
    console.error("Failed to notify students of new class task:", err);
  }

  return task;
}

// ─────────────────────────────────────────
// 2. Get all class tasks with completion stats
// ─────────────────────────────────────────
export async function getClassTasks(
  userId: string,
  role: Role,
  classroomId: string
) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    throw ApiError.badRequest("معرّف غير صالح");
  }
  await assertClassroomAccess(userId, role, classroomId);

  const [tasks, totalStudents, studentProgressList] = await Promise.all([
    ClassTask.find({ classroom: classroomId, isActive: true })
      .sort({ createdAt: -1 })
      .lean(),
    GroupMembership.countDocuments({ group: classroomId, isActive: true }),
    role === Role.STUDENT
      ? StudentTaskProgress.find({ student: userId }).lean()
      : Promise.resolve([]),
  ]);

  const studentProgressMap = new Map<string, { isCompleted: boolean; completedAt?: Date }>();
  for (const sp of studentProgressList) {
    studentProgressMap.set(String(sp.task), {
      isCompleted: sp.isCompleted,
      completedAt: sp.completedAt,
    });
  }

  const taskIds = tasks.map((t) => t._id);
  const progressCounts = await StudentTaskProgress.aggregate([
    { $match: { task: { $in: taskIds }, isCompleted: true } },
    { $group: { _id: "$task", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  for (const pc of progressCounts) {
    countMap.set(String(pc._id), pc.count);
  }

  const tasksWithStats = tasks.map((task) => {
    const tid = String(task._id);
    const completedCount = countMap.get(tid) ?? 0;
    const percentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
    const studentStatus = studentProgressMap.get(tid);

    return {
      _id: task._id,
      classroom: task.classroom,
      teacher: task.teacher,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      isActive: task.isActive,
      createdAt: task.createdAt,
      stats: {
        completedCount,
        totalStudents,
        percentage,
      },
      // Student-specific fields if requested by a student
      isCompleted: studentStatus?.isCompleted ?? false,
      completedAt: studentStatus?.completedAt,
    };
  });

  return {
    tasks: tasksWithStats,
    totalStudents,
  };
}

// ─────────────────────────────────────────
// 3. Teacher Task Progress Drill-down (Completed vs Pending)
// ─────────────────────────────────────────
export async function getClassTaskProgress(teacherId: string, taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");
  const task = await ClassTask.findById(taskId);
  if (!task || !task.isActive) throw ApiError.notFound("المهمة غير موجودة");

  await assertTeacherOwnsGroup(teacherId, String(task.classroom));

  const [memberships, progressList] = await Promise.all([
    GroupMembership.find({ group: task.classroom, isActive: true })
      .populate("student", "name email phone avatarUrl grade")
      .lean(),
    StudentTaskProgress.find({ task: task._id }).lean(),
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

  // Validate student is in classroom
  const isMember = await GroupMembership.exists({
    group: task.classroom,
    student: studentId,
    isActive: true,
  });
  if (!isMember) throw ApiError.forbidden("لست عضواً في هذه المجموعة");

  const existing = await StudentTaskProgress.findOne({
    task: task._id,
    student: studentId,
  });

  const nextCompleted = existing ? !existing.isCompleted : true;
  const progress = await StudentTaskProgress.findOneAndUpdate(
    { task: task._id, student: studentId },
    {
      $set: {
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date() : undefined,
      },
    },
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

  let targetStudentIds: string[] = dto.studentIds || [];

  if (targetStudentIds.length === 0) {
    // Find all pending students
    const [memberships, completedList] = await Promise.all([
      GroupMembership.find({ group: task.classroom, isActive: true }).select("student").lean(),
      StudentTaskProgress.find({ task: task._id, isCompleted: true }).select("student").lean(),
    ]);

    const completedSet = new Set(completedList.map((c) => String(c.student)));
    targetStudentIds = memberships
      .map((m) => String(m.student))
      .filter((sid) => !completedSet.has(sid));
  }

  if (targetStudentIds.length > 0) {
    await notifyUsers({
      userIds: targetStudentIds,
      type: NotificationType.NEW_POST,
      title: "تذكير بمهمة دراسية مطلوبة",
      message: `تذكير من المعلم: لم تقم بإنجاز المهمة المطلوبة بعد: "${task.title}".`,
      metadata: { taskId: task._id, classroomId: task.classroom },
    });
  }

  return {
    success: true,
    message: `تم إرسال التنبيه إلى ${targetStudentIds.length} طالب بنجاح`,
    count: targetStudentIds.length,
  };
}
