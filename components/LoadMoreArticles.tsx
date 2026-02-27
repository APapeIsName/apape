"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  type: "USER" | "AI";
  createdAt: string;
  author?: { name: string | null; image: string | null } | null;
  _count: { comments: number };
}

interface LoadMoreArticlesProps {
  initialCursor: string | undefined;
  type: "USER" | "AI";
  basePath: string;
}

export function LoadMoreArticles({
  initialCursor,
  type,
  basePath,
}: LoadMoreArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/articles?type=${type}&cursor=${cursor}&limit=20`
      );
      if (!res.ok) return;
      const data = await res.json();
      setArticles((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor ?? undefined);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, type]);

  if (articles.length === 0 && !cursor) return null;

  return (
    <>
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`${basePath}/${article.id}`}
          className="pixel-border-sm p-6 bg-nord-4/20 hover:bg-white transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 bg-nord-light-accent border-2 border-nord-1 flex items-center justify-center text-nord-6 group-hover:bg-nord-0 transition-colors">
              <span className="material-symbols-outlined">
                {type === "AI" ? "psychology" : "description"}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-nord-0 uppercase tracking-tight">
                  {article.title}
                </h4>
              </div>
              <div className="flex items-center gap-4">
                {type === "AI" ? (
                  <span className="bg-nord-light-accent text-nord-6 px-2 py-0.5 text-[10px] font-bold uppercase">
                    AI Generated
                  </span>
                ) : (
                  <span className="text-nord-3 text-[10px] uppercase font-bold tracking-widest">
                    {article.author?.name ?? "Unknown"}
                  </span>
                )}
                <span className="text-nord-3 text-[10px] uppercase font-bold tracking-widest">
                  {new Date(article.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <span className={`${type === "AI" ? "text-nord-3" : "bg-nord-1 text-nord-6 px-2 py-0.5"} text-[10px] font-bold uppercase`}>
                  {article._count.comments} Comments
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-4 bg-nord-0 text-white font-bold uppercase tracking-widest text-sm hover:bg-nord-light-accent transition-colors disabled:opacity-50 border-4 border-nord-1"
        >
          {loading ? "LOADING..." : "LOAD MORE"}
        </button>
      )}
    </>
  );
}
