import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  description: z.string().max(1000).trim().optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  description: z.string().max(1000).trim().optional(),
});

export type CreateGroupDto = z.infer<typeof createGroupSchema>;
export type UpdateGroupDto = z.infer<typeof updateGroupSchema>;
