import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import { createAiArticleSchema } from "@/lib/validators/article";
import {
  unauthorized,
  forbidden,
  validationError,
  badGateway,
  internalError,
  rateLimited,
} from "@/lib/api-error";
import { rateLimitStrict } from "@/lib/rate-limit";

// POST /api/admin/ai-articles (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimitStrict(request, "admin:ai-generate");
    if (!rl.allowed) return rateLimited();

    await requireAdmin();

    const body = await request.json();
    const parsed = createAiArticleSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return validationError(issue.message, { path: issue.path });
    }

    const { topic } = parsed.data;

    // Call external AI API (Gemini)
    const aiResult = await generateAiArticle(topic);
    if (!aiResult) {
      return badGateway("AI article generation failed");
    }

    const article = await prisma.article.create({
      data: {
        title: aiResult.title,
        content: aiResult.content,
        type: "AI",
        authorId: null,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === "UNAUTHORIZED" ? unauthorized() : forbidden();
    }
    return internalError();
  }
}

async function generateAiArticle(
  topic: string
): Promise<{ title: string; content: string } | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.error("AI_API_KEY is not set");
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `다음 주제에 대한 백과사전 스타일의 아티클을 작성해주세요.

주제: ${topic}

요구사항:
- 제목은 간결하게 (한 줄)
- 본문은 마크다운 형식으로 작성
- 소개, 주요 내용, 결론 구조
- 객관적이고 정보성 있는 톤
- 한국어로 작성

다음 JSON 형식으로만 응답해주세요:
{"title": "제목", "content": "마크다운 본문"}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // Parse JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.title && parsed.content) {
      return { title: parsed.title, content: parsed.content };
    }

    return null;
  } catch (e) {
    console.error("AI generation error:", e);
    return null;
  }
}
