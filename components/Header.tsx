import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./SignOutButton";
import { DarkModeToggle } from "./DarkModeToggle";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b-4 border-nord-light-secondary bg-white dark:bg-nord-dark-bg dark:border-nord-dark-secondary">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/favicon.svg" alt="APAPE" width={32} height={32} className="border-2 border-nord-light-text dark:border-nord-dark-text" />
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              APAPE
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/blog"
              className="text-sm font-bold uppercase tracking-widest text-nord-light-secondary dark:text-nord-dark-secondary hover:text-nord-light-accent dark:hover:text-nord-dark-accent"
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-bold hidden sm:inline">
                {user.name ?? user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-nord-light-text dark:bg-nord-dark-text text-white dark:text-nord-dark-bg text-sm font-bold uppercase tracking-widest border-2 border-nord-light-text dark:border-nord-dark-text"
            >
              Login
            </Link>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
