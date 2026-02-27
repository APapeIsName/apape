import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, AuthError } from "@/lib/auth";
import { createArticleSchema } from "@/lib/validators/article";
import { unauthorized, forbidden, validationError, internalError, rateLimited } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/articles?type=USER|AI&cursor=...&limit=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "USER" | "AI" | null;
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const where = type ? { type } : {};

    const articles = await prisma.article.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    const hasMore = articles.length > limit;
    const items = hasMore ? articles.slice(0, limit) : articles;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return NextResponse.json({ items, nextCursor });
  } catch {
    return internalError();
  }
}

// POST /api/articles (authenticated users)
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, "articles:create");
    if (!rl.allowed) return rateLimited();

    const user = await requireAuth();

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return validationError(issue.message, { path: issue.path });
    }

    const article = await prisma.article.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        type: "USER",
        authorId: user.id,
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
