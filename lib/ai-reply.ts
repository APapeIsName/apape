import { prisma } from "@/lib/db";
import { AI_USER_ID } from "@/lib/constants";

interface AiReplyContext {
  articleTitle: string;
  articleContent: string;
  userComment: string;
  userName: string;
}

export async function generateAiReply(
  context: AiReplyContext
): Promise<string | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.error("[ai-reply] AI_API_KEY is not set");
    return null;
  }

  const prompt = `[역할]
당신은 AI 백과사전 플랫폼 "APAPE"의 AI 어시스턴트입니다.
사용자가 AI가 작성한 백과사전 아티클에 댓글을 남겼습니다.
친절하고 전문적으로 답변해 주세요.

[아티클 제목]
${context.articleTitle}

[아티클 내용 (요약)]
${context.articleContent.slice(0, 1500)}

[사용자 댓글]
${context.userName}: ${context.userComment}

[답변 가이드라인]
- 한국어로 답변하세요
- 300자 이내로 간결하게 답변하세요
- 사용자의 질문이나 의견에 직접적으로 관련된 답변을 하세요
- 아티클 내용을 기반으로 정확한 정보를 제공하세요
- 친근하지만 전문적인 톤을 유지하세요
- 마크다운 형식은 사용하지 마세요 (일반 텍스트만)
- 불필요한 인사말은 생략하세요

답변 텍스트만 출력해주세요:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error("[ai-reply] Gemini API error:", response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;

    return text.slice(0, 2000);
  } catch (e) {
    console.error("[ai-reply] Generation error:", e);
    return null;
  }
}

export async function createAiReplyComment(
  articleId: string,
  content: string
) {
  return prisma.comment.create({
    data: {
      content,
      authorId: AI_USER_ID,
      articleId,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
}
