// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "teacher" | "student";
export type AttendanceStatus = "present" | "absent" | "late";
export type AccountStatus = "active" | "inactive" | "suspended";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subject: string;
  groupIds: string[];
  studentCount: number;
  status: AccountStatus;
  lastActive: string;
  phone?: string;
  joinedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  groupId: string;
  score: number;
  attendanceCount: number;
  absenceCount: number;
  rank: number;
  phone?: string;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  cover: string;
  teacherIds: string[];
  studentCount: number;
  subject: string;
  schedule: string;
  createdAt: string;
  lastActivity: string;
  attendanceRate: number;
  postCount: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Post {
  id: string;
  groupId: string;
  teacherId: string;
  content: string;
  image?: string;
  likes: number;
  commentCount: number;
  createdAt: string;
  pinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "post" | "comment" | "attendance" | "ranking" | "announcement";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export const mockTeachers: Teacher[] = [
  {
    id: "t1",
    name: "أ. محمد السيد",
    email: "m.elsayed@edutrack.app",
    avatar: "م",
    subject: "رياضيات",
    groupIds: ["g1", "g2"],
    studentCount: 62,
    status: "active",
    lastActive: "منذ ساعة",
    phone: "01012345678",
    joinedAt: "١ يناير ٢٠٢٦",
  },
  {
    id: "t2",
    name: "أ. فاطمة النور",
    email: "f.alnour@edutrack.app",
    avatar: "ف",
    subject: "لغة عربية",
    groupIds: ["g3"],
    studentCount: 35,
    status: "active",
    lastActive: "منذ ٣ ساعات",
    phone: "01098765432",
    joinedAt: "١٥ يناير ٢٠٢٦",
  },
  {
    id: "t3",
    name: "أ. خالد العمر",
    email: "k.alomar@edutrack.app",
    avatar: "خ",
    subject: "علوم",
    groupIds: ["g4"],
    studentCount: 28,
    status: "active",
    lastActive: "منذ يوم",
    joinedAt: "٢٠ فبراير ٢٠٢٦",
  },
  {
    id: "t4",
    name: "أ. نورا حامد",
    email: "n.hamed@edutrack.app",
    avatar: "ن",
    subject: "فيزياء",
    groupIds: ["g5"],
    studentCount: 41,
    status: "inactive",
    lastActive: "منذ أسبوع",
    joinedAt: "١ مارس ٢٠٢٦",
  },
];

// ─── Groups ───────────────────────────────────────────────────────────────────

export const mockGroups: Group[] = [
  {
    id: "g1",
    name: "رياضيات — الصف الثالث أ",
    description: "مجموعة رياضيات للصف الثالث الإعدادي — الفصل الدراسي الثاني",
    cover: "violet",
    teacherIds: ["t1"],
    studentCount: 32,
    subject: "رياضيات",
    schedule: "السبت والثلاثاء — ٥ م",
    createdAt: "١ فبراير ٢٠٢٦",
    lastActivity: "منذ ٣٠ دقيقة",
    attendanceRate: 88,
    postCount: 24,
  },
  {
    id: "g2",
    name: "رياضيات — الصف الثالث ب",
    description: "مجموعة رياضيات للصف الثالث الإعدادي — الفصل الدراسي الثاني",
    cover: "cyan",
    teacherIds: ["t1"],
    studentCount: 30,
    subject: "رياضيات",
    schedule: "الأحد والأربعاء — ٦ م",
    createdAt: "١ فبراير ٢٠٢٦",
    lastActivity: "منذ ساعتين",
    attendanceRate: 82,
    postCount: 18,
  },
  {
    id: "g3",
    name: "لغة عربية — الصف الثاني",
    description: "مجموعة اللغة العربية للصف الثاني الإعدادي",
    cover: "amber",
    teacherIds: ["t2"],
    studentCount: 35,
    subject: "لغة عربية",
    schedule: "الإثنين والخميس — ٤ م",
    createdAt: "١٥ فبراير ٢٠٢٦",
    lastActivity: "منذ ساعة",
    attendanceRate: 91,
    postCount: 31,
  },
  {
    id: "g4",
    name: "علوم — الصف الأول",
    description: "مجموعة العلوم للصف الأول الإعدادي",
    cover: "emerald",
    teacherIds: ["t3"],
    studentCount: 28,
    subject: "علوم",
    schedule: "الثلاثاء والجمعة — ٣ م",
    createdAt: "١ مارس ٢٠٢٦",
    lastActivity: "منذ يوم",
    attendanceRate: 79,
    postCount: 12,
  },
  {
    id: "g5",
    name: "فيزياء — الصف الثالث",
    description: "مجموعة الفيزياء للصف الثالث الثانوي",
    cover: "rose",
    teacherIds: ["t4"],
    studentCount: 41,
    subject: "فيزياء",
    schedule: "السبت والأربعاء — ٧ م",
    createdAt: "٥ مارس ٢٠٢٦",
    lastActivity: "منذ ٣ أيام",
    attendanceRate: 85,
    postCount: 9,
  },
];

// ─── Students ─────────────────────────────────────────────────────────────────

export const mockStudents: Student[] = [
  { id: "s1",  name: "أحمد محمد علي",    email: "a.ali@student.app",     avatar: "أ", groupId: "g1", score: 20, attendanceCount: 20, absenceCount: 2,  rank: 1,  joinedAt: "١ فبراير ٢٠٢٦" },
  { id: "s2",  name: "محمد إبراهيم",     email: "m.ibrahim@student.app", avatar: "م", groupId: "g1", score: 19, attendanceCount: 19, absenceCount: 3,  rank: 2,  joinedAt: "١ فبراير ٢٠٢٦" },
  { id: "s3",  name: "علي حسن محمود",    email: "a.hassan@student.app",  avatar: "ع", groupId: "g1", score: 18, attendanceCount: 18, absenceCount: 4,  rank: 3,  joinedAt: "١ فبراير ٢٠٢٦" },
  { id: "s4",  name: "سارة أحمد",        email: "s.ahmed@student.app",   avatar: "س", groupId: "g1", score: 17, attendanceCount: 17, absenceCount: 5,  rank: 4,  joinedAt: "٢ فبراير ٢٠٢٦" },
  { id: "s5",  name: "نورا عبدالله",     email: "n.abdalla@student.app", avatar: "ن", groupId: "g1", score: 16, attendanceCount: 16, absenceCount: 6,  rank: 5,  joinedAt: "٢ فبراير ٢٠٢٦" },
  { id: "s6",  name: "عمر خالد",         email: "o.khaled@student.app",  avatar: "ع", groupId: "g1", score: 15, attendanceCount: 15, absenceCount: 7,  rank: 6,  joinedAt: "٣ فبراير ٢٠٢٦" },
  { id: "s7",  name: "يوسف أحمد",        email: "y.ahmed@student.app",   avatar: "ي", groupId: "g1", score: 14, attendanceCount: 14, absenceCount: 8,  rank: 7,  joinedAt: "٣ فبراير ٢٠٢٦" },
  { id: "s8",  name: "مريم حسن",         email: "m.hassan@student.app",  avatar: "م", groupId: "g1", score: 13, attendanceCount: 13, absenceCount: 9,  rank: 8,  joinedAt: "٤ فبراير ٢٠٢٦" },
  { id: "s9",  name: "إبراهيم سالم",     email: "i.salem@student.app",   avatar: "إ", groupId: "g1", score: 12, attendanceCount: 12, absenceCount: 10, rank: 9,  joinedAt: "٤ فبراير ٢٠٢٦" },
  { id: "s10", name: "هناء محمود",       email: "h.mahmoud@student.app", avatar: "ه", groupId: "g1", score: 11, attendanceCount: 11, absenceCount: 11, rank: 10, joinedAt: "٥ فبراير ٢٠٢٦" },
  { id: "s11", name: "كريم عاطف",        email: "k.atef@student.app",    avatar: "ك", groupId: "g1", score: 10, attendanceCount: 10, absenceCount: 12, rank: 11, joinedAt: "٥ فبراير ٢٠٢٦" },
  { id: "s12", name: "دينا فاروق",       email: "d.farouk@student.app",  avatar: "د", groupId: "g1", score: 9,  attendanceCount: 9,  absenceCount: 13, rank: 12, joinedAt: "٦ فبراير ٢٠٢٦" },
];

// ─── Attendance ───────────────────────────────────────────────────────────────

export const mockAttendance: AttendanceRecord[] = [
  // Aug 25
  { id: "a1",  studentId: "s1",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a2",  studentId: "s2",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a3",  studentId: "s3",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "absent"  },
  { id: "a4",  studentId: "s4",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a5",  studentId: "s5",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "late"    },
  { id: "a6",  studentId: "s6",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a7",  studentId: "s7",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "absent"  },
  { id: "a8",  studentId: "s8",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a9",  studentId: "s9",  groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a10", studentId: "s10", groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "absent"  },
  { id: "a11", studentId: "s11", groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
  { id: "a12", studentId: "s12", groupId: "g1", date: "٢٥ أغسطس ٢٠٢٦", status: "present" },
];

// ─── Posts ────────────────────────────────────────────────────────────────────

export const mockPosts: Post[] = [
  {
    id: "p1",
    groupId: "g1",
    teacherId: "t1",
    content: "🎉 تهانينا للطلاب المتفوقين في اختبار الجبر! النتائج كانت ممتازة هذا الشهر. استمروا في التفوق!\n\nموعد الحصة القادمة: السبت ٢٩ أغسطس الساعة ٥ م",
    likes: 24,
    commentCount: 8,
    createdAt: "منذ ٢ ساعة",
    pinned: true,
  },
  {
    id: "p2",
    groupId: "g1",
    teacherId: "t1",
    content: "📚 تذكير: يجب مراجعة الفصل الثالث من الكتاب (المعادلات التربيعية) قبل الحصة القادمة.\n\nمن يحتاج مساعدة يتواصل معي مباشرة.",
    likes: 18,
    commentCount: 12,
    createdAt: "منذ يوم",
  },
  {
    id: "p3",
    groupId: "g1",
    teacherId: "t1",
    content: "💡 نصيحة اليوم: حل ١٠ مسائل يومياً أفضل بكثير من حل ١٠٠ مسألة في يوم واحد قبل الامتحان. الاستمرارية هي سر النجاح! 🌟",
    likes: 31,
    commentCount: 5,
    createdAt: "منذ يومين",
  },
  {
    id: "p4",
    groupId: "g1",
    teacherId: "t1",
    content: "📝 نتائج اختبار المنتصف:\n• أعلى درجة: ٤٨ / ٥٠\n• متوسط الدرجات: ٣٩.٥\n• عدد الناجحين: ٢٨ / ٣٢\n\nبارك الله في جهودكم جميعاً 👏",
    likes: 42,
    commentCount: 19,
    createdAt: "منذ ٤ أيام",
  },
];

export const mockComments: Comment[] = [
  { id: "c1", postId: "p1", authorId: "s1", authorName: "أحمد محمد",  authorAvatar: "أ", content: "شكراً يا أستاذ! كان الاختبار صعب بس بالتوفيق 💪", createdAt: "منذ ساعة" },
  { id: "c2", postId: "p1", authorId: "s2", authorName: "محمد إبراهيم", authorAvatar: "م", content: "جزاك الله خيراً أستاذنا الكريم", createdAt: "منذ ساعة" },
  { id: "c3", postId: "p2", authorId: "s3", authorName: "علي حسن",    authorAvatar: "ع", content: "استاذ ممكن شرح إضافي على المعادلات التربيعية؟", createdAt: "منذ ٢٣ ساعة" },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: "n1", userId: "s1", type: "post",        title: "منشور جديد",         body: "نشر أ. محمد منشوراً جديداً في مجموعة رياضيات أ",      read: false, createdAt: "منذ ٢ ساعة" },
  { id: "n2", userId: "s1", type: "comment",     title: "تعليق جديد",         body: "علّق محمد إبراهيم على منشور الأستاذ",                 read: false, createdAt: "منذ ساعة"   },
  { id: "n3", userId: "s1", type: "attendance",  title: "تم تسجيل حضورك",    body: "تم تسجيل حضورك بنجاح في حصة السبت ٢٥ أغسطس",        read: true,  createdAt: "منذ يوم"    },
  { id: "n4", userId: "s1", type: "ranking",     title: "تحديث الترتيب",      body: "ترتيبك الآن #١ في مجموعة رياضيات أ 🎉",              read: true,  createdAt: "منذ يومين"  },
  { id: "n5", userId: "s1", type: "announcement",title: "إعلان من الأستاذ",  body: "موعد الاختبار القادم: الأحد ٣٠ أغسطس الساعة ٥ م",    read: true,  createdAt: "منذ ٣ أيام" },
  { id: "n6", userId: "t1", type: "comment",     title: "تعليق جديد",         body: "علّق أحمد محمد على منشورك في مجموعة رياضيات أ",      read: false, createdAt: "منذ ساعة"   },
  { id: "n7", userId: "t1", type: "attendance",  title: "تذكير تسجيل الحضور", body: "لم يتم تسجيل الحضور لمجموعة رياضيات ب اليوم",        read: false, createdAt: "منذ ٣ ساعات"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getGroupById = (id: string) => mockGroups.find(g => g.id === id);
export const getTeacherById = (id: string) => mockTeachers.find(t => t.id === id);
export const getStudentById = (id: string) => mockStudents.find(s => s.id === id);
export const getStudentsByGroup = (groupId: string) => mockStudents.filter(s => s.groupId === groupId);
export const getPostsByGroup = (groupId: string) => mockPosts.filter(p => p.groupId === groupId);
export const getAttendanceByGroup = (groupId: string) => mockAttendance.filter(a => a.groupId === groupId);
export const getNotificationsByUser = (userId: string) => mockNotifications.filter(n => n.userId === userId);

// Current logged-in mock users
export const currentTeacher = mockTeachers[0]; // أ. محمد السيد
export const currentStudent = mockStudents[0]; // أحمد محمد علي
export const currentStudentGroup = mockGroups[0]; // g1
