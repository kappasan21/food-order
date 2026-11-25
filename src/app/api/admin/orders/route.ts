import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      }),
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json(
      { error: "Unable to load orders" },
      { status: 500 },
    );
  }
}
