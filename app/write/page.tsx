"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("본문을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "발행에 실패했습니다.");
        return;
      }

      const data = await res.json();
      router.push(`/blog/${data.article.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="flex-1 flex justify-center py-12 px-4">
      <div className="w-full max-w-[800px] flex flex-col gap-8">
        {/* Title Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-nord-light-accent uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Nord Light Edition - Write your story
          </div>

          {error && (
            <div className="bg-red-50 border-4 border-red-400 p-4 text-sm font-bold text-red-700 uppercase">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full bg-white border-4 border-nord-0 p-6 text-3xl font-black uppercase tracking-tight focus:ring-0 focus:outline-none placeholder:text-slate-300 pixel-border"
              placeholder="ARTICLE_TITLE"
            />
          </div>
        </div>

        {/* Toolbar & Editor Section */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border-4 border-nord-0 pixel-border flex flex-col">
            {/* Toolbar */}
            <div className="border-b-4 border-nord-0 p-2 flex items-center justify-between bg-nord-5/50">
              <div className="flex gap-1">
                <span className="p-2 border-2 border-transparent text-nord-3 text-xs font-bold uppercase">
                  Markdown
                </span>
              </div>
              <div className="px-4 text-[10px] font-bold text-nord-3 uppercase tracking-widest hidden sm:block">
                {content.length > 0 ? "Editing..." : "Ready"}
              </div>
            </div>

            {/* Main Textarea */}
            <div className="p-6 min-h-[500px] flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full resize-none border-none focus:ring-0 text-lg leading-relaxed text-nord-0 placeholder:text-slate-300 bg-transparent font-normal"
                placeholder="START_WRITING..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-16 bg-nord-light-accent text-white border-4 border-nord-0 flex items-center justify-center gap-3 font-black text-lg uppercase tracking-widest pixel-border pixel-button-shadow transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined font-bold">send</span>
              {submitting ? "PUBLISHING..." : "PUBLISH"}
            </button>
          </div>
        </form>

        {/* Footer Meta */}
        <footer className="mt-4 border-t-2 border-nord-0/10 pt-8 pb-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-nord-3 uppercase tracking-widest">
          <div className="flex gap-6">
            <span>Word Count: {wordCount}</span>
            <span>Reading Time: {readingTime}m</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
