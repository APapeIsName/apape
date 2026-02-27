import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  const [recentArticles, articleCount, commentCount] = await Promise.all([
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.article.count(),
    prisma.comment.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Section */}
        <section className="lg:col-span-8 space-y-12">
          <h2 className="text-3xl font-bold text-white bg-nord-light-accent dark:bg-nord-dark-accent dark:text-nord-dark-bg inline-block px-6 py-2 uppercase tracking-widest">
            Active Modules
          </h2>

          {recentArticles.length === 0 ? (
            <div className="bg-white dark:bg-nord-dark-bg p-12 border-4 border-nord-light-text dark:border-nord-dark-text text-center">
              <p className="text-xl font-bold text-nord-light-secondary dark:text-nord-dark-secondary uppercase">
                No articles yet. Be the first to write!
              </p>
              <Link
                href="/write"
                className="inline-block mt-6 px-6 py-3 bg-nord-light-accent text-white font-bold uppercase"
              >
                Start Writing
              </Link>
            </div>
          ) : (
            recentArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-nord-dark-bg p-8 border-4 border-nord-light-text dark:border-nord-dark-text"
              >
                <div className="flex flex-col gap-4">
                  <span className="text-lg text-nord-light-accent dark:text-nord-dark-accent font-bold uppercase underline">
                    Module: {article.type === "AI" ? "AI_GENERATED" : "USER_BLOG"}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold text-nord-light-text dark:text-nord-dark-text leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-nord-light-secondary dark:text-nord-dark-secondary text-lg leading-relaxed line-clamp-2">
                    {article.content.replace(/[#*`>\-\[\]()]/g, "").slice(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-nord-light-secondary dark:text-nord-dark-secondary">
                        {new Date(article.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      <span className="bg-nord-1 text-nord-6 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {article._count.comments} Comments
                      </span>
                      {article.author && (
                        <span className="text-[10px] font-bold text-nord-3 uppercase tracking-widest">
                          by {article.author.name}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/blog/${article.id}`}
                      className="px-6 py-3 bg-nord-light-text dark:bg-nord-dark-text text-white dark:text-nord-dark-bg text-sm font-bold uppercase hover:bg-nord-light-accent dark:hover:bg-nord-dark-accent transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Sidebar Section */}
        <aside className="lg:col-span-4 space-y-12">
          {/* User Profile Widget */}
          <div className="bg-white dark:bg-nord-dark-bg p-6 border-8 border-nord-light-text dark:border-nord-dark-text">
            <h4 className="text-white font-bold uppercase text-lg mb-6 bg-nord-light-text dark:bg-nord-dark-text px-4 py-1 inline-block">
              {user ? "Profile" : "Welcome"}
            </h4>
            {user ? (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 dark:bg-nord-dark-secondary border-4 border-nord-light-text dark:border-nord-dark-text overflow-hidden p-1">
                  {user.image ? (
                    <img
                      className="w-full h-full object-cover"
                      alt={user.name ?? "User"}
                      src={user.image}
                    />
                  ) : (
                    <div className="w-full h-full bg-nord-4 flex items-center justify-center">
                      <span className="material-symbols-outlined text-nord-3 text-3xl">person</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.name ?? "Anonymous"}</p>
                  <p className="text-sm text-nord-light-accent dark:text-nord-dark-accent font-bold uppercase">
                    System User
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-nord-light-secondary dark:text-nord-dark-secondary font-bold uppercase text-sm">
                  Join the APAPE system
                </p>
                <Link
                  href="/login"
                  className="block bg-nord-light-text dark:bg-nord-dark-text text-white dark:text-nord-dark-bg py-3 font-bold uppercase tracking-widest text-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* System Stats Widget */}
          <div className="bg-gray-100 dark:bg-nord-dark-bg p-6 border-8 border-nord-light-text dark:border-nord-dark-text">
            <h4 className="text-white font-bold uppercase text-lg mb-6 bg-nord-light-text dark:bg-nord-dark-text px-4 py-1 inline-block">
              System Stats
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b-4 border-gray-300 dark:border-gray-700 pb-2">
                <span className="text-lg font-bold uppercase">Articles</span>
                <span className="text-4xl font-bold tracking-tighter">
                  {String(articleCount).padStart(6, "0")}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold uppercase">Comments</span>
                <span className="text-4xl font-bold tracking-tighter">
                  {String(commentCount).padStart(6, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <Link
              href="/blog"
              className="block bg-white dark:bg-nord-dark-bg p-4 border-4 border-nord-light-text dark:border-nord-dark-text font-bold uppercase tracking-widest text-sm hover:bg-nord-light-accent hover:text-white transition-colors text-center"
            >
              Blog Archive
            </Link>
            <Link
              href="/write"
              className="block bg-white dark:bg-nord-dark-bg p-4 border-4 border-nord-light-text dark:border-nord-dark-text font-bold uppercase tracking-widest text-sm hover:bg-nord-light-accent hover:text-white transition-colors text-center"
            >
              Write Article
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
