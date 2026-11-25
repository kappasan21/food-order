import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { count } from "drizzle-orm";

import { menuItems } from "./schema";

const italianMenu = [
  {
    id: "menu-margherita",
    name: "Pizza Margherita",
    description:
      "Classic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil.",
    priceCents: 1250,
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  },
  {
    id: "menu-carbonara",
    name: "Spaghetti Carbonara",
    description:
      "Silky spaghetti tossed with guanciale, Pecorino Romano, egg yolk, and cracked black pepper.",
    priceCents: 1400,
    imageUrl:
      "https://images.unsplash.com/photo-1612874741227-9fe2008b56a0?w=800&q=80",
  },
  {
    id: "menu-lasagna",
    name: "Lasagna Bolognese",
    description:
      "Layers of fresh pasta, slow-cooked beef ragù, béchamel, and Parmigiano-Reggiano baked until golden.",
    priceCents: 1550,
    imageUrl:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80",
  },
  {
    id: "menu-risotto",
    name: "Risotto ai Funghi",
    description:
      "Creamy Arborio rice with porcini mushrooms, white wine, butter, and finished with parsley.",
    priceCents: 1350,
    imageUrl:
      "https://images.unsplash.com/photo-1476124369491-e9675330465e?w=800&q=80",
  },
  {
    id: "menu-bruschetta",
    name: "Bruschetta al Pomodoro",
    description:
      "Grilled ciabatta topped with marinated cherry tomatoes, garlic, basil, and balsamic glaze.",
    priceCents: 750,
    imageUrl:
      "https://images.unsplash.com/photo-1572695157366-42e8fade625c?w=800&q=80",
  },
  {
    id: "menu-tiramisu",
    name: "Tiramisu",
    description:
      "Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa powder.",
    priceCents: 800,
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
  },
  {
    id: "menu-arrabbiata",
    name: "Penne all'Arrabbiata",
    description:
      "Penne pasta in a spicy tomato sauce with garlic, chili flakes, and fresh parsley.",
    priceCents: 1100,
    imageUrl:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  },
  {
    id: "menu-osso-buco",
    name: "Osso Buco",
    description:
      "Braised veal shanks in white wine and vegetables, served with gremolata and saffron risotto.",
    priceCents: 1850,
    imageUrl:
      "https://images.unsplash.com/photo-1546833998-877b37c2b5cd?w=800&q=80",
  },
  {
    id: "menu-caprese",
    name: "Insalata Caprese",
    description:
      "Fresh buffalo mozzarella, ripe tomatoes, basil leaves, and a drizzle of aged balsamic.",
    priceCents: 950,
    imageUrl:
      "https://images.unsplash.com/photo-1608897012190-a68733678208?w=800&q=80",
  },
  {
    id: "menu-alfredo",
    name: "Fettuccine Alfredo",
    description:
      "Handmade fettuccine in a rich sauce of butter, heavy cream, and Parmigiano-Reggiano.",
    priceCents: 1300,
    imageUrl:
      "https://images.unsplash.com/photo-1645112411341-6c4fd023802a?w=800&q=80",
  },
];

async function seed() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client);

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(menuItems);

  if (existingCount > 0) {
    console.log(`Menu already has ${existingCount} items. Skipping seed.`);
    return;
  }

  await db.insert(menuItems).values(italianMenu);
  console.log(`Seeded ${italianMenu.length} Italian menu items.`);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
