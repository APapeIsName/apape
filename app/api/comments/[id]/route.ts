import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwnerOrAdmin, AuthError } from "@/lib/auth";
import { updateCommentSchema } from "@/lib/validators/comment";
import {
  unauthorized,
  forbidden,
  notFound,
  validationError,
  internalError,
} from "@/lib/api-error";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/comments/:id (owner or ADMIN)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) return notFound("Comment not found");

    await requireOwnerOrAdmin(comment.authorId);

    const body = await request.json();
    const parsed = updateCommentSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return validationError(issue.message, { path: issue.path });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: parsed.data.content },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comment: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === "UNAUTHORIZED" ? unauthorized() : forbidden();
    }
    return internalError();
  }
}

// DELETE /api/comments/:id (owner or ADMIN)
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) return notFound("Comment not found");

    await requireOwnerOrAdmin(comment.authorId);

    await prisma.comment.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof AuthError) {
      return e.type === "UNAUTHORIZED" ? unauthorized() : forbidden();
    }
    return internalError();
  }
}
