import Link from "next/link";

const sections = [
  {
    href: "/admin/orders",
    title: "Orders",
    description: "View all customer orders and advance their status.",
    color: "bg-amber-50 border-amber-200",
    labelColor: "text-amber-700",
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Manage customer accounts, promote or demote admin roles.",
    color: "bg-blue-50 border-blue-200",
    labelColor: "text-blue-700",
  },
  {
    href: "/admin/menu",
    title: "Menu",
    description: "Add, edit, or delete menu items and upload dish images.",
    color: "bg-green-50 border-green-200",
    labelColor: "text-green-700",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Dashboard</h1>
        <p className="mt-2 text-stone-600">Manage orders, users, and the menu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`rounded-3xl border p-6 transition hover:shadow-md ${section.color}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-widest ${section.labelColor}`}>
              {section.title}
            </p>
            <p className="mt-2 text-sm text-stone-700">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
