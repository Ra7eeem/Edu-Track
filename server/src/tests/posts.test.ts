/**
 * Tests: Posts, Comments, Likes
 *
 * Business rules covered:
 *  Only TEACHER / ADMIN can create posts
 *  STUDENT can view posts (if member), like, comment
 *  Non-members cannot access posts
 *  Post author / ADMIN can edit & delete
 *  Double-like prevention
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createTeacher,
  createStudent,
  createGroup,
  assignTeacherToGroup,
  enrollStudent,
} from "./helpers/db";
import * as PostService from "../modules/posts/post.service";
import { PostLike } from "../models/PostLike";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { Role } from "../types";

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearCollections);

describe("Post creation", () => {
  it("teacher can create a post in their group", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "محتوى المنشور التجريبي" }
    );

    expect(post.content).toBe("محتوى المنشور التجريبي");
    expect(String(post.author)).toBe(String(teacher._id));
  });

  it("student cannot create a post", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    await expect(
      PostService.createPost(
        String(group._id),
        String(student._id),
        Role.STUDENT,
        { content: "طالب يحاول النشر" }
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("Post access control", () => {
  it("student member can view posts", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    await enrollStudent(String(group._id), String(student._id));

    await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور للأعضاء" }
    );

    const mockReq = { query: { page: "1", limit: "20" } };
    const result = await PostService.getPosts(
      String(group._id),
      String(student._id),
      Role.STUDENT,
      mockReq as never
    );

    expect(result.data).toHaveLength(1);
  });

  it("non-member student cannot view posts", async () => {
    const teacher = await createTeacher();
    const student = await createStudent(); // not enrolled
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));

    const mockReq = { query: {} };
    await expect(
      PostService.getPosts(
        String(group._id),
        String(student._id),
        Role.STUDENT,
        mockReq as never
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("Post edit & delete permissions", () => {
  it("teacher can edit their own post", async () => {
    const teacher = await createTeacher();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "محتوى قديم" }
    );

    const updated = await PostService.updatePost(
      String(post._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "محتوى جديد" }
    );

    expect(updated.content).toBe("محتوى جديد");
  });

  it("another teacher cannot edit someone else's post", async () => {
    const teacher1 = await createTeacher("1");
    const teacher2 = await createTeacher("2");
    const group = await createGroup(String(teacher1._id));
    await assignTeacherToGroup(String(group._id), String(teacher1._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher1._id),
      Role.TEACHER,
      { content: "منشور المدرس الأول" }
    );

    await expect(
      PostService.updatePost(
        String(post._id),
        String(teacher2._id),
        Role.TEACHER,
        { content: "تعديل غير مصرح" }
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("admin can delete any post", async () => {
    const teacher = await createTeacher();
    const admin = await createTeacher("admin");
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور يُحذف من الأدمن" }
    );

    await PostService.deletePost(String(post._id), String(admin._id), Role.ADMIN);

    const found = await Post.findById(post._id);
    expect(found).toBeNull();
  });
});

describe("Likes", () => {
  it("student can like a post", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور قابل للإعجاب" }
    );

    const result = await PostService.toggleLike(String(post._id), String(student._id));
    expect(result.liked).toBe(true);
    expect(result.likesCount).toBe(1);
  });

  it("toggle removes like on second call", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور" }
    );

    await PostService.toggleLike(String(post._id), String(student._id));
    const result = await PostService.toggleLike(String(post._id), String(student._id));

    expect(result.liked).toBe(false);
    expect(result.likesCount).toBe(0);
  });

  it("database prevents duplicate likes via unique index", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور" }
    );

    await PostLike.create({ post: post._id, user: student._id });

    await expect(
      PostLike.create({ post: post._id, user: student._id })
    ).rejects.toMatchObject({ code: 11000 });
  });
});

describe("Comments", () => {
  it("creates a top-level comment and increments commentsCount", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور" }
    );

    await PostService.createComment(String(post._id), String(student._id), {
      content: "تعليق الطالب",
    });

    const updatedPost = await Post.findById(post._id);
    expect(updatedPost!.commentsCount).toBe(1);

    const comments = await Comment.find({ post: post._id, parentComment: null });
    expect(comments).toHaveLength(1);
  });

  it("creates a reply and increments parent repliesCount", async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const group = await createGroup(String(teacher._id));
    await assignTeacherToGroup(String(group._id), String(teacher._id));
    const post = await PostService.createPost(
      String(group._id),
      String(teacher._id),
      Role.TEACHER,
      { content: "منشور" }
    );

    const comment = await PostService.createComment(
      String(post._id),
      String(student._id),
      { content: "تعليق رئيسي" }
    );

    await PostService.createComment(
      String(post._id),
      String(teacher._id),
      { content: "رد المدرس", parentCommentId: String((comment as { _id: unknown })._id) }
    );

    const parentComment = await Comment.findById((comment as { _id: unknown })._id);
    expect(parentComment!.repliesCount).toBe(1);

    const updatedPost = await Post.findById(post._id);
    expect(updatedPost!.commentsCount).toBe(2);
  });
});
