import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "EduSync API",
      version: "1.0.0",
      description:
        "REST API for the EduSync educational platform — manages groups, students, teachers, attendance, ranking, posts and notifications.",
      contact: { name: "EduSync Team" },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from POST /api/auth/login",
        },
      },
      schemas: {
        // ── Enums ──────────────────────────
        Role: {
          type: "string",
          enum: ["ADMIN", "TEACHER", "STUDENT"],
        },
        Grade: {
          type: "string",
          enum: ["GRADE_7", "GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"],
          description:
            "GRADE_7=أول إعدادي, GRADE_8=ثاني إعدادي, GRADE_9=ثالث إعدادي, GRADE_10=أول ثانوي, GRADE_11=ثاني ثانوي, GRADE_12=ثالث ثانوي",
        },
        AttendanceStatus: {
          type: "string",
          enum: ["PRESENT", "ABSENT"],
        },
        JoinRequestStatus: {
          type: "string",
          enum: ["PENDING", "APPROVED", "REJECTED"],
        },
        NotificationType: {
          type: "string",
          enum: [
            "JOIN_REQUEST_APPROVED",
            "JOIN_REQUEST_REJECTED",
            "NEW_POST",
            "NEW_COMMENT",
            "NEW_REPLY",
            "ADDED_TO_GROUP",
          ],
        },

        // ── Core Objects ───────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name: { type: "string", example: "أحمد محمد" },
            email: { type: "string", format: "email", example: "ahmed@example.com" },
            role: { $ref: "#/components/schemas/Role" },
            avatarUrl: { type: "string", nullable: true },
            phone: { type: "string", nullable: true, example: "01012345678" },
            grade: { $ref: "#/components/schemas/Grade", nullable: true },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Group: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "مجموعة الرياضيات" },
            description: { type: "string", nullable: true },
            imageUrl: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        JoinRequest: {
          type: "object",
          properties: {
            _id: { type: "string" },
            student: { $ref: "#/components/schemas/User" },
            group: { $ref: "#/components/schemas/Group" },
            status: { $ref: "#/components/schemas/JoinRequestStatus" },
            reviewedAt: { type: "string", format: "date-time", nullable: true },
            reviewedBy: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AttendanceRecord: {
          type: "object",
          properties: {
            student: { type: "string", description: "Student ObjectId" },
            status: { $ref: "#/components/schemas/AttendanceStatus" },
          },
        },
        AttendanceSession: {
          type: "object",
          properties: {
            _id: { type: "string" },
            group: { type: "string" },
            date: { type: "string", format: "date", example: "2026-08-28" },
            records: {
              type: "array",
              items: { $ref: "#/components/schemas/AttendanceRecord" },
            },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        MonthlyScore: {
          type: "object",
          properties: {
            _id: { type: "string" },
            student: { $ref: "#/components/schemas/User" },
            group: { $ref: "#/components/schemas/Group" },
            month: { type: "integer", minimum: 1, maximum: 12, example: 8 },
            year: { type: "integer", example: 2026 },
            score: { type: "integer", example: 18 },
            presentCount: { type: "integer", example: 18 },
            absentCount: { type: "integer", example: 2 },
          },
        },
        RankingEntry: {
          type: "object",
          properties: {
            rank: { type: "integer", example: 1 },
            student: { $ref: "#/components/schemas/User" },
            score: { type: "integer", example: 20 },
            presentCount: { type: "integer", example: 20 },
            absentCount: { type: "integer", example: 0 },
          },
        },
        Post: {
          type: "object",
          properties: {
            _id: { type: "string" },
            group: { type: "string" },
            author: { $ref: "#/components/schemas/User" },
            content: { type: "string" },
            imageUrl: { type: "string", nullable: true },
            likesCount: { type: "integer" },
            commentsCount: { type: "integer" },
            isLikedByMe: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            post: { type: "string" },
            author: { $ref: "#/components/schemas/User" },
            content: { type: "string" },
            parentComment: { type: "string", nullable: true },
            repliesCount: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            type: { $ref: "#/components/schemas/NotificationType" },
            title: { type: "string" },
            message: { type: "string" },
            isRead: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ── Request Bodies ─────────────────
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@edusync.com" },
            password: { type: "string", example: "Admin@123456" },
          },
        },
        RegisterStudentRequest: {
          type: "object",
          required: ["name", "email", "password", "phone", "grade", "groupId"],
          properties: {
            name: { type: "string", example: "يوسف إبراهيم" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            phone: { type: "string", example: "01012345678" },
            grade: { $ref: "#/components/schemas/Grade" },
            groupId: { type: "string", description: "ObjectId of target group" },
          },
        },
        CreateTeacherRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
        CreateGroupRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "مجموعة الفيزياء" },
            description: { type: "string" },
            image: { type: "string", format: "binary" },
          },
        },
        RecordAttendanceRequest: {
          type: "object",
          required: ["date", "records"],
          properties: {
            date: { type: "string", format: "date", example: "2026-08-28" },
            records: {
              type: "array",
              items: {
                type: "object",
                required: ["studentId", "status"],
                properties: {
                  studentId: { type: "string" },
                  status: { $ref: "#/components/schemas/AttendanceStatus" },
                },
              },
            },
          },
        },
        CreatePostRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", maxLength: 5000 },
            image: { type: "string", format: "binary" },
          },
        },
        CreateCommentRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", maxLength: 2000 },
            parentCommentId: {
              type: "string",
              nullable: true,
              description: "Omit for top-level comment, provide for reply",
            },
          },
        },

        // ── Responses ─────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 20 },
                total: { type: "integer", example: 100 },
                totalPages: { type: "integer", example: 5 },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "لا يمكنك تنفيذ هذا الإجراء" },
            code: { type: "string", example: "FORBIDDEN" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "غير مصرح — JWT مفقود أو منتهي الصلاحية",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "لم يتم تقديم رمز المصادقة", code: "UNAUTHORIZED" },
            },
          },
        },
        Forbidden: {
          description: "ممنوع — الدور لا يملك الصلاحية",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "لا يمكنك تنفيذ هذا الإجراء", code: "FORBIDDEN" },
            },
          },
        },
        NotFound: {
          description: "المورد غير موجود",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "المورد غير موجود", code: "NOT_FOUND" },
            },
          },
        },
        ValidationError: {
          description: "بيانات غير صالحة",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "بيانات غير صالحة", code: "VALIDATION_ERROR" },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "تسجيل الدخول وإنشاء الحسابات" },
      { name: "Admin — Teachers", description: "إدارة المدرسين (ADMIN فقط)" },
      { name: "Admin — Groups", description: "إدارة المجموعات (ADMIN فقط)" },
      { name: "Admin — Students", description: "عرض بيانات الطلاب (ADMIN فقط)" },
      { name: "Admin — Dashboard", description: "إحصائيات عامة (ADMIN فقط)" },
      { name: "Teacher", description: "عمليات المدرس" },
      { name: "Groups", description: "إدارة المجموعات" },
      { name: "Attendance", description: "تسجيل ومشاهدة الحضور" },
      { name: "Ranking", description: "الترتيب الشهري" },
      { name: "Posts", description: "المنشورات والتعليقات" },
      { name: "Notifications", description: "الإشعارات" },
      { name: "Students", description: "بيانات الطالب الشخصية" },
    ],
    paths: {
      // ── AUTH ──────────────────────────────
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "تسجيل الدخول",
          description: "يعمل لجميع الأدوار: ADMIN، TEACHER، STUDENT",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: {
              description: "تسجيل دخول ناجح",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              token: { type: "string" },
                              user: { $ref: "#/components/schemas/User" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
            400: { $ref: "#/components/responses/ValidationError" },
          },
        },
      },
      "/api/auth/register/student": {
        post: {
          tags: ["Auth"],
          summary: "تسجيل طالب جديد",
          description: "ينشئ حساب STUDENT ويُرسل طلب انضمام PENDING للمجموعة المختارة.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterStudentRequest" },
              },
            },
          },
          responses: {
            201: { description: "تم إنشاء الحساب وطلب الانضمام" },
            400: { $ref: "#/components/responses/ValidationError" },
            409: { description: "البريد الإلكتروني مستخدم مسبقاً" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "بيانات المستخدم الحالي",
          responses: {
            200: { description: "بيانات المستخدم" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },

      // ── ADMIN DASHBOARD ───────────────────
      "/api/admin/dashboard": {
        get: {
          tags: ["Admin — Dashboard"],
          summary: "إحصائيات عامة للنظام",
          description: "يُرجع: totalTeachers, totalStudents, totalGroups, todayPresent, todayAbsent, totalPosts, totalComments",
          responses: {
            200: { description: "الإحصائيات" },
            401: { $ref: "#/components/responses/Unauthorized" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },

      // ── ADMIN TEACHERS ────────────────────
      "/api/admin/teachers": {
        get: {
          tags: ["Admin — Teachers"],
          summary: "قائمة المدرسين",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "قائمة مصفحة من المدرسين" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
        post: {
          tags: ["Admin — Teachers"],
          summary: "إنشاء حساب مدرس جديد (ADMIN فقط)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTeacherRequest" },
              },
            },
          },
          responses: {
            201: { description: "تم إنشاء المدرس" },
            409: { description: "البريد الإلكتروني مستخدم مسبقاً" },
          },
        },
      },
      "/api/admin/teachers/{id}": {
        get: {
          tags: ["Admin — Teachers"],
          summary: "بيانات مدرس محدد",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "بيانات المدرس" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        patch: {
          tags: ["Admin — Teachers"],
          summary: "تعديل بيانات مدرس",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    isActive: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "تم التحديث" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
        delete: {
          tags: ["Admin — Teachers"],
          summary: "حذف مدرس",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "تم الحذف" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ── ADMIN GROUPS ──────────────────────
      "/api/admin/groups": {
        get: {
          tags: ["Admin — Groups"],
          summary: "قائمة جميع المجموعات",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "قائمة المجموعات" } },
        },
      },
      "/api/admin/groups/{id}": {
        get: {
          tags: ["Admin — Groups"],
          summary: "بيانات مجموعة محددة مع مدرسيها وعدد طلابها",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "بيانات المجموعة" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
        patch: {
          tags: ["Admin — Groups"],
          summary: "تعديل مجموعة",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "تم التحديث" } },
        },
        delete: {
          tags: ["Admin — Groups"],
          summary: "حذف مجموعة",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "تم الحذف" } },
        },
      },
      "/api/admin/groups/{groupId}/teachers": {
        post: {
          tags: ["Admin — Groups"],
          summary: "إضافة مدرس إلى مجموعة",
          parameters: [{ name: "groupId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { type: "object", properties: { teacherId: { type: "string" } } } },
            },
          },
          responses: { 201: { description: "تمت الإضافة" }, 409: { description: "المدرس مضاف بالفعل" } },
        },
      },
      "/api/admin/groups/{groupId}/teachers/{teacherId}": {
        delete: {
          tags: ["Admin — Groups"],
          summary: "إزالة مدرس من مجموعة",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "teacherId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "تمت الإزالة" } },
        },
      },

      // ── ADMIN STUDENTS ────────────────────
      "/api/admin/students": {
        get: {
          tags: ["Admin — Students"],
          summary: "قائمة الطلاب",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "grade", in: "query", schema: { $ref: "#/components/schemas/Grade" } },
          ],
          responses: { 200: { description: "قائمة الطلاب" } },
        },
      },
      "/api/admin/students/{id}": {
        get: {
          tags: ["Admin — Students"],
          summary: "بيانات طالب محدد مع مجموعاته",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "بيانات الطالب" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ── TEACHER ───────────────────────────
      "/api/teacher/profile": {
        get: { tags: ["Teacher"], summary: "الملف الشخصي للمدرس", responses: { 200: { description: "بيانات المدرس" } } },
        patch: {
          tags: ["Teacher"],
          summary: "تعديل الملف الشخصي",
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { name: { type: "string" }, phone: { type: "string" } } },
              },
            },
          },
          responses: { 200: { description: "تم التحديث" } },
        },
      },
      "/api/teacher/groups": {
        get: { tags: ["Teacher"], summary: "مجموعاتي", responses: { 200: { description: "المجموعات التي أديرها" } } },
      },
      "/api/teacher/join-requests": {
        get: {
          tags: ["Teacher"],
          summary: "طلبات الانضمام لمجموعاتي",
          parameters: [
            { name: "status", in: "query", schema: { $ref: "#/components/schemas/JoinRequestStatus" } },
            { name: "page", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "طلبات الانضمام" } },
        },
      },
      "/api/teacher/join-requests/{requestId}/approve": {
        post: {
          tags: ["Teacher"],
          summary: "الموافقة على طلب انضمام",
          description: "ينشئ GroupMembership ويُرسل إشعاراً للطالب. المدرس يستطيع الموافقة على طلبات مجموعاته فقط.",
          parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "تمت الموافقة" },
            403: { $ref: "#/components/responses/Forbidden" },
            404: { $ref: "#/components/responses/NotFound" },
            409: { description: "تم البت في الطلب مسبقاً" },
          },
        },
      },
      "/api/teacher/join-requests/{requestId}/reject": {
        post: {
          tags: ["Teacher"],
          summary: "رفض طلب انضمام",
          parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "تم الرفض" },
            403: { $ref: "#/components/responses/Forbidden" },
            409: { description: "تم البت في الطلب مسبقاً" },
          },
        },
      },
      "/api/teacher/students": {
        post: {
          tags: ["Teacher"],
          summary: "إضافة طالب مباشرة (بدون Join Request)",
          description: "إذا كان الطالب موجوداً يُضاف للمجموعة. إذا لم يكن موجوداً يُنشأ له حساب.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "phone", "grade", "groupId"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    phone: { type: "string" },
                    grade: { $ref: "#/components/schemas/Grade" },
                    groupId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "تمت الإضافة" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/teacher/groups/{groupId}/students": {
        get: {
          tags: ["Teacher"],
          summary: "طلاب مجموعة محددة",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "قائمة الطلاب" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/teacher/groups/{groupId}/students/{studentId}": {
        delete: {
          tags: ["Teacher"],
          summary: "إزالة طالب من مجموعة",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "studentId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "تمت الإزالة" } },
        },
      },

      // ── GROUPS ────────────────────────────
      "/api/groups": {
        get: {
          tags: ["Groups"],
          summary: "قائمة المجموعات النشطة",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "المجموعات" } },
        },
        post: {
          tags: ["Groups"],
          summary: "إنشاء مجموعة جديدة (TEACHER أو ADMIN)",
          requestBody: {
            content: {
              "multipart/form-data": { schema: { $ref: "#/components/schemas/CreateGroupRequest" } },
            },
          },
          responses: { 201: { description: "تم إنشاء المجموعة" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/groups/{id}": {
        get: {
          tags: ["Groups"],
          summary: "بيانات مجموعة مع مدرسيها وعدد أعضائها",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "المجموعة" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
        patch: {
          tags: ["Groups"],
          summary: "تعديل مجموعة (صاحبها أو ADMIN)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "تم التحديث" } },
        },
      },
      "/api/groups/{id}/members": {
        get: {
          tags: ["Groups"],
          summary: "أعضاء المجموعة",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "قائمة الأعضاء" } },
        },
      },
      "/api/groups/{id}/teachers": {
        get: {
          tags: ["Groups"],
          summary: "مدرسو المجموعة",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "قائمة المدرسين" } },
        },
      },

      // ── ATTENDANCE ────────────────────────
      "/api/groups/{groupId}/attendance": {
        get: {
          tags: ["Attendance"],
          summary: "سجل الحضور لمجموعة (TEACHER أو ADMIN)",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "month", in: "query", schema: { type: "integer" }, description: "رقم الشهر 1-12" },
            { name: "year", in: "query", schema: { type: "integer" } },
            { name: "studentId", in: "query", schema: { type: "string" }, description: "تصفية لطالب محدد" },
          ],
          responses: { 200: { description: "جلسات الحضور" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
        post: {
          tags: ["Attendance"],
          summary: "تسجيل الحضور (TEACHER فقط — idempotent)",
          description: "إرسال نفس البيانات مرة ثانية لنفس المجموعة والتاريخ يُحدّث السجل ولا يُضاعفه.",
          parameters: [{ name: "groupId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RecordAttendanceRequest" } },
            },
          },
          responses: {
            200: { description: "تم تسجيل الحضور وتحديث النقاط الشهرية" },
            400: { description: "طالب ليس عضواً في المجموعة" },
            403: { $ref: "#/components/responses/Forbidden" },
          },
        },
      },

      // ── RANKING ───────────────────────────
      "/api/groups/{groupId}/ranking": {
        get: {
          tags: ["Ranking"],
          summary: "ترتيب طلاب مجموعة لشهر محدد",
          description: "مرتب تنازلياً حسب النقاط الشهرية. يدعم التعادل في الترتيب.",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "month", in: "query", schema: { type: "integer" } },
            { name: "year", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            200: {
              description: "قائمة الترتيب",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      month: { type: "integer" },
                      year: { type: "integer" },
                      groupId: { type: "string" },
                      ranking: { type: "array", items: { $ref: "#/components/schemas/RankingEntry" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/groups/{groupId}/ranking/students/{studentId}": {
        get: {
          tags: ["Ranking"],
          summary: "ترتيب طالب محدد في مجموعة",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "studentId", in: "path", required: true, schema: { type: "string" } },
            { name: "month", in: "query", schema: { type: "integer" } },
            { name: "year", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "ترتيب الطالب" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },

      // ── POSTS ─────────────────────────────
      "/api/groups/{groupId}/posts": {
        get: {
          tags: ["Posts"],
          summary: "منشورات مجموعة",
          description: "يتضمن حقل isLikedByMe للمستخدم الحالي",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "المنشورات" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
        post: {
          tags: ["Posts"],
          summary: "إنشاء منشور (TEACHER أو ADMIN)",
          parameters: [{ name: "groupId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "multipart/form-data": { schema: { $ref: "#/components/schemas/CreatePostRequest" } },
            },
          },
          responses: { 201: { description: "تم النشر" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/groups/{groupId}/posts/{postId}": {
        patch: {
          tags: ["Posts"],
          summary: "تعديل منشور (صاحبه أو ADMIN)",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "تم التحديث" } },
        },
        delete: {
          tags: ["Posts"],
          summary: "حذف منشور (صاحبه أو ADMIN)",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "تم الحذف" } },
        },
      },
      "/api/groups/{groupId}/posts/{postId}/like": {
        post: {
          tags: ["Posts"],
          summary: "إضافة/إزالة إعجاب (toggle)",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "حالة الإعجاب",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { liked: { type: "boolean" }, likesCount: { type: "integer" } },
                  },
                },
              },
            },
          },
        },
      },
      "/api/groups/{groupId}/posts/{postId}/comments": {
        get: {
          tags: ["Posts"],
          summary: "تعليقات منشور (Top-level فقط)",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "التعليقات" } },
        },
        post: {
          tags: ["Posts"],
          summary: "إضافة تعليق أو رد",
          description: "إرسال parentCommentId للرد على تعليق، أو تركه فارغاً لتعليق جديد.",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/CreateCommentRequest" } },
            },
          },
          responses: { 201: { description: "تم التعليق" } },
        },
      },
      "/api/groups/{groupId}/posts/{postId}/comments/{commentId}/replies": {
        get: {
          tags: ["Posts"],
          summary: "ردود على تعليق محدد",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "postId", in: "path", required: true, schema: { type: "string" } },
            { name: "commentId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "الردود" } },
        },
      },

      // ── NOTIFICATIONS ─────────────────────
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "إشعاراتي",
          parameters: [
            { name: "unread", in: "query", schema: { type: "boolean" }, description: "true لعرض غير المقروءة فقط" },
            { name: "page", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            200: {
              description: "الإشعارات مع عدد غير المقروءة",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
                      pagination: { type: "object" },
                      unreadCount: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/notifications/{id}/read": {
        post: {
          tags: ["Notifications"],
          summary: "تحديد إشعار كمقروء",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "تم التحديث" }, 404: { $ref: "#/components/responses/NotFound" } },
        },
      },
      "/api/notifications/read-all": {
        post: {
          tags: ["Notifications"],
          summary: "تحديد جميع الإشعارات كمقروءة",
          responses: { 200: { description: "تم التحديث" } },
        },
      },

      // ── STUDENT ───────────────────────────
      "/api/students/me": {
        get: {
          tags: ["Students"],
          summary: "ملفي الشخصي",
          responses: { 200: { description: "بياناتي" } },
        },
        patch: {
          tags: ["Students"],
          summary: "تعديل الملف الشخصي (يدعم رفع الصورة)",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    grade: { $ref: "#/components/schemas/Grade" },
                    avatar: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "تم التحديث" } },
        },
      },
      "/api/students/me/groups": {
        get: {
          tags: ["Students"],
          summary: "مجموعاتي (المقبولة)",
          responses: { 200: { description: "المجموعات" } },
        },
      },
      "/api/students/me/join-requests": {
        get: {
          tags: ["Students"],
          summary: "طلبات الانضمام المُرسلة مني",
          responses: { 200: { description: "الطلبات" } },
        },
      },
      "/api/students/me/groups/{groupId}/attendance": {
        get: {
          tags: ["Students"],
          summary: "سجل حضوري في مجموعة",
          parameters: [
            { name: "groupId", in: "path", required: true, schema: { type: "string" } },
            { name: "month", in: "query", schema: { type: "integer" } },
            { name: "year", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "سجل الحضور" }, 403: { $ref: "#/components/responses/Forbidden" } },
        },
      },
      "/api/students/me/scores": {
        get: {
          tags: ["Students"],
          summary: "نقاطي الشهرية في جميع مجموعاتي",
          parameters: [
            { name: "month", in: "query", schema: { type: "integer" } },
            { name: "year", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "النقاط الشهرية" } },
        },
      },
    },
  },
  apis: [], // All docs defined inline above
};

export const swaggerSpec = swaggerJsdoc(options);
