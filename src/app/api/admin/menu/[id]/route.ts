import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

const updateMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  description: z.string().trim().min(1, "Description is required").optional(),
  priceCents: z.number().int().min(1, "Price must be greater than 0").optional(),
  imageUrl: z.string().url("A valid image URL is required").optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db.update(menuItems).set(updates).where(eq(menuItems.id, id));

    const [updated] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json({ error: "Unable to update menu item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;

    const [existing] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    await db.delete(menuItems).where(eq(menuItems.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json({ error: "Unable to delete menu item" }, { status: 500 });
  }
}
