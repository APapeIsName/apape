import Link from "next/link";
import { prisma } from "@/lib/db";
import { LoadMoreArticles } from "@/components/LoadMoreArticles";

const PAGE_SIZE = 20;

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { type: "USER" },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  const hasMore = articles.length > PAGE_SIZE;
  const items = hasMore ? articles.slice(0, PAGE_SIZE) : articles;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="pixel-border bg-nord-4/30 dark:bg-nord-2/30 p-8 flex flex-col gap-4">
            <h2 className="text-4xl font-bold text-nord-0 dark:text-nord-dark-text tracking-tighter uppercase italic leading-none">
              BLOG_ARCHIVE
            </h2>
            <p className="text-nord-3 dark:text-nord-dark-secondary text-lg leading-relaxed max-w-xl">
              Personal writings and thoughts from the{" "}
              <span className="bg-nord-light-accent text-nord-6 px-1">APAPE</span> system.
            </p>
          </div>

          {/* Article List Header */}
          <div className="flex items-center justify-between border-b-4 border-nord-1 dark:border-nord-dark-secondary pb-4">
            <h3 className="text-nord-0 dark:text-nord-dark-text text-xl font-bold uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-nord-light-accent dark:text-nord-dark-accent">article</span>
              Recent_Posts
            </h3>
            <span className="text-nord-3 dark:text-nord-dark-secondary text-xs font-mono uppercase tracking-tighter">
              Showing: {items.length}
            </span>
          </div>

          {/* Article Cards */}
          <div className="flex flex-col gap-6">
            {items.length === 0 ? (
              <div className="pixel-border-sm p-6 bg-nord-4/20 dark:bg-nord-2/20 text-center">
                <p className="text-nord-3 dark:text-nord-dark-secondary font-bold uppercase">No articles found</p>
              </div>
            ) : (
              items.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="pixel-border-sm p-6 bg-nord-4/20 dark:bg-nord-2/20 hover:bg-white dark:hover:bg-nord-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-nord-light-accent border-2 border-nord-1 flex items-center justify-center text-nord-6 group-hover:bg-nord-0 transition-colors">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-nord-0 dark:text-nord-dark-text uppercase tracking-tight">
                          {article.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-nord-3 dark:text-nord-dark-secondary text-[10px] uppercase font-bold tracking-widest">
                          {article.author?.name ?? "Unknown"}
                        </span>
                        <span className="text-nord-3 dark:text-nord-dark-secondary text-[10px] uppercase font-bold tracking-widest">
                          {new Date(article.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className="bg-nord-1 text-nord-6 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {article._count.comments} Comments
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}

            <LoadMoreArticles
              initialCursor={nextCursor}
              type="USER"
              basePath="/blog"
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Write CTA */}
          <div className="pixel-border bg-nord-0 p-6 text-center">
            <h4 className="text-[10px] font-black uppercase text-nord-4 tracking-[0.2em] mb-4 italic">
              Write New Post
            </h4>
            <Link
              href="/write"
              className="block bg-nord-light-accent text-white py-3 font-bold uppercase tracking-widest text-sm border-2 border-nord-4 hover:bg-nord-frost-3 transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
