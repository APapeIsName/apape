import { z } from "zod/v4";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(2000, "댓글은 2,000자 이내로 입력해주세요"),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(2000, "댓글은 2,000자 이내로 입력해주세요"),
});
