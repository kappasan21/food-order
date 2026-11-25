import { asc } from "drizzle-orm";

import { MenuGrid } from "@/components/menu/menu-grid";
import { db } from "@/db";
import { menuItems, type MenuItem } from "@/db/schema";

export default async function MenuPage() {
  let items: MenuItem[] = [];

  try {
    items = await db.select().from(menuItems).orderBy(asc(menuItems.name));
  } catch (error) {
    console.error("Failed to load menu from database:", error);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-red-700">
          Our menu
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">
          Italian classics
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Ten sample dishes for the test environment, each with a photo, price,
          name, and short description.
        </p>
      </div>
      <MenuGrid items={items} />
    </section>
  );
}
