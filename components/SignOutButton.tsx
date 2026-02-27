"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3 py-1.5 text-sm font-bold uppercase tracking-widest border-2 border-nord-light-secondary dark:border-nord-dark-secondary text-nord-light-secondary dark:text-nord-dark-secondary hover:border-nord-light-accent hover:text-nord-light-accent dark:hover:border-nord-dark-accent dark:hover:text-nord-dark-accent transition-colors"
    >
      Logout
    </button>
  );
}
