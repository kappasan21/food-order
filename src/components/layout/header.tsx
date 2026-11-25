"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { useCart } from "@/components/providers/cart-provider";

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100";

export function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-lg font-semibold text-white">
            T
          </span>
          <div>
            <p className="text-lg font-semibold text-stone-900">Trattoria Test</p>
            <p className="text-xs text-stone-500">Italian food ordering</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/menu" className={navLinkClass}>
            Menu
          </Link>
          <Link href="/cart" className={navLinkClass}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          {session ? (
            <>
              <Link href="/orders" className={navLinkClass}>
                My Orders
              </Link>
              <span className="hidden text-sm text-stone-500 sm:inline">
                {session.user?.name}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
