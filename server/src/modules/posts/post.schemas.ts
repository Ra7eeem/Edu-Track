import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string({ required_error: "محتوى المنشور مطلوب" })
    .min(1, "محتوى المنشور مطلوب")
    .max(5000),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: "محتوى التعليق مطلوب" })
    .min(1)
    .max(2000),
  parentCommentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
