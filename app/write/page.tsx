"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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
  const charCount = content.length;

  return (
    <main className="flex-1 flex flex-col py-6 px-4 max-w-[1400px] mx-auto w-full">
      {/* Title Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-nord-light-accent dark:text-nord-dark-accent uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Write your story
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="md:hidden px-3 py-1 border-2 border-nord-0 dark:border-nord-dark-text text-xs font-bold uppercase"
          >
            {showPreview ? "Editor" : "Preview"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-4 border-red-400 p-4 text-sm font-bold text-red-700 dark:text-red-400 uppercase">
            {error}
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full bg-white dark:bg-nord-dark-bg border-4 border-nord-0 dark:border-nord-dark-text p-4 text-2xl font-black uppercase tracking-tight focus:ring-0 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-nord-dark-secondary dark:text-nord-dark-text"
          placeholder="ARTICLE_TITLE"
        />
      </div>

      {/* Editor + Preview Split */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 flex gap-4 min-h-[500px]">
          {/* Left: Editor */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-nord-dark-bg border-4 border-nord-0 dark:border-nord-dark-text ${showPreview ? "hidden md:flex" : "flex"}`}>
            {/* Toolbar */}
            <div className="border-b-4 border-nord-0 dark:border-nord-dark-text p-2 flex items-center justify-between bg-nord-5/50 dark:bg-nord-dark-secondary/30">
              <span className="px-2 py-1 text-xs font-bold uppercase text-nord-3 dark:text-nord-dark-secondary">
                Markdown Editor
              </span>
              <div className="px-4 text-[10px] font-bold text-nord-3 dark:text-nord-dark-secondary uppercase tracking-widest hidden sm:block">
                {content.length > 0 ? "Editing..." : "Ready"}
              </div>
            </div>
            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full resize-none border-none focus:ring-0 p-6 text-base leading-relaxed text-nord-0 dark:text-nord-dark-text placeholder:text-slate-300 dark:placeholder:text-nord-dark-secondary bg-transparent font-mono"
              placeholder={"마크다운으로 작성하세요...\n\n# 제목\n## 소제목\n**볼드** *이탤릭*\n\n```javascript\nconsole.log('Hello');\n```"}
            />
          </div>

          {/* Right: Preview */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-nord-dark-bg border-4 border-nord-0 dark:border-nord-dark-text ${showPreview ? "flex" : "hidden md:flex"}`}>
            {/* Preview Header */}
            <div className="border-b-4 border-nord-0 dark:border-nord-dark-text p-2 flex items-center justify-between bg-nord-5/50 dark:bg-nord-dark-secondary/30">
              <span className="px-2 py-1 text-xs font-bold uppercase text-nord-light-accent dark:text-nord-dark-accent">
                Preview
              </span>
              <span className="px-4 text-[10px] font-bold text-nord-3 dark:text-nord-dark-secondary uppercase tracking-widest hidden sm:block">
                Live
              </span>
            </div>
            {/* Rendered content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {content.trim() ? (
                <article className="prose prose-nord dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="text-nord-3 dark:text-nord-dark-secondary text-sm font-bold uppercase italic">
                  미리보기가 여기에 표시됩니다...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto h-14 px-12 bg-nord-light-accent dark:bg-nord-dark-accent text-white dark:text-nord-dark-bg border-4 border-nord-0 dark:border-nord-dark-text flex items-center justify-center gap-3 font-black text-lg uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined font-bold">send</span>
            {submitting ? "PUBLISHING..." : "PUBLISH"}
          </button>
          <div className="flex gap-6 text-xs font-bold text-nord-3 dark:text-nord-dark-secondary uppercase tracking-widest">
            <span>{charCount} chars</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </form>
    </main>
  );
}
