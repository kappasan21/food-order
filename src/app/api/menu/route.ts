import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { menuItems } from "@/db/schema";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(menuItems)
      .orderBy(asc(menuItems.name));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Unable to load menu items" },
      { status: 500 },
    );
  }
}
