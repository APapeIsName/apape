import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwnerOrAdmin, AuthError } from "@/lib/auth";
import { updateArticleSchema } from "@/lib/validators/article";
import {
  unauthorized,
  forbidden,
  notFound,
  validationError,
  internalError,
} from "@/lib/api-error";

type Params = { params: Promise<{ id: string }> };

// GET /api/articles/:id
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!article) return notFound("Article not found");

    return NextResponse.json({ article });
  } catch {
    return internalError();
  }
}

// PATCH /api/articles/:id (owner or ADMIN)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!article) return notFound("Article not found");
    if (!article.authorId) return forbidden("AI articles cannot be edited");

    await requireOwnerOrAdmin(article.authorId);

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return validationError(issue.message, { path: issue.path });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ article: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === "UNAUTHORIZED" ? unauthorized() : forbidden();
    }
    return internalError();
  }
}

// DELETE /api/articles/:id (owner or ADMIN)
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!article) return notFound("Article not found");
    if (!article.authorId) return forbidden("AI articles cannot be deleted via this endpoint");

    await requireOwnerOrAdmin(article.authorId);

    await prisma.article.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === "UNAUTHORIZED" ? unauthorized() : forbidden();
    }
    return internalError();
  }
}
