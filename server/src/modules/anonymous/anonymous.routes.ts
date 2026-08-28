import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { sendMessageSchema, replyMessageSchema } from "./anonymous.schemas";
import * as AnonymousController from "./anonymous.controller";

export const anonymousRouter = Router();
anonymousRouter.use(authenticate);

// ── Student ───────────────────────────────────────────────────────────────────
// POST /api/anonymous           — send a new anonymous message
anonymousRouter.post(
  "/",
  authorize(Role.STUDENT),
  validate(sendMessageSchema),
  AnonymousController.sendMessage
);

// GET  /api/anonymous/me        — student views their own messages + replies
anonymousRouter.get(
  "/me",
  authorize(Role.STUDENT),
  AnonymousController.getMyMessages
);

// ── Teacher ───────────────────────────────────────────────────────────────────
// GET  /api/anonymous/inbox     — teacher views anonymous messages to them
anonymousRouter.get(
  "/inbox",
  authorize(Role.TEACHER),
  AnonymousController.getTeacherMessages
);

// POST /api/anonymous/:messageId/reply
anonymousRouter.post(
  "/:messageId/reply",
  authorize(Role.TEACHER),
  validate(replyMessageSchema),
  AnonymousController.replyToMessage
);

// ── Admin ─────────────────────────────────────────────────────────────────────
// GET  /api/anonymous/admin     — admin sees all messages with sender revealed
anonymousRouter.get(
  "/admin",
  authorize(Role.ADMIN),
  AnonymousController.getAllMessages
);
