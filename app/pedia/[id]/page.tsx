import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { auth } from "@/lib/auth";
import { CommentSection } from "@/components/CommentSection";

type Params = { params: Promise<{ id: string }> };

export default async function PediaArticlePage({ params }: Params) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id, type: "AI" },
  });

  if (!article) notFound();

  const htmlContent = await markdownToHtml(article.content);
  const session = await auth();

  const comments = await prisma.comment.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row justify-center px-6 pt-12 pb-24 gap-12">
      {/* Main Article Content */}
      <main className="w-full max-w-[720px] flex-shrink-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-nord-3 text-sm font-medium uppercase tracking-widest">
          <a className="hover:text-nord-light-accent transition-colors" href="/pedia">
            Pedia
          </a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-nord-0">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="inline-block bg-nord-light-accent text-nord-6 px-3 py-1 text-xs font-bold uppercase tracking-tighter mb-4">
            AI Generated
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight text-nord-0">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-nord-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-nord-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-nord-light-accent text-sm">smart_toy</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">AI System</span>
            </div>
            <span className="w-1.5 h-1.5 bg-nord-light-accent"></span>
            <span className="text-sm font-medium">
              {new Date(article.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article
          className="prose prose-lg max-w-none text-lg leading-relaxed space-y-8 text-nord-1"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Pixel Divider */}
        <div className="pixel-divider my-16"></div>

        {/* Comment Section */}
        <CommentSection
          articleId={id}
          initialComments={comments}
          isLoggedIn={!!session?.user}
          currentUserId={session?.user?.id}
        />
      </main>

      {/* Right Sticky Sidebar / TOC Widget */}
      <aside className="hidden lg:block w-[280px]">
        <div className="sticky top-16">
          <div className="bg-white p-6 border-2 border-nord-4">
            <h4 className="text-xs font-black text-nord-3 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Article Info
              <span className="w-3 h-3 bg-nord-light-accent block"></span>
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[10px] font-bold text-nord-3 uppercase tracking-widest block mb-1">
                  Type
                </span>
                <span className="font-bold text-nord-0 uppercase">AI Encyclopedia</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-nord-3 uppercase tracking-widest block mb-1">
                  Created
                </span>
                <span className="font-bold text-nord-0">
                  {new Date(article.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-nord-3 uppercase tracking-widest block mb-1">
                  Comments
                </span>
                <span className="font-bold text-nord-0">{comments.length}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-nord-4">
              <a
                href="/pedia"
                className="w-full border-2 border-nord-light-accent text-nord-light-accent py-3 px-4 text-xs font-black uppercase tracking-widest hover:bg-nord-light-accent hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Pedia
              </a>
            </div>
          </div>

          <div className="mt-6 px-2 opacity-50">
            <p className="text-[9px] font-medium text-nord-3 uppercase tracking-widest">
              FOCUSED READING MODE v1.0.2<br />
              NORD COLOR SYSTEM
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
