import { z } from "zod/v4";

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(120, "제목은 120자 이내로 입력해주세요"),
  content: z
    .string()
    .min(1, "본문을 입력해주세요")
    .max(100000, "본문은 100,000자 이내로 입력해주세요"),
});

export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(120, "제목은 120자 이내로 입력해주세요")
    .optional(),
  content: z
    .string()
    .min(1, "본문을 입력해주세요")
    .max(100000, "본문은 100,000자 이내로 입력해주세요")
    .optional(),
});

export const createAiArticleSchema = z.object({
  topic: z
    .string()
    .min(1, "주제를 입력해주세요")
    .max(200, "주제는 200자 이내로 입력해주세요"),
  priorKnowledge: z
    .string()
    .max(300, "기존 지식은 300자 이내로 입력해주세요")
    .optional(),
});
