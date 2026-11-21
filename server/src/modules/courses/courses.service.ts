import mongoose from "mongoose";
import {
  Course,
  ICourse,
  Lesson,
  ILesson,
  LessonProgress,
  ILessonProgress,
  WatchStatus,
  LessonComment,
  Group,
  GroupMembership,
  GroupTeacher,
  User,
} from "../../models";
import { ApiError } from "../../utils/ApiError";
import { extractYouTubeId } from "../../utils/youtube";
import { notifyUsers } from "../notifications/notification.service";
import { NotificationType } from "../../types";
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateLessonDto,
  UpdateLessonProgressDto,
} from "./courses.schemas";

// Helper: Format seconds to MM:SS
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Verify if teacher or admin has rights to manage group content
 */
async function assertTeacherOrAdmin(userId: string, classroomId: string): Promise<void> {
  const user = await User.findById(userId).select("role");
  if (!user) throw ApiError.unauthorized("المستخدم غير موجود");
  if (user.role === "ADMIN") return;

  const groupTeacher = await GroupTeacher.findOne({
    teacher: userId,
    group: classroomId,
  });
  if (!groupTeacher) {
    throw ApiError.forbidden("ليس لديك صلاحية إدارة محتوى هذه المجموعة");
  }
}

/**
 * Create a new Course
 */
export async function createCourse(teacherId: string, dto: CreateCourseDto): Promise<ICourse> {
  await assertTeacherOrAdmin(teacherId, dto.classroomId);

  const classroom = await Group.findById(dto.classroomId);
  if (!classroom) throw ApiError.notFound("المجموعة غير موجودة");

  let order = dto.order;
  if (order === undefined) {
    const lastCourse = await Course.findOne({ classroom: dto.classroomId })
      .sort({ order: -1 })
      .select("order");
    order = (lastCourse?.order ?? -1) + 1;
  }

  const course = await Course.create({
    classroom: dto.classroomId,
    teacher: teacherId,
    title: dto.title.trim(),
    description: dto.description?.trim() ?? "",
    thumbnailUrl: dto.thumbnailUrl ?? null,
    order,
    isActive: true,
  });

  return course;
}

/**
 * Get all courses for a classroom (with lessons count and student progress overview)
 */
export async function getGroupCourses(classroomId: string, studentId?: string) {
  const courses = await Course.find({ classroom: classroomId, isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const courseIds = courses.map((c) => c._id);

  // Fetch all lessons in these courses
  const lessons = await Lesson.find({
    course: { $in: courseIds },
    isActive: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // If studentId provided, fetch all their lesson progress records
  let progressMap = new Map<string, ILessonProgress>();
  if (studentId) {
    const progressList = await LessonProgress.find({
      student: studentId,
      course: { $in: courseIds },
    }).lean();

    progressMap = new Map(progressList.map((p) => [String(p.lesson), p as unknown as ILessonProgress]));
  }

  // Group lessons by course
  const result = courses.map((course) => {
    const courseLessons = lessons
      .filter((l) => String(l.course) === String(course._id))
      .map((lesson) => {
        const prog = progressMap.get(String(lesson._id));
        return {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          youtubeUrl: lesson.youtubeUrl,
          youtubeVideoId: lesson.youtubeVideoId,
          durationSeconds: lesson.durationSeconds ?? 0,
          formattedDuration: formatTime(lesson.durationSeconds ?? 0),
          order: lesson.order,
          progress: prog
            ? {
                status: prog.status,
                percentage: prog.percentage,
                lastPositionSeconds: prog.lastPositionSeconds,
                formattedPosition: formatTime(prog.lastPositionSeconds),
                isCompleted: prog.isCompleted,
                lastWatchedAt: prog.lastWatchedAt,
              }
            : {
                status: WatchStatus.NOT_STARTED,
                percentage: 0,
                lastPositionSeconds: 0,
                formattedPosition: "00:00",
                isCompleted: false,
                lastWatchedAt: null,
              },
        };
      });

    const totalLessons = courseLessons.length;
    const completedLessons = courseLessons.filter((l) => l.progress.isCompleted).length;
    const courseProgressPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...course,
      totalLessons,
      completedLessons,
      courseProgressPercentage,
      lessons: courseLessons,
    };
  });

  return result;
}

/**
 * Get courses across user's groups (standalone courses view)
 */
export async function getMyCourses(
  userId: string,
  userRole: string,
  classroomId?: string
) {
  let groupIds: mongoose.Types.ObjectId[] = [];

  if (classroomId && mongoose.Types.ObjectId.isValid(classroomId)) {
    groupIds = [new mongoose.Types.ObjectId(classroomId)];
  } else if (userRole === "ADMIN") {
    const allGroups = await Group.find({ isActive: true }).select("_id").lean();
    groupIds = allGroups.map((g) => g._id);
  } else if (userRole === "TEACHER") {
    const [links, createdGroups] = await Promise.all([
      GroupTeacher.find({ teacher: userId }).select("group").lean(),
      Group.find({ createdBy: userId, isActive: true }).select("_id").lean(),
    ]);
    const set = new Set<string>();
    links.forEach((l) => set.add(String(l.group)));
    createdGroups.forEach((g) => set.add(String(g._id)));
    groupIds = Array.from(set).map((id) => new mongoose.Types.ObjectId(id));
  } else {
    // Student
    const memberships = await GroupMembership.find({
      student: userId,
      isActive: { $ne: false },
    })
      .select("group")
      .lean();
    groupIds = memberships.map((m) => m.group as mongoose.Types.ObjectId);
  }

  const courses = await Course.find({ classroom: { $in: groupIds }, isActive: true })
    .populate("classroom", "name imageUrl grades")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  const courseIds = courses.map((c) => c._id);

  const lessons = await Lesson.find({
    course: { $in: courseIds },
    isActive: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // If student, get progress
  const progressMap = new Map<string, any>();
  if (userRole === "STUDENT") {
    const progressList = await LessonProgress.find({
      student: userId,
      course: { $in: courseIds },
    }).lean();
    for (const p of progressList) {
      progressMap.set(String(p.lesson), p);
    }
  }

  return courses.map((course) => {
    const cid = String(course._id);
    const courseLessons = lessons.filter((l) => String(l.course) === cid);
    const totalLessons = courseLessons.length;
    let completedLessons = 0;

    const lessonsWithProgress = courseLessons.map((lesson) => {
      const lid = String(lesson._id);
      const prog = progressMap.get(lid);
      const isCompleted = prog?.isCompleted ?? false;
      if (isCompleted) completedLessons++;
      return {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        youtubeUrl: lesson.youtubeUrl,
        youtubeVideoId: lesson.youtubeVideoId,
        durationSeconds: lesson.durationSeconds ?? 0,
        formattedDuration: formatTime(lesson.durationSeconds ?? 0),
        order: lesson.order,
        progress: prog
          ? {
              status: prog.status,
              percentage: prog.percentage,
              lastPositionSeconds: prog.lastPositionSeconds,
              formattedPosition: formatTime(prog.lastPositionSeconds),
              isCompleted: prog.isCompleted,
            }
          : {
              status: WatchStatus.NOT_STARTED,
              percentage: 0,
              lastPositionSeconds: 0,
              formattedPosition: "00:00",
              isCompleted: false,
            },
      };
    });

    const courseProgressPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...course,
      totalLessons,
      completedLessons,
      courseProgressPercentage,
      lessons: lessonsWithProgress,
    };
  });
}

/**
 * Create a new Lesson in a Course
 */
export async function createLesson(
  teacherId: string,
  courseId: string,
  dto: CreateLessonDto
): Promise<ILesson> {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound("الكورس غير موجود");

  await assertTeacherOrAdmin(teacherId, String(course.classroom));

  const youtubeVideoId = extractYouTubeId(dto.youtubeUrl);
  if (!youtubeVideoId) {
    throw ApiError.badRequest("رابط فيديو اليوتيوب غير صالح أو لا يمكن استخراج معرف الفيديو منه");
  }

  let order = dto.order;
  if (order === undefined) {
    const lastLesson = await Lesson.findOne({ course: courseId })
      .sort({ order: -1 })
      .select("order");
    order = (lastLesson?.order ?? -1) + 1;
  }

  const lesson = await Lesson.create({
    course: courseId,
    classroom: course.classroom,
    title: dto.title.trim(),
    description: dto.description?.trim() ?? "",
    youtubeUrl: dto.youtubeUrl.trim(),
    youtubeVideoId,
    durationSeconds: dto.durationSeconds ?? 0,
    order,
    isActive: true,
  });

  return lesson;
}

/**
 * Get Lesson details and student's progress
 */
export async function getLesson(lessonId: string, userId: string) {
  const lesson = await Lesson.findById(lessonId)
    .populate("course", "title description classroom")
    .lean();

  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  const progress = await LessonProgress.findOne({
    lesson: lessonId,
    student: userId,
  }).lean();

  // Also get sibling lessons in the same course for convenient navigation
  const courseLessons = await Lesson.find({
    course: lesson.course._id,
    isActive: true,
  })
    .sort({ order: 1, createdAt: 1 })
    .select("_id title durationSeconds order")
    .lean();

  return {
    lesson: {
      ...lesson,
      formattedDuration: formatTime(lesson.durationSeconds ?? 0),
    },
    courseLessons,
    progress: progress
      ? {
          status: progress.status,
          percentage: progress.percentage,
          lastPositionSeconds: progress.lastPositionSeconds,
          formattedPosition: formatTime(progress.lastPositionSeconds),
          isCompleted: progress.isCompleted,
          completedAt: progress.completedAt,
          lastWatchedAt: progress.lastWatchedAt,
        }
      : {
          status: WatchStatus.NOT_STARTED,
          percentage: 0,
          lastPositionSeconds: 0,
          formattedPosition: "00:00",
          isCompleted: false,
          completedAt: null,
          lastWatchedAt: null,
        },
  };
}

/**
 * Update student's lesson watch progress
 */
export async function updateLessonProgress(
  studentId: string,
  lessonId: string,
  dto: UpdateLessonProgressDto
) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  // Keep duration updated if passed from player and lesson duration is unset
  const durationSeconds =
    dto.durationSeconds > 0 ? dto.durationSeconds : (lesson.durationSeconds ?? 0);

  if (dto.durationSeconds > 0 && (!lesson.durationSeconds || lesson.durationSeconds === 0)) {
    lesson.durationSeconds = Math.round(dto.durationSeconds);
    await lesson.save().catch(() => {});
  }

  // Calculate percentage and status per business rules
  const percentage =
    durationSeconds > 0
      ? Math.min(100, Math.round((dto.currentPositionSeconds / durationSeconds) * 100))
      : dto.isEnded
      ? 100
      : 0;

  // Completion logic: >= 85% or isEnded
  const isCompleted = Boolean(dto.isEnded || percentage >= 85);
  const status = isCompleted
    ? WatchStatus.COMPLETED
    : percentage > 0
    ? WatchStatus.IN_PROGRESS
    : WatchStatus.NOT_STARTED;

  const existing = await LessonProgress.findOne({
    lesson: lessonId,
    student: studentId,
  });

  const now = new Date();
  const completedAt = isCompleted
    ? existing?.completedAt ?? now
    : existing?.completedAt ?? null;

  const progress = await LessonProgress.findOneAndUpdate(
    { lesson: lessonId, student: studentId },
    {
      $set: {
        course: lesson.course,
        lastPositionSeconds: Math.floor(dto.currentPositionSeconds),
        durationSeconds: Math.floor(durationSeconds),
        percentage,
        status,
        isCompleted,
        completedAt,
        lastWatchedAt: now,
      },
    },
    { upsert: true, new: true }
  );

  return progress;
}

/**
 * Teacher Lesson Analytics Dashboard
 */
export async function getLessonAnalytics(teacherId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId)
    .populate("course", "title classroom")
    .lean();

  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  await assertTeacherOrAdmin(teacherId, String(lesson.classroom));

  // Fetch all active students in the classroom
  const memberships = await GroupMembership.find({
    group: lesson.classroom,
    status: "ACTIVE",
  })
    .populate("student", "_id name email avatar")
    .lean();

  const students = memberships
    .map((m) => m.student as any)
    .filter((s) => s && s._id);

  const studentIds = students.map((s) => s._id);

  // Fetch progress records for these students
  const progressList = await LessonProgress.find({
    lesson: lessonId,
    student: { $in: studentIds },
  }).lean();

  const progressMap = new Map(progressList.map((p) => [String(p.student), p]));

  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;
  let totalPercentageSum = 0;

  const studentProgressList = students.map((student) => {
    const prog = progressMap.get(String(student._id));
    const status = prog?.status ?? WatchStatus.NOT_STARTED;
    const percentage = prog?.percentage ?? 0;
    const lastPositionSeconds = prog?.lastPositionSeconds ?? 0;
    const duration = prog?.durationSeconds ?? lesson.durationSeconds ?? 0;

    if (status === WatchStatus.COMPLETED) {
      completedCount++;
    } else if (status === WatchStatus.IN_PROGRESS) {
      inProgressCount++;
    } else {
      notStartedCount++;
    }

    totalPercentageSum += percentage;

    return {
      studentId: student._id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatar ?? null,
      status,
      percentage,
      lastPositionSeconds,
      durationSeconds: duration,
      formattedPosition: `${formatTime(lastPositionSeconds)} / ${formatTime(duration)} دقيقة`,
      isCompleted: prog?.isCompleted ?? false,
      completedAt: prog?.completedAt ?? null,
      lastWatchedAt: prog?.lastWatchedAt ?? null,
    };
  });

  const totalStudents = students.length;
  const completionRate =
    totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const averageWatchProgress =
    totalStudents > 0 ? Math.round(totalPercentageSum / totalStudents) : 0;

  return {
    lesson: {
      _id: lesson._id,
      title: lesson.title,
      durationSeconds: lesson.durationSeconds ?? 0,
      formattedDuration: formatTime(lesson.durationSeconds ?? 0),
      youtubeUrl: lesson.youtubeUrl,
    },
    totalStudents,
    completedCount,
    inProgressCount,
    notStartedCount,
    completionRate,
    averageWatchProgress,
    students: studentProgressList,
  };
}

/**
 * Send reminder to pending/non-completed students for a lesson
 */
export async function sendLessonReminder(teacherId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  await assertTeacherOrAdmin(teacherId, String(lesson.classroom));

  // Fetch active students in classroom
  const memberships = await GroupMembership.find({
    group: lesson.classroom,
    status: "ACTIVE",
  }).select("student");

  const studentIds = memberships.map((m) => m.student);

  // Fetch students who already completed the lesson
  const completedProgress = await LessonProgress.find({
    lesson: lessonId,
    student: { $in: studentIds },
    status: WatchStatus.COMPLETED,
  }).select("student");

  const completedSet = new Set(completedProgress.map((p) => String(p.student)));

  // Target students who are NOT_STARTED or IN_PROGRESS
  const pendingStudentIds = studentIds.filter((id) => !completedSet.has(String(id)));

  if (pendingStudentIds.length > 0) {
    await notifyUsers({
      userIds: pendingStudentIds,
      type: NotificationType.LESSON_REMINDER,
      title: `تذكير بمشاهدة الدرس: ${lesson.title}`,
      message: `يرجى إكمال مشاهدة الدرس المطلوب: "${lesson.title}" لتحقيق أقصى استفادة تعليمية.`,
      metadata: {
        lessonId: String(lesson._id),
        url: `/student/lessons/${lesson._id}`,
      },
    });
  }

  return {
    notifiedCount: pendingStudentIds.length,
  };
}

/**
 * Comments on a Lesson
 */
export async function getLessonComments(lessonId: string, limit = 50) {
  const comments = await LessonComment.find({ lesson: lessonId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("author", "_id name email avatar role")
    .lean();

  return comments;
}

export async function createLessonComment(
  userId: string,
  lessonId: string,
  content: string,
  parentId?: string | null
) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  const comment = await LessonComment.create({
    lesson: lessonId,
    author: userId,
    content: content.trim(),
    parentId: parentId || null,
  });

  const populated = await LessonComment.findById(comment._id)
    .populate("author", "_id name email avatar role")
    .lean();

  return populated;
}

export async function deleteLessonComment(
  userId: string,
  userRole: string,
  commentId: string
) {
  const comment = await LessonComment.findById(commentId);
  if (!comment) throw ApiError.notFound("التعليق غير موجود");

  if (userRole !== "ADMIN" && String(comment.author) !== userId) {
    // Check if user is teacher of the group
    const lesson = await Lesson.findById(comment.lesson);
    if (lesson) {
      const isTeacher = await GroupTeacher.findOne({
        teacher: userId,
        group: lesson.classroom,
      });
      if (!isTeacher) {
        throw ApiError.forbidden("ليس لديك صلاحية حذف هذا التعليق");
      }
    } else {
      throw ApiError.forbidden("ليس لديك صلاحية حذف هذا التعليق");
    }
  }

  await LessonComment.findByIdAndDelete(commentId);
  return { deleted: true };
}

/**
 * Delete a course (and its lessons)
 */
export async function deleteCourse(teacherId: string, courseId: string) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound("الكورس غير موجود");

  await assertTeacherOrAdmin(teacherId, String(course.classroom));

  await LessonComment.deleteMany({
    lesson: { $in: await Lesson.find({ course: courseId }).distinct("_id") },
  });
  await LessonProgress.deleteMany({ course: courseId });
  await Lesson.deleteMany({ course: courseId });
  await Course.findByIdAndDelete(courseId);

  return { deleted: true };
}

/**
 * Delete a lesson
 */
export async function deleteLesson(teacherId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw ApiError.notFound("الدرس غير موجود");

  await assertTeacherOrAdmin(teacherId, String(lesson.classroom));

  await LessonComment.deleteMany({ lesson: lessonId });
  await LessonProgress.deleteMany({ lesson: lessonId });
  await Lesson.findByIdAndDelete(lessonId);

  return { deleted: true };
}
