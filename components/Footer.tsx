import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-4 border-nord-light-secondary bg-white dark:bg-nord-dark-bg dark:border-nord-dark-secondary">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-nord-light-secondary dark:text-nord-dark-secondary">
            &copy; 2026 APAPE_OS // NORD_EDITION v1.0
          </span>
        </div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
          <Link
            href="/blog"
            className="text-nord-light-secondary dark:text-nord-dark-secondary hover:text-nord-light-accent dark:hover:text-nord-dark-accent"
          >
            Blog
          </Link>
          <Link
            href="/pedia"
            className="text-nord-light-secondary dark:text-nord-dark-secondary hover:text-nord-light-accent dark:hover:text-nord-dark-accent"
          >
            Pedia
          </Link>
        </div>
      </div>
    </footer>
  );
}
