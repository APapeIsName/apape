"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PendingComment extends Comment {
  pending?: boolean;
}

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
  currentUserId?: string;
}

const COMMENTS_PER_PAGE = 20;

export function CommentSection({
  articleId,
  initialComments,
  isLoggedIn,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<PendingComment[]>(initialComments);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination: if we got exactly COMMENTS_PER_PAGE initial comments, there may be more
  const [cursor, setCursor] = useState<string | null>(
    initialComments.length === COMMENTS_PER_PAGE
      ? initialComments[initialComments.length - 1].id
      : null
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || status === "submitting") return;

      const tempId = `temp_${Date.now()}`;
      const tempComment: PendingComment = {
        id: tempId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        author: {
          id: currentUserId ?? "",
          name: "Me",
          image: null,
        },
        pending: true,
      };

      setComments((prev) => [tempComment, ...prev]);
      setContent("");
      setStatus("submitting");
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/articles/${articleId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: tempComment.content }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message ?? "댓글 등록에 실패했습니다.");
        }

        const data = await res.json();

        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? { ...data.comment, pending: false } : c))
        );
        setStatus("idle");
      } catch (err) {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "댓글 등록에 실패했습니다."
        );
      }
    },
    [content, status, articleId, currentUserId]
  );

  const handleLoadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/articles/${articleId}/comments?cursor=${cursor}&limit=${COMMENTS_PER_PAGE}`
      );
      if (!res.ok) throw new Error("Failed to load more comments.");

      const data: { items: Comment[]; nextCursor?: string } = await res.json();

      setComments((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor ?? null);
    } catch {
      // Silently fail -- user can retry
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, articleId]);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-black uppercase italic text-nord-0 flex items-center gap-3">
        <span className="material-symbols-outlined">forum</span>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Comment Input */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="bg-nord-5 p-6 pixel-border">
          {status === "error" && errorMessage && (
            <div className="mb-4 bg-red-50 border-2 border-red-400 p-3 text-sm font-bold text-red-700 uppercase flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setErrorMessage(null);
                }}
                className="text-xs underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}
          <label className="block text-xs font-black uppercase text-nord-3 mb-2">
            Leave a response
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            className="w-full bg-white pixel-border-sm border-none focus:ring-2 focus:ring-nord-light-accent p-4 text-sm font-medium h-32"
            placeholder="TYPE YOUR MESSAGE HERE..."
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={status === "submitting" || !content.trim()}
              className="bg-nord-light-accent text-white font-bold uppercase px-8 py-3 pixel-border-accent hover:bg-nord-frost-3 transition-colors disabled:opacity-50"
            >
              {status === "submitting" ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-nord-5 p-6 pixel-border text-center">
          <p className="text-nord-3 font-bold uppercase text-sm">
            Please{" "}
            <Link
              href="/login"
              className="text-nord-light-accent underline hover:text-nord-frost-3"
            >
              Login
            </Link>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <div className="p-6 bg-nord-5 text-center">
            <p className="text-nord-3 font-bold uppercase text-sm">No comments yet.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 items-start">
              <div className="size-12 pixel-border-sm bg-white overflow-hidden shrink-0 flex items-center justify-center">
                {comment.author.image ? (
                  <img
                    alt={comment.author.name ?? "User"}
                    src={comment.author.image}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-nord-3">person</span>
                )}
              </div>
              <div
                className={`bg-white p-4 pixel-border-sm flex-1 ${
                  comment.pending ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black uppercase text-nord-light-accent tracking-tighter">
                    {comment.author.name ?? "Unknown"}
                  </span>
                  <span className="text-[10px] font-bold text-nord-3">
                    {comment.pending
                      ? "POSTING..."
                      : new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-sm font-medium text-nord-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {cursor && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-3 bg-nord-0 text-white font-bold uppercase tracking-widest text-xs hover:bg-nord-light-accent transition-colors border-2 border-nord-1 disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </section>
  );
}
