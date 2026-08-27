import mongoose from "mongoose";
import { Post } from "../../models/Post";
import { Comment } from "../../models/Comment";
import { PostLike } from "../../models/PostLike";
import { GroupMembership } from "../../models/GroupMembership";
import { GroupTeacher } from "../../models/GroupTeacher";
import { Notification } from "../../models/Notification";
import { ApiError } from "../../utils/ApiError";
import { Role, NotificationType } from "../../types";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { getFileUrl } from "../../middleware/upload";
import { Request } from "express";
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
} from "./post.schemas";

// ─────────────────────────────────────────
// Guard — user can access group content
// ─────────────────────────────────────────

async function assertGroupAccess(userId: string, role: Role, groupId: string) {
  if (role === Role.ADMIN) return;
  if (role === Role.TEACHER) {
    const link = await GroupTeacher.findOne({ group: groupId, teacher: userId });
    if (!link) throw ApiError.forbidden("لا تملك صلاحية الوصول لهذه المجموعة");
    return;
  }
  // Student
  const membership = await GroupMembership.findOne({
    student: userId,
    group: groupId,
    isActive: true,
  });
  if (!membership) throw ApiError.forbidden("يجب أن تكون عضواً في المجموعة للوصول إلى محتواها");
}

// ─────────────────────────────────────────
// Posts
// ─────────────────────────────────────────

export async function getPosts(groupId: string, userId: string, role: Role, req: Request): Promise<{ data: Record<string, unknown>[]; pagination: import("../../types").PaginationMeta }> {
  if (!mongoose.Types.ObjectId.isValid(groupId)) throw ApiError.badRequest("معرّف غير صالح");
  await assertGroupAccess(userId, role, groupId);

  const { page, limit, skip } = parsePagination(req);
  const [posts, total] = await Promise.all([
    Post.find({ group: groupId })
      .populate("author", "name avatarUrl role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ group: groupId }),
  ]);

  // Attach whether current user liked each post
  const postIds = posts.map((p) => p._id);
  const userLikes = await PostLike.find({ post: { $in: postIds }, user: userId }).select("post");
  const likedSet = new Set(userLikes.map((l) => String(l.post)));

  const data = posts.map((p) => ({
    ...p.toJSON(),
    isLikedByMe: likedSet.has(String(p._id)),
  }));

  return { data, pagination: buildPaginationMeta(total, page, limit) };
}

export async function createPost(
  groupId: string,
  authorId: string,
  role: Role,
  dto: CreatePostDto,
  imageFilename?: string
) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) throw ApiError.badRequest("معرّف غير صالح");
  if (role !== Role.TEACHER && role !== Role.ADMIN)
    throw ApiError.forbidden("فقط المدرسون يمكنهم إنشاء منشورات");

  await assertGroupAccess(authorId, role, groupId);

  const post = await Post.create({
    group: groupId,
    author: authorId,
    content: dto.content,
    imageUrl: imageFilename ? getFileUrl(imageFilename) : undefined,
  });

  // Notify all group members
  const memberships = await GroupMembership.find({
    group: groupId,
    isActive: true,
  }).select("student");

  const notifications = memberships.map((m) => ({
    user: m.student,
    type: NotificationType.NEW_POST,
    title: "منشور جديد في مجموعتك",
    message: `نشر المدرس منشوراً جديداً في المجموعة`,
    metadata: { postId: post._id, groupId },
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return post;
}

export async function updatePost(
  postId: string,
  userId: string,
  role: Role,
  dto: UpdatePostDto,
  imageFilename?: string
) {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw ApiError.badRequest("معرّف غير صالح");
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound("المنشور غير موجود");

  if (role !== Role.ADMIN && String(post.author) !== userId)
    throw ApiError.forbidden("لا تملك صلاحية تعديل هذا المنشور");

  if (dto.content) post.content = dto.content;
  if (imageFilename) post.imageUrl = getFileUrl(imageFilename);
  await post.save();
  return post;
}

export async function deletePost(postId: string, userId: string, role: Role) {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw ApiError.badRequest("معرّف غير صالح");
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound("المنشور غير موجود");

  if (role !== Role.ADMIN && String(post.author) !== userId)
    throw ApiError.forbidden("لا تملك صلاحية حذف هذا المنشور");

  await Promise.all([
    post.deleteOne(),
    Comment.deleteMany({ post: postId }),
    PostLike.deleteMany({ post: postId }),
  ]);
}

// ─────────────────────────────────────────
// Likes
// ─────────────────────────────────────────

export async function toggleLike(postId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw ApiError.badRequest("معرّف غير صالح");
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound("المنشور غير موجود");

  const existing = await PostLike.findOne({ post: postId, user: userId });
  if (existing) {
    await existing.deleteOne();
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
    return { liked: false, likesCount: post.likesCount - 1 };
  }

  await PostLike.create({ post: postId, user: userId });
  await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
  return { liked: true, likesCount: post.likesCount + 1 };
}

// ─────────────────────────────────────────
// Comments
// ─────────────────────────────────────────

export async function getComments(postId: string, req: Request) {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw ApiError.badRequest("معرّف غير صالح");
  const { page, limit, skip } = parsePagination(req);

  // Top-level comments only
  const [comments, total] = await Promise.all([
    Comment.find({ post: postId, parentComment: null })
      .populate("author", "name avatarUrl role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ post: postId, parentComment: null }),
  ]);

  return { data: comments, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getReplies(commentId: string, req: Request) {
  if (!mongoose.Types.ObjectId.isValid(commentId)) throw ApiError.badRequest("معرّف غير صالح");
  const { page, limit, skip } = parsePagination(req);
  const [replies, total] = await Promise.all([
    Comment.find({ parentComment: commentId })
      .populate("author", "name avatarUrl role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ parentComment: commentId }),
  ]);
  return { data: replies, pagination: buildPaginationMeta(total, page, limit) };
}

export async function createComment(
  postId: string,
  authorId: string,
  dto: CreateCommentDto
) {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw ApiError.badRequest("معرّف غير صالح");
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound("المنشور غير موجود");

  let parentComment = null;
  if (dto.parentCommentId) {
    if (!mongoose.Types.ObjectId.isValid(dto.parentCommentId))
      throw ApiError.badRequest("معرّف التعليق الأصلي غير صالح");
    parentComment = await Comment.findById(dto.parentCommentId);
    if (!parentComment) throw ApiError.notFound("التعليق الأصلي غير موجود");
  }

  const comment = await Comment.create({
    post: postId,
    author: authorId,
    content: dto.content,
    parentComment: dto.parentCommentId ?? null,
  });

  // Update counters
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  if (parentComment) {
    await Comment.findByIdAndUpdate(dto.parentCommentId, { $inc: { repliesCount: 1 } });
  }

  // Notifications
  const notificationType = parentComment
    ? NotificationType.NEW_REPLY
    : NotificationType.NEW_COMMENT;

  const notifyUserId = parentComment
    ? String(parentComment.author)  // notify parent comment author on reply
    : String(post.author);           // notify post author on comment

  if (notifyUserId !== authorId) {
    await Notification.create({
      user: notifyUserId,
      type: notificationType,
      title: parentComment ? "رد جديد على تعليقك" : "تعليق جديد على منشورك",
      message: parentComment
        ? "رد شخص ما على تعليقك"
        : "علّق شخص ما على منشورك",
      metadata: { postId, commentId: comment._id },
    });
  }

  return comment.populate("author", "name avatarUrl role");
}

export async function updateComment(
  commentId: string,
  userId: string,
  role: Role,
  dto: UpdateCommentDto
) {
  if (!mongoose.Types.ObjectId.isValid(commentId)) throw ApiError.badRequest("معرّف غير صالح");
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound("التعليق غير موجود");
  if (role !== Role.ADMIN && String(comment.author) !== userId)
    throw ApiError.forbidden("لا تملك صلاحية تعديل هذا التعليق");
  comment.content = dto.content;
  await comment.save();
  return comment;
}

export async function deleteComment(commentId: string, userId: string, role: Role) {
  if (!mongoose.Types.ObjectId.isValid(commentId)) throw ApiError.badRequest("معرّف غير صالح");
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound("التعليق غير موجود");
  if (role !== Role.ADMIN && String(comment.author) !== userId)
    throw ApiError.forbidden("لا تملك صلاحية حذف هذا التعليق");

  // Decrement post counter
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
  }

  // Delete all replies to this comment too
  await Comment.deleteMany({ parentComment: commentId });
  await comment.deleteOne();
}
