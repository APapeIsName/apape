import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { auth } from "@/lib/auth";
import { CommentSection } from "@/components/CommentSection";

type Params = { params: Promise<{ id: string }> };

export default async function BlogArticlePage({ params }: Params) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id, type: "USER" },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
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
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 md:flex-row md:p-12">
      {/* Left Column: Article Content */}
      <div className="flex flex-1 flex-col gap-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-tighter text-nord-3">
          <a className="hover:text-nord-light-accent" href="/">Home</a>
          <span>/</span>
          <a className="hover:text-nord-light-accent" href="/blog">Blog</a>
          <span>/</span>
          <span className="text-nord-0">{article.title}</span>
        </div>

        {/* Article Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-6xl font-black text-nord-0 leading-[1.1] tracking-tighter uppercase bg-white p-4 pixel-border">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 px-2">
            <div className="size-10 pixel-border-sm bg-nord-4 overflow-hidden shrink-0 flex items-center justify-center">
              {article.author?.image ? (
                <img
                  alt={article.author.name ?? "Author"}
                  src={article.author.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-nord-3">person</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-nord-3">Written By</span>
              <span className="text-sm font-bold text-nord-0">
                {article.author?.name ?? "Unknown"} |{" "}
                {new Date(article.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div
          className="bg-white dark:bg-nord-dark-bg p-8 pixel-border leading-relaxed text-nord-1 dark:text-nord-dark-text space-y-6 text-lg prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Pixel Divider */}
        <div className="pixel-divider my-8"></div>

        {/* Comments Section */}
        <CommentSection
          articleId={id}
          initialComments={comments}
          isLoggedIn={!!session?.user}
          currentUserId={session?.user?.id}
        />
      </div>

      {/* Right Sidebar */}
      <aside className="flex w-full flex-col gap-6 md:w-80">
        {/* Profile Widget */}
        {article.author && (
          <div className="bg-white p-6 pixel-border">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-24 bg-nord-5 pixel-border-sm p-1 flex items-center justify-center overflow-hidden">
                {article.author.image ? (
                  <img
                    alt={article.author.name ?? "Author"}
                    src={article.author.image}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-nord-3 text-4xl">person</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic text-nord-0">
                  {article.author.name ?? "Unknown"}
                </h3>
                <p className="text-xs font-bold text-nord-3 uppercase tracking-widest mt-1">
                  Writer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="bg-white p-6 pixel-border">
          <h4 className="text-xs font-black uppercase text-nord-0 mb-4 border-b-2 border-nord-5 pb-2">
            Top Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-nord-5 text-[10px] font-bold uppercase pixel-border-sm hover:bg-nord-light-accent hover:text-white cursor-pointer transition-colors">
              BLOG
            </span>
            <span className="px-2 py-1 bg-nord-5 text-[10px] font-bold uppercase pixel-border-sm hover:bg-nord-light-accent hover:text-white cursor-pointer transition-colors">
              TECH
            </span>
            <span className="px-2 py-1 bg-nord-5 text-[10px] font-bold uppercase pixel-border-sm hover:bg-nord-light-accent hover:text-white cursor-pointer transition-colors">
              DESIGN
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
