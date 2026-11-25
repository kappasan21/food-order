import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/menu", label: "Menu" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
          <div className="border-b border-stone-200 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-red-700">Admin</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">Trattoria Test</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-200 px-4 py-4">
            <p className="truncate text-xs text-stone-500">{session.user?.email}</p>
            <Link
              href="/api/auth/signout"
              className="mt-2 block text-xs font-medium text-red-700 hover:text-red-800"
            >
              Sign out
            </Link>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="flex flex-1 flex-col">
          <header className="flex items-center gap-4 border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
            <p className="text-sm font-semibold text-stone-900">Admin</p>
            <nav className="flex gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-stone-600 hover:text-stone-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
