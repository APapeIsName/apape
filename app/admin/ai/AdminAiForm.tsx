"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAiForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; title: string } | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!topic.trim()) {
      setError("주제를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/ai-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "AI 글 생성에 실패했습니다.");
        return;
      }

      const data = await res.json();
      setResult({ id: data.article.id, title: data.article.title });
      setTopic("");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b-4 border-nord-0 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-nord-0">terminal</span>
          <h2 className="text-xl font-bold uppercase tracking-tighter text-nord-0">
            APAPE CONTROL PANEL v1.0
          </h2>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
        {/* AI Generator Section */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-4xl font-black text-nord-0 uppercase leading-none tracking-tighter">
              AI ARTICLE GENERATION
            </h3>
            <p className="text-nord-3 font-medium uppercase tracking-wider italic">
              Create new content using the 8-bit Nord Engine
            </p>
          </div>

          <form onSubmit={handleGenerate} className="bg-white pixel-border-sm p-8 max-w-4xl space-y-6">
            {error && (
              <div className="bg-red-50 border-4 border-red-400 p-4 text-sm font-bold text-red-700 uppercase">
                {error}
              </div>
            )}

            {result && (
              <div className="bg-green-50 border-4 border-green-400 p-4 text-sm font-bold text-green-700 uppercase flex items-center justify-between">
                <span>Generated: &quot;{result.title}&quot;</span>
                <button
                  type="button"
                  onClick={() => router.push(`/pedia/${result.id}`)}
                  className="bg-nord-0 text-white px-4 py-1 text-xs font-bold uppercase hover:bg-nord-light-accent transition-colors"
                >
                  VIEW
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-widest text-nord-0">
                TOPIC_INPUT
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={200}
                  className="flex-1 border-4 border-nord-0 bg-nord-6 p-4 text-lg font-bold uppercase text-nord-0 focus:ring-0 focus:border-nord-light-accent placeholder:text-nord-3/50"
                  placeholder="ENTER_TOPIC_FOR_AI..."
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-nord-light-accent text-white px-10 py-4 font-black text-xl uppercase tracking-tighter border-4 border-nord-0 pixel-button-shadow transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined font-black">bolt</span>
                  {submitting ? "GENERATING..." : "GENERATE"}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-nord-5 border-2 border-nord-0 px-3 py-1 text-[10px] font-bold uppercase">
                MODE: PIXEL_ACCURACY
              </span>
              <span className="bg-nord-5 border-2 border-nord-0 px-3 py-1 text-[10px] font-bold uppercase">
                TOKENS: 4096_MAX
              </span>
            </div>
          </form>
        </section>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-nord-0 text-white flex items-center px-6 md:px-10 justify-between text-[10px] font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>SERVER_STATUS: ONLINE</span>
          <span className="text-nord-frost-2">LATENCY: 14MS</span>
        </div>
        <div>
          <span>APAPE_ADMIN // v1.0.42-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
