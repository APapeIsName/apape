import Link from "next/link";
import { prisma } from "@/lib/db";
import { LoadMoreArticles } from "@/components/LoadMoreArticles";

const PAGE_SIZE = 20;

export default async function PediaPage() {
  const articles = await prisma.article.findMany({
    where: { type: "AI" },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    include: {
      _count: { select: { comments: true } },
    },
  });

  const hasMore = articles.length > PAGE_SIZE;
  const items = hasMore ? articles.slice(0, PAGE_SIZE) : articles;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8">
      <div className="scanline"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="pixel-border bg-nord-4/30 dark:bg-nord-2/30 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="w-32 h-32 flex-shrink-0 bg-nord-4 dark:bg-nord-2 p-2 border-2 border-nord-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-nord-light-accent dark:text-nord-dark-accent text-6xl">smart_toy</span>
            </div>
            <div className="flex flex-col gap-4 text-center md:text-left">
              <h2 className="text-4xl font-bold text-nord-0 dark:text-nord-dark-text tracking-tighter uppercase italic leading-none">
                SYSTEM_CORE: ONLINE
              </h2>
              <p className="text-nord-3 dark:text-nord-dark-secondary text-lg leading-relaxed max-w-xl">
                Welcome to the{" "}
                <span className="bg-nord-light-accent text-nord-6 px-1">APAPE PEDIA</span>.
                Explore AI-generated data packets and Nord-logic archives below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-nord-light-accent text-nord-6 border border-nord-1 px-3 py-1 text-xs font-bold uppercase tracking-tighter">
                  Status: Ready
                </span>
                <span className="border-2 border-nord-1 dark:border-nord-dark-secondary text-nord-0 dark:text-nord-dark-text px-3 py-1 text-xs font-bold uppercase tracking-tighter">
                  ROM: v0.8.2-ND
                </span>
              </div>
            </div>
          </div>

          {/* Articles List Header */}
          <div className="flex items-center justify-between border-b-4 border-nord-1 dark:border-nord-dark-secondary pb-4">
            <h3 className="text-nord-0 dark:text-nord-dark-text text-xl font-bold uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-nord-light-accent dark:text-nord-dark-accent">memory</span>
              Neural_Archives
            </h3>
            <span className="text-nord-3 dark:text-nord-dark-secondary text-xs font-mono uppercase tracking-tighter">
              Showing: {items.length}
            </span>
          </div>

          {/* Article Cards */}
          <div className="flex flex-col gap-6">
            {items.length === 0 ? (
              <div className="pixel-border-sm p-6 bg-nord-4/20 dark:bg-nord-2/20 text-center">
                <p className="text-nord-3 dark:text-nord-dark-secondary font-bold uppercase">
                  No archives found. Generate one from the Admin panel.
                </p>
              </div>
            ) : (
              items.map((article) => (
                <Link
                  key={article.id}
                  href={`/pedia/${article.id}`}
                  className="pixel-border-sm p-6 bg-nord-4/20 dark:bg-nord-2/20 hover:bg-white dark:hover:bg-nord-1 transition-all cursor-pointer group border-nord-1/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-nord-light-accent border-2 border-nord-1 flex items-center justify-center text-nord-6 group-hover:bg-nord-0 transition-colors">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-nord-0 dark:text-nord-dark-text uppercase tracking-tight">
                          {article.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="bg-nord-light-accent text-nord-6 px-2 py-0.5 text-[10px] font-bold uppercase">
                          AI Generated
                        </span>
                        <span className="text-nord-3 dark:text-nord-dark-secondary text-[10px] uppercase font-bold tracking-widest">
                          {new Date(article.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className="text-nord-3 dark:text-nord-dark-secondary text-[10px] uppercase font-bold tracking-widest">
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
              type="AI"
              basePath="/pedia"
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Admin Link */}
          <div className="pixel-border bg-nord-0 p-6 text-center">
            <h4 className="text-[10px] font-black uppercase text-nord-4 tracking-[0.2em] mb-4 italic">
              Admin Control
            </h4>
            <Link
              href="/admin/ai"
              className="block bg-nord-light-accent text-white py-3 font-bold uppercase tracking-widest text-sm border-2 border-nord-4 hover:bg-nord-frost-3 transition-colors"
            >
              Generate AI Article
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
