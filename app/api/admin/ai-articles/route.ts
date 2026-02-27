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

export const maxDuration = 60;

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

    const { topic, priorKnowledge } = parsed.data;

    // Call external AI API (Gemini)
    const aiResult = await generateAiArticle(topic, priorKnowledge);
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
  topic: string,
  priorKnowledge?: string
): Promise<{ title: string; content: string } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return null;
  }

  const priorKnowledgeSection = priorKnowledge
    ? `\n독자의 기존 지식: ${priorKnowledge}`
    : "\n독자의 기존 지식: 해당 분야의 기초적인 배경지식";

  try {
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: `당신은 뇌과학과 인지심리학에 기반하여 최고로 효율적인 학습 경험을 설계하는 '인지 학습 설계자'이자 전문 테크 라이터입니다.

단순한 정보 나열이 아니라 독자가 글을 읽는 과정 자체에서 뇌과학적 학습 원리가 자연스럽게 적용되도록 글의 구조를 설계해야 합니다.

작성 가이드라인 - 5대 원칙 적용:
1. 정교화 (Elaborative Encoding): 새로운 개념을 설명할 때, 독자의 기존 지식과 어떤 점이 유사하고 어떤 점이 다른지 명확히 비교하는 비유나 연결 고리를 반드시 포함해 주세요.
2. 능동적 인출 (Active Recall): 섹션이 넘어갈 때마다 정답을 바로 알려주지 말고, 독자가 스스로 방금 읽은 개념을 떠올려 보거나 간단한 코드를 유추해 볼 수 있는 '미니 퀴즈'나 '생각해 볼 질문'을 배치해 주세요.
3. 분산 학습 (Spaced Practice): 한 번에 너무 많은 정보를 주지 마세요. 글을 3~4개의 명확한 마일스톤(Session)으로 쪼개고, 각 세션 사이에 "여기서 잠시 멈추고 개념을 소화하세요"라는 안내 문구를 넣어주세요.
4. 도파민/보상 설계: 각 세션을 완료할 때마다 작은 성취감을 느낄 수 있는 격려의 메시지를 넣고, 다음 단계로 넘어갈 강력한 동기부여를 제시해 주세요.
5. DMN 및 수면 활용: 글의 마지막에는 산책을 하거나 자기 전에 가볍게 머릿속으로 굴려볼 만한 '철학적이거나 근본적인 질문' 하나를 던지며 마무리해 주세요.

출력 형식:
- 한국어로 작성
- 각 Session은 ## 헤딩으로 구분
- 미니 퀴즈는 > (blockquote) 형식으로 표시
- 격려 메시지는 **볼드** 로 강조
- 코드 블록은 반드시 언어를 명시 (예: \`\`\`python, \`\`\`javascript)
- **볼드** 텍스트 앞뒤에는 반드시 공백 또는 줄바꿈을 넣으세요
- 빈 줄을 사용하여 단락을 명확히 구분하세요

반드시 다음 JSON 형식으로만 응답해주세요 (마크다운 코드블록 없이):
{"title": "제목", "content": "마크다운 본문"}`,
          messages: [
            {
              role: "user",
              content: `학습 주제: ${topic}${priorKnowledgeSection}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Claude API error:", response.status, errBody);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
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
