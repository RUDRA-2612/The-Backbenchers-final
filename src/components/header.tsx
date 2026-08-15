"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full max-w-7xl px-8 py-6 flex justify-between items-center mx-auto">
      <Link
        href="/"
        className="text-2xl font-playfair font-bold text-primary italic hover:opacity-80 transition-opacity"
      >
        The Backbenchers
      </Link>
      <div className="flex items-center gap-8">
        {session ? (
          <>
            {session.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-semibold tracking-wider text-foreground hover:text-primary transition-colors uppercase"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-sm font-semibold tracking-wider text-foreground hover:text-primary transition-colors uppercase"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold tracking-wider text-foreground hover:text-primary transition-colors uppercase"
          >
            Login
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
