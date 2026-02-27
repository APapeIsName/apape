"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteArticleButton({
  articleId,
  redirectTo = "/pedia",
}: {
  articleId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error?.message ?? "삭제에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full border-2 border-red-400 dark:border-red-500/50 text-red-500 dark:text-red-400 py-3 px-4 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        Delete Article
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-red-500 text-center uppercase">
        정말 삭제하시겠습니까?
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 bg-red-500 text-white py-2 px-3 text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {deleting ? "삭제 중..." : "확인"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border-2 border-nord-3 dark:border-nord-dark-secondary text-nord-3 dark:text-nord-dark-secondary py-2 px-3 text-xs font-black uppercase tracking-widest"
        >
          취소
        </button>
      </div>
    </div>
  );
}
