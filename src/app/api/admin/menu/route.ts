import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  priceCents: z.number().int().min(1, "Price must be greater than 0"),
  imageUrl: z.string().url("A valid image URL is required"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const item = {
      id: crypto.randomUUID(),
      ...parsed.data,
    };

    await db.insert(menuItems).values(item);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json({ error: "Unable to create menu item" }, { status: 500 });
  }
}
