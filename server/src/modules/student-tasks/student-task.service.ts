import mongoose from "mongoose";
import { StudentTask, IStudentTask } from "../../models/StudentTask";
import { ApiError } from "../../utils/ApiError";
import { CreateTaskDto, ReorderTasksDto } from "./student-task.schemas";

// ─────────────────────────────────────────
// 1. Get current student's personal tasks & stats
// ─────────────────────────────────────────
export async function getStudentTasks(studentId: string) {
  const tasks = await StudentTask.find({ student: studentId })
    .sort({ isCompleted: 1, order: 1, createdAt: -1 })
    .lean();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    tasks,
    stats: {
      total,
      completed,
      pending,
      percentage,
    },
  };
}

// ─────────────────────────────────────────
// 2. Create personal task
// ─────────────────────────────────────────
export async function createStudentTask(studentId: string, dto: CreateTaskDto) {
  const lastTask = await StudentTask.findOne({ student: studentId }).sort({ order: -1 });
  const nextOrder = (lastTask?.order ?? 0) + 1;

  const task = await StudentTask.create({
    student: studentId,
    title: dto.title.trim(),
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    order: nextOrder,
    isCompleted: false,
  });

  return task;
}

// ─────────────────────────────────────────
// 3. Toggle task completion
// ─────────────────────────────────────────
export async function toggleStudentTask(studentId: string, taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");

  const task = await StudentTask.findOne({ _id: taskId, student: studentId });
  if (!task) throw ApiError.notFound("المهمة غير موجودة");

  task.isCompleted = !task.isCompleted;
  await task.save();
  return task;
}

// ─────────────────────────────────────────
// 4. Delete task
// ─────────────────────────────────────────
export async function deleteStudentTask(studentId: string, taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("معرّف غير صالح");

  const task = await StudentTask.findOneAndDelete({ _id: taskId, student: studentId });
  if (!task) throw ApiError.notFound("المهمة غير موجودة");

  return { success: true, message: "تم حذف المهمة بنجاح" };
}

// ─────────────────────────────────────────
// 5. Reorder tasks
// ─────────────────────────────────────────
export async function reorderStudentTasks(studentId: string, dto: ReorderTasksDto) {
  const bulkOps = dto.taskIds.map((taskId, index) => ({
    updateOne: {
      filter: { _id: taskId, student: studentId },
      update: { $set: { order: index } },
    },
  }));

  if (bulkOps.length > 0) {
    await StudentTask.bulkWrite(bulkOps);
  }

  return { success: true };
}
