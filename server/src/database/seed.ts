/**
 * EduSync — Seed Script
 * Run: pnpm seed  (or npm run seed)
 *
 * Creates realistic Arabic test data:
 *  - 1 Admin
 *  - 3 Teachers
 *  - 4 Groups
 *  - 20 Students spread across groups
 *  - Attendance records for the last 10 days
 *  - Monthly scores (auto-calculated by attendance logic)
 *  - Posts, Comments, Likes
 *  - Notifications
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import argon2 from "argon2";
import { env } from "../config/env";
import { ATTENDANCE_SCORE } from "../config/constants";
import { Role, Grade, JoinRequestStatus, AttendanceStatus, NotificationType } from "../types";
import { toDateOnly } from "../utils/date";

// ── Models ────────────────────────────────
import { User } from "../models/User";
import { Group } from "../models/Group";
import { GroupTeacher } from "../models/GroupTeacher";
import { GroupMembership } from "../models/GroupMembership";
import { JoinRequest } from "../models/JoinRequest";
import { Attendance } from "../models/Attendance";
import { StudentScore } from "../models/StudentScore";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { PostLike } from "../models/PostLike";
import { Notification } from "../models/Notification";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

async function hashPassword(plain: string) {
  return argon2.hash(plain);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return toDateOnly(d);
}

// ─────────────────────────────────────────
// Seed data definitions
// ─────────────────────────────────────────

const ADMIN_DATA = {
  name: "مدير النظام",
  email: "admin@edusync.com",
  password: "Admin@123456",
  role: Role.ADMIN,
};

const TEACHERS_DATA = [
  { name: "أحمد محمد السيد", email: "ahmed.teacher@edusync.com", password: "Teacher@123" },
  { name: "سارة عبدالله النجار", email: "sara.teacher@edusync.com", password: "Teacher@123" },
  { name: "محمد خالد العمري", email: "mohammed.teacher@edusync.com", password: "Teacher@123" },
];

const GROUPS_DATA = [
  {
    name: "مجموعة الرياضيات — أولى ثانوي",
    description: "مجموعة مخصصة لمادة الرياضيات للصف الأول الثانوي، تشمل الجبر والهندسة.",
  },
  {
    name: "مجموعة الفيزياء — ثاني ثانوي",
    description: "مجموعة فيزياء للصف الثاني الثانوي، تركز على الميكانيكا والكهرباء.",
  },
  {
    name: "مجموعة اللغة العربية — ثالث إعدادي",
    description: "تحسين مهارات اللغة العربية للصف الثالث الإعدادي.",
  },
  {
    name: "مجموعة الكيمياء — ثالث ثانوي",
    description: "مجموعة كيمياء تحضيرية لامتحانات الثانوية العامة.",
  },
];

const STUDENTS_DATA = [
  { name: "يوسف إبراهيم الحسن", email: "youssef@student.com", grade: Grade.GRADE_10, phone: "01012345601" },
  { name: "نور الدين محمود", email: "nour@student.com", grade: Grade.GRADE_10, phone: "01012345602" },
  { name: "ريم أحمد الشافعي", email: "reem@student.com", grade: Grade.GRADE_10, phone: "01012345603" },
  { name: "عمر سامي الدين", email: "omar@student.com", grade: Grade.GRADE_10, phone: "01012345604" },
  { name: "لمياء حسن البكري", email: "lamia@student.com", grade: Grade.GRADE_10, phone: "01012345605" },
  { name: "كريم عبدالرحمن", email: "kareem@student.com", grade: Grade.GRADE_11, phone: "01012345606" },
  { name: "دينا طارق الشرقاوي", email: "dina@student.com", grade: Grade.GRADE_11, phone: "01012345607" },
  { name: "خالد سعيد المنصوري", email: "khaled@student.com", grade: Grade.GRADE_11, phone: "01012345608" },
  { name: "منى عصام الجمال", email: "mona@student.com", grade: Grade.GRADE_11, phone: "01012345609" },
  { name: "أسامة فتحي المصري", email: "osama@student.com", grade: Grade.GRADE_11, phone: "01012345610" },
  { name: "رنا محمود الطيب", email: "rana@student.com", grade: Grade.GRADE_9, phone: "01012345611" },
  { name: "بسام نادر الأمين", email: "bassam@student.com", grade: Grade.GRADE_9, phone: "01012345612" },
  { name: "شيرين وليد الجابري", email: "shirin@student.com", grade: Grade.GRADE_9, phone: "01012345613" },
  { name: "ياسر عادل النجار", email: "yasser@student.com", grade: Grade.GRADE_9, phone: "01012345614" },
  { name: "أميرة هاني الزهراني", email: "amira@student.com", grade: Grade.GRADE_9, phone: "01012345615" },
  { name: "وليد سمير القحطاني", email: "walid@student.com", grade: Grade.GRADE_12, phone: "01012345616" },
  { name: "نادية فؤاد الراشد", email: "nadia@student.com", grade: Grade.GRADE_12, phone: "01012345617" },
  { name: "مصطفى علاء الدين", email: "mustafa@student.com", grade: Grade.GRADE_12, phone: "01012345618" },
  { name: "هبة رامي الشمري", email: "heba@student.com", grade: Grade.GRADE_12, phone: "01012345619" },
  { name: "زياد حازم المطيري", email: "ziyad@student.com", grade: Grade.GRADE_12, phone: "01012345620" },
];

const POSTS_CONTENT = [
  "مرحباً بكم يا طلاب، اليوم سنبدأ بمراجعة الفصل الثالث من المنهج. تأكدوا من مراجعة الأمثلة المحلولة.",
  "تذكيرٌ مهم: موعد الاختبار القادم يوم الخميس القادم. ادرسوا بشكل جيد وتواصلوا معي إن كان لديكم أسئلة.",
  "رفعت ملخص الدرس السابق، راجعوه وأبلغوني عن أي نقطة غامضة.",
  "أحسنتم في الواجب المنزلي الأسبوع الماضي! سنكمل الشرح في الجلسة القادمة.",
  "نصيحة الأسبوع: الاستمرارية في المراجعة اليومية أفضل بكثير من الحفظ المكثف قبل الامتحان.",
];

const COMMENTS_CONTENT = [
  "شكراً أستاذنا على الشرح الواضح!",
  "هل يمكنني الحضور في موعد آخر لهذا الأسبوع؟",
  "استفدت كثيراً من الملخص، جزاكم الله خيراً.",
  "لدي سؤال عن المسألة رقم 7 في الواجب.",
  "رائع! ننتظر المزيد من الشرح.",
];

const REPLY_CONTENT = [
  "بالطبع يمكنك ذلك، تواصل معي على الرسائل.",
  "المسألة 7 تحتاج تطبيق قانون X أولاً.",
  "على الرحب والسعة، أي سؤال آخر؟",
];

// ─────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // ── Wipe existing data ─────────────────
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    GroupTeacher.deleteMany({}),
    GroupMembership.deleteMany({}),
    JoinRequest.deleteMany({}),
    Attendance.deleteMany({}),
    StudentScore.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    PostLike.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── Create Admin ───────────────────────
  const admin = await User.create({
    name: ADMIN_DATA.name,
    email: ADMIN_DATA.email,
    passwordHash: await hashPassword(ADMIN_DATA.password),
    role: Role.ADMIN,
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // ── Create Teachers ────────────────────
  const teachers = await Promise.all(
    TEACHERS_DATA.map(async (t) =>
      User.create({
        name: t.name,
        email: t.email,
        passwordHash: await hashPassword(t.password),
        role: Role.TEACHER,
        phone: `0100000000${TEACHERS_DATA.indexOf(t) + 1}`,
      })
    )
  );
  console.log(`👨‍🏫 ${teachers.length} teachers created`);

  // ── Create Groups ──────────────────────
  const groups = await Promise.all(
    GROUPS_DATA.map((g, i) =>
      Group.create({
        name: g.name,
        description: g.description,
        createdBy: teachers[i % teachers.length]._id,
      })
    )
  );
  console.log(`📚 ${groups.length} groups created`);

  // ── Assign Teachers to Groups ──────────
  // Group 0 → teacher 0
  // Group 1 → teacher 1
  // Group 2 → teacher 2
  // Group 3 → teacher 0 + teacher 1 (multi-teacher group)
  await Promise.all([
    GroupTeacher.create({ group: groups[0]._id, teacher: teachers[0]._id }),
    GroupTeacher.create({ group: groups[1]._id, teacher: teachers[1]._id }),
    GroupTeacher.create({ group: groups[2]._id, teacher: teachers[2]._id }),
    GroupTeacher.create({ group: groups[3]._id, teacher: teachers[0]._id }),
    GroupTeacher.create({ group: groups[3]._id, teacher: teachers[1]._id }),
  ]);
  console.log("🔗 Teachers assigned to groups");

  // ── Create Students ────────────────────
  const students = await Promise.all(
    STUDENTS_DATA.map(async (s) =>
      User.create({
        name: s.name,
        email: s.email,
        passwordHash: await hashPassword("Student@123"),
        role: Role.STUDENT,
        phone: s.phone,
        grade: s.grade,
      })
    )
  );
  console.log(`🎓 ${students.length} students created`);

  // ── Assign students to groups (5 per group) ─
  // Groups 0–3 each get 5 students
  const studentGroupAssignments = [
    { groupIdx: 0, studentIdxs: [0, 1, 2, 3, 4] },
    { groupIdx: 1, studentIdxs: [5, 6, 7, 8, 9] },
    { groupIdx: 2, studentIdxs: [10, 11, 12, 13, 14] },
    { groupIdx: 3, studentIdxs: [15, 16, 17, 18, 19] },
  ];

  for (const { groupIdx, studentIdxs } of studentGroupAssignments) {
    await Promise.all(
      studentIdxs.map((si) =>
        GroupMembership.create({
          student: students[si]._id,
          group: groups[groupIdx]._id,
        })
      )
    );
    // Create approved join requests for each
    await Promise.all(
      studentIdxs.map((si) =>
        JoinRequest.create({
          student: students[si]._id,
          group: groups[groupIdx]._id,
          status: JoinRequestStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: teachers[groupIdx % teachers.length]._id,
        })
      )
    );
  }

  // One PENDING join request from student[0] to group[1]
  // (simulate a student who registered but hasn't been approved yet)
  // We use a separate "pending student" by updating student[4]'s request status
  // Actually let's just create a separate pending request manually
  await JoinRequest.create({
    student: students[4]._id,
    group: groups[1]._id,
    status: JoinRequestStatus.PENDING,
  }).catch(() => {
    /* ignore duplicate if already exists */
  });

  console.log("👥 Students assigned to groups");

  // ── Attendance for last 10 days ────────
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
    const date = daysAgo(dayOffset);

    for (const { groupIdx, studentIdxs } of studentGroupAssignments) {
      const records = studentIdxs.map((si, i) => ({
        student: students[si]._id,
        // Alternate presence: students 0,1,2 mostly present, 3,4 sometimes absent
        status:
          i < 3
            ? AttendanceStatus.PRESENT
            : dayOffset % 3 === 0
            ? AttendanceStatus.ABSENT
            : AttendanceStatus.PRESENT,
      }));

      await Attendance.create({
        group: groups[groupIdx]._id,
        date,
        records,
        createdBy: teachers[groupIdx % teachers.length]._id,
      });

      // Update monthly scores
      for (const rec of records) {
        const score = rec.status === AttendanceStatus.PRESENT ? ATTENDANCE_SCORE.PRESENT : 0;
        await StudentScore.findOneAndUpdate(
          { student: rec.student, group: groups[groupIdx]._id, month, year },
          {
            $inc: {
              score: score,
              presentCount: rec.status === AttendanceStatus.PRESENT ? 1 : 0,
              absentCount: rec.status === AttendanceStatus.ABSENT ? 1 : 0,
            },
          },
          { upsert: true }
        );
      }
    }
  }
  console.log("📅 Attendance records created (last 10 days)");

  // ── Posts ──────────────────────────────
  const posts: (typeof Post.prototype)[] = [];
  for (let gi = 0; gi < groups.length; gi++) {
    const teacher = teachers[gi % teachers.length];
    for (let pi = 0; pi < 2; pi++) {
      const post = await Post.create({
        group: groups[gi]._id,
        author: teacher._id,
        content: POSTS_CONTENT[(gi * 2 + pi) % POSTS_CONTENT.length],
      });
      posts.push(post);
    }
  }
  console.log(`📝 ${posts.length} posts created`);

  // ── Comments & Replies ─────────────────
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const groupStudents =
      studentGroupAssignments[i % studentGroupAssignments.length].studentIdxs;

    // 2–3 top-level comments per post
    const commentCount = randomInt(2, 3);
    for (let c = 0; c < commentCount; c++) {
      const studentIdx = groupStudents[c % groupStudents.length];
      const comment = await Comment.create({
        post: post._id,
        author: students[studentIdx]._id,
        content: COMMENTS_CONTENT[c % COMMENTS_CONTENT.length],
        parentComment: null,
      });
      await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });

      // Teacher replies to first comment
      if (c === 0) {
        const teacher = teachers[i % teachers.length];
        const reply = await Comment.create({
          post: post._id,
          author: teacher._id,
          content: REPLY_CONTENT[i % REPLY_CONTENT.length],
          parentComment: comment._id,
        });
        await Comment.findByIdAndUpdate(comment._id, { $inc: { repliesCount: 1 } });
        await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
      }
    }
  }
  console.log("💬 Comments and replies created");

  // ── Likes ──────────────────────────────
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const groupStudents =
      studentGroupAssignments[i % studentGroupAssignments.length].studentIdxs;
    const likeCount = randomInt(2, 4);
    let actualLikes = 0;
    for (let l = 0; l < likeCount; l++) {
      const studentIdx = groupStudents[l % groupStudents.length];
      try {
        await PostLike.create({ post: post._id, user: students[studentIdx]._id });
        actualLikes++;
      } catch {
        /* ignore duplicates */
      }
    }
    await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: actualLikes } });
  }
  console.log("❤️  Likes created");

  // ── Notifications ──────────────────────
  // Welcome notifications for all students
  await Notification.insertMany(
    students.slice(0, 10).map((s) => ({
      user: s._id,
      type: NotificationType.JOIN_REQUEST_APPROVED,
      title: "مرحباً بك في EduSync",
      message: "تمت الموافقة على طلب انضمامك للمجموعة",
      isRead: false,
    }))
  );

  // New post notifications for students in group 0
  const firstPost = posts[0];
  await Notification.insertMany(
    studentGroupAssignments[0].studentIdxs.map((si) => ({
      user: students[si]._id,
      type: NotificationType.NEW_POST,
      title: "منشور جديد",
      message: "نشر مدرسك منشوراً جديداً في مجموعتك",
      metadata: { postId: firstPost._id },
      isRead: false,
    }))
  );
  console.log("🔔 Notifications created");

  // ── Summary ────────────────────────────
  console.log("\n✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("🔐 Credentials:");
  console.log(`   Admin     → ${ADMIN_DATA.email}  / ${ADMIN_DATA.password}`);
  console.log(`   Teacher 1 → ${TEACHERS_DATA[0].email}  / ${TEACHERS_DATA[0].password}`);
  console.log(`   Teacher 2 → ${TEACHERS_DATA[1].email}  / ${TEACHERS_DATA[1].password}`);
  console.log(`   Teacher 3 → ${TEACHERS_DATA[2].email}  / ${TEACHERS_DATA[2].password}`);
  console.log(`   Student 1 → ${STUDENTS_DATA[0].email}  / Student@123`);
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
