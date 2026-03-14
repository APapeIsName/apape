import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validators/comment";
import {
  unauthorized,
  notFound,
  validationError,
  internalError,
  rateLimited,
} from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { generateAiReply, createAiReplyComment } from "@/lib/ai-reply";

type Params = { params: Promise<{ id: string }> };

// GET /api/articles/:id/comments?cursor=...&limit=20
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: articleId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    // Check article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });
    if (!article) return notFound("Article not found");

    const comments = await prisma.comment.findMany({
      where: { articleId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return NextResponse.json({ items, nextCursor });
  } catch {
    return internalError();
  }
}

// POST /api/articles/:id/comments (auth required)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const rl = rateLimit(request, "comments:create");
    if (!rl.allowed) return rateLimited();

    const user = await requireAuth();
    const { id: articleId } = await params;

    // Check article exists (include type/title/content for AI reply)
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, type: true, title: true, content: true },
    });
    if (!article) return notFound("Article not found");

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return validationError(issue.message, { path: issue.path });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        authorId: user.id,
        articleId,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    // Fire-and-forget: generate AI reply for pedia articles
    const aiReplyPending = article.type === "AI";
    if (aiReplyPending) {
      generateAiReply({
        articleTitle: article.title,
        articleContent: article.content,
        userComment: parsed.data.content,
        userName: user.name || "사용자",
      })
        .then((content) => {
          if (content) return createAiReplyComment(articleId, content);
        })
        .catch((err) => console.error("[ai-reply] async error:", err));
    }

    return NextResponse.json({ comment, aiReplyPending }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return unauthorized();
    }
    return internalError();
  }
}
